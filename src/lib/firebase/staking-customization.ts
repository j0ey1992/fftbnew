import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase-config';
import { StakingPageCustomization, defaultCustomization } from '@/types/staking-customization';

const CUSTOMIZATION_COLLECTION = 'staking-customizations';

/**
 * Get customization data for a staking contract
 * @param contractId The contract ID
 * @param contractType The type of contract ('vault', 'lp-staking', 'token-staking')
 * @returns The customization data or default values if not found
 */
export async function getStakingCustomization(
  contractId: string,
  contractType: 'vault' | 'lp-staking' | 'token-staking' | 'nft-staking'
): Promise<StakingPageCustomization> {
  try {
    const docId = `${contractType}-${contractId}`;
    const docRef = doc(db, CUSTOMIZATION_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as StakingPageCustomization;
    }
    
    // If no customization exists, create one with default values
    const defaultValues = { ...defaultCustomization };
    await setDoc(docRef, defaultValues);
    return defaultValues;
  } catch (error) {
    console.error('Error getting staking customization:', error);
    return { ...defaultCustomization };
  }
}

/**
 * Update customization data for a staking contract
 * @param contractId The contract ID
 * @param contractType The type of contract ('vault', 'lp-staking', 'token-staking')
 * @param customization The customization data to update
 * @returns A promise that resolves when the update is complete
 */
export async function updateStakingCustomization(
  contractId: string,
  contractType: 'vault' | 'lp-staking' | 'token-staking' | 'nft-staking',
  customization: Partial<StakingPageCustomization>
): Promise<void> {
  try {
    const docId = `${contractType}-${contractId}`;
    const docRef = doc(db, CUSTOMIZATION_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, customization);
    } else {
      const newCustomization = { ...defaultCustomization, ...customization };
      await setDoc(docRef, newCustomization);
    }
  } catch (error) {
    console.error('Error updating staking customization:', error);
    throw error;
  }
}

/**
 * Check if a user is the owner of a staking contract
 * @param userId The user ID
 * @param contractId The contract ID
 * @param contractType The type of contract ('vault', 'lp-staking', 'token-staking')
 * @returns A promise that resolves to true if the user is the owner
 */
export async function isStakingContractOwner(
  userId: string,
  contractId: string,
  contractType: 'vault' | 'lp-staking' | 'token-staking' | 'nft-staking'
): Promise<boolean> {
  try {
    console.log(`[OWNERSHIP CHECK] Starting ownership verification for user ${userId.substring(0, 6)}... on contract ${contractId} (${contractType})`);
    
    // This is a simplified check. In a real app, you would check the contract's owner field
    // or a separate collection that maps contracts to owners
    let contractCollectionName;
    
    // Determine the collection name based on contract type
    if (contractType === 'vault') {
      contractCollectionName = 'vault-contracts';
    } else if (contractType === 'lp-staking') {
      contractCollectionName = 'lp-staking-contracts';
    } else if (contractType === 'nft-staking') {
      contractCollectionName = 'user-nft-contracts';
    } else {
      // Default to token-staking
      contractCollectionName = 'token-staking-contracts';
    }
    
    console.log(`[OWNERSHIP CHECK] Looking in collection: ${contractCollectionName}`);
    
    const contractRef = doc(db, contractCollectionName, contractId);
    const contractSnap = await getDoc(contractRef);
    
    if (!contractSnap.exists()) {
      console.log(`[OWNERSHIP CHECK] Contract ${contractId} not found in ${contractCollectionName}`);
      return false;
    }
    
    const contractData = contractSnap.data();
    // Check for ownerAddress (used in saveDeployedContract) instead of ownerId
    // Normalize addresses to lowercase for comparison to avoid case sensitivity issues
    const ownerAddress = contractData.ownerAddress?.toLowerCase();
    const userAddress = userId?.toLowerCase();
    
    const isOwner = ownerAddress === userAddress;
    
    // Log for debugging
    console.log('[OWNERSHIP CHECK] Result:', {
      contractId,
      contractType,
      ownerAddress: ownerAddress ? `${ownerAddress.substring(0, 6)}...${ownerAddress.substring(ownerAddress.length - 4)}` : 'undefined',
      userAddress: userAddress ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` : 'undefined',
      isOwner
    });
    
    return isOwner;
  } catch (error) {
    console.error('[OWNERSHIP CHECK] Error checking contract ownership:', error);
    return false;
  }
}
