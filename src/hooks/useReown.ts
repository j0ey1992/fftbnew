'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppKit } from '@/lib/reown/init';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/user-profile';
import { Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-config';
import {
  authenticateWithWallet,
  requestWalletChallenge,
  signOut as firebaseSignOut,
  WalletType,
  AuthError,
  AuthErrorType
} from '@/lib/api/auth';

export default function useReown() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);

  // Set up Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', user ? `User ${user.uid} authenticated` : 'No user authenticated');
    });
    
    return () => unsubscribe();
  }, []);

  // Authenticate with Firebase using wallet address
  const authenticateUser = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      console.log('Starting authentication process for wallet:', walletAddress);
      
      // Step 1: Request a challenge
      const { message } = await requestWalletChallenge(walletAddress);
      console.log('Challenge received, requesting signature');
      
      // Step 2: Get the wallet to sign the message
      const appKit = getAppKit();
      if (!appKit || !appKit.signMessage) {
        throw new AuthError('Wallet not connected or does not support signing', AuthErrorType.UNKNOWN);
      }
      
      // Determine wallet type if possible
      const detectedWalletType = determineWalletType(appKit);
      setWalletType(detectedWalletType);
      // Sign the message
      console.log('SIGN DEBUG: Attempting to sign message in useReown', {
        messageLength: message.length,
        messagePreview: message.substring(0, 50) + '...',
        appKitMethods: Object.keys(appKit || {}),
        hasSignMethod: typeof appKit.signMessage === 'function',
        directCall: 'Using direct call to signMessage (no optional chaining)',
        timestamp: new Date().toISOString()
      });
      
      let signature: string;
      
      try {
        signature = await appKit.signMessage(message);
        
        console.log('SIGN DEBUG: Signature result in useReown', {
          signatureReceived: !!signature,
          signatureLength: signature ? signature.length : 0,
          signaturePreview: signature ? signature.substring(0, 20) + '...' : 'null',
          timestamp: new Date().toISOString()
        });
        
        if (!signature) {
          console.error('SIGN DEBUG: Signature is empty or null in useReown');
          throw new Error('Failed to sign message');
        }
        
        console.log('Message signed, verifying with server');
      } catch (signError) {
        console.error('SIGN DEBUG: Error during message signing in useReown', {
          error: signError,
          message: signError instanceof Error ? signError.message : String(signError),
          stack: signError instanceof Error ? signError.stack : undefined,
          timestamp: new Date().toISOString()
        });
        throw signError;
      }
      
      // Step 3: Authenticate with the signature
      // Pass undefined instead of null for walletType
      await authenticateWithWallet(
        walletAddress,
        signature,
        detectedWalletType || undefined
      );
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error instanceof AuthError) {
        setAuthError(error);
      } else {
        setAuthError(new AuthError(
          error instanceof Error ? error.message : 'Authentication failed',
          AuthErrorType.UNKNOWN
        ));
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, []);
  
  /**
   * Determine the wallet type from the AppKit
   * @param appKit The Reown AppKit instance
   * @returns The detected wallet type or null
   */
  const determineWalletType = (appKit: any): WalletType | null => {
    if (!appKit) return null;
    
    // Try to determine wallet type from AppKit
    // This is a simplified example - in reality, you would need to check
    // specific properties or methods of the AppKit to determine the wallet type
    if (appKit.provider?.isMetaMask) {
      return WalletType.METAMASK;
    } else if (appKit.provider?.isWalletConnect) {
      return WalletType.WALLET_CONNECT;
    } else if (appKit.provider?.isCoinbaseWallet) {
      return WalletType.COINBASE;
    }
    
    return WalletType.OTHER;
  };

  // Ensure user profile exists in Firebase
  const ensureUserProfileExists = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;
    
    // Enhanced logging for wallet address normalization diagnosis
    console.log('WALLET DEBUG: useReown.ensureUserProfileExists - Address Check', {
      originalWalletAddress: walletAddress,
      normalizedWalletAddress: walletAddress.toLowerCase(),
      areEqual: walletAddress === walletAddress.toLowerCase(),
      timestamp: new Date().toISOString()
    });
    
    console.log('Checking if user profile exists for address:', walletAddress);
    
    try {
      // First authenticate the user with Firebase
      await authenticateUser(walletAddress);
      
      // Check if user profile already exists
      const userProfile = await getUserProfile(walletAddress);
      console.log('User profile check result:', userProfile ? 'Profile exists' : 'No profile found');
      
      // If profile doesn't exist, create a new one with default values
      if (!userProfile) {
        console.log('Creating new user profile for address:', walletAddress);
        try {
          // Log the address being used for profile creation
          console.log('WALLET DEBUG: Profile Creation - Address Normalization', {
            originalAddress: walletAddress,
            normalizedForStorage: walletAddress.toLowerCase(),
            timestamp: new Date().toISOString()
          });
          
          const newProfile = await updateUserProfile(walletAddress, {
            address: walletAddress.toLowerCase(),
            displayName: '',
            bio: '',
            xp: 0,
            level: 1,
            completedQuests: [],
            following: [],
            followers: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          console.log('User profile created successfully:', newProfile);
        } catch (createError) {
          console.error('Error creating user profile:', createError);
          // Try to get more details about the error
          if (createError instanceof Error) {
            console.error('Error details:', createError.message, createError.stack);
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
      // Try to get more details about the error
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
    }
  }, [authenticateUser]);

  useEffect(() => {
    const appKit = getAppKit();
    if (!appKit) {
      setIsInitializing(false);
      return;
    }

    // Check initial connection state
    const checkConnection = async () => {
      try {
        const isConnected = await appKit.isConnected?.();
        setIsConnected(!!isConnected);
        
        if (isConnected) {
          const account = await appKit.getAccount?.();
          const accountAddress = account?.address || null;
          setAddress(accountAddress);
          
          // Create user profile if already connected
          if (accountAddress) {
            await ensureUserProfileExists(accountAddress);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkConnection();

    // Set up account change handler
    const handleAccountChange = async (account: any) => {
      const isAccountConnected = !!account;
      setIsConnected(isAccountConnected);
      
      const accountAddress = account?.address || null;
      setAddress(accountAddress);
      
      // Create user profile if account is connected
      if (isAccountConnected && accountAddress) {
        await ensureUserProfileExists(accountAddress);
      }
    };

    // Add event listener
    appKit.on?.('account', handleAccountChange);

    return () => {
      // Remove event listener
      appKit.off?.('account', handleAccountChange);
    };
  }, [ensureUserProfileExists]);

  const connect = async () => {
    try {
      const appKit = getAppKit();
      if (!appKit) return;

      await appKit.connect?.();
      
      // After connection, get the account and ensure profile exists
      const account = await appKit.getAccount?.();
      if (account?.address) {
        await ensureUserProfileExists(account.address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = async () => {
    try {
      const appKit = getAppKit();
      if (!appKit) return;

      // Disconnect from wallet
      await appKit.disconnect?.();
      
      // Sign out from Firebase
      await firebaseSignOut();
      console.log('Signed out from Firebase');
      
      // Reset state
      setWalletType(null);
      setAuthError(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return {
    isConnected,
    address,
    isInitializing,
    isAuthenticating,
    authError,
    walletType,
    connect,
    disconnect,
    // Expose the error type for better error handling in UI
    AuthErrorType
  };
}
