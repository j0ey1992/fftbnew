'use client'

import { 
  getFunctions, 
  httpsCallable, 
  connectFunctionsEmulator,
  HttpsCallableResult
} from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from './config';

// Initialize Firebase Functions
const functions = getFunctions(firebaseApp);

// Connect to emulator if in development environment
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

/**
 * Interface for VVS pair data
 */
export interface VVSPairData {
  id?: string;
  name: string;
  symbol: string;
  logo: string;
  address: string;
  isNative?: boolean;
  decimals: number;
  enabled: boolean;
  chainId: number;
}

/**
 * Interface for staking contract data
 */
export interface StakingContractData {
  id?: string;
  name: string;
  description: string;
  contractAddress: string;
  tokenAddress: string;
  rewardTokenAddress: string;
  apr: string;
  minStake: string;
  enabled: boolean;
  chainId: number;
  lockPeriods: {
    period: string;
    days: number;
    apr: string;
    multiplier?: string; // For TokenVault contracts
  }[];
  abi: any[];
  // Logo and social links
  logoUrl?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    website?: string;
    whereToBuy?: string;
    discord?: string;
    telegram?: string;
  };
  createdAt?: any;
  updatedAt?: any;
  contractType?: string; // To identify specific contract types (TokenVault, Smartchef, etc.)
  // TokenVault specific fields
  rewardStartTimestamp?: number;
  rewardEndTimestamp?: number;
  rewardPerSecond?: string;
  // Smartchef specific fields
  startBlock?: number;
  bonusEndBlock?: number;
  poolLimitPerUser?: string;
  minStakingPeriod?: number;
  useInitialLockPeriod?: boolean;
}

/**
 * Interface for NFT collection data
 */
export interface NftCollectionData {
  id: string;
  name: string;
  address: string;
  ratio: number;
  description: string;
  image: string;
  totalStaked: number;
}

/**
 * Interface for NFT staking contract data
 */
export interface NftStakingContractData {
  id?: string;
  name: string;
  description: string;
  contractAddress: string;
  rewardTokenAddress?: string;
  enabled: boolean;
  chainId: number;
  collections: NftCollectionData[];
  abi: any[];
  logoUrl?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    website?: string;
    whereToBuy?: string;
    discord?: string;
    telegram?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Interface for vault contract data
 */
export interface VaultContractData {
  id?: string;
  name: string;
  description: string;
  contractAddress: string;
  tokenAddress: string;
  rewardTokenAddress: string;
  apr: string;
  minDeposit: string;
  enabled: boolean;
  chainId: number;
  depositPeriods: {
    period: string;
    days: number;
    apr: string;
  }[];
  abi: any[];
  logoUrl?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    website?: string;
    whereToBuy?: string;
    discord?: string;
    telegram?: string;
  };
}

/**
 * Get all VVS pairs using Cloud Functions (admin only)
 * @returns Promise with array of VVS pairs
 */
export const getAllVVSPairsFunction = async () => {
  try {
    const getAllPairsFunction = httpsCallable(functions, 'vvsPairs-getAllPairs');
    const result = await getAllPairsFunction();
    return result.data as VVSPairData[];
  } catch (error) {
    console.error('Error getting all VVS pairs:', error);
    throw error;
  }
};

/**
 * Add a new VVS pair using Cloud Functions (admin only)
 * @param pairData VVS pair data
 * @returns Promise with result
 */
export const addVVSPairFunction = async (pairData: VVSPairData) => {
  try {
    const addPairFunction = httpsCallable(functions, 'vvsPairs-addPair');
    const result = await addPairFunction(pairData);
    return result.data as { id: string; success: boolean };
  } catch (error) {
    console.error('Error adding VVS pair:', error);
    throw error;
  }
};

/**
 * Update an existing VVS pair using Cloud Functions (admin only)
 * @param id VVS pair ID
 * @param pairData Updated VVS pair data
 * @returns Promise with result
 */
export const updateVVSPairFunction = async (id: string, pairData: Partial<VVSPairData>) => {
  try {
    const updatePairFunction = httpsCallable(functions, 'vvsPairs-updatePair');
    const result = await updatePairFunction({ id, ...pairData });
    return result.data as { success: boolean };
  } catch (error) {
    console.error('Error updating VVS pair:', error);
    throw error;
  }
};

/**
 * Delete a VVS pair using Cloud Functions (admin only)
 * @param id VVS pair ID
 * @returns Promise with result
 */
export const deleteVVSPairFunction = async (id: string) => {
  try {
    const deletePairFunction = httpsCallable(functions, 'vvsPairs-deletePair');
    const result = await deletePairFunction({ id });
    return result.data as { success: boolean };
  } catch (error) {
    console.error('Error deleting VVS pair:', error);
    throw error;
  }
};

