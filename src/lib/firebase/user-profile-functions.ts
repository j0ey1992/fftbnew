'use client';

import { 
  getFunctions, 
  httpsCallable, 
  connectFunctionsEmulator
} from 'firebase/functions';
import { firebaseApp } from './config';
import { User } from '@/types/user';
import { normalizeAddress } from '@/utils/addressUtils';
import { profileDebug } from '@/utils/debugUtils';

// Initialize Firebase Functions
const functions = getFunctions(firebaseApp);

// Connect to emulator if in development environment
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

/**
 * Get a user profile by address
 * @param address User's wallet address
 * @returns User profile or null if not found
 */
export async function getUserProfileFunction(address: string): Promise<User | null> {
  if (!address) {
    console.error('getUserProfileFunction called with empty address');
    return null;
  }
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  profileDebug.fetchAttempt(normalizedAddr);
  
  try {
    // Use the local server API instead of directly calling Firebase
    // Add debug log to track the API call
    console.log(`[DEBUG] Fetching user profile via server API for address: ${normalizedAddr}`);
    console.log(`[DEBUG] Environment: ${process.env.NODE_ENV}`);
    console.log(`[DEBUG] NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    console.log(`[DEBUG] NEXT_PUBLIC_USE_FIREBASE_EMULATOR: ${process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR}`);
    
    // Use the server API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log(`[DEBUG] Using API base URL: ${baseUrl}`);
    const url = new URL(`${baseUrl}/api/users/${normalizedAddr}`);
    console.log(`[DEBUG] Full request URL: ${url.toString()}`);
    
    console.log(`[DEBUG] Sending fetch request to: ${url.toString()}`);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`[DEBUG] Server API response status: ${response.status}`);
    console.log(`[DEBUG] Server API response headers:`, Object.fromEntries([...response.headers]));
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[DEBUG] 404 response received - User profile not found for: ${normalizedAddr}`);
        profileDebug.fetchNotFound(normalizedAddr);
        
        // Check if we should auto-create the profile
        console.log(`[DEBUG] Should we auto-create the profile? Checking configuration...`);
        const shouldAutoCreate = process.env.NEXT_PUBLIC_AUTO_CREATE_PROFILES === 'true';
        console.log(`[DEBUG] Auto-create profiles setting: ${shouldAutoCreate}`);
        
        if (shouldAutoCreate) {
          console.log(`[DEBUG] Auto-creating profile for: ${normalizedAddr}`);
          try {
            console.log(`[DEBUG] Calling ensureUserProfileExists to create profile for: ${normalizedAddr}`);
            // Create the profile directly instead of calling ensureUserProfileExists
            // This avoids potential recursion issues
            
            // Use the local server API instead of directly calling Firebase
            console.log(`[DEBUG] Creating user profile via server API for address: ${normalizedAddr}`);
            
            // Use the server API endpoint
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const url = `${baseUrl}/api/users`;
            
            console.log(`[DEBUG] Creating profile with POST request to: ${url}`);
            
            // Prepare the profile data
            const profileData = {
              address: normalizedAddr,
              userData: {
                displayName: `User ${normalizedAddr.substring(0, 6)}`,
                xp: 0,
                level: 1,
                completedQuests: [],
                tokenBalances: {},
                tokenSymbols: {},
                tokenDecimals: {}
              }
            };
            
            console.log(`[DEBUG] Profile data to be sent:`, JSON.stringify(profileData));
            
            const createResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(profileData)
            });
            
            console.log(`[DEBUG] Create profile response status: ${createResponse.status}`);
            
            if (!createResponse.ok) {
              const errorText = await createResponse.text();
              console.log(`[DEBUG] Error response when creating profile: ${errorText}`);
              throw new Error(`HTTP error! status: ${createResponse.status}, message: ${errorText}`);
            }
            
            console.log(`[DEBUG] Successfully created profile, parsing response...`);
            const data = await createResponse.json();
            console.log(`[DEBUG] Created profile data:`, data);
            profileDebug.createSuccess(normalizedAddr);
            return data.profile;
          } catch (createError: any) {
            console.error(`[DEBUG] Error auto-creating profile:`, createError);
            console.error(`[DEBUG] Error details:`, createError.message);
            console.error(`[DEBUG] Error stack:`, createError.stack);
          }
        }
        
        return null; // User not found
      }
      const errorText = await response.text();
      console.log(`[DEBUG] Error response body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    console.log(`[DEBUG] Successfully received profile response, parsing JSON...`);
    const data = await response.json();
    console.log(`[DEBUG] Parsed profile data:`, data);
    profileDebug.fetchSuccess(normalizedAddr);
    return data as User | null;
  } catch (error) {
    profileDebug.fetchError(normalizedAddr, error);
    console.error('Error getting user profile:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('[DEBUG] Error type:', error.constructor.name);
      console.error('[DEBUG] Error message:', error.message);
      console.error('[DEBUG] Error stack:', error.stack);
    } else {
      console.error('[DEBUG] Unknown error type:', typeof error);
    }
    
    // Check if we're falling back to direct Firebase call
    console.error('[DEBUG] Are we falling back to direct Firebase call? Investigate this!');
    
    throw error;
  }
}

/**
 * Ensure a user profile exists, creating it if it doesn't
 * @param address User's wallet address
 * @returns User profile
 */
export async function ensureUserProfileExists(address: string): Promise<User | null> {
  if (!address) {
    console.error('ensureUserProfileExists called with empty address');
    return null;
  }
  
  const normalizedAddr = normalizeAddress(address);
  
  try {
    // First try to get the existing profile
    const existingProfile = await getUserProfileFunction(normalizedAddr);
    
    // If profile exists, return it
    if (existingProfile) {
      return existingProfile;
    }
    
    // If profile doesn't exist, create a new one
    profileDebug.createAttempt(normalizedAddr);
    
    // Use the local server API instead of directly calling Firebase
    // Add debug log to track the API call
    console.log(`[DEBUG] Creating user profile via server API for address: ${normalizedAddr}`);
    
    // Use the server API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/users`;
    
    console.log(`[DEBUG] Creating profile with POST request to: ${url}`);
    
    // Prepare the profile data
    const profileData = {
      address: normalizedAddr,
      userData: {
        displayName: `User ${normalizedAddr.substring(0, 6)}`,
        xp: 0,
        level: 1,
        completedQuests: [],
        tokenBalances: {},
        tokenSymbols: {},
        tokenDecimals: {}
      }
    };
    
    console.log(`[DEBUG] Profile data to be sent:`, JSON.stringify(profileData));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    console.log(`[DEBUG] Server API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[DEBUG] Error response when creating profile: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    console.log(`[DEBUG] Successfully created profile, parsing response...`);
    const data = await response.json();
    console.log(`[DEBUG] Created profile data:`, data);
    profileDebug.createSuccess(normalizedAddr);
    return data as User;
  } catch (error) {
    profileDebug.createError(normalizedAddr, error);
    console.error('Error ensuring user profile exists:', error);
    throw error;
  }
}

/**
 * Update a user profile
 * @param address User's wallet address
 * @param userData User profile data to update
 * @returns Updated user profile
 */
export async function updateUserProfileFunction(address: string, userData: Partial<User>): Promise<User> {
  if (!address) {
    console.error('updateUserProfileFunction called with empty address');
    throw new Error('Address is required');
  }
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    console.log(`[DEBUG] Updating user profile via server API for address: ${normalizedAddr}`);
    
    // Use the server API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/users/${normalizedAddr}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] Update profile error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('[DEBUG] Parsed error data:', errorData);
      } catch {
        // Not JSON, use raw text
      }
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    return data.profile as User;
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof Error) {
      console.error('[DEBUG] Error details:', error.message);
    }
    throw error;
  }
}

/**
 * Add XP to a user profile
 * @param address User's wallet address
 * @param xpAmount Amount of XP to add
 * @returns Updated user profile
 */
export async function addUserXPFunction(address: string, xpAmount: number): Promise<User> {
  if (!address) {
    console.error('addUserXPFunction called with empty address');
    throw new Error('Address is required');
  }
  
  const normalizedAddr = normalizeAddress(address);
  
  try {
    console.log(`[DEBUG] Adding XP via server API for address: ${normalizedAddr}`);
    
    // Use the server API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/users/${normalizedAddr}/add-xp`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ xp: xpAmount })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    return data.profile as User;
  } catch (error) {
    console.error('Error adding user XP:', error);
    if (error instanceof Error) {
      console.error('[DEBUG] Error details:', error.message);
    }
    throw error;
  }
}

