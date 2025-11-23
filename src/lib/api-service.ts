'use client'

// Force module reload
import {
  NftStakingContractData,
  StakingContractData,
  VaultContractData,
  VVSPairData
} from './firebase/functions-service';
import { Quest } from '@/types';
import { Submission } from '@/types/submission';
import { authenticatedFetch } from '@/lib/api/auth-helpers';
import { firebaseAuth } from './firebase/config';
import { getAuthToken } from './api/auth';
import { API_BASE_URL } from '@/lib/api/config';

/**
 * Ensure CSRF token is available by fetching from server if needed
 * @returns Promise that resolves when CSRF token is available
 */
// Store CSRF token in memory as fallback for cross-origin issues
let csrfTokenInMemory: string | null = null;

async function ensureCSRFToken(): Promise<void> {
  // Check if we already have a CSRF token
  const existingToken = getCsrfTokenFromCookie() || csrfTokenInMemory;
  if (existingToken) {
    console.log('CSRF token already exists');
    return;
  }
  
  console.log('Fetching CSRF token from server...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Important: include credentials to receive cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch CSRF token:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('CSRF token response:', data);
    
    // Store token from response body as fallback
    if (data.token) {
      csrfTokenInMemory = data.token;
      console.log('CSRF token stored in memory from response');
    }
    
    // Check if token was set in cookie (might not work for cross-origin)
    const newToken = getCsrfTokenFromCookie();
    if (newToken) {
      console.log('CSRF token successfully set in cookie');
    } else {
      console.log('CSRF token not in cookie, using in-memory token');
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
}

/**
 * Get CSRF token from cookie or memory
 * @returns CSRF token or null if not found
 */
function getCsrfTokenFromCookie(): string | null {
  // First try to get from cookie
  if (typeof document !== 'undefined') {
    const name = 'csrf-token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    console.log('All cookies:', document.cookie);
    console.log('Looking for CSRF token...');
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      console.log('Checking cookie:', cookie);
      if (cookie.indexOf(name) === 0) {
        const token = cookie.substring(name.length, cookie.length);
        console.log('Found CSRF token in cookie:', token);
        return token;
      }
    }
    
    console.log('CSRF token not found in cookies');
  }
  
  // Fallback to in-memory token for cross-origin scenarios
  if (csrfTokenInMemory) {
    console.log('Using in-memory CSRF token');
    return csrfTokenInMemory;
  }
  
  return null;
}

/**
 * Get enabled NFT staking contracts from the backend API
 * @returns Promise with array of enabled NFT staking contracts
 */
export const getEnabledNftStakingContracts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nft-staking/enabled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the data includes all required properties for NftStakingContract
    return data as NftStakingContractData[];
  } catch (error) {
    console.error('Error getting enabled NFT staking contracts:', error);
    throw error;
  }
};

/**
 * Get a specific NFT staking contract by ID from the backend API
 * @param id NFT staking contract ID
 * @returns Promise with NFT staking contract data or null if not found
 */
export const getNftStakingContract = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nft-staking/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the data includes all required properties for NftStakingContract
    return data as NftStakingContractData;
  } catch (error) {
    console.error(`Error getting NFT staking contract ${id}:`, error);
    throw error;
  }
};

// Auth imports are already at the top of the file

/**
 * Get all NFT staking contracts from the backend API (admin only)
 * @returns Promise with array of NFT staking contracts
 */
export const getAllNftStakingContracts = async () => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/nft-staking`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the data includes all required properties for NftStakingContract
    return data as NftStakingContractData[];
  } catch (error) {
    console.error('Error getting all NFT staking contracts:', error);
    throw error;
  }
};

/**
 * Add a new NFT staking contract using the backend API (admin only)
 * @param contractData NFT staking contract data
 * @returns Promise with result
 */
export const addNftStakingContract = async (contractData: NftStakingContractData) => {
  try {
    // Ensure CSRF token is available
    await ensureCSRFToken();
    
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/nft-staking`, {
      method: 'POST',
      headers,
      credentials: 'include', // Include credentials to send cookies
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding NFT staking contract:', error);
    throw error;
  }
};

