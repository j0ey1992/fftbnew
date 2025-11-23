// Client-side API service for VVS tokens
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface VVSToken {
  address: string
  symbol: string
  name: string
  logo: string
  priceUSD: number
  priceCRO: number
  isVVS: boolean
  lastUpdated?: any
}

// Cache for VVS tokens
let vvsTokensCache: VVSToken[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Get VVS tokens with pagination
export async function getVVSTokensFromAPI(page: number = 1, limit: number = 50, search?: string): Promise<{
  tokens: VVSToken[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })
    
    console.log(`Fetching VVS tokens from API (page ${page})...`)
    const response = await fetch(`${API_BASE}/api/vvs/tokens?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch VVS tokens: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch VVS tokens')
    }
    
    console.log(`Loaded ${data.tokens.length} VVS tokens from API (page ${page})`)
    return {
      tokens: data.tokens,
      pagination: data.pagination
    }
  } catch (error) {
    console.error('Error fetching VVS tokens:', error)
    return {
      tokens: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    }
  }
}

// Get all VVS tokens (legacy function for backward compatibility)
export async function getAllVVSTokens(): Promise<VVSToken[]> {
  // Return cached data if still valid
  if (vvsTokensCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return vvsTokensCache
  }
  
  // Fetch first page only for performance
  const result = await getVVSTokensFromAPI(1, 100)
  
  // Update cache
  vvsTokensCache = result.tokens
  cacheTimestamp = Date.now()
  
  return result.tokens
}

// Get a specific VVS token
export async function getVVSToken(address: string): Promise<VVSToken | null> {
  try {
    const response = await fetch(`${API_BASE}/api/vvs/tokens/${address}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data.success) {
      return null
    }
    
    return data.token
  } catch (error) {
    console.error('Error fetching VVS token:', error)
    return null
  }
}

// Search VVS tokens
export async function searchVVSTokens(query: string): Promise<VVSToken[]> {
  try {
    const response = await fetch(`${API_BASE}/api/vvs/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    
    if (!data.success) {
      return []
    }
    
    return data.tokens
  } catch (error) {
    console.error('Error searching VVS tokens:', error)
    return []
  }
}

// Get popular VVS tokens (highest price/volume)
export async function getPopularVVSTokens(limit: number = 20): Promise<VVSToken[]> {
  const result = await getVVSTokensFromAPI(1, limit)
  return result.tokens
}

// Convert VVS token to VVSPair format
export function vvsTokenToVVSPair(token: VVSToken): any {
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

// Check if tokens need refresh
export async function checkVVSTokensMetadata(): Promise<{ 
  lastUpdated: Date | null
  tokenCount: number
}> {
  try {
    const response = await fetch(`${API_BASE}/api/vvs/metadata`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      return { lastUpdated: null, tokenCount: 0 }
    }
    
    const data = await response.json()
    
    if (!data.success) {
      return { lastUpdated: null, tokenCount: 0 }
    }
    
    return {
      lastUpdated: data.metadata.lastUpdated ? new Date(data.metadata.lastUpdated) : null,
      tokenCount: data.metadata.tokenCount || 0
    }
  } catch (error) {
    console.error('Error fetching VVS metadata:', error)
    return { lastUpdated: null, tokenCount: 0 }
  }
}