/**
 * Toggle a VVS pair's enabled status using Cloud Functions (admin only)
 * @param id VVS pair ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleVVSPairStatusFunction = async (id: string, enabled: boolean) => {
  try {
    const togglePairStatusFunction = httpsCallable(functions, 'vvsPairs-togglePairStatus');
    const result = await togglePairStatusFunction({ id, enabled });
    return result.data as { success: boolean };
  } catch (error) {
    console.error('Error toggling VVS pair status:', error);
    throw error;
  }
};

/**
 * Initialize default VVS pairs if collection is empty using Cloud Functions (admin only)
 * @returns Promise with result
 */
export const initializeDefaultVVSPairsFunction = async () => {
  try {
    const initializeDefaultPairsFunction = httpsCallable(functions, 'vvsPairs-initializeDefaultPairs');
    const result = await initializeDefaultPairsFunction();
    return result.data as { 
      success: boolean; 
      message: string;
      count?: number;
    };
  } catch (error) {
    console.error('Error initializing default VVS pairs:', error);
    throw error;
  }
};

/**
 * Set admin claim for a user (admin only)
 * @param email User email
 * @returns Promise with result
 */
export const setAdminClaim = async (email: string) => {
  try {
    const setAdminClaimFunction = httpsCallable(functions, 'setAdminClaim');
    const result = await setAdminClaimFunction({ email });
    return result.data as { 
      success: boolean; 
      message: string;
    };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw error;
  }
};

/**
 * Admin-only function example
 * @returns Promise with result
 */
export const adminOnlyFunction = async () => {
  try {
    const adminOnlyFunction = httpsCallable(functions, 'adminOnly');
    const result = await adminOnlyFunction();
    return result.data as { 
      message: string;
      timestamp: string;
    };
  } catch (error) {
    console.error('Error calling admin-only function:', error);
    throw error;
  }
};

/**
 * Get all staking contracts using Cloud Functions (admin only)
 * @returns Promise with array of staking contracts
 */
export const getAllStakingContractsFunction = async () => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/stakingContractsGetAllContracts'
      : 'https://us-central1-trollslots.cloudfunctions.net/stakingContractsGetAllContracts';
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as StakingContractData[];
  } catch (error) {
    console.error('Error getting all staking contracts:', error);
    throw error;
  }
};

/**
 * Add a new staking contract using Cloud Functions (admin only)
 * @param contractData Staking contract data
 * @returns Promise with result
 */
export const addStakingContractFunction = async (contractData: StakingContractData) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/stakingContractsAddContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/stakingContractsAddContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { id: string; success: boolean };
  } catch (error) {
    console.error('Error adding staking contract:', error);
    throw error;
  }
};

/**
 * Update an existing staking contract using Cloud Functions (admin only)
 * @param id Staking contract ID
 * @param contractData Updated staking contract data
 * @returns Promise with result
 */
export const updateStakingContractFunction = async (id: string, contractData: Partial<StakingContractData>) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/stakingContractsUpdateContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/stakingContractsUpdateContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, ...contractData })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error updating staking contract:', error);
    throw error;
  }
};

/**
 * Delete a staking contract using Cloud Functions (admin only)
 * @param id Staking contract ID
 * @returns Promise with result
 */
export const deleteStakingContractFunction = async (id: string) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/stakingContractsDeleteContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/stakingContractsDeleteContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error deleting staking contract:', error);
    throw error;
  }
};

/**
 * Toggle a staking contract's enabled status using Cloud Functions (admin only)
 * @param id Staking contract ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleStakingContractStatusFunction = async (id: string, enabled: boolean) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/stakingContractsToggleContractStatus'
      : 'https://us-central1-trollslots.cloudfunctions.net/stakingContractsToggleContractStatus';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error toggling staking contract status:', error);
    throw error;
  }
};

/**
 * Get all NFT staking contracts using Cloud Functions (admin only)
 * @returns Promise with array of NFT staking contracts
 */
export const getAllNftStakingContractsFunction = async () => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsGetAllContracts'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsGetAllContracts';
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as NftStakingContractData[];
  } catch (error) {
    console.error('Error getting all NFT staking contracts:', error);
    throw error;
  }
};

/**
 * Get enabled NFT staking contracts using Cloud Functions (public)
 * @returns Promise with array of enabled NFT staking contracts
 */
export const getEnabledNftStakingContractsFunction = async () => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsGetEnabledContracts'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsGetEnabledContracts';
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as NftStakingContractData[];
  } catch (error) {
    console.error('Error getting enabled NFT staking contracts:', error);
    throw error;
  }
};

/**
 * Add a new NFT staking contract using Cloud Functions (admin only)
 * @param contractData NFT staking contract data
 * @returns Promise with result
 */
export const addNftStakingContractFunction = async (contractData: NftStakingContractData) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsAddContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsAddContract';
    
    // Get the Firebase auth token
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { id: string; success: boolean };
  } catch (error) {
    console.error('Error adding NFT staking contract:', error);
    throw error;
  }
};

