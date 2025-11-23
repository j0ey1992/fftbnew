'use client'

import { ethers } from 'ethers';
import { useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';

// ERC20 interface for token symbol and decimals
const erc20Abi = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)'
];

// Known token addresses and their symbols
// This is a more comprehensive list than the original implementation
export const KNOWN_TOKENS: { [key: string]: { symbol: string, name?: string, decimals?: number } } = {
  // Cronos Mainnet Tokens
  '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23': { symbol: 'CRO', name: 'Cronos', decimals: 18 },
  '0xc21223249ca28397b4b6541dffaecc539bff0c59': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  '0x66e428c3f67a68878562e79a0234c1f83c208770': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  '0xf2001b145b43032aaf5ee2884e456ccd805f677d': { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
  '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8': { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  '0x97749c9B61F878a880DfE312d2594AE07AEd7656': { symbol: 'MMF', name: 'Mad Meerkat Finance', decimals: 18 },
  '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03': { symbol: 'VVS', name: 'VVS Finance', decimals: 18 },
  '0xadbd1231fb360047525BEdF962581F3eee7b49fe': { symbol: 'TONIC', name: 'Tectonic', decimals: 18 },
  '0xCbDE0E17d14F49e10a10302a32d17AE88a7Ecb8B': { symbol: 'ATOM', name: 'Cosmos Hub', decimals: 6 },
  
  // Add more tokens as needed
};

/**
 * Get token symbol from address
 * First checks known tokens, then falls back to blockchain query
 * @param tokenAddress Token contract address
 * @param provider Ethers provider
 * @returns Token symbol
 */
export async function getTokenSymbol(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<string> {
  // Normalize address to lowercase for comparison
  const normalizedAddress = tokenAddress.toLowerCase();
  
  // Check known tokens first
  if (KNOWN_TOKENS[normalizedAddress]) {
    return KNOWN_TOKENS[normalizedAddress].symbol;
  }
  
  // Fallback to blockchain query
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.symbol();
  } catch (err) {
    console.error('Error fetching token symbol:', err);
    return 'TOKEN';
  }
}

/**
 * Get token decimals from address
 * First checks known tokens, then falls back to blockchain query
 * @param tokenAddress Token contract address
 * @param provider Ethers provider
 * @returns Token decimals
 */
export async function getTokenDecimals(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<number> {
  // Normalize address to lowercase for comparison
  const normalizedAddress = tokenAddress.toLowerCase();
  
  // Check known tokens first
  if (KNOWN_TOKENS[normalizedAddress] && KNOWN_TOKENS[normalizedAddress].decimals !== undefined) {
    return KNOWN_TOKENS[normalizedAddress].decimals!;
  }
  
  // Fallback to blockchain query
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.decimals();
  } catch (err) {
    console.error('Error fetching token decimals:', err);
    return 18; // Default to 18 decimals
  }
}

/**
 * Get token name from address
 * First checks known tokens, then falls back to blockchain query
 * @param tokenAddress Token contract address
 * @param provider Ethers provider
 * @returns Token name
 */
export async function getTokenName(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<string> {
  // Normalize address to lowercase for comparison
  const normalizedAddress = tokenAddress.toLowerCase();
  
  // Check known tokens first
  if (KNOWN_TOKENS[normalizedAddress] && KNOWN_TOKENS[normalizedAddress].name) {
    return KNOWN_TOKENS[normalizedAddress].name!;
  }
  
  // Fallback to blockchain query
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    return await tokenContract.name();
  } catch (err) {
    console.error('Error fetching token name:', err);
    return 'Unknown Token';
  }
}

/**
 * React hook for token information
 * @param tokenAddress Token contract address
 * @returns Token information and loading state
 */
export function useTokenInfo(tokenAddress: string | undefined) {
  const { walletProvider } = useAppKitProvider('eip155');
  const { chainId } = useAppKitNetwork();
  const [tokenInfo, setTokenInfo] = React.useState<{
    symbol: string;
    name: string;
    decimals: number;
  }>({
    symbol: 'TOKEN',
    name: 'Unknown Token',
    decimals: 18
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tokenAddress || !walletProvider) return;

    const fetchTokenInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
        
        // Normalize address to lowercase for comparison
        const normalizedAddress = tokenAddress.toLowerCase();
        
        // Check known tokens first
        if (KNOWN_TOKENS[normalizedAddress]) {
          setTokenInfo({
            symbol: KNOWN_TOKENS[normalizedAddress].symbol,
            name: KNOWN_TOKENS[normalizedAddress].name || 'Unknown Token',
            decimals: KNOWN_TOKENS[normalizedAddress].decimals || 18
          });
          setIsLoading(false);
          return;
        }
        
        // Fallback to blockchain query
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        
        // Fetch token info in parallel
        const [symbol, name, decimals] = await Promise.all([
          tokenContract.symbol().catch(() => 'TOKEN'),
          tokenContract.name().catch(() => 'Unknown Token'),
          tokenContract.decimals().catch(() => 18)
        ]);
        
        setTokenInfo({
          symbol,
          name,
          decimals: Number(decimals)
        });
      } catch (err: any) {
        console.error('Error fetching token info:', err);
        setError(err.message || 'Failed to fetch token information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress, walletProvider, chainId]);

  return { tokenInfo, isLoading, error };
}

// Import React at the top
import React from 'react';
