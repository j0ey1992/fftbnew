/**
 * Utility functions for debugging
 */

/**
 * Log a debug message with a timestamp
 * @param context The context of the debug message
 * @param message The debug message
 * @param data Additional data to log
 */
export function debugLog(context: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${context}] ${message}`);
  if (data !== undefined) {
    console.log(data);
  }
}

/**
 * Create a profile debugging object to track profile-related operations
 */
export const profileDebug = {
  fetchAttempt: (address: string) => debugLog('Profile Fetch', `Attempting to fetch profile for address: ${address}`),
  fetchSuccess: (address: string) => debugLog('Profile Fetch', `Successfully fetched profile for address: ${address}`),
  fetchError: (address: string, error: any) => debugLog('Profile Fetch', `Error fetching profile for address: ${address}`, error),
  fetchNotFound: (address: string) => debugLog('Profile Fetch', `Profile not found for address: ${address}`),
  createAttempt: (address: string) => debugLog('Profile Create', `Attempting to create profile for address: ${address}`),
  createSuccess: (address: string) => debugLog('Profile Create', `Successfully created profile for address: ${address}`),
  createError: (address: string, error: any) => debugLog('Profile Create', `Error creating profile for address: ${address}`, error),
  addressNormalization: (original: string, normalized: string) => debugLog('Address', `Normalized address: ${original} → ${normalized}`),
};

/**
 * Create a permission debugging object to track permission-related operations
 */
export const permissionDebug = {
  checkStart: (type: string, context: string) =>
    debugLog('Permission Check', `Starting ${type} permission check in ${context}`),
  
  checkResult: (type: string, result: boolean, context: string, details?: any) =>
    debugLog('Permission Check', `${type} permission check result: ${result ? 'GRANTED' : 'DENIED'} in ${context}`, details),
  
  userInfo: (context: string, address?: string, claims?: any) =>
    debugLog('Permission User', `User info in ${context}`, { address, claims }),
  
  projectAccess: (context: string, projectId: string, isOwner: boolean, isCollaborator: boolean, details?: any) =>
    debugLog('Permission Project', `Project ${projectId} access in ${context}: owner=${isOwner}, collaborator=${isCollaborator}`, details),
  
  collaboratorAdd: (context: string, projectId: string, userAddress?: string, result?: boolean) =>
    debugLog('Permission Collaborator', `Adding user ${userAddress || 'unknown'} as collaborator to project ${projectId} in ${context}: ${result ? 'SUCCESS' : 'FAILED'}`),
  
  apiRequest: (context: string, endpoint: string, method: string, details?: any) =>
    debugLog('Permission API', `${method} request to ${endpoint} in ${context}`, details),
  
  apiResponse: (context: string, endpoint: string, status: number, details?: any) =>
    debugLog('Permission API', `Response from ${endpoint} in ${context}: status=${status}`, details),
  
  error: (context: string, message: string, error?: any) =>
    debugLog('Permission Error', `Error in ${context}: ${message}`, error)
};