/**
 * Add a user-deployed NFT staking contract using the backend API (authenticated users)
 * @param contractData NFT staking contract data
 * @returns Promise with result
 */
export const addUserDeployedNftStakingContract = async (contractData: NftStakingContractData) => {
  try {
    // Ensure CSRF token is available
    await ensureCSRFToken();
    
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/nft-staking/user-deployed`, {
      method: 'POST',
      headers,
      credentials: 'include', // Include credentials to send cookies
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding user-deployed NFT staking contract:', error);
    throw error;
  }
};

/**
 * Update an existing NFT staking contract using the backend API (admin only)
 * @param id NFT staking contract ID
 * @param contractData Updated NFT staking contract data
 * @returns Promise with result
 */
export const updateNftStakingContract = async (id: string, contractData: Partial<NftStakingContractData>) => {
  try {
    // Ensure CSRF token is available
    await ensureCSRFToken();
    
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/nft-staking/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include', // Include credentials to send cookies
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating NFT staking contract:', error);
    throw error;
  }
};

/**
 * Delete an NFT staking contract using the backend API (admin only)
 * @param id NFT staking contract ID
 * @returns Promise with result
 */
export const deleteNftStakingContract = async (id: string) => {
  try {
    // Ensure CSRF token is available
    await ensureCSRFToken();
    
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/nft-staking/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include' // Include credentials to send cookies
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting NFT staking contract:', error);
    throw error;
  }
};

/**
 * Toggle an NFT staking contract's enabled status using the backend API (admin only)
 * @param id NFT staking contract ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleNftStakingContractStatus = async (id: string, enabled: boolean) => {
  try {
    // Ensure CSRF token is available
    await ensureCSRFToken();
    
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/nft-staking/${id}/toggle`, {
      method: 'PATCH',
      headers,
      credentials: 'include', // Include credentials to send cookies
      body: JSON.stringify({ enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling NFT staking contract status:', error);
    throw error;
  }
};

/**
 * Get all staking contracts from the backend API (admin only)
 * @returns Promise with array of staking contracts
 */
export const getAllStakingContracts = async () => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/staking`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the data includes all required properties for StakingContract
    return data as StakingContractData[];
  } catch (error) {
    console.error('Error getting all staking contracts:', error);
    throw error;
  }
};

/**
 * Get enabled staking contracts from the backend API
 * @returns Promise with array of enabled staking contracts
 */
export const getEnabledStakingContracts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/staking/enabled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the data includes all required properties for StakingContract
    return data as StakingContractData[];
  } catch (error) {
    console.error('Error getting enabled staking contracts:', error);
    throw error;
  }
};

/**
 * Get a specific staking contract by ID from the backend API
 * @param id Staking contract ID
 * @returns Promise with staking contract data or null if not found
 */
export const getStakingContract = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/staking/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the data includes all required properties for StakingContract
    return data as StakingContractData;
  } catch (error) {
    console.error(`Error getting staking contract ${id}:`, error);
    throw error;
  }
};

/**
 * Get a specific LP staking contract by ID from the backend API
 * @param id LP staking contract ID
 * @returns Promise with LP staking contract data or null if not found
 */
export const getLpStakingContract = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lp-staking/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting LP staking contract ${id}:`, error);
    throw error;
  }
};

/**
 * Get enabled LP staking contracts from the backend API
 * @returns Promise with array of enabled LP staking contracts
 */
export const getEnabledLpStakingContracts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lp-staking/enabled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting enabled LP staking contracts:', error);
    throw error;
  }
};

/**
 * Get all LP staking contracts from the backend API (admin only)
 * @returns Promise with array of LP staking contracts
 */
export const getAllLpStakingContracts = async () => {
  try {
    console.log('LP Staking API: Getting all contracts (admin endpoint)');
    
    // Use the authenticated fetch helper which ensures auth is ready and token is fresh
    const response = await authenticatedFetch(`${API_BASE_URL}/api/lp-staking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`LP Staking API: Response status ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LP Staking API: Error response: ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please ensure you are signed in with an admin account.');
      } else if (response.status === 403) {
        throw new Error('Admin access required. Your account does not have admin privileges.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`LP Staking API: Successfully retrieved ${data.length} contracts`);
    return data;
  } catch (error) {
    console.error('Error getting all LP staking contracts:', error);
    throw error;
  }
};

/**
 * Update an LP staking contract using the backend API (admin only)
 * @param id LP staking contract ID
 * @param contractData Updated LP staking contract data
 * @returns Promise with result
 */
export const updateLpStakingContract = async (id: string, contractData: any) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/lp-staking/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating LP staking contract:', error);
    throw error;
  }
};

