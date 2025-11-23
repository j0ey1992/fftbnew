import { firebaseAuth } from '../firebase/config';
import { API_BASE_URL, ENDPOINTS } from './config';
import { signInWithCustomToken } from 'firebase/auth';
import { normalizeAddress, isValidAddress } from '@/utils/addressUtils';
import { permissionDebug } from '@/utils/debugUtils';

// Define wallet types for better type safety
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  OTHER = 'other'
}

// Define authentication error types
export enum AuthErrorType {
  INVALID_ADDRESS = 'invalid_address',
  CHALLENGE_EXPIRED = 'challenge_expired',
  INVALID_SIGNATURE = 'invalid_signature',
  SERVER_ERROR = 'server_error',
  USER_REJECTED = 'user_rejected',
  SIGNATURE_NOT_SUPPORTED = 'signature_not_supported',
  UNKNOWN = 'unknown'
}

// Authentication error class
export class AuthError extends Error {
  type: AuthErrorType;
  
  constructor(message: string, type: AuthErrorType = AuthErrorType.UNKNOWN) {
    super(message);
    this.type = type;
    this.name = 'AuthError';
  }
}

/**
 * Authentication utilities for the API client
 */

/**
 * Get the current authentication token from Firebase Auth
 * @returns Promise with the authentication token or null if not available
/**
* Get the current authentication token from Firebase Auth
* @returns Promise with the authentication token or null if not available
*/
export const getAuthToken = async (): Promise<string | null> => {
 try {
   // Log Firebase auth state for debugging
   console.log('Firebase Auth State:', {
     currentUser: !!firebaseAuth.currentUser,
     uid: firebaseAuth.currentUser?.uid,
     emailVerified: firebaseAuth.currentUser?.emailVerified,
     providerData: firebaseAuth.currentUser?.providerData
   });
   
   const user = firebaseAuth.currentUser;
   if (!user) {
     console.log('No current user found in Firebase Auth');
     
     // Wait a bit for auth state to be established if it's still loading
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     // Check again after waiting
     const userAfterWait = firebaseAuth.currentUser;
     if (!userAfterWait) {
       console.log('Still no user after waiting - user needs to authenticate');
       return null;
     }
     
     // Force token refresh to ensure it's valid
     const token = await userAfterWait.getIdToken(true);
     console.log('Auth token retrieved after wait', {
       tokenLength: token.length,
       tokenPrefix: token.substring(0, 10) + '...'
     });
     return token;
   }
   
   // Force token refresh to ensure it's not expired
   const token = await user.getIdToken(true);
   console.log('Auth token retrieved successfully', {
     tokenLength: token.length,
     tokenPrefix: token.substring(0, 10) + '...'
   });
   return token;
 } catch (error) {
   console.error('Error getting auth token:', error);
   return null;
 }
};

/**
 * Verify if the current authentication token is valid
 * @returns Promise with boolean indicating if token is valid
 */
export const verifyAuthToken = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.VERIFY_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return false;
  }
};

/**
 * Get authentication headers for API requests
 * @returns Promise with headers object including auth token if available
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Check if the current user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!firebaseAuth.currentUser;
};

/**
 * Get the current user's ID
 * @returns User ID or null if not authenticated
 */
export const getCurrentUserId = (): string | null => {
  const user = firebaseAuth.currentUser;
  return user ? user.uid : null;
};

/**
 * Get the current user's wallet address from custom claims
 * @returns Promise with wallet address or null if not available
 */
