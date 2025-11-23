'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { useAppKitAccount, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react'
import { getWalletTokens, searchTokens, TokenData } from '@/lib/moralis/token-service'

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: ethers.BigNumber
  formattedBalance: string
  logo: string
}

export function useWalletTokens() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const { chainId } = useAppKitNetwork();
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Convert TokenData to Token format
  const convertToToken = (tokenData: TokenData): Token => {
    let balance;
    try {
      // Try to convert to BigNumber directly
      balance = ethers.BigNumber.from(tokenData.balance);
    } catch (error) {
      // If the balance is a decimal string, handle it differently
      if (tokenData.balance.includes('.')) {
        console.log(`Converting decimal balance: ${tokenData.balance}`);
        // Use the formatted balance for display, but set the actual balance to 0
        // This is a fallback to prevent errors
        balance = ethers.BigNumber.from(0);
      } else {
        // If it's not a decimal but still fails, default to 0
        console.error(`Error converting balance: ${tokenData.balance}`, error);
        balance = ethers.BigNumber.from(0);
      }
    }
    
    return {
      address: tokenData.address,
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      balance: balance,
      formattedBalance: tokenData.formattedBalance,
      logo: tokenData.logo
    };
  };
  
  // Fetch tokens from wallet
  const fetchTokens = useCallback(async (page: number = 1) => {
    if (!isConnected || !address) {
      setTokens([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching tokens for address ${address}, page ${page}`);
      const tokenData = await getWalletTokens(address, page);
      
      // Convert to Token format
      const fetchedTokens = tokenData.map(convertToToken);
      
      // If first page, replace tokens, otherwise append
      if (page === 1) {
        setTokens(fetchedTokens);
      } else {
        setTokens(prev => [...prev, ...fetchedTokens]);
      }
      
      // Check if there are more tokens to load
      // For now, we'll just use a simple heuristic - if we got a full page, there might be more
      setHasMore(tokenData.length >= 100);
      setCurrentPage(page);
      
    } catch (err: any) {
      console.error('Error fetching wallet tokens:', err);
      setError(err.message || 'Failed to fetch wallet tokens');
      
      // If first page fetch fails, set empty tokens
      if (page === 1) {
        setTokens([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, chainId]);
  
  // Load more tokens
  const loadMoreTokens = useCallback(async () => {
    if (!loading && !loadingMore && hasMore) {
      try {
        setLoadingMore(true);
        await fetchTokens(currentPage + 1);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [fetchTokens, currentPage, loading, loadingMore, hasMore]);
  
  // Fetch tokens on mount and when wallet changes
  useEffect(() => {
    fetchTokens(1);
  }, [fetchTokens]);
  
  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    
    return tokens.filter(token => 
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);
  
  return {
    tokens: filteredTokens,
    allTokens: tokens,
    loading,
    error,
    fetchTokens,
    loadMoreTokens,
    hasMore,
    searchQuery,
    setSearchQuery
  };
}
