'use client'

import { firestoreDB as db } from './config'
import { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { FarmInfo } from '@/lib/contracts/kris-v3-vault'
import { uploadImageThroughBackend } from '../api/upload-service'

export interface V3Farm {
  id: string
  poolId: string
  name: string
  description: string
  token0: string
  token1: string
  fee: number
  logoUrl?: string
  bannerUrl?: string
  apr: string
  tvl?: string
  dailyRewards?: string
  rewardToken: string
  vaultAddress: string
  isActive: boolean
  featured?: boolean
  order?: number
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
  createdAt?: any
  updatedAt?: any
}

const V3_FARMS_COLLECTION = 'v3Farms'

// Convert FarmInfo to V3Farm for Firebase
export const farmInfoToV3Farm = (farmInfo: FarmInfo, additionalData?: Partial<V3Farm>): Omit<V3Farm, 'id'> => {
  const token0Symbol = farmInfo.token0 === '0x2829955d8Aac64f184E363516FDfbb0394042B90' ? 'KRIS' : 'WCRO'
  const token1Symbol = farmInfo.token1 === '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23' ? 'WCRO' : 'KRIS'
  
  return {
    poolId: farmInfo.poolId,
    name: `${token0Symbol}/${token1Symbol} ${farmInfo.fee / 10000}%`,
    description: `Earn rewards by staking your ${token0Symbol}/${token1Symbol} V3 LP positions`,
    token0: farmInfo.token0,
    token1: farmInfo.token1,
    fee: farmInfo.fee,
    apr: '0%', // Will be calculated based on TVL
    rewardToken: farmInfo.rewardToken,
    vaultAddress: '0x352e9f9E615970047047f1F5DD91a2860Bd8812e', // New vault address
    isActive: farmInfo.isActive,
    dailyRewards: farmInfo.rewardsPerDay,
    ...additionalData
  }
}

// Get all V3 farms
export async function getV3Farms(): Promise<V3Farm[]> {
  try {
    const farmsQuery = query(
      collection(db, V3_FARMS_COLLECTION),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(farmsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as V3Farm))
  } catch (error) {
    console.error('Error getting V3 farms:', error)
    return []
  }
}

// Get enabled V3 farms (active ones)
export async function getEnabledV3Farms(): Promise<V3Farm[]> {
  try {
    const farmsQuery = query(
      collection(db, V3_FARMS_COLLECTION),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(farmsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as V3Farm))
  } catch (error) {
    console.error('Error getting enabled V3 farms:', error)
    return []
  }
}

// Get V3 farm by ID
export async function getV3FarmById(id: string): Promise<V3Farm | null> {
  try {
    const farmDoc = await getDoc(doc(db, V3_FARMS_COLLECTION, id))
    if (!farmDoc.exists()) {
      return null
    }
    return {
      id: farmDoc.id,
      ...farmDoc.data()
    } as V3Farm
  } catch (error) {
    console.error('Error getting V3 farm by ID:', error)
    return null
  }
}

// Create V3 farm
export async function createV3Farm(farmData: Omit<V3Farm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, V3_FARMS_COLLECTION), {
      ...farmData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating V3 farm:', error)
    throw error
  }
}

// Update V3 farm
export async function updateV3Farm(id: string, updates: Partial<V3Farm>): Promise<void> {
  try {
    await updateDoc(doc(db, V3_FARMS_COLLECTION, id), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating V3 farm:', error)
    throw error
  }
}

// Delete V3 farm
export async function deleteV3Farm(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, V3_FARMS_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting V3 farm:', error)
    throw error
  }
}

/**
 * Upload a V3 farm logo image through backend API
 * @param file - The image file to upload
 * @param farmId - The V3 farm ID
 * @returns Promise<string> - The download URL of the uploaded image
 */
export const uploadV3FarmLogo = async (file: File, farmId: string): Promise<string> => {
  try {
    // Use backend API to upload to avoid CORS issues
    const downloadURL = await uploadImageThroughBackend(file, `v3-farms/logos/${farmId}`)
    return downloadURL
  } catch (error) {
    console.error('Error uploading V3 farm logo:', error)
    throw error
  }
}

/**
 * Upload a V3 farm banner image through backend API
 * @param file - The image file to upload
 * @param farmId - The V3 farm ID
 * @returns Promise<string> - The download URL of the uploaded image
 */
export const uploadV3FarmBanner = async (file: File, farmId: string): Promise<string> => {
  try {
    // Use backend API to upload to avoid CORS issues
    const downloadURL = await uploadImageThroughBackend(file, `v3-farms/banners/${farmId}`)
    return downloadURL
  } catch (error) {
    console.error('Error uploading V3 farm banner:', error)
    throw error
  }
}