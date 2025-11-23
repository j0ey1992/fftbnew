'use client'

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { firestoreDB } from './config';
import { getCurrentUser, isUserAdmin } from './auth';

// Collection reference
const VVS_PAIRS_COLLECTION = 'vvs-pairs';
const vvsPairsRef = collection(firestoreDB, VVS_PAIRS_COLLECTION);

/**
 * VVSPair interface defining the structure of a token pair document
 */
export interface VVSPair {
  id: string;            // Unique identifier (e.g., 'cro', 'usdc')
  name: string;          // Display name (e.g., 'Cronos', 'USD Coin')
  symbol: string;        // Token symbol (e.g., 'CRO', 'USDC')
  logo: string;          // Path to logo image
  address: string;       // Token contract address or 'NATIVE' for native token
  isNative?: boolean;    // Flag for native token
  decimals: number;      // Token decimals (usually 18 for most tokens, 6 for USDC)
  enabled: boolean;      // Whether this token is enabled for trading
  chainId: number;       // Chain ID (e.g., 25 for Cronos Mainnet)
  createdAt: Timestamp;  // When the token was added
  updatedAt: Timestamp;  // When the token was last updated
}

/**
 * Type for creating a new VVS pair (omitting auto-generated fields)
 */
export type NewVVSPair = Omit<VVSPair, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating an existing VVS pair
 */
export type UpdateVVSPair = Partial<Omit<VVSPair, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Convert Firestore document to VVSPair object
 */
const convertDocToVVSPair = (id: string, data: DocumentData): VVSPair => {
  return {
    id,
    name: data.name,
    symbol: data.symbol,
    logo: data.logo,
    address: data.address,
    isNative: data.isNative || false,
    decimals: data.decimals,
    enabled: data.enabled,
    chainId: data.chainId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

/**
 * Get all enabled VVS pairs
 * @returns Array of enabled VVSPair objects
 */
export const getEnabledVVSPairs = async (): Promise<VVSPair[]> => {
  try {
    // Get all pairs and filter on the client side
    // This is more permissive with Firestore rules
    const querySnapshot = await getDocs(vvsPairsRef);
    const pairs = querySnapshot.docs.map(doc => convertDocToVVSPair(doc.id, doc.data()));
    
    // Check if user is admin
    const currentUser = getCurrentUser();
    const isAdmin = currentUser ? await isUserAdmin(currentUser) : false;
    
    // If user is admin, return all pairs
    // Otherwise, filter for enabled tokens only
    if (isAdmin) {
      console.log('User is admin, returning all VVS pairs');
      return pairs;
    } else {
      console.log('User is not admin, returning only enabled VVS pairs');
      return pairs.filter(pair => pair.enabled === true);
    }
  } catch (error) {
    console.error("Error getting enabled VVS pairs:", error);
    throw error;
  }
};

/**
 * Get all VVS pairs (for admin)
 * @returns Array of all VVSPair objects
 */
export const getAllVVSPairs = async (): Promise<VVSPair[]> => {
  try {
    const querySnapshot = await getDocs(vvsPairsRef);
    
    return querySnapshot.docs.map(doc => 
      convertDocToVVSPair(doc.id, doc.data())
    );
  } catch (error) {
    console.error("Error getting all VVS pairs:", error);
    throw error;
  }
};

/**
 * Get a specific VVS pair by ID
 * @param id VVS pair ID
 * @returns VVSPair object or null if not found
 */
export const getVVSPair = async (id: string): Promise<VVSPair | null> => {
  try {
    const docRef = doc(firestoreDB, VVS_PAIRS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const pair = convertDocToVVSPair(docSnap.id, docSnap.data());
      
      // Check if user is admin
      const currentUser = getCurrentUser();
      const isAdmin = currentUser ? await isUserAdmin(currentUser) : false;
      
      // Return the pair if it's enabled or if the user is an admin
      if (pair.enabled || isAdmin) {
        return pair;
      } else {
        console.log(`Token ${id} is disabled and not accessible to non-admin users`);
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting VVS pair with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Add a new VVS pair
 * @param pair VVS pair data
 * @returns ID of the newly created document
 */
export const addVVSPair = async (pair: NewVVSPair): Promise<string> => {
  try {
    const timestamp = serverTimestamp();
    const docRef = await addDoc(vvsPairsRef, {
      ...pair,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding VVS pair:", error);
    throw error;
  }
};

/**
 * Update an existing VVS pair
 * @param id VVS pair ID
 * @param data Updated VVS pair data
 */
export const updateVVSPair = async (id: string, data: UpdateVVSPair): Promise<void> => {
  try {
    const docRef = doc(firestoreDB, VVS_PAIRS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating VVS pair with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a VVS pair
 * @param id VVS pair ID
 */
export const deleteVVSPair = async (id: string): Promise<void> => {
  try {
    const docRef = doc(firestoreDB, VVS_PAIRS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting VVS pair with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle a VVS pair's enabled status
 * @param id VVS pair ID
 * @param enabled New enabled status
 */
export const toggleVVSPairStatus = async (id: string, enabled: boolean): Promise<void> => {
  try {
    const docRef = doc(firestoreDB, VVS_PAIRS_COLLECTION, id);
    await updateDoc(docRef, {
      enabled,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error toggling status for VVS pair with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Initialize default VVS pairs if collection is empty
 * This is useful for first-time setup
 */
export const initializeDefaultVVSPairs = async (): Promise<void> => {
  try {
    // Check if collection is empty
    const snapshot = await getDocs(vvsPairsRef);
    if (!snapshot.empty) {
      console.log('VVS pairs collection already has data, skipping initialization');
      return;
    }
    
    // Default tokens based on the current hardcoded arrays
    const defaultPairs: NewVVSPair[] = [
      {
        name: 'Cronos',
        symbol: 'CRO',
        logo: '/Roo.png',
        address: 'NATIVE',
        isNative: true,
        decimals: 18,
        enabled: true,
        chainId: 25
      },
      {
        name: 'Wrapped CRO',
        symbol: 'WCRO',
        logo: '/Roo.png',
        address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        isNative: false,
        decimals: 18,
        enabled: true,
        chainId: 25
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        logo: '/Roo.png',
        address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
        isNative: false,
        decimals: 6,
        enabled: true,
        chainId: 25
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        logo: '/Roo.png',
        address: '0x66e428c3f67a68878562e79A0234c1F83c208770',
        isNative: false,
        decimals: 6,
        enabled: true,
        chainId: 25
      },
      {
        name: 'VVS Finance',
        symbol: 'VVS',
        logo: '/Roo.png',
        address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03',
        isNative: false,
        decimals: 18,
        enabled: true,
        chainId: 25
      }
    ];
    
    // Add each default pair
    for (const pair of defaultPairs) {
      await addVVSPair(pair);
    }
    
    console.log('Successfully initialized default VVS pairs');
  } catch (error) {
    console.error('Error initializing default VVS pairs:', error);
    throw error;
  }
};
