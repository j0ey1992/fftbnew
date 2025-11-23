import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase/config';
import { API_BASE_URL, ENDPOINTS } from '@/lib/api/config';
import { normalizeAddress } from '@/utils/addressUtils';
import { authLock } from '@/lib/auth/authenticationLock';


// Define AppKit interface with potential signMessage method
interface ExtendedAppKit {
  open: (options?: any) => Promise<void>;
  close: () => Promise<void>;
  signMessage?: (message: string) => Promise<string>;
  [key: string]: any; // Allow indexing with string
}

/**
 * Error types that can occur during wallet authentication
 */
enum WalletAuthErrorType {
  WALLET_CONNECTION = 'wallet_connection',
  BACKEND_AUTH = 'backend_auth',
  FIREBASE_AUTH = 'firebase_auth',
  ADDRESS_VALIDATION = 'address_validation',
  UNKNOWN = 'unknown'
}

/**
 * Custom hook to handle authentication between Reown wallet and Firebase
 *
 * This hook manages the simplified authentication flow:
 * 1. Detect wallet connection via Reown AppKit
 * 2. Send wallet address to backend for user creation/authentication
 * 3. Sign in to Firebase with the returned custom token
 * 4. Handle disconnection and error states appropriately
 *
 * The flow includes error handling at each step to ensure a smooth user experience.
 */
export function useReownAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAppKitAccount();
  const appKit = useAppKit() as ExtendedAppKit;
  
  console.log('DIAGNOSTIC: AppKit object in useReownAuth:', {
    appKitKeys: Object.keys(appKit || {}),
    hasClose: typeof appKit?.close === 'function',
    closeType: typeof appKit?.close
  });
  
  const auth = firebaseAuth;
  
  /**
   * Handle the authentication process when wallet is connected
   *
   * This function implements the simplified authentication flow:
   * 1. Validate wallet connection and address
   * 2. Send wallet address to backend for user creation/authentication
   * 3. Use the returned token to authenticate with Firebase
   *
   * Error handling is implemented at each step with appropriate fallback mechanisms
   * and detailed logging to help diagnose issues.
   */
  const handleAuthentication = useCallback(async () => {
    if (!address) return;
    
    // Check if already authenticating this wallet
    if (authLock.isAuthenticatingWallet(address)) {
      console.log('WALLET DEBUG: Authentication already in progress for this wallet, skipping');
      return;
    }
    
    let releaseLock: (() => void) | null = null;
    
    try {
      // Acquire authentication lock
      try {
        releaseLock = await authLock.acquireLock(address);
      } catch {
        // Authentication already completed for this wallet
        console.log('WALLET DEBUG: Authentication already completed for wallet:', address);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Track the current error type for better error handling
      let currentErrorType = WalletAuthErrorType.UNKNOWN;
      
      try {
      // Initial step: Check wallet connection
      currentErrorType = WalletAuthErrorType.WALLET_CONNECTION;
      console.log('WALLET DEBUG: Checking wallet connection');
      
      if (!isConnected || !address) {
        throw new Error('Wallet is not connected or address is missing');
      }
      
      // Log the start of authentication process with detailed context
      console.log('WALLET DEBUG: Starting simplified wallet authentication', {
        address,
        isConnected,
        appKitAvailable: !!appKit,
        timestamp: new Date().toISOString()
      });
      
      // Step 1: Normalize and validate address
      currentErrorType = WalletAuthErrorType.ADDRESS_VALIDATION;
      const normalizedAddress = normalizeAddress(address);
      
      if (!normalizedAddress) {
        throw new Error('Invalid wallet address format');
      }
      
      console.log('WALLET DEBUG: Address validation', {
        originalAddress: address,
        normalizedAddress: normalizedAddress
      });

      // Step 2: Authenticate with backend using wallet address
      currentErrorType = WalletAuthErrorType.BACKEND_AUTH;
      console.log('WALLET DEBUG: Connecting wallet with backend', {
        endpoint: `${API_BASE_URL}${ENDPOINTS.AUTH.CONNECT_WALLET}`,
        address: normalizedAddress
      });
      
      // Make authentication request without CSRF token (endpoint is excluded from CSRF protection)
      const verifyResponse = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.CONNECT_WALLET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: normalizedAddress,
        }),
        cache: 'no-cache',
        credentials: 'include'
      });
      
      console.log('WALLET DEBUG: Backend authentication response status:', {
        status: verifyResponse.status,
        ok: verifyResponse.ok,
        statusText: verifyResponse.statusText
      });
      
      if (!verifyResponse.ok) {
        let errorData;
        try {
          errorData = await verifyResponse.json();
          console.error('WALLET DEBUG: Backend authentication error response:', errorData);
        } catch (e) {
          console.error('WALLET DEBUG: Failed to parse error response:', e);
          errorData = { error: `HTTP error ${verifyResponse.status}: ${verifyResponse.statusText}` };
        }
        throw new Error(errorData.error || 'Backend authentication failed');
      }
      
      let responseData;
      try {
        responseData = await verifyResponse.json();
        console.log('WALLET DEBUG: Backend authentication success response:', {
          hasToken: !!responseData.token,
          tokenLength: responseData.token ? responseData.token.length : 0,
          user: responseData.user
        });
      } catch (e) {
        console.error('WALLET DEBUG: Failed to parse success response:', e);
        throw new Error('Failed to parse authentication response');
      }
      
      const { token } = responseData;
      
      // Step 3: Sign in to Firebase with custom token
      currentErrorType = WalletAuthErrorType.FIREBASE_AUTH;
      console.log('WALLET DEBUG: Attempting to sign in with Firebase custom token');
      try {
        await signInWithCustomToken(auth, token);
        console.log('WALLET DEBUG: Successfully authenticated with Firebase', {
          user: auth.currentUser?.uid,
          emailVerified: auth.currentUser?.emailVerified,
          providerData: auth.currentUser?.providerData
        });
      } catch (firebaseError) {
        console.error('WALLET DEBUG: Firebase authentication error:', {
          error: firebaseError,
          message: firebaseError instanceof Error ? firebaseError.message : String(firebaseError),
          stack: firebaseError instanceof Error ? firebaseError.stack : undefined
        });
        throw firebaseError;
      }
      
    } catch (err) {
      // Comprehensive error handling with error type context
      console.error(`Authentication error (${currentErrorType}):`, err);
      
      // Enhanced structured error logging
      console.error('WALLET DEBUG: Authentication error details', {
        errorType: currentErrorType,
        error: err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        walletAddress: address,
        isConnected,
        appKitAvailable: !!appKit
      });
      
      // User-friendly error messages based on error type
      let userErrorMessage = 'Authentication failed';
      
      // Determine user-friendly error message based on error type
      if (currentErrorType === WalletAuthErrorType.WALLET_CONNECTION) {
        userErrorMessage = 'Failed to connect to wallet. Please check your wallet extension is installed and unlocked.';
      } else if (currentErrorType === WalletAuthErrorType.ADDRESS_VALIDATION) {
        userErrorMessage = 'Invalid wallet address format. Please try reconnecting your wallet.';
      } else if (currentErrorType === WalletAuthErrorType.BACKEND_AUTH) {
        userErrorMessage = 'Failed to authenticate with server. Please try again.';
      } else if (currentErrorType === WalletAuthErrorType.FIREBASE_AUTH) {
        userErrorMessage = 'Failed to authenticate with Firebase. Please try again later.';
      } else {
        userErrorMessage = err instanceof Error ? err.message : 'Authentication failed';
      }
      
      setError(userErrorMessage);
      
      // Disconnect wallet on authentication failure
      if (appKit && typeof appKit.close === 'function') {
        console.log('WALLET DEBUG: Closing AppKit connection due to authentication failure');
        try {
          appKit.close();
        } catch (closeError) {
          console.error('WALLET DEBUG: Error closing AppKit connection:', closeError);
        }
      }
      } finally {
        setIsLoading(false);
      }
    } finally {
      // Always release the lock
      if (releaseLock) {
        releaseLock();
      }
    }
  }, [address, auth, appKit, isConnected]);
  
  /**
   * Handle wallet connection/disconnection and address changes
   */
  useEffect(() => {
    const checkAuthState = async () => {
      if (isConnected && address) {
        // Check if we need to authenticate or re-authenticate
        const currentUser = auth.currentUser;
        if (!currentUser) {
          // No user logged in, authenticate
          handleAuthentication();
        } else {
          // User is logged in, check if wallet changed
          const token = await currentUser.getIdTokenResult();
          const tokenWalletAddress = token.claims.walletAddress;
          
          if (tokenWalletAddress && normalizeAddress(tokenWalletAddress) !== normalizeAddress(address)) {
            console.log('WALLET DEBUG: Wallet address changed, re-authenticating', {
              oldAddress: tokenWalletAddress,
              newAddress: address
            });
            // Wallet changed, sign out and re-authenticate
            await firebaseSignOut(auth);
            handleAuthentication();
          }
        }
      } else if (!isConnected && auth.currentUser) {
        // Disconnect from Firebase when wallet disconnects
        firebaseSignOut(auth).catch(console.error);
      }
    };
    
    checkAuthState();
  }, [isConnected, address, auth, handleAuthentication]);
  
  /**
   * Log out the user from both wallet and Firebase
   *
   * This function:
   * 1. Closes the AppKit connection to disconnect the wallet
   * 2. Signs out from Firebase authentication
   * 3. Optionally notifies the backend about the logout
   *
   * Error handling ensures that even if one step fails, the others will still be attempted.
   */
  const logout = useCallback(async () => {
    try {
      console.log('WALLET DEBUG: Starting logout process');
      
      // Step 1: Disconnect wallet
      try {
        // Close AppKit connection
        if (appKit && typeof appKit.close === 'function') {
          console.log('WALLET DEBUG: Closing AppKit connection');
          await appKit.close();
          console.log('WALLET DEBUG: Successfully closed AppKit connection');
        }
      } catch (closeError) {
        console.error('WALLET DEBUG: Error during AppKit logout:', closeError);
        // Continue with logout even if wallet disconnect fails
      }
      
      // Step 2: Sign out from Firebase
      try {
        console.log('WALLET DEBUG: Signing out from Firebase');
        await firebaseSignOut(auth);
        console.log('WALLET DEBUG: Successfully signed out from Firebase');
      } catch (firebaseError) {
        console.error('WALLET DEBUG: Error signing out from Firebase:', firebaseError);
        throw firebaseError; // Re-throw as this is a critical error
      }
      
      // Step 3: Logout is complete (no backend notification needed for simplified auth)
      console.log('WALLET DEBUG: Logout completed - no backend notification needed');
      
      console.log('WALLET DEBUG: Successfully completed logout process');
    } catch (err) {
      console.error('WALLET DEBUG: Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }, [appKit, auth, address]);

  return {
    isLoading,
    error,
    isAuthenticated: !!auth.currentUser,
    user: auth.currentUser,
    walletAddress: address,
    isWalletConnected: isConnected,
    logout
  };
}