/**
 * Update an existing NFT staking contract using Cloud Functions (admin only)
 * @param id NFT staking contract ID
 * @param contractData Updated NFT staking contract data
 * @returns Promise with result
 */
export const updateNftStakingContractFunction = async (id: string, contractData: Partial<NftStakingContractData>) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsUpdateContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsUpdateContract';
    
    // Get the Firebase auth token
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...contractData })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error updating NFT staking contract:', error);
    throw error;
  }
};

/**
 * Delete an NFT staking contract using Cloud Functions (admin only)
 * @param id NFT staking contract ID
 * @returns Promise with result
 */
export const deleteNftStakingContractFunction = async (id: string) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsDeleteContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsDeleteContract';
    
    // Get the Firebase auth token
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error deleting NFT staking contract:', error);
    throw error;
  }
};

/**
 * Add a user deployed NFT staking contract using Cloud Functions
 * @param contractData NFT staking contract data
 * @returns Promise with result
 */
export const addUserDeployedNftStakingContractFunction = async (contractData: NftStakingContractData) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsAddUserDeployedContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsAddUserDeployedContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { id: string; success: boolean };
  } catch (error) {
    console.error('Error adding user deployed NFT staking contract:', error);
    throw error;
  }
};

/**
 * Update an NFT staking contract's logo URL using Cloud Functions
 * @param id NFT staking contract ID
 * @param logoUrl New logo URL
 * @returns Promise with result
 */
export const updateNftStakingContractLogoFunction = async (id: string, logoUrl: string) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsUpdateContractLogo'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsUpdateContractLogo';
    
    // Get the Firebase auth token
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contractId: id, logoUrl })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error updating NFT staking contract logo:', error);
    throw error;
  }
};

/**
 * Toggle an NFT staking contract's enabled status using Cloud Functions (admin only)
 * @param id NFT staking contract ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleNftStakingContractStatusFunction = async (id: string, enabled: boolean) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/nftStakingContractsToggleContractStatus'
      : 'https://us-central1-trollslots.cloudfunctions.net/nftStakingContractsToggleContractStatus';
    
    // Get the Firebase auth token
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error toggling NFT staking contract status:', error);
    throw error;
  }
};

/**
 * Get all vault contracts using Cloud Functions (admin only)
 * @returns Promise with array of vault contracts
 */
export const getAllVaultContractsFunction = async () => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/vaultContractsGetAllContracts'
      : 'https://us-central1-trollslots.cloudfunctions.net/vaultContractsGetAllContracts';
    
    const response = await fetch(baseUrl, {
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
    console.error('Error getting all vault contracts:', error);
    throw error;
  }
};

/**
 * Get enabled vault contracts using Cloud Functions (public)
 * @returns Promise with array of enabled vault contracts
 */
export const getEnabledVaultContractsFunction = async () => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/vaultContractsGetEnabledContracts'
      : 'https://us-central1-trollslots.cloudfunctions.net/vaultContractsGetEnabledContracts';
    
    const response = await fetch(baseUrl, {
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
 * Add a new vault contract using Cloud Functions (admin only)
 * @param contractData Vault contract data
 * @returns Promise with result
 */
export const addVaultContractFunction = async (contractData: VaultContractData) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/vaultContractsAddContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/vaultContractsAddContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { id: string; success: boolean };
  } catch (error) {
    console.error('Error adding vault contract:', error);
    throw error;
  }
};

/**
 * Update an existing vault contract using Cloud Functions (admin only)
 * @param id Vault contract ID
 * @param contractData Updated vault contract data
 * @returns Promise with result
 */
export const updateVaultContractFunction = async (id: string, contractData: Partial<VaultContractData>) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/vaultContractsUpdateContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/vaultContractsUpdateContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, ...contractData })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error updating vault contract:', error);
    throw error;
  }
};

/**
 * Delete a vault contract using Cloud Functions (admin only)
 * @param id Vault contract ID
 * @returns Promise with result
 */
export const deleteVaultContractFunction = async (id: string) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/vaultContractsDeleteContract'
      : 'https://us-central1-trollslots.cloudfunctions.net/vaultContractsDeleteContract';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error deleting vault contract:', error);
    throw error;
  }
};

/**
 * Toggle a vault contract's enabled status using Cloud Functions (admin only)
 * @param id Vault contract ID
 * @param enabled New enabled status
 * @returns Promise with result
 */
export const toggleVaultContractStatusFunction = async (id: string, enabled: boolean) => {
  try {
    // Use direct HTTP fetch instead of callable function to avoid CORS issues
    const baseUrl = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
      ? 'http://localhost:5001/trollslots/us-central1/vaultContractsToggleContractStatus'
      : 'https://us-central1-trollslots.cloudfunctions.net/vaultContractsToggleContractStatus';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as { success: boolean };
  } catch (error) {
    console.error('Error toggling vault contract status:', error);
    throw error;
  }
};
