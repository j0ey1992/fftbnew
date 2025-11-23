import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { firestoreDB } from './config'; // Use the exported Firestore instance

const db = firestoreDB; // Use the imported instance directly
const GLOBAL_TOKENS_COLLECTION = 'globalImportedTokens';

export interface ImportedToken {
  address: string;
  symbol: string;
  name?: string; // Add optional name field
  decimals: number;
  logo?: string; // Optional logo URL
  chainId: number; // Store chain ID for context
}

/**
 * Adds a custom token to the global imported list in Firestore.
 * @param token - The token details to add.
 * @returns A promise that resolves when the token is added.
 */
export const addImportedToken = async (token: ImportedToken): Promise<void> => {
  if (!token.address || !token.symbol || token.decimals === undefined || !token.chainId) {
    throw new Error('Invalid token data provided.');
  }

  const globalTokensCollectionRef = collection(db, GLOBAL_TOKENS_COLLECTION);
  const tokenDocRef = doc(globalTokensCollectionRef, token.address.toLowerCase()); // Use lowercase address as ID

  try {
    // Use merge: true to add or update the token details if it already exists globally
    await setDoc(tokenDocRef, token, { merge: true }); 
    console.log(`Globally imported token ${token.symbol} (${token.address}) added/updated.`);
  } catch (error) {
    console.error(`Error adding/updating global imported token ${token.address}:`, error);
    throw new Error('Failed to save imported token.');
  }
};

/**
 * Retrieves all globally imported tokens from Firestore.
 * @returns A promise that resolves with an array of imported tokens.
 */
export const getImportedTokens = async (): Promise<ImportedToken[]> => {
  const globalTokensCollectionRef = collection(db, GLOBAL_TOKENS_COLLECTION);
  
  try {
    const querySnapshot = await getDocs(globalTokensCollectionRef);
    const tokens: ImportedToken[] = [];
    querySnapshot.forEach((doc) => {
      // Basic validation to ensure the document looks like an ImportedToken
      const data = doc.data();
      if (data.address && data.symbol && data.decimals !== undefined && data.chainId !== undefined) {
        tokens.push(data as ImportedToken);
      } else {
        console.warn(`Invalid global token data found in Firestore, doc ID ${doc.id}:`, data);
      }
    });
    console.log(`Retrieved ${tokens.length} globally imported tokens.`);
    return tokens;
  } catch (error) {
    console.error(`Error retrieving global imported tokens:`, error);
    // Return empty array on error to avoid breaking the UI
    return []; 
  }
};

// Potential future function: Remove imported token
// export const removeImportedToken = async (userId: string, tokenAddress: string): Promise<void> => { ... }
