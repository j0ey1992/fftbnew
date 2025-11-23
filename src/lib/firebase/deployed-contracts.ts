import { firestoreDB } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

export interface DeployedContract {
  id: string
  templateId: string
  contractAddress: string
  chainId: number
  ownerAddress: string
  parameters: Record<string, any>
  projectName: string
  description: string
  socialLinks: Record<string, string>
  collections: Array<{
    id: string
    name: string
    address: string
    ratio: number
    description: string
  }>
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  updatedAt: any
  transactionHash: string
  metadata?: {
    deployedVia: string
    version: string
  }
  images?: {
    logoUrl?: string
    bannerUrl?: string
  }
  adminNotes?: string
}

/**
 * Get all approved deployed contracts
 */
export async function getApprovedContracts(): Promise<DeployedContract[]> {
  try {
    const contractsRef = collection(firestoreDB, 'deployed-contracts')
    const q = query(
      contractsRef, 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const contracts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DeployedContract[]
    
    console.log('Fetched approved contracts:', contracts.length)
    return contracts
  } catch (error) {
    console.error('Error fetching approved contracts:', error)
    throw error
  }
}

/**
 * Get approved NFT staking contracts (contracts with NFT-related templates)
 */
export async function getApprovedNftStakingContracts(): Promise<DeployedContract[]> {
  try {
    const allContracts = await getApprovedContracts()
    
    // Filter for NFT staking contracts
    const nftStakingContracts = allContracts.filter(contract => 
      contract.templateId.toLowerCase().includes('nft') ||
      contract.templateId.toLowerCase().includes('staking') ||
      contract.projectName.toLowerCase().includes('nft') ||
      contract.description.toLowerCase().includes('nft')
    )
    
    console.log('Filtered NFT staking contracts:', nftStakingContracts.length)
    return nftStakingContracts
  } catch (error) {
    console.error('Error fetching approved NFT staking contracts:', error)
    throw error
  }
}

/**
 * Get a specific deployed contract by ID
 */
export async function getDeployedContractById(contractId: string): Promise<DeployedContract | null> {
  try {
    const contractsRef = collection(firestoreDB, 'deployed-contracts')
    const q = query(contractsRef, where('__name__', '==', contractId))
    
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as DeployedContract
  } catch (error) {
    console.error('Error fetching contract by ID:', error)
    throw error
  }
}
