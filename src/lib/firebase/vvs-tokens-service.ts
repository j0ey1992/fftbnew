import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase-config'
import { VVSPair } from './index'

export interface VVSToken {
  address: string
  symbol: string
  name: string
  logo: string
  priceUSD: number
  priceCRO: number
  isVVS: boolean
  lastUpdated: Timestamp
}

// Cache for VVS tokens
let vvsTokensCache: VVSToken[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Get all VVS tokens from Firebase
export async function getVVSTokensFromFirebase(): Promise<VVSToken[]> {
  // Return cached data if still valid
  if (vvsTokensCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return vvsTokensCache
  }
  
  try {
    console.log('Fetching VVS tokens from Firebase...')
    const tokensRef = collection(db, 'vvsTokens')
    const q = query(tokensRef, orderBy('priceUSD', 'desc'))
    const snapshot = await getDocs(q)
    
    const tokens: VVSToken[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      tokens.push({
        address: doc.id,
        symbol: data.symbol,
        name: data.name,
        logo: data.logo || '/Roo.png',
        priceUSD: data.priceUSD || 0,
        priceCRO: data.priceCRO || 0,
        isVVS: true,
        lastUpdated: data.lastUpdated
      })
    })
    
    // Update cache
    vvsTokensCache = tokens
    cacheTimestamp = Date.now()
    
    console.log(`Loaded ${tokens.length} VVS tokens from Firebase`)
    return tokens
  } catch (error) {
    console.error('Error fetching VVS tokens from Firebase:', error)
    return []
  }
}

// Get a specific VVS token
export async function getVVSToken(address: string): Promise<VVSToken | null> {
  try {
    const tokenRef = doc(db, 'vvsTokens', address.toLowerCase())
    const tokenDoc = await getDoc(tokenRef)
    
    if (!tokenDoc.exists()) {
      return null
    }
    
    const data = tokenDoc.data()
    return {
      address: tokenDoc.id,
      symbol: data.symbol,
      name: data.name,
      logo: data.logo || '/Roo.png',
      priceUSD: data.priceUSD || 0,
      priceCRO: data.priceCRO || 0,
      isVVS: true,
      lastUpdated: data.lastUpdated
    }
  } catch (error) {
    console.error('Error fetching VVS token:', error)
    return null
  }
}

// Search VVS tokens
export async function searchVVSTokens(searchQuery: string): Promise<VVSToken[]> {
  const allTokens = await getVVSTokensFromFirebase()
  const query = searchQuery.toLowerCase()
  
  return allTokens.filter(token => 
    token.symbol.toLowerCase().includes(query) ||
    token.name.toLowerCase().includes(query) ||
    token.address.toLowerCase().includes(query)
  )
}

// Get popular VVS tokens (highest price/volume)
export async function getPopularVVSTokens(limitCount: number = 20): Promise<VVSToken[]> {
  const allTokens = await getVVSTokensFromFirebase()
  return allTokens.slice(0, limitCount)
}

// Convert VVS token to VVSPair format
export function vvsTokenToVVSPair(token: VVSToken): VVSPair {
  return {
    id: `vvs_${token.address}`,
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    logo: token.logo,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Clear cache
export function clearVVSTokenCache() {
  vvsTokensCache = null
  cacheTimestamp = 0
}

// Check if tokens need refresh (called by admin)
export async function checkVVSTokensLastUpdate(): Promise<{ needsUpdate: boolean; lastUpdated: Date | null }> {
  try {
    const metadataRef = doc(db, 'metadata', 'vvsTokens')
    const metadataDoc = await getDoc(metadataRef)
    
    if (!metadataDoc.exists()) {
      return { needsUpdate: true, lastUpdated: null }
    }
    
    const data = metadataDoc.data()
    const lastUpdated = data.lastUpdated?.toDate() || null
    
    // Consider update needed if older than 24 hours
    const needsUpdate = !lastUpdated || (Date.now() - lastUpdated.getTime() > 24 * 60 * 60 * 1000)
    
    return { needsUpdate, lastUpdated }
  } catch (error) {
    console.error('Error checking VVS tokens update status:', error)
    return { needsUpdate: true, lastUpdated: null }
  }
}