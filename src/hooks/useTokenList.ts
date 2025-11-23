import { useState, useEffect } from 'react'
import { Token } from '@/types/token'
import { VVSPair, getEnabledVVSPairs } from '@/lib/firebase'
import { ImportedToken, getImportedTokens } from '@/lib/firebase/tokens'
import { getVVSTokensFromAPI, vvsTokenToVVSPair } from '@/lib/api/vvs-tokens-api'

export const useTokenList = () => {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch from three sources
        const [predefinedTokens, importedTokens, vvsTokensResult] = await Promise.all([
          getEnabledVVSPairs().catch(() => []),
          getImportedTokens().catch(() => []),
          getVVSTokensFromAPI(1, 50).catch(() => ({ tokens: [] }))
        ])
        
        // Convert VVS API tokens to VVSPair format
        const vvsPairs = vvsTokensResult.tokens?.map((token: any) => vvsTokenToVVSPair(token)) || []
        
        // Create a map to handle deduplication
        const tokenMap = new Map<string, Token>()
        
        // Convert to Token type and add VVS tokens first (lowest priority)
        vvsPairs.forEach((pair: VVSPair) => {
          const key = pair.address.toLowerCase()
          tokenMap.set(key, {
            symbol: pair.symbol,
            name: pair.name,
            address: pair.address,
            decimals: pair.decimals || 18,
            chainId: 25, // Cronos mainnet
            logoURI: pair.logo || undefined
          })
        })
        
        // Add predefined tokens (override VVS tokens)
        predefinedTokens.forEach((pair: VVSPair) => {
          const key = pair.address.toLowerCase()
          tokenMap.set(key, {
            symbol: pair.symbol,
            name: pair.name,
            address: pair.address,
            decimals: pair.decimals || 18,
            chainId: 25, // Cronos mainnet
            logoURI: pair.logo || undefined
          })
        })
        
        // Add imported tokens (highest priority)
        importedTokens.forEach((token: ImportedToken) => {
          const key = token.address.toLowerCase()
          tokenMap.set(key, {
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            decimals: token.decimals,
            chainId: 25, // Cronos mainnet
            logoURI: token.logo || undefined
          })
        })
        
        // Convert back to array
        const uniqueTokens = Array.from(tokenMap.values())
        setTokens(uniqueTokens)
      } catch (err) {
        console.error('Error fetching tokens:', err)
        setError(err as Error)
        setTokens([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTokens()
  }, [])

  return { tokens, isLoading, error }
}