import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from './firebase-config';
import { ContractTemplate, DeployedContract } from '@/types/contract-templates';

// Collection references
const TEMPLATES_COLLECTION = 'contract-templates';
const DEPLOYED_CONTRACTS_COLLECTION = 'deployed-contracts';

/**
 * Add a new contract template to Firestore
 * @param template Contract template data
 * @returns Promise with the template ID
 */
export async function addContractTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Create a new document reference
    const templateRef = doc(collection(db, TEMPLATES_COLLECTION));
    
    // Prepare the template data with timestamps
    const templateData: ContractTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Add the template to Firestore
    await setDoc(templateRef, templateData);
    
    return templateRef.id;
  } catch (error) {
    console.error('Error adding contract template:', error);
    throw error;
  }
}

/**
 * Get a contract template by ID
 * @param id Template ID
 * @returns Promise with the template data
 */
export async function getContractTemplate(id: string): Promise<ContractTemplate | null> {
  try {
    const templateRef = doc(db, TEMPLATES_COLLECTION, id);
    const templateSnap = await getDoc(templateRef);
    
    if (templateSnap.exists()) {
      return templateSnap.data() as ContractTemplate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting contract template:', error);
    throw error;
  }
}

/**
 * Get all contract templates
 * @param category Optional category filter
 * @returns Promise with an array of templates
 */
export async function getAllContractTemplates(category?: string): Promise<ContractTemplate[]> {
  try {
    let templatesQuery;
    
    if (category) {
      templatesQuery = query(
        collection(db, TEMPLATES_COLLECTION),
        where('category', '==', category),
        where('enabled', '==', true),
        orderBy('name')
      );
    } else {
      templatesQuery = query(
        collection(db, TEMPLATES_COLLECTION),
        where('enabled', '==', true),
        orderBy('name')
      );
    }
    
    const templatesSnap = await getDocs(templatesQuery);
    const templates: ContractTemplate[] = [];
    
    templatesSnap.forEach((doc) => {
      templates.push(doc.data() as ContractTemplate);
    });
    
    return templates;
  } catch (error) {
    console.error('Error getting contract templates:', error);
    throw error;
  }
}

/**
 * Update a contract template
 * @param id Template ID
 * @param template Updated template data
 * @returns Promise
 */
export async function updateContractTemplate(
  id: string, 
  template: Partial<Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const templateRef = doc(db, TEMPLATES_COLLECTION, id);
    
    // Add updated timestamp
    const updateData = {
      ...template,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(templateRef, updateData);
  } catch (error) {
    console.error('Error updating contract template:', error);
    throw error;
  }
}

/**
 * Toggle a contract template's enabled status
 * @param id Template ID
 * @param enabled New enabled status
 * @returns Promise
 */
export async function toggleTemplateStatus(id: string, enabled: boolean): Promise<void> {
  try {
    const functions = getFunctions();
    const toggleStatus = httpsCallable(functions, 'toggleTemplateStatus');
    
    await toggleStatus({ id, enabled });
  } catch (error) {
    console.error('Error toggling template status:', error);
    throw error;
  }
}

/**
 * Delete a contract template
 * @param id Template ID
 * @returns Promise
 */
export async function deleteContractTemplate(id: string): Promise<void> {
  try {
    const templateRef = doc(db, TEMPLATES_COLLECTION, id);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting contract template:', error);
    throw error;
  }
}

/**
 * Save a deployed contract to Firestore
 * @param contract Deployed contract data
 * @returns Promise with the contract ID
 */
export async function saveDeployedContract(
  contract: Omit<DeployedContract, 'id' | 'createdAt'>
): Promise<string> {
  try {
    // Create a new document reference
    const contractRef = doc(collection(db, DEPLOYED_CONTRACTS_COLLECTION));
    
    // Prepare the contract data with timestamp
    const contractData: DeployedContract = {
      ...contract,
      id: contractRef.id,
      createdAt: Timestamp.now()
    };
    
    // Add the contract to Firestore
    await setDoc(contractRef, contractData);
    
    return contractRef.id;
  } catch (error) {
    console.error('Error saving deployed contract:', error);
    throw error;
  }
}

/**
 * Get all contracts deployed by a user
 * @param ownerAddress User's wallet address
 * @returns Promise with an array of deployed contracts
 */
export async function getUserDeployedContracts(ownerAddress: string): Promise<DeployedContract[]> {
  try {
    const contractsQuery = query(
      collection(db, DEPLOYED_CONTRACTS_COLLECTION),
      where('ownerAddress', '==', ownerAddress),
      orderBy('createdAt', 'desc')
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    const contracts: DeployedContract[] = [];
    
    contractsSnap.forEach((doc) => {
      contracts.push(doc.data() as DeployedContract);
    });
    
    return contracts;
  } catch (error) {
    console.error('Error getting user deployed contracts:', error);
    throw error;
  }
}

/**
 * Get a deployed contract by address
 * @param contractAddress Contract address
 * @param chainId Chain ID
 * @returns Promise with the deployed contract data
 */
export async function getDeployedContractByAddress(
  contractAddress: string,
  chainId: number
): Promise<DeployedContract | null> {
  try {
    const contractsQuery = query(
      collection(db, DEPLOYED_CONTRACTS_COLLECTION),
      where('contractAddress', '==', contractAddress),
      where('chainId', '==', chainId)
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    
    if (!contractsSnap.empty) {
      return contractsSnap.docs[0].data() as DeployedContract;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting deployed contract:', error);
    throw error;
  }
}
