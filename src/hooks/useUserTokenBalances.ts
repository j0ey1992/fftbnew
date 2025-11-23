'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';
import { 
  TokenBalance, 
  fetchUserTokenBalances, 
  discoverUserTokens,
  watchTokenBalance,
  FetchTokenBalancesOptions,
  CRONOS_TOKENS
} from '@/lib/blockchain/token-balance-service';

export interface UseUserTokenBalancesOptions extends FetchTokenBalancesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  watchRealTime?: boolean; // Watch for real-time balance updates
  discoverNewTokens?: boolean; // Discover tokens via event scanning
}

export interface UseUserTokenBalancesReturn {
  tokens: TokenBalance[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  addCustomToken: (tokenAddress: string) => Promise<void>;
  removeToken: (tokenAddress: string) => void;
  watchedTokens: string[];
}

/**
 * Hook to fetch and manage user token balances
 */
export function useUserTokenBalances(
  options: UseUserTokenBalancesOptions = {}
): UseUserTokenBalancesReturn {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const { chainId } = useAppKitNetwork();
  
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [customTokens, setCustomTokens] = useState<string[]>([]);
  const [watchedTokens, setWatchedTokens] = useState<string[]>([]);
  
  const cleanupFunctions = useRef<(() => void)[]>([]);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    autoRefresh = false,
    refreshInterval = 60, // 60 seconds default
    watchRealTime = false,
    discoverNewTokens = false,
    includeNativeToken = true,
    includeZeroBalances = false,
    tokenAddresses = CRONOS_TOKENS.map(t => t.address),
    minBalanceUSD = 0
  } = options;
  
  // Combine default tokens with custom tokens
  const allTokenAddresses = [...new Set([...tokenAddresses, ...customTokens])];
  
  /**
   * Fetch token balances
   */
  const fetchBalances = useCallback(async (isRefresh = false) => {
    if (!isConnected || !address || !walletProvider) {
      setTokens([]);
      setError('Wallet not connected');
      return;
    }
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
      
      // Discover new tokens if enabled
      let discoveredTokens: string[] = [];
      if (discoverNewTokens) {
        try {
          // Scan last 10000 blocks (approximately last day on Cronos)
          const currentBlock = await provider.getBlockNumber();
          const fromBlock = Math.max(0, currentBlock - 10000);
          discoveredTokens = await discoverUserTokens(provider, address, fromBlock);
          console.log(`Discovered ${discoveredTokens.length} tokens from blockchain events`);
        } catch (discoverError) {
          console.error('Error discovering tokens:', discoverError);
        }
      }
      
      // Combine all token addresses
      const tokensToCheck = [...new Set([...allTokenAddresses, ...discoveredTokens])];
      
      // Fetch balances
      const balances = await fetchUserTokenBalances(provider, address, {
        includeNativeToken,
        includeZeroBalances,
        tokenAddresses: tokensToCheck,
        minBalanceUSD
      });
      
      setTokens(balances);
      setLastUpdated(new Date());
      
      // Set up real-time watchers if enabled
      if (watchRealTime && !isRefresh) {
        // Clean up existing watchers
        cleanupFunctions.current.forEach(cleanup => cleanup());
        cleanupFunctions.current = [];
        
        const watchedAddresses: string[] = [];
        
        // Watch top 10 tokens with non-zero balances
        const tokensToWatch = balances
          .filter(t => t.address !== 'native' && t.balance !== '0')
          .slice(0, 10);
        
        tokensToWatch.forEach(token => {
          const cleanup = watchTokenBalance(
            provider,
            address,
            token.address,
            (updatedBalance) => {
              setTokens(prev => prev.map(t => 
                t.address === updatedBalance.address ? updatedBalance : t
              ));
              setLastUpdated(new Date());
            }
          );
          cleanupFunctions.current.push(cleanup);
          watchedAddresses.push(token.address);
        });
        
        setWatchedTokens(watchedAddresses);
      }
      
    } catch (err: any) {
      console.error('Error fetching token balances:', err);
      setError(err.message || 'Failed to fetch token balances');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [
    isConnected, 
    address, 
    walletProvider, 
    chainId, 
    allTokenAddresses,
    includeNativeToken,
    includeZeroBalances,
    minBalanceUSD,
    discoverNewTokens,
    watchRealTime
  ]);
  
  /**
   * Add a custom token
   */
  const addCustomToken = useCallback(async (tokenAddress: string) => {
    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }
    
    const normalizedAddress = tokenAddress.toLowerCase();
    
    // Check if already added
    if (allTokenAddresses.includes(normalizedAddress)) {
      return;
    }
    
    // Add to custom tokens
    setCustomTokens(prev => [...prev, normalizedAddress]);
    
    // Fetch balance for this specific token
    if (isConnected && address && walletProvider) {
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
        const tokenBalance = await fetchUserTokenBalances(provider, address, {
          includeNativeToken: false,
          includeZeroBalances: true,
          tokenAddresses: [normalizedAddress]
        });
        
        if (tokenBalance.length > 0) {
          setTokens(prev => [...prev, tokenBalance[0]]);
        }
      } catch (err) {
        console.error('Error adding custom token:', err);
      }
    }
  }, [allTokenAddresses, isConnected, address, walletProvider, chainId]);
  
  /**
   * Remove a token from the list (only hides it, doesn't remove from blockchain)
   */
  const removeToken = useCallback((tokenAddress: string) => {
    const normalizedAddress = tokenAddress.toLowerCase();
    setCustomTokens(prev => prev.filter(addr => addr !== normalizedAddress));
    setTokens(prev => prev.filter(token => token.address !== normalizedAddress));
  }, []);
  
  /**
   * Manual refetch
   */
  const refetch = useCallback(async () => {
    await fetchBalances(true);
  }, [fetchBalances]);
  
  // Initial fetch on mount and when dependencies change
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);
  
  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refetch();
      }, refreshInterval * 1000);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refetch]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);
  
  return {
    tokens,
    loading,
    error,
    refetch,
    isRefreshing,
    lastUpdated,
    addCustomToken,
    removeToken,
    watchedTokens
  };
}