export const getCurrentUserWalletAddress = async (): Promise<string | null> => {
  try {
    permissionDebug.checkStart('walletAddress', 'getCurrentUserWalletAddress');
    
    const user = firebaseAuth.currentUser;
    if (!user) {
      permissionDebug.checkResult('walletAddress', false, 'getCurrentUserWalletAddress', {
        reason: 'No current user found'
      });
      return null;
    }
    
    permissionDebug.userInfo('getCurrentUserWalletAddress', undefined, {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
    
    // Refresh token to get latest claims with retry mechanism
    console.log('WALLET DEBUG: Refreshing token to get latest claims');
    let idTokenResult;
    
    try {
      await user.getIdToken(true);
      idTokenResult = await user.getIdTokenResult();
    } catch (tokenError) {
      console.error('Error refreshing token, retrying once:', tokenError);
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await user.getIdToken(true);
      idTokenResult = await user.getIdTokenResult();
    }
    
    const walletAddress = idTokenResult.claims.walletAddress as string || null;
    
    // Always normalize the wallet address for consistency
    const normalizedWalletAddress = walletAddress ? normalizeAddress(walletAddress) : null;
    
    // Enhanced logging for wallet address normalization diagnosis
    console.log('WALLET DEBUG: getCurrentUserWalletAddress - Token claims:', {
      claims: idTokenResult.claims,
      originalWalletAddress: walletAddress,
      normalizedWalletAddress,
      walletAddressType: typeof walletAddress,
      walletAddressLength: walletAddress ? walletAddress.length : 0,
      areEqual: walletAddress === normalizedWalletAddress,
      uid: user.uid,
      timestamp: new Date().toISOString()
    });
    
    // Check if this is the expected wallet address
    const targetWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
    const normalizedTargetAddress = normalizeAddress(targetWalletAddress);
    
    console.log('WALLET DEBUG: Address comparison:', {
      expectedAddress: targetWalletAddress,
      normalizedExpectedAddress: normalizedTargetAddress,
      currentAddress: walletAddress,
      normalizedCurrentAddress: normalizedWalletAddress,
      isMatch: normalizedWalletAddress === normalizedTargetAddress,
      timestamp: new Date().toISOString()
    });
    
    permissionDebug.checkResult('walletAddress', !!normalizedWalletAddress, 'getCurrentUserWalletAddress', {
      originalWalletAddress: walletAddress,
      normalizedWalletAddress
    });
    
    // Return the normalized wallet address for consistency
    return normalizedWalletAddress;
  } catch (error) {
    permissionDebug.error('getCurrentUserWalletAddress', 'Error getting user wallet address', error);
    return null;
  }
};

/**
 * Check if the current user has admin role
 * @returns Promise with boolean indicating if user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    permissionDebug.checkStart('admin', 'isAdmin');
    
    const user = firebaseAuth.currentUser;
    if (!user) {
      permissionDebug.checkResult('admin', false, 'isAdmin', {
        reason: 'No current user found'
      });
      return false;
    }
    
    // Refresh token to get latest claims with retry mechanism
    let idTokenResult;
    try {
      await user.getIdToken(true);
      idTokenResult = await user.getIdTokenResult();
    } catch (tokenError) {
      console.error('Error refreshing token in isAdmin, retrying once:', tokenError);
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await user.getIdToken(true);
      idTokenResult = await user.getIdTokenResult();
    }
    
    const hasAdminClaim = !!idTokenResult.claims.admin;
    
    // Get wallet address from claims and check if it matches admin address
    const walletAddressFromClaims = idTokenResult.claims.walletAddress as string || null;
    const normalizedWalletAddress = walletAddressFromClaims ? normalizeAddress(walletAddressFromClaims) : null;
    
    // Check if this is the admin wallet address
    const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
    const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
    const isAdminWallet = normalizedWalletAddress === normalizedAdminAddress;
    
    // Enhanced logging for admin claim diagnosis
    console.log('ADMIN CHECK - Token claims detail:', {
      claims: idTokenResult.claims,
      adminClaim: idTokenResult.claims.admin,
      hasAdminClaim,
      walletAddress: walletAddressFromClaims,
      normalizedWalletAddress,
      adminWalletAddress,
      normalizedAdminAddress,
      isAdminWallet,
      uid: user.uid,
      timestamp: new Date().toISOString()
    });
    
    // If the wallet address matches the admin address but the admin claim is not set,
    // we should still consider them an admin (this is a fallback mechanism)
    const isAdminUser = hasAdminClaim || isAdminWallet;
    
    permissionDebug.checkResult('admin', isAdminUser, 'isAdmin', {
      uid: user.uid,
      claims: idTokenResult.claims,
      hasAdminClaim,
      isAdminWallet,
      finalDecision: isAdminUser
    });
    
    return isAdminUser;
  } catch (error) {
    permissionDebug.error('isAdmin', 'Error checking admin status', error);
    return false;
  }
};

/**
 * Request a challenge for wallet authentication
 * @param walletAddress The wallet address to authenticate
 * @returns Promise with the challenge
 * @throws AuthError if the request fails
 */
export const requestWalletChallenge = async (walletAddress: string): Promise<{ challenge: string, message: string }> => {
  try {
    if (!walletAddress) {
      throw new AuthError('Wallet address is required', AuthErrorType.INVALID_ADDRESS);
    }
    
    // Always normalize the wallet address for consistency
    const normalizedAddress = normalizeAddress(walletAddress);
    
    // Validate the address
    if (!isValidAddress(normalizedAddress)) {
      throw new AuthError(`Invalid wallet address format: ${normalizedAddress}`, AuthErrorType.INVALID_ADDRESS);
    }
    
    // Enhanced debugging for API configuration
    console.log('API Configuration:', {
      API_BASE_URL,
      endpoint: ENDPOINTS.AUTH.WALLET_CHALLENGE,
      fullUrl: `${API_BASE_URL}${ENDPOINTS.AUTH.WALLET_CHALLENGE}`,
      environment: process.env.NODE_ENV,
      apiUrlEnvVar: process.env.NEXT_PUBLIC_API_URL
    });
    
    // Log the request for debugging
    console.log('Requesting wallet challenge:', {
      originalAddress: walletAddress,
      normalizedAddress,
      areEqual: walletAddress === normalizedAddress,
      timestamp: new Date().toISOString()
    });
    
    // Test if the server is reachable
    try {
      console.log('Attempting server health check...');
      const testResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add cache busting parameter
        cache: 'no-cache',
        credentials: 'same-origin'
      });
      
      const healthData = await testResponse.text();
      console.log('Server health check:', {
        status: testResponse.status,
        ok: testResponse.ok,
        statusText: testResponse.statusText,
        url: `${API_BASE_URL}/health`,
        responseText: healthData.substring(0, 100) // Show first 100 chars
      });
    } catch (healthError) {
      console.error('Server health check failed:', healthError);
      console.error('Server URL attempted:', `${API_BASE_URL}/health`);
    }
    
    console.log('Sending wallet challenge request to:', `${API_BASE_URL}${ENDPOINTS.AUTH.WALLET_CHALLENGE}`);
    console.log('Request payload:', { walletAddress: normalizedAddress });
    
    // Get the response result with retry mechanism
    let result;
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}${ENDPOINTS.AUTH.WALLET_CHALLENGE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ walletAddress: normalizedAddress }),
          cache: 'no-cache',
          credentials: 'same-origin'
        }
      );
      
      console.log('Challenge request response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
      
      if (!response.ok) {
        let errorData;
        let responseText;
        
        try {
          // Try to get the raw response text first
          responseText = await response.text();
          console.error('Error response text:', responseText);
          
          // Then try to parse it as JSON
          try {
            errorData = JSON.parse(responseText);
          } catch (jsonError) {
            console.error('Failed to parse error response as JSON:', jsonError);
            errorData = { error: `HTTP error ${response.status}: ${response.statusText}` };
          }
        } catch (e) {
          console.error('Failed to read error response:', e);
          errorData = { error: `HTTP error ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.error || 'Failed to request challenge';
        
        // Map error types
        let errorType = AuthErrorType.UNKNOWN;
        if (errorMessage.includes('Invalid wallet address')) {
          errorType = AuthErrorType.INVALID_ADDRESS;
        } else if (errorMessage.includes('server')) {
          errorType = AuthErrorType.SERVER_ERROR;
        }
        
        throw new AuthError(errorMessage, errorType);
      }
      
      result = await response.json();
      
      // Log the result for debugging
      console.log('Challenge received:', {
        challenge: result.challenge ? result.challenge.substring(0, 10) + '...' : null,
        messageLength: result.message ? result.message.length : 0,
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (fetchError) {
      console.error('Fetch error during wallet challenge request:', fetchError);
      throw new AuthError(
        fetchError instanceof Error ? fetchError.message : 'Network error during challenge request',
        AuthErrorType.SERVER_ERROR
      );
    }
  } catch (error) {
    console.error('Error requesting wallet challenge:', error);
    
    // Rethrow as AuthError if it's not already
    if (!(error instanceof AuthError)) {
      throw new AuthError(
        error instanceof Error ? error.message : 'Failed to request challenge',
        AuthErrorType.UNKNOWN
      );
    }
    
    throw error;
  }
};

/**
 * Helper function to fetch with retry
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries
 * @returns Promise with the fetch response
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Fetch failed, retrying... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return fetchWithRetry(url, options, retries - 1);
  }
}

/**
 * Authenticate with wallet using challenge-response
 * @param walletAddress The wallet address to authenticate
 * @param signature The signature of the challenge
 * @param walletType Optional wallet type for specific signature verification
 * @returns Promise with the authentication result
 * @throws AuthError if authentication fails
 */
export const authenticateWithWallet = async (
  walletAddress: string,
  signature: string,
  walletType?: WalletType,
  usedFallbackAuth?: boolean
): Promise<{
  token: string;
  user: {
    uid: string;
    walletAddress: string;
    isProject: boolean;
    isAdmin: boolean;
  }
}> => {
  try {
    if (!walletAddress) {
      throw new AuthError('Wallet address is required', AuthErrorType.INVALID_ADDRESS);
    }
    
    // Only check for signature if not using fallback auth
    if (!signature && !usedFallbackAuth) {
      throw new AuthError('Signature is required', AuthErrorType.INVALID_SIGNATURE);
    }
    
    // Always normalize the wallet address for consistency
    const normalizedAddress = normalizeAddress(walletAddress);
    
    // Log authentication attempt for debugging
    console.log('Authenticating with wallet:', {
      originalAddress: walletAddress,
      normalizedAddress,
      areEqual: walletAddress === normalizedAddress,
      signatureLength: signature ? signature.length : 0,
      walletType: walletType || 'not specified',
      timestamp: new Date().toISOString()
    });
    
    console.log('Sending wallet authentication request to:', `${API_BASE_URL}${ENDPOINTS.AUTH.WALLET_AUTHENTICATE}`);
    console.log('Authentication payload:', {
      walletAddress: normalizedAddress,
      signatureLength: signature ? signature.length : 0,
      walletType: walletType || undefined,
      usedFallbackAuth: !!usedFallbackAuth
    });
    
    // Check if this is the admin wallet address for fallback auth
    const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
    const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
    const isAdminWallet = normalizedAddress === normalizedAdminAddress;
    
    // If using fallback auth, verify this is the admin wallet
    if (usedFallbackAuth && !isAdminWallet) {
      throw new AuthError(
        'Fallback authentication is only available for admin wallets',
        AuthErrorType.INVALID_ADDRESS
      );
    }
    
    // Enhanced logging for admin authentication
    if (isAdminWallet) {
      console.log('Admin wallet authentication attempt:', {
        isAdminWallet,
        usedFallbackAuth,
        hasSignature: !!signature && signature.length > 0,
        timestamp: new Date().toISOString()
      });
    }
    
    // Make the authentication request
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.WALLET_AUTHENTICATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: normalizedAddress,
        signature: signature || '',
        walletType: walletType || undefined,
        useFallbackAuth: usedFallbackAuth || (isAdminWallet && (!signature || signature.trim() === ''))
      }),
      cache: 'no-cache',
      credentials: 'same-origin'
    });
    
    console.log('Authentication response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    if (!response.ok) {
      let errorData;
      let responseText;
      
      try {
        // Try to get the raw response text first
        responseText = await response.text();
        console.error('Error response text:', responseText);
        
        // Then try to parse it as JSON
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          errorData = { error: `HTTP error ${response.status}: ${response.statusText}` };
        }
      } catch (e) {
        console.error('Failed to read error response:', e);
        errorData = { error: `HTTP error ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = errorData.error || 'Authentication failed';
      
      // Map error types
      let errorType = AuthErrorType.UNKNOWN;
      if (errorMessage.includes('Invalid wallet address')) {
        errorType = AuthErrorType.INVALID_ADDRESS;
      } else if (errorMessage.includes('Invalid signature')) {
        errorType = AuthErrorType.INVALID_SIGNATURE;
      } else if (errorMessage.includes('Challenge expired')) {
        errorType = AuthErrorType.CHALLENGE_EXPIRED;
      } else if (errorMessage.includes('server')) {
        errorType = AuthErrorType.SERVER_ERROR;
      }
      
      throw new AuthError(errorMessage, errorType);
    }
    
    const authResult = await response.json();
    
    // Log successful authentication with detailed backend response
    console.log('Authentication successful - Backend response:', {
      uid: authResult.user?.uid,
      walletAddress: authResult.user?.walletAddress,
      isAdmin: authResult.user?.isAdmin,
      userObject: authResult.user,
      timestamp: new Date().toISOString()
    });
    
    // Sign in with the custom token
    await signInWithCustomToken(firebaseAuth, authResult.token);
    
    // Check Firebase token claims after authentication with retry mechanism
    try {
      const freshUser = firebaseAuth.currentUser;
      if (freshUser) {
        // Force token refresh with retry
        try {
          await freshUser.getIdToken(true);
        } catch (refreshError) {
          console.error('Error refreshing token, retrying once:', refreshError);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await freshUser.getIdToken(true);
        }
        
        const freshTokenResult = await freshUser.getIdTokenResult();
        
        // Check if admin claim is set correctly
        const hasAdminClaim = !!freshTokenResult.claims.admin;
        const walletAddressFromClaims = freshTokenResult.claims.walletAddress as string || null;
        const normalizedWalletAddressFromClaims = walletAddressFromClaims ? normalizeAddress(walletAddressFromClaims) : null;
        
        // Check if this is the admin wallet address
        const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
        const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
        const isAdminWallet = normalizedWalletAddressFromClaims === normalizedAdminAddress;
        
        console.log('Post-authentication Firebase token claims:', {
          claims: freshTokenResult.claims,
          adminClaim: freshTokenResult.claims.admin,
          hasAdminClaim,
          walletAddress: walletAddressFromClaims,
          normalizedWalletAddress: normalizedWalletAddressFromClaims,
          isAdminWallet,
          uid: freshUser.uid,
          timestamp: new Date().toISOString()
        });
        
        // If this is the admin wallet but the admin claim is not set,
        // we need to refresh the token again to ensure the claim is set
        if (isAdminWallet && !hasAdminClaim) {
          console.log('Admin wallet detected but admin claim not set, refreshing token again');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await freshUser.getIdToken(true);
        }
      }
    } catch (tokenError) {
      console.error('Error checking post-authentication token:', tokenError);
    }
    
    return authResult;
  } catch (error) {
    console.error('Error authenticating with wallet:', error);
    
    // Rethrow as AuthError if it's not already
    if (!(error instanceof AuthError)) {
      throw new AuthError(
        error instanceof Error ? error.message : 'Authentication failed',
        AuthErrorType.UNKNOWN
      );
    }
    
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns Promise that resolves when sign out is complete
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseAuth.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Check if the current user has project role
 * @returns Promise with boolean indicating if user is a project owner
 */
export const isProject = async (): Promise<boolean> => {
  try {
    permissionDebug.checkStart('project', 'isProject');
    
    const user = firebaseAuth.currentUser;
    if (!user) {
      permissionDebug.checkResult('project', false, 'isProject', {
        reason: 'No current user found'
      });
      return false;
    }
    
    // Refresh token to get latest claims
    await user.getIdToken(true);
    const idTokenResult = await user.getIdTokenResult();
    
    const hasProjectClaim = !!idTokenResult.claims.project;
    
    permissionDebug.checkResult('project', hasProjectClaim, 'isProject', {
      uid: user.uid,
      claims: idTokenResult.claims
    });
    
    return hasProjectClaim;
  } catch (error) {
    permissionDebug.error('isProject', 'Error checking project status', error);
    return false;
  }
};