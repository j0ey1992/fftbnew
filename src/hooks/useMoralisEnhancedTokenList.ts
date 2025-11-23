'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Token } from '@/types/token'
import { useTokenList } from './useTokenList'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { getWalletTokens, TokenData as MoralisTokenData } from '@/lib/moralis/token-service'
import { apiClient } from '@/lib/api'
import { debounce } from 'lodash'

export interface MoralisEnhancedToken extends Token {
  balance?: string
  balanceFormatted?: number
  hasBalance?: boolean
  balanceUSD?: number
  isMoralisToken?: boolean
  isVVSToken?: boolean
  searchScore?: number
}

interface TokenPriceData {
  [address: string]: number
}

export const useMoralisEnhancedTokenList = () => {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { tokens: vvsTokens, isLoading: vvsLoading, error: vvsError } = useTokenList()
  
  const [moralisTokens, setMoralisTokens] = useState<MoralisEnhancedToken[]>([])
  const [backendTokens, setBackendTokens] = useState<MoralisEnhancedToken[]>([])
  const [tokenPrices, setTokenPrices] = useState<TokenPriceData>({})
  const [moralisLoading, setMoralisLoading] = useState(false)
  const [backendLoading, setBackendLoading] = useState(false)
  const [moralisError, setMoralisError] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  // Fetch token prices from backend
  const fetchTokenPrices = useCallback(async (tokenAddresses: string[]) => {
    if (tokenAddresses.length === 0) return

    try {
      const response = await apiClient.post('/api/tokens/prices', {
        addresses: tokenAddresses,
        chainId: chainId || 25
      })

      if (response.success && response.prices) {
        setTokenPrices(prev => ({ ...prev, ...response.prices }))
      }
    } catch (error) {
      console.error('Error fetching token prices:', error)
    }
  }, [chainId])

  // Debounced price fetcher
  const debouncedFetchPrices = useMemo(
    () => debounce(fetchTokenPrices, 1000),
    [fetchTokenPrices]
  )

  // Fetch tokens from Moralis
  useEffect(() => {
    const fetchMoralisTokens = async () => {
      if (!isConnected || !address) {
        setMoralisTokens([])
        setMoralisLoading(false)
        return
      }

      console.log('Fetching Moralis tokens for:', address)
      setMoralisLoading(true)
      setMoralisError(null)

      try {
        // Fetch multiple pages to get more tokens
        const allTokens: MoralisTokenData[] = []
        const maxPages = 3 // Fetch up to 3 pages
        
        for (let page = 1; page <= maxPages; page++) {
          const tokens = await getWalletTokens(address, page, 100)
          if (tokens.length === 0) break
          allTokens.push(...tokens)
        }

        console.log(`Fetched ${allTokens.length} tokens from Moralis`)

        // Convert Moralis tokens to our format
        const enhancedTokens: MoralisEnhancedToken[] = allTokens
          .filter(token => parseFloat(token.balance) > 0) // Only tokens with balance
          .map(token => ({
            symbol: token.symbol,
            name: token.name,
            address: token.address.toLowerCase(),
            decimals: token.decimals,
            chainId: chainId || 25,
            logoURI: token.logo,
            balance: token.balance,
            balanceFormatted: parseFloat(token.formattedBalance),
            hasBalance: true,
            isMoralisToken: true,
            isVVSToken: false
          }))

        setMoralisTokens(enhancedTokens)

        // Fetch prices for Moralis tokens
        const tokenAddresses = enhancedTokens.map(t => t.address)
        debouncedFetchPrices(tokenAddresses)
      } catch (error) {
        console.error('Error fetching Moralis tokens:', error)
        setMoralisError('Failed to fetch tokens from Moralis')
      } finally {
        setMoralisLoading(false)
      }
    }

    fetchMoralisTokens()
  }, [address, isConnected, chainId, debouncedFetchPrices])

  // Also fetch backend tokens for comparison and additional data
  useEffect(() => {
    const fetchBackendTokens = async () => {
      if (!isConnected || !address) {
        setBackendTokens([])
        setBackendLoading(false)
        return
      }

      setBackendLoading(true)
      setBackendError(null)

      try {
        const response = await apiClient.get(
          `/api/user-tokens/balances/${address}?chainId=${chainId || 25}&includeZeroBalances=false`,
          { requireAuth: true }
        )

        if (response.success) {
          const tokens: MoralisEnhancedToken[] = response.tokens.map((token: any) => ({
            symbol: token.symbol,
            name: token.name,
            address: token.address.toLowerCase(),
            decimals: token.decimals,
            chainId: response.chainId || 25,
            logoURI: token.logo,
            balance: token.balance,
            balanceFormatted: parseFloat(token.balanceFormatted || '0'),
            hasBalance: token.hasBalance,
            balanceUSD: token.balanceUSD,
            isVVSToken: true,
            isMoralisToken: false
          }))
          
          setBackendTokens(tokens)
        }
      } catch (error) {
        console.error('Error fetching backend tokens:', error)
        setBackendError('Failed to fetch token balances')
      } finally {
        setBackendLoading(false)
      }
    }

    fetchBackendTokens()
  }, [address, isConnected, chainId])

  // Enhanced search scoring function
  const calculateSearchScore = (token: MoralisEnhancedToken, query: string): number => {
    const lowerQuery = query.toLowerCase()
    const symbol = token.symbol.toLowerCase()
    const name = token.name.toLowerCase()
    const address = token.address.toLowerCase()

    let score = 0

    // Exact matches get highest scores
    if (symbol === lowerQuery) score += 100
    else if (symbol.startsWith(lowerQuery)) score += 80
    else if (symbol.includes(lowerQuery)) score += 50

    if (name === lowerQuery) score += 90
    else if (name.startsWith(lowerQuery)) score += 70
    else if (name.includes(lowerQuery)) score += 40

    if (address === lowerQuery) score += 95
    else if (address.startsWith(lowerQuery)) score += 60

    // Bonus for tokens with balance
    if (token.hasBalance) score += 30

    // Bonus for popular tokens (based on USD value)
    if (token.balanceUSD && token.balanceUSD > 100) score += 20
    else if (token.balanceUSD && token.balanceUSD > 10) score += 10

    // Bonus for VVS tokens (they're curated)
    if (token.isVVSToken) score += 15

    return score
  }

  // Merge all token sources intelligently
  const allTokens = useMemo(() => {
    if (!vvsTokens || vvsTokens.length === 0) {
      // If VVS tokens aren't loaded yet, return merged Moralis and backend tokens
      const tokenMap = new Map<string, MoralisEnhancedToken>()
      
      // Add Moralis tokens first (user's actual holdings)
      moralisTokens.forEach(token => {
        tokenMap.set(token.address, { ...token, balanceUSD: tokenPrices[token.address] ? token.balanceFormatted * tokenPrices[token.address] : 0 })
      })
      
      // Add backend tokens, merging if duplicate
      backendTokens.forEach(token => {
        const existing = tokenMap.get(token.address)
        if (existing) {
          // Merge data, preferring backend data for some fields
          tokenMap.set(token.address, {
            ...existing,
            ...token,
            isMoralisToken: existing.isMoralisToken,
            isVVSToken: true,
            // Keep Moralis balance if it's higher (more accurate)
            balance: existing.balanceFormatted > token.balanceFormatted ? existing.balance : token.balance,
            balanceFormatted: Math.max(existing.balanceFormatted, token.balanceFormatted),
            balanceUSD: token.balanceUSD || existing.balanceUSD
          })
        } else {
          tokenMap.set(token.address, token)
        }
      })
      
      return Array.from(tokenMap.values())
    }

    // Create comprehensive token map
    const tokenMap = new Map<string, MoralisEnhancedToken>()

    // First, add all VVS tokens (complete list)
    vvsTokens.forEach(vvsToken => {
      tokenMap.set(vvsToken.address.toLowerCase(), {
        ...vvsToken,
        address: vvsToken.address.toLowerCase(),
        balance: '0',
        balanceFormatted: 0,
        hasBalance: false,
        balanceUSD: 0,
        isVVSToken: true,
        isMoralisToken: false
      })
    })

    // Then overlay Moralis tokens (user's holdings)
    moralisTokens.forEach(moralisToken => {
      const existing = tokenMap.get(moralisToken.address)
      if (existing) {
        // Merge with VVS token data
        tokenMap.set(moralisToken.address, {
          ...existing,
          ...moralisToken,
          logoURI: existing.logoURI || moralisToken.logoURI, // Prefer VVS logo
          name: existing.name || moralisToken.name, // Prefer VVS name
          isVVSToken: true,
          isMoralisToken: true,
          balanceUSD: tokenPrices[moralisToken.address] ? moralisToken.balanceFormatted * tokenPrices[moralisToken.address] : 0
        })
      } else {
        // New token from Moralis not in VVS list
        tokenMap.set(moralisToken.address, {
          ...moralisToken,
          balanceUSD: tokenPrices[moralisToken.address] ? moralisToken.balanceFormatted * tokenPrices[moralisToken.address] : 0
        })
      }
    })

    // Finally overlay backend tokens for additional data
    backendTokens.forEach(backendToken => {
      const existing = tokenMap.get(backendToken.address)
      if (existing && existing.isMoralisToken) {
        // If we have Moralis data, only update USD value from backend
        tokenMap.set(backendToken.address, {
          ...existing,
          balanceUSD: backendToken.balanceUSD || existing.balanceUSD
        })
      } else if (existing) {
        // No Moralis data, use backend balance
        tokenMap.set(backendToken.address, {
          ...existing,
          ...backendToken,
          isVVSToken: true
        })
      } else {
        // New token from backend
        tokenMap.set(backendToken.address, backendToken)
      }
    })

    // Convert to array and sort
    const finalTokens = Array.from(tokenMap.values())

    // Sort tokens: 
    // 1. Tokens with balance first (sorted by USD value)
    // 2. Then VVS tokens alphabetically
    // 3. Then other tokens alphabetically
    finalTokens.sort((a, b) => {
      // Both have balance: sort by USD value (highest first)
      if (a.hasBalance && b.hasBalance) {
        return (b.balanceUSD || 0) - (a.balanceUSD || 0)
      }
      
      // One has balance, other doesn't: prioritize the one with balance
      if (a.hasBalance && !b.hasBalance) return -1
      if (!a.hasBalance && b.hasBalance) return 1
      
      // Neither has balance: prioritize VVS tokens
      if (a.isVVSToken && !b.isVVSToken) return -1
      if (!a.isVVSToken && b.isVVSToken) return 1
      
      // Both are same type: sort alphabetically by symbol
      return a.symbol.localeCompare(b.symbol)
    })

    console.log(`Total tokens: ${finalTokens.length} (Moralis: ${moralisTokens.length}, Backend: ${backendTokens.length}, VVS: ${vvsTokens.length})`)
    console.log(`Tokens with balance: ${finalTokens.filter(t => t.hasBalance).length}`)
    
    return finalTokens
  }, [vvsTokens, moralisTokens, backendTokens, tokenPrices])

  // Enhanced search function
  const searchTokens = useCallback((tokens: MoralisEnhancedToken[], query: string): MoralisEnhancedToken[] => {
    if (!query || query.trim() === '') return tokens

    // Calculate search scores for all tokens
    const scoredTokens = tokens.map(token => ({
      ...token,
      searchScore: calculateSearchScore(token, query)
    }))

    // Filter tokens with score > 0 and sort by score
    return scoredTokens
      .filter(token => token.searchScore! > 0)
      .sort((a, b) => b.searchScore! - a.searchScore!)
  }, [])

  return {
    tokens: allTokens,
    isLoading: vvsLoading || moralisLoading || (isConnected && backendLoading),
    error: vvsError || moralisError || backendError,
    isConnected,
    searchTokens,
    refetch: useCallback(async () => {
      // Trigger refetch for all sources
      setMoralisTokens([])
      setBackendTokens([])
      // VVS tokens will refetch automatically
    }, [])
  }
}