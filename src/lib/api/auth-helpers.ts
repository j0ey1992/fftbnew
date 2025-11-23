import { firebaseAuth } from '@/lib/firebase/config';

/**
 * Get a fresh Firebase ID token
 * This ensures we always have a valid token for API calls
 */
export async function getFreshToken(): Promise<string | null> {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) {
      console.log('AUTH HELPER: No current user');
      return null;
    }
    
    // Force refresh to get the latest token with all claims
    const token = await user.getIdToken(true);
    console.log('AUTH HELPER: Got fresh token');
    return token;
  } catch (error) {
    console.error('AUTH HELPER: Error getting fresh token:', error);
    return null;
  }
}

/**
 * Wait for authentication to be ready
 * This is useful when making API calls immediately after page load
 */
export async function waitForAuth(maxWaitTime = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (firebaseAuth.currentUser) {
      console.log('AUTH HELPER: Auth is ready');
      return true;
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('AUTH HELPER: Auth wait timeout');
  return false;
}

/**
 * Ensure user is authenticated before making API calls
 * This combines waiting for auth and getting a fresh token
 */
export async function ensureAuthenticated(): Promise<string | null> {
  // First wait for auth to be ready
  const authReady = await waitForAuth();
  if (!authReady) {
    console.log('AUTH HELPER: Authentication not ready');
    return null;
  }
  
  // Then get a fresh token
  return getFreshToken();
}

/**
 * Make an authenticated API request
 * This helper ensures proper authentication before making the request
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await ensureAuthenticated();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Add the authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}