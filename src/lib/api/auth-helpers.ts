/**
 * Authentication helpers (stub - Firebase removed)
 */

/**
 * Get a fresh Firebase ID token
 * Stub - Firebase removed
 */
export async function getFreshToken(): Promise<string | null> {
  console.warn('getFreshToken: Firebase removed, returning null');
  return null;
}

/**
 * Wait for authentication to be ready
 * Stub - Firebase removed
 */
export async function waitForAuth(maxWaitTime = 5000): Promise<boolean> {
  console.warn('waitForAuth: Firebase removed, returning false');
  return false;
}

/**
 * Ensure user is authenticated before making API calls
 * Stub - Firebase removed
 */
export async function ensureAuthenticated(): Promise<string | null> {
  console.warn('ensureAuthenticated: Firebase removed, returning null');
  return null;
}

/**
 * Make an authenticated API request
 * Stub - Firebase removed
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  console.warn('authenticatedFetch: Firebase removed, making unauthenticated request');
  return fetch(url, options);
}