/**
 * Delete an LP staking contract using the backend API (admin only)
 * @param id LP staking contract ID
 * @returns Promise with result
 */
export const deleteLpStakingContract = async (id: string) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/lp-staking/${id}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting LP staking contract:', error);
    throw error;
  }
};

/**
 * Toggle an LP staking contract's enabled status using the backend API (admin only)
 * @param id LP staking contract ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleLpStakingContractStatus = async (id: string, enabled: boolean) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/lp-staking/${id}/toggle`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling LP staking contract status:', error);
    throw error;
  }
};

/**
 * Get user profile by address from the backend API
 * @param address User wallet address
 * @returns Promise with user profile data
 */
export const getUserProfile = async (address: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Create or update user profile using the backend API
 * @param address User wallet address
 * @param userData User profile data
 * @returns Promise with updated user profile data
 */
export const createOrUpdateUserProfile = async (address: string, userData: any) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ address, userData })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

/**
 * Get top users by XP from the backend API
 * @param limitCount Number of users to retrieve
 * @returns Promise with array of top users
 */
export const getTopUsers = async (limitCount: number = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/top?limitCount=${limitCount}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting top users:', error);
    throw error;
  }
};

/**
 * Get all quests from the backend API (admin only)
 * @returns Promise with array of quests
 */
export const getAllQuests = async () => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quest[];
  } catch (error) {
    console.error('Error getting all quests:', error);
    throw error;
  }
};

/**
 * Get active quests from the backend API
 * @returns Promise with array of active quests
 */
export const getActiveQuests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quests/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quest[];
  } catch (error) {
    console.error('Error getting active quests:', error);
    throw error;
  }
};

/**
 * Get quests by category from the backend API
 * @param category Quest category
 * @returns Promise with array of quests
 */
export const getQuestsByCategory = async (category: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quests/category/${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quest[];
  } catch (error) {
    console.error('Error getting quests by category:', error);
    throw error;
  }
};

/**
 * Get quests by difficulty from the backend API
 * @param difficulty Quest difficulty
 * @returns Promise with array of quests
 */
export const getQuestsByDifficulty = async (difficulty: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quests/difficulty/${difficulty}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quest[];
  } catch (error) {
    console.error('Error getting quests by difficulty:', error);
    throw error;
  }
};

/**
 * Get featured quests from the backend API
 * @param limit Number of quests to return
 * @returns Promise with array of featured quests
 */
export const getFeaturedQuests = async (limit: number = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quests/featured?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quest[];
  } catch (error) {
    console.error('Error getting featured quests:', error);
    throw error;
  }
};

/**
 * Get a quest by ID from the backend API
 * @param id Quest ID
 * @returns Promise with quest data
 */
export const getQuestById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quests/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quest;
  } catch (error) {
    console.error('Error getting quest by ID:', error);
    throw error;
  }
};

/**
 * Create a new quest using the backend API (admin only)
 * @param questData Quest data
 * @returns Promise with result
 */
export const createQuest = async (questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'participantsJoined'>) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Transform client-side Quest model to match server-side expected format
    const serverQuestData = {
      title: questData.title,
      description: questData.description,
      // Convert reward from number to string
      reward: questData.reward.toString(),
      // Default to 'token' as rewardType
      rewardType: 'token',
      // Map client-side difficulty to server-side format (lowercase)
      difficulty: questData.difficulty.toLowerCase(),
      // Convert requirements array to string (JSON stringify)
      requirements: JSON.stringify(questData.requirements),
      // Set startDate to current date if not provided
      startDate: new Date().toISOString(),
      // Set endDate to expiresAt if provided, otherwise 30 days from now
      endDate: questData.expiresAt 
        ? (questData.expiresAt instanceof Date 
            ? questData.expiresAt.toISOString() 
            : typeof questData.expiresAt === 'object' && 'toDate' in questData.expiresAt 
              ? questData.expiresAt.toDate().toISOString()
              : new Date(questData.expiresAt as any).toISOString())
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      // Pass through any other fields that might be needed
      category: questData.category,
      projectId: questData.projectId,
      tokenAddress: questData.tokenAddress,
      tokenSymbol: questData.tokenSymbol,
      tokenDecimals: questData.tokenDecimals,
      participantLimit: questData.participantLimit,
      status: questData.status
    };
    
    console.log('Sending quest data to server:', serverQuestData);
    
    const response = await fetch(`${API_BASE_URL}/api/quests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(serverQuestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating quest:', error);
    throw error;
  }
};

/**
 * Update an existing quest using the backend API (admin only)
 * @param id Quest ID
 * @param questData Updated quest data
 * @returns Promise with result
 */
export const updateQuest = async (id: string, questData: Partial<Quest>) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Transform client-side Quest model to match server-side expected format
    const serverQuestData: any = { ...questData };
    
    // Convert reward from number to string if present
    if (typeof questData.reward === 'number') {
      serverQuestData.reward = questData.reward.toString();
    }
    
    // Add rewardType if not present
    if (!serverQuestData.rewardType) {
      serverQuestData.rewardType = 'token';
    }
    
    // Convert requirements array to string if present
    if (Array.isArray(questData.requirements)) {
      serverQuestData.requirements = JSON.stringify(questData.requirements);
    }
    
    // Handle expiresAt to endDate conversion if present
    if (questData.expiresAt) {
      serverQuestData.endDate = questData.expiresAt instanceof Date 
        ? questData.expiresAt.toISOString() 
        : typeof questData.expiresAt === 'object' && 'toDate' in questData.expiresAt 
          ? questData.expiresAt.toDate().toISOString()
          : new Date(questData.expiresAt as any).toISOString();
      
      // If we're setting endDate, also ensure startDate is set
      if (!serverQuestData.startDate) {
        serverQuestData.startDate = new Date().toISOString();
      }
    }
    
    // Map client-side difficulty to server-side format (lowercase) if present
    if (questData.difficulty) {
      serverQuestData.difficulty = questData.difficulty.toLowerCase();
    }
    
    console.log('Sending updated quest data to server:', serverQuestData);
    
    const response = await fetch(`${API_BASE_URL}/api/quests/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(serverQuestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating quest:', error);
    throw error;
  }
};

/**
 * Delete a quest using the backend API (admin only)
 * @param id Quest ID
 * @returns Promise with result
 */
export const deleteQuest = async (id: string) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/${id}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting quest:', error);
    throw error;
  }
};

/**
 * Submit a quest completion using the backend API
 * @param questId Quest ID
 * @param proofType Type of proof (image_proof, link_proof, tx_hash)
 * @param proofData Proof data
 * @param requirementType Type of requirement completed
 * @returns Promise with result
 */
export const submitQuestCompletion = async (
  questId: string,
  proofType: string,
  proofData: any,
  requirementType?: string
) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/${questId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        proofType,
        proofData,
        requirementType
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting quest completion:', error);
    throw error;
  }
};

/**
 * Moderate a quest submission using the backend API (admin only)
 * @param submissionId Submission ID
 * @param status New status (verified or rejected)
 * @param moderationNote Optional moderation note
 * @returns Promise with result
 */
export const moderateSubmission = async (
  submissionId: string,
  status: 'verified' | 'rejected',
  moderationNote?: string
) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/submissions/${submissionId}/moderate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        status,
        moderationNote
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error moderating submission:', error);
    throw error;
  }
};

/**
 * Get all submissions using the backend API (admin only)
 * @param status Optional status filter
 * @returns Promise with array of submissions
 */
export const getAllSubmissions = async (status?: string) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = status 
      ? `${API_BASE_URL}/api/quests/submissions?status=${status}`
      : `${API_BASE_URL}/api/quests/submissions`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Submission[];
  } catch (error) {
    console.error('Error getting submissions:', error);
    throw error;
  }
};

/**
 * Get submissions by user using the backend API
 * @param walletAddress User wallet address
 * @returns Promise with array of submissions
 */
export const getUserSubmissions = async (walletAddress: string) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/submissions/user/${walletAddress}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Submission[];
  } catch (error) {
    console.error('Error getting user submissions:', error);
    throw error;
  }
};

/**
 * Get all vault contracts from the backend API (admin only)
 * @returns Promise with array of vault contracts
 */
export const getAllVaultContracts = async () => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/vaults`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as VaultContractData[];
  } catch (error) {
    console.error('Error getting all vault contracts:', error);
    throw error;
  }
};

/**
 * Get enabled vault contracts from the backend API
 * @returns Promise with array of enabled vault contracts
 */
export const getEnabledVaultContracts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vaults/enabled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as VaultContractData[];
  } catch (error) {
    console.error('Error getting enabled vault contracts:', error);
    throw error;
  }
};

/**
 * Get a vault contract by ID from the backend API
 * @param id Vault contract ID
 * @returns Promise with vault contract data
 */
export const getVaultContractById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vaults/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as VaultContractData;
  } catch (error) {
    console.error('Error getting vault contract by ID:', error);
    throw error;
  }
};

/**
 * Add a new vault contract using the backend API (admin only)
 * @param contractData Vault contract data
 * @returns Promise with result
 */
export const addVaultContract = async (contractData: Omit<VaultContractData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/vaults`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding vault contract:', error);
    throw error;
  }
};

/**
 * Update an existing vault contract using the backend API (admin only)
 * @param id Vault contract ID
 * @param contractData Updated vault contract data
 * @returns Promise with result
 */
export const updateVaultContract = async (id: string, contractData: Partial<VaultContractData>) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/vaults/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating vault contract:', error);
    throw error;
  }
};

/**
 * Delete a vault contract using the backend API (admin only)
 * @param id Vault contract ID
 * @returns Promise with result
 */
export const deleteVaultContract = async (id: string) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/vaults/${id}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting vault contract:', error);
    throw error;
  }
};

/**
 * Toggle a vault contract's enabled status using the backend API (admin only)
 * @param id Vault contract ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleVaultContractStatus = async (id: string, enabled: boolean) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/vaults/${id}/toggle`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling vault contract status:', error);
    throw error;
  }
};

/**
 * Get quest logs from the backend API (admin only)
 * @param type Log type (activity, security, moderation)
 * @param limitCount Maximum number of logs to retrieve
 * @returns Promise with array of log entries
 */
export const getQuestLogs = async (type: string = 'activity', limitCount: number = 100) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/logs?type=${type}&limit=${limitCount}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting quest logs:', error);
    throw error;
  }
};

/**
 * Get logs for a specific user from the backend API (admin only)
 * @param userId User ID
 * @param type Log type (activity, security, moderation)
 * @param limitCount Maximum number of logs to retrieve
 * @returns Promise with array of log entries
 */
export const getUserLogs = async (userId: string, type: string = 'activity', limitCount: number = 50) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/logs/user/${userId}?type=${type}&limit=${limitCount}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting logs for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get logs for a specific quest from the backend API (admin only)
 * @param questId Quest ID
 * @param type Log type (activity, security, moderation)
 * @param limitCount Maximum number of logs to retrieve
 * @returns Promise with array of log entries
 */
export const getQuestLogsByQuestId = async (questId: string, type: string = 'activity', limitCount: number = 50) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/logs/quest/${questId}?type=${type}&limit=${limitCount}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting logs for quest ${questId}:`, error);
    throw error;
  }
};

/**
 * Create a log entry using the backend API
 * @param level Log level (INFO, WARNING, ERROR, SECURITY)
 * @param type Log type (ACTIVITY, SECURITY, MODERATION)
 * @param message Log message
 * @param metadata Additional metadata
 * @returns Promise with result
 */
export const createLogEntry = async (
  level: string,
  type: string,
  message: string,
  metadata: Record<string, any> = {}
) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quests/logs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        level,
        type,
        message,
        metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating log entry:', error);
    throw error;
  }
};
