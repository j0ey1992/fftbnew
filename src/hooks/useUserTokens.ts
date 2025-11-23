'use client'

import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { ethers } from 'ethers';

// ERC20 ABI for basic token operations
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// Common tokens on Cronos
const COMMON_TOKENS = [
  {
    address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23', // WCRO
    symbol: 'WCRO',
    name: 'Wrapped CRO',
    decimals: 18,
    logoUrl: '/crypto-logos/cronos.png'
  },
  {
    address: '0x66e428c3f67a68878562e79A0234c1F83c208770', // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  {
    address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    address: '0x062E66477Faf219F25D27dCED647BF57C3107d52', // WBTC
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    logoUrl: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png'
  },
  {
    address: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', // WETH
    symbol: 'WETH',
    name: 'Wrapped ETH',
    decimals: 18,
    logoUrl: '/crypto-logos/ethereum.png'
  },
  {
    address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03', // VVS
    symbol: 'VVS',
    name: 'VVS Finance',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/14519.png'
  }
];

export interface UserToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  balanceUSD?: string;
  logoUrl?: string;
  price?: number;
}

export function useUserTokens() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [tokens, setTokens] = useState<UserToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setTokens([]);
      return;
    }

    fetchUserTokens();
  }, [address, isConnected, chainId]);

  const fetchUserTokens = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      // Get RPC URL based on chainId
      let rpcUrl: string;
      switch (chainId) {
        case 25: // Cronos mainnet
          rpcUrl = 'https://evm.cronos.org';
          break;
        case 338: // Cronos testnet
          rpcUrl = 'https://evm-t3.cronos.org';
          break;
        case 1: // Ethereum mainnet
          rpcUrl = 'https://eth.llamarpc.com';
          break;
        case 56: // BSC mainnet
          rpcUrl = 'https://bsc-dataseed.binance.org';
          break;
        default:
          rpcUrl = 'https://evm.cronos.org'; // Default to Cronos
      }

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const userTokens: UserToken[] = [];

      // First, get native token balance (CRO)
      try {
        const nativeBalance = await provider.getBalance(address);
        const nativeBalanceFormatted = ethers.utils.formatEther(nativeBalance);
        
        if (parseFloat(nativeBalanceFormatted) > 0) {
          userTokens.push({
            address: 'native',
            symbol: chainId === 25 || chainId === 338 ? 'CRO' : 'ETH',
            name: chainId === 25 || chainId === 338 ? 'Cronos' : 'Ethereum',
            decimals: 18,
            balance: nativeBalance.toString(),
            balanceFormatted: parseFloat(nativeBalanceFormatted).toFixed(4),
            logoUrl: chainId === 25 || chainId === 338 ? '/crypto-logos/cronos.png' : '/crypto-logos/ethereum.png'
          });
        }
      } catch (err) {
        console.error('Error fetching native balance:', err);
      }

      // Then, check common tokens (only for Cronos chains)
      if (chainId === 25 || chainId === 338) {
        await Promise.all(
          COMMON_TOKENS.map(async (tokenInfo) => {
            try {
              const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider);
              const balance = await contract.balanceOf(address);
              
              if (balance.gt(0)) {
                const balanceFormatted = ethers.utils.formatUnits(balance, tokenInfo.decimals);
                
                userTokens.push({
                  address: tokenInfo.address,
                  symbol: tokenInfo.symbol,
                  name: tokenInfo.name,
                  decimals: tokenInfo.decimals,
                  balance: balance.toString(),
                  balanceFormatted: parseFloat(balanceFormatted).toFixed(4),
                  logoUrl: tokenInfo.logoUrl
                });
              }
            } catch (err) {
              console.error(`Error fetching balance for ${tokenInfo.symbol}:`, err);
            }
          })
        );
      }

      // Sort tokens by balance (highest first)
      userTokens.sort((a, b) => {
        const balanceA = parseFloat(a.balanceFormatted);
        const balanceB = parseFloat(b.balanceFormatted);
        return balanceB - balanceA;
      });

      setTokens(userTokens);
    } catch (err) {
      console.error('Error fetching user tokens:', err);
      setError('Failed to fetch token balances');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (isConnected && address) {
      fetchUserTokens();
    }
  };

  return { tokens, loading, error, refetch, isConnected };
}