/**
 * Add a completed quest to a user profile
 * @param address User's wallet address
 * @param questId ID of the completed quest
 * @param xpReward XP reward for completing the quest
 * @returns Updated user profile
 */
export async function addCompletedQuestFunction(
  address: string, 
  questId: string, 
  xpReward: number = 0
): Promise<User> {
  try {
    const addCompletedQuestFunction = httpsCallable(functions, 'addCompletedQuest');
    const result = await addCompletedQuestFunction({ address, questId, xpReward });
    return result.data as User;
  } catch (error) {
    console.error('Error adding completed quest:', error);
    throw error;
  }
}

/**
 * Get top users by XP (leaderboard)
 * @param limitCount Number of users to return
 * @returns Array of user profiles sorted by XP
 */
export async function getTopUsersFunction(limitCount: number = 10): Promise<User[]> {
  try {
    // Add debug logs to understand environment and URL selection
    console.log(`[DEBUG] getTopUsersFunction - Environment: ${process.env.NODE_ENV}`);
    console.log(`[DEBUG] getTopUsersFunction - NEXT_PUBLIC_USE_FIREBASE_EMULATOR: ${process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR}`);
    console.log(`[DEBUG] getTopUsersFunction - NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    
    // Check if we should use the local server API instead
    const shouldUseLocalServer = process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'development';
    console.log(`[DEBUG] getTopUsersFunction - Should use local server: ${shouldUseLocalServer}`);
    
    let url: URL;
    
    if (shouldUseLocalServer) {
      // Use the local server API endpoint
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      url = new URL(`${baseUrl}/api/users/top`);
      console.log(`[DEBUG] getTopUsersFunction - Using local server URL: ${url.toString()}`);
    } else {
      // Use direct HTTP fetch instead of callable function to avoid CORS issues
      const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
        ? `http://localhost:5001/${firebaseApp.options.projectId}/us-central1/getTopUsersHttp`
        : `https://us-central1-${firebaseApp.options.projectId}.cloudfunctions.net/getTopUsersHttp`;
      
      url = new URL(baseUrl);
      console.log(`[DEBUG] getTopUsersFunction - Using Firebase URL: ${url.toString()}`);
    }
    
    url.searchParams.append('limitCount', limitCount.toString());
    console.log(`[DEBUG] getTopUsersFunction - Final URL with params: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as User[];
  } catch (error) {
    console.error('Error getting top users:', error);
    throw error;
  }
}

/**
 * Follow a user
 * @param followerAddress Address of the user who is following
 * @param followeeAddress Address of the user to follow
 * @returns Updated user profile of the follower
 */
export async function followUserFunction(
  followerAddress: string,
  followeeAddress: string
): Promise<User> {
  try {
    const followUserFunction = httpsCallable(functions, 'followUser');
    const result = await followUserFunction({ followerAddress, followeeAddress });
    return result.data as User;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 * @param followerAddress Address of the user who is unfollowing
 * @param followeeAddress Address of the user to unfollow
 * @returns Updated user profile of the follower
 */
export async function unfollowUserFunction(
  followerAddress: string,
  followeeAddress: string
): Promise<User> {
  try {
    const unfollowUserFunction = httpsCallable(functions, 'unfollowUser');
    const result = await unfollowUserFunction({ followerAddress, followeeAddress });
    return result.data as User;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Share a quest on social media
 * @param address User's wallet address
 * @param questId ID of the quest to share
 * @param platform Platform where the quest was shared
 * @param url URL of the share (if available)
 * @returns Updated user profile
 */
export async function shareQuestFunction(
  address: string,
  questId: string,
  platform: 'twitter' | 'discord' | 'telegram' | 'other',
  url?: string
): Promise<User> {
  try {
    const shareQuestFunction = httpsCallable(functions, 'shareQuest');
    const result = await shareQuestFunction({ address, questId, platform, url });
    return result.data as User;
  } catch (error) {
    console.error('Error sharing quest:', error);
    throw error;
  }
}

/**
 * Get followers of a user
 * @param address User's wallet address
 * @param limitCount Maximum number of followers to return
 * @returns Array of user profiles
 */
export async function getUserFollowersFunction(
  address: string,
  limitCount: number = 10
): Promise<User[]> {
  try {
    const getUserFollowersFunction = httpsCallable(functions, 'getUserFollowers');
    const result = await getUserFollowersFunction({ address, limitCount });
    return result.data as User[];
  } catch (error) {
    console.error('Error getting user followers:', error);
    throw error;
  }
}

/**
 * Get users followed by a user
 * @param address User's wallet address
 * @param limitCount Maximum number of followed users to return
 * @returns Array of user profiles
 */
export async function getUserFollowingFunction(
  address: string,
  limitCount: number = 10
): Promise<User[]> {
  try {
    const getUserFollowingFunction = httpsCallable(functions, 'getUserFollowing');
    const result = await getUserFollowingFunction({ address, limitCount });
    return result.data as User[];
  } catch (error) {
    console.error('Error getting user following:', error);
    throw error;
  }
}
