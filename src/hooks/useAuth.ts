'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-config';
import {
  authenticateWithWallet,
  requestWalletChallenge,
  signOut,
  getCurrentUserWalletAddress,
  isAdmin,
  isProject,
  WalletType,
  AuthError,
  AuthErrorType
} from '@/lib/api/auth';
import { getAppKit } from '@/lib/reown/init';
import { normalizeAddress } from '@/utils/addressUtils';

/**
 * Authentication hook for wallet-based authentication
 * @returns Authentication state and methods
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [userRoles, setUserRoles] = useState<{
    isAdmin: boolean;
    isProject: boolean;
  }>({
    isAdmin: false,
    isProject: false
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        
        try {
          // Force token refresh to get latest claims
          await user.getIdToken(true);
          
          // Get wallet address
          const address = await getCurrentUserWalletAddress();
          setWalletAddress(address);
          
          // Get user roles with retry mechanism
          let adminStatus = false;
          let projectStatus = false;
          
          try {
            [adminStatus, projectStatus] = await Promise.all([
              isAdmin(),
              isProject()
            ]);
          } catch (roleErr) {
            console.error('Error getting user roles, retrying once:', roleErr);
            // Retry once after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            [adminStatus, projectStatus] = await Promise.all([
              isAdmin(),
              isProject()
            ]);
          }
          
          console.log('User roles updated:', { adminStatus, projectStatus });
          
          setUserRoles({
            isAdmin: adminStatus,
            isProject: projectStatus
          });
        } catch (err) {
          console.error('Error getting user data:', err);
          // Even if there's an error, we should still set loading to false
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setWalletAddress(null);
        setUserRoles({
          isAdmin: false,
          isProject: false
        });
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  /**
   * Connect wallet and authenticate
   */
  const connect = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log('Starting wallet connection and authentication process');
      
      // Get AppKit
      const appKit = getAppKit();
      if (!appKit) {
        throw new AuthError('AppKit not initialized', AuthErrorType.UNKNOWN);
      }
      
      // Connect wallet
      await appKit.connect?.();
      console.log('Wallet connected successfully');
      
      // Get wallet address
      const account = await appKit.getAccount?.();
      if (!account?.address) {
        throw new AuthError('Failed to get wallet address', AuthErrorType.UNKNOWN);
      }
      
      const address = account.address;
      console.log('Got wallet address:', address);
      
      // Normalize the address for consistency
      const normalizedAddress = address.toLowerCase();
      
      // Determine wallet type
      const detectedWalletType = determineWalletType(appKit);
      setWalletType(detectedWalletType);
      
      // Check if this is the admin wallet address
      const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
      const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
      const isAdminWallet = normalizedAddress === normalizedAdminAddress;
      
      // Request challenge
      console.log('Requesting challenge for address:', normalizedAddress);
      const { message } = await requestWalletChallenge(normalizedAddress);
      
      let signature: string;
      let usedFallbackAuth = false;
      
      try {
        // Check if appKit has the signMessage method
        if (!appKit.signMessage) {
          console.warn('SIGN DEBUG: appKit.signMessage method is not available', {
            appKit: typeof appKit,
            methods: Object.keys(appKit || {}),
            timestamp: new Date().toISOString()
          });
          
          // If this is the admin wallet, use fallback authentication
          if (isAdminWallet) {
            console.log('Using fallback authentication for admin wallet');
            usedFallbackAuth = true;
            // Use empty signature for fallback auth - the backend will validate based on wallet address
            signature = '';
          } else {
            throw new AuthError('Wallet does not support message signing', AuthErrorType.SIGNATURE_NOT_SUPPORTED);
          }
        } else {
          // Try to sign the message
          console.log('SIGN DEBUG: Attempting to sign challenge message', {
            messageLength: message.length,
            messagePreview: message.substring(0, 50) + '...',
            hasSignMethod: typeof appKit.signMessage === 'function',
            timestamp: new Date().toISOString()
          });
          
          signature = await appKit.signMessage?.(message);
          
          console.log('SIGN DEBUG: Signature result', {
            signatureReceived: !!signature,
            signatureLength: signature ? signature.length : 0,
            signaturePreview: signature ? signature.substring(0, 20) + '...' : 'null',
            timestamp: new Date().toISOString()
          });
          
          if (!signature) {
            console.error('SIGN DEBUG: Signature is empty or null');
            
            // If this is the admin wallet, use fallback authentication
            if (isAdminWallet) {
              console.log('Using fallback authentication for admin wallet after failed signature');
              usedFallbackAuth = true;
              // Use empty signature for fallback auth
              signature = '';
            } else {
              throw new AuthError('Failed to sign message', AuthErrorType.USER_REJECTED);
            }
          }
        }
      } catch (signError) {
        console.error('SIGN DEBUG: Error during message signing', {
          error: signError,
          message: signError instanceof Error ? signError.message : String(signError),
          stack: signError instanceof Error ? signError.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        // If this is the admin wallet, use fallback authentication
        if (isAdminWallet) {
          console.log('Using fallback authentication for admin wallet after signature error');
          usedFallbackAuth = true;
          // Use empty signature for fallback auth
          signature = '';
        } else {
          throw new AuthError(
            signError instanceof Error ? signError.message : 'Failed to sign message',
            AuthErrorType.USER_REJECTED
          );
        }
      }
      
      // Authenticate with signature or fallback
      console.log(`Authenticating with ${usedFallbackAuth ? 'fallback method' : 'signature'}`);
      const result = await authenticateWithWallet(
        normalizedAddress,
        signature,
        detectedWalletType || undefined,
        usedFallbackAuth
      );
      
      // Update state
      setWalletAddress(normalizedAddress);
      
      // Force token refresh to get latest claims
      if (auth.currentUser) {
        console.log('Refreshing token to get latest claims');
        await auth.currentUser.getIdToken(true);
        
        // Update user roles
        const [adminStatus, projectStatus] = await Promise.all([
          isAdmin(),
          isProject()
        ]);
        
        setUserRoles({
          isAdmin: adminStatus,
          isProject: projectStatus
        });
        
        console.log('Updated user roles after authentication:', {
          isAdmin: adminStatus,
          isProject: projectStatus
        });
      }
      
      return result;
    } catch (err) {
      console.error('Authentication error:', err);
      
      if (err instanceof AuthError) {
        setError(err);
      } else {
        setError(new AuthError(
          err instanceof Error ? err.message : 'Authentication failed',
          AuthErrorType.UNKNOWN
        ));
      }
      
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /**
   * Disconnect wallet and sign out
   */
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting wallet disconnection and sign out process');
      
      // Disconnect wallet
      const appKit = getAppKit();
      if (appKit) {
        await appKit.disconnect?.();
        console.log('Wallet disconnected successfully');
      }
      
      // Sign out from Firebase
      await signOut();
      console.log('Signed out from Firebase successfully');
      
      // Reset all state
      setWalletType(null);
      setError(null);
      setWalletAddress(null);
      setUser(null);
      setIsAuthenticated(false);
      setUserRoles({
        isAdmin: false,
        isProject: false
      });
      
      console.log('Auth state reset successfully');
    } catch (err) {
      console.error('Disconnect error:', err);
      
      if (err instanceof AuthError) {
        setError(err);
      } else {
        setError(new AuthError(
          err instanceof Error ? err.message : 'Disconnect failed',
          AuthErrorType.UNKNOWN
        ));
      }
    } finally {
      setIsLoading(false);
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
    if (appKit.provider?.isMetaMask) {
      return WalletType.METAMASK;
    } else if (appKit.provider?.isWalletConnect) {
      return WalletType.WALLET_CONNECT;
    } else if (appKit.provider?.isCoinbaseWallet) {
      return WalletType.COINBASE;
    }
    
    return WalletType.OTHER;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthenticating,
    walletAddress,
    walletType,
    error,
    userRoles,
    connect,
    disconnect,
    AuthErrorType
  };
}

export default useAuth;