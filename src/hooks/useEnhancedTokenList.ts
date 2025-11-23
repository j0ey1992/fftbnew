'use client'

import { useState, useEffect, useMemo } from 'react'
import { Token } from '@/types/token'
import { useTokenList } from './useTokenList'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { apiClient } from '@/lib/api'

export interface EnhancedToken extends Token {
  balance?: string
  balanceFormatted?: number
  hasBalance?: boolean
  balanceUSD?: number
}

export const useEnhancedTokenList = () => {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { tokens: baseTokens, isLoading: baseLoading, error: baseError } = useTokenList()
  const [userTokens, setUserTokens] = useState<EnhancedToken[]>([])
  const [balancesLoading, setBalancesLoading] = useState(false)
  const [balancesError, setBalancesError] = useState<string | null>(null)

  // Fetch user token balances from backend
  useEffect(() => {
    const fetchUserBalances = async () => {
      if (!isConnected || !address) {
        console.log('Not fetching balances - wallet not connected', { isConnected, address })
        setUserTokens([])
        setBalancesLoading(false)
        return
      }

      console.log('Fetching user token balances for:', address, 'chainId:', chainId)
      setBalancesLoading(true)
      setBalancesError(null)

      try {
        const response = await apiClient.get(`/api/user-tokens/balances/${address}?chainId=${chainId || 25}&includeZeroBalances=true`, {
          requireAuth: true
        })

        console.log('Token balance response:', response)

        if (response.success) {
          const backendTokens: EnhancedToken[] = response.tokens.map((token: any) => ({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            decimals: token.decimals,
            chainId: response.chainId || 25,
            logoURI: token.logo,
            balance: token.balance,
            balanceFormatted: parseFloat(token.balanceFormatted || '0'),
            hasBalance: token.hasBalance,
            balanceUSD: token.balanceUSD
          }))
          console.log('Backend tokens with balances:', backendTokens.filter(t => t.hasBalance))
          setUserTokens(backendTokens)
        }
      } catch (error) {
        console.error('Error fetching user token balances:', error)
        setBalancesError('Failed to fetch token balances')
      } finally {
        setBalancesLoading(false)
      }
    }

    fetchUserBalances()
  }, [address, isConnected, chainId])

  // Merge backend tokens with base tokens
  const allTokens = useMemo(() => {
    if (!baseTokens || baseTokens.length === 0) {
      // If base tokens aren't loaded yet, just return user tokens
      return userTokens
    }

    // Create a map of user tokens for quick lookup
    const userTokenMap = new Map<string, EnhancedToken>()
    userTokens.forEach(token => {
      userTokenMap.set(token.address.toLowerCase(), token)
    })

    // Create a map to track all unique tokens
    const allTokensMap = new Map<string, EnhancedToken>()

    // First, add all user tokens (these have balance info)
    userTokens.forEach(token => {
      allTokensMap.set(token.address.toLowerCase(), token)
    })

    // Then add base tokens, merging with user token data if available
    baseTokens.forEach(baseToken => {
      const key = baseToken.address.toLowerCase()
      const userToken = userTokenMap.get(key)
      
      if (userToken) {
        // Merge base token info with user token (user token has balance info)
        allTokensMap.set(key, {
          ...baseToken,
          ...userToken,
          // Prefer base token logo if available
          logoURI: baseToken.logoURI || userToken.logoURI
        })
      } else if (!allTokensMap.has(key)) {
        // Add base token without balance info
        allTokensMap.set(key, {
          ...baseToken,
          balance: '0',
          balanceFormatted: 0,
          hasBalance: false,
          balanceUSD: 0
        })
      }
    })

    // Convert map to array and sort
    const finalTokens = Array.from(allTokensMap.values())

    // Sort tokens: tokens with balance first (sorted by USD value), then others alphabetically
    finalTokens.sort((a, b) => {
      // Both have balance: sort by USD value (highest first)
      if (a.hasBalance && b.hasBalance) {
        return (b.balanceUSD || 0) - (a.balanceUSD || 0)
      }
      
      // One has balance, other doesn't: prioritize the one with balance
      if (a.hasBalance && !b.hasBalance) return -1
      if (!a.hasBalance && b.hasBalance) return 1
      
      // Neither has balance: sort alphabetically by symbol
      return a.symbol.localeCompare(b.symbol)
    })

    console.log('Final tokens with balance:', finalTokens.filter(t => t.hasBalance).length, 'out of', finalTokens.length)
    console.log('Tokens with balance:', finalTokens.filter(t => t.hasBalance).map(t => ({ symbol: t.symbol, balance: t.balanceFormatted, usd: t.balanceUSD })))
    
    return finalTokens
  }, [baseTokens, userTokens])

  return {
    tokens: allTokens,
    isLoading: baseLoading || (isConnected && balancesLoading),
    error: baseError || balancesError,
    isConnected
  }
}