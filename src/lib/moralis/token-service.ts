'use client'

import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { initMoralis } from './nft-service';

// Define interfaces for token data
// Define interfaces for token data
export interface MoralisTokenContract {
  contractAddress: {
    lowercase: string;
  };
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
}

export interface MoralisToken {
  token: MoralisTokenContract;
  value: string;
  formattedValue: string;
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  logo: string;
}

/**
 * Format token balance with proper decimals
 * @param value Raw balance value (integer string) or pre-formatted value (decimal string)
 * @param decimals Token decimals
 * @returns Formatted balance string
 */
export function formatTokenBalance(value: string, decimals: number): string {
  try {
    // Check if the value is already a decimal string
    if (value.includes('.')) {
      // Already formatted, just ensure proper formatting
      const [integerPart, existingFractionalPart] = value.split('.');
      
      // Format integer part with commas
      const formattedInteger = parseInt(integerPart).toLocaleString();
      
      // Keep fractional part as is, but limit to decimals length
      let fractionalPart = existingFractionalPart;
      if (fractionalPart.length > decimals) {
        fractionalPart = fractionalPart.substring(0, decimals);
      }
      
      // Trim trailing zeros but keep at least 2 decimal places
      while (fractionalPart.length > 2 && fractionalPart.endsWith('0')) {
        fractionalPart = fractionalPart.slice(0, -1);
      }
      
      // Only show decimal part if it's not all zeros
      if (fractionalPart === '0'.repeat(fractionalPart.length)) {
        return formattedInteger;
      }
      
      return `${formattedInteger}.${fractionalPart}`;
    }
    
    // Handle raw integer value (token units)
    // Convert from wei to token units
    const divisor = BigInt(10) ** BigInt(decimals);
    const valueBI = BigInt(value);
    
    // Integer part
    const integerPart = (valueBI / divisor).toString();
    
    // Fractional part (with proper padding)
    let fractionalPart = (valueBI % divisor).toString().padStart(decimals, '0');
    
    // Trim trailing zeros but keep at least 2 decimal places
    while (fractionalPart.length > 2 && fractionalPart.endsWith('0')) {
      fractionalPart = fractionalPart.slice(0, -1);
    }
    
    // Format with commas for thousands
    const formattedInteger = parseInt(integerPart).toLocaleString();
    
    // Only show decimal part if it's not all zeros
    if (fractionalPart === '0'.repeat(fractionalPart.length)) {
      return formattedInteger;
    }
    
    return `${formattedInteger}.${fractionalPart}`;
  } catch (error) {
    console.error('Error formatting token balance:', error);
    return value;
  }
}

/**
 * Get token logo URL
 * @param address Token contract address
 * @param symbol Token symbol
 * @returns URL to token logo
 */
export function getTokenLogo(address: string, symbol: string): string {
  // Try to get logo from common token logos
  const commonTokens: Record<string, string> = {
    'CRO': '/crypto-logos/cronos.svg',
    'WCRO': '/crypto-logos/cronos.svg',
    'USDC': '/crypto-logos/cronos.svg', // Replace with actual USDC logo
    'USDT': '/crypto-logos/cronos.svg', // Replace with actual USDT logo
  };
  
  if (symbol && commonTokens[symbol]) {
    return commonTokens[symbol];
  }
  
  // For unknown tokens, generate a placeholder based on the address
  // This ensures the same token always gets the same placeholder
  const colorCode = address.slice(-6);
  return `https://via.placeholder.com/40/${colorCode}/ffffff?text=${symbol?.slice(0, 2) || '??'}`;
}

/**
 * Get all ERC20 tokens for an address
 * @param address Wallet address
 * @param page Page number for pagination (1-based)
 * @param limit Number of tokens per page
 * @returns Array of token data
 */
export async function getWalletTokens(
  address: string,
  page: number = 1,
  limit: number = 100
): Promise<TokenData[]> {
  if (!address) {
    console.error('No wallet address provided for getWalletTokens');
    return [];
  }
  
  try {
    // Initialize Moralis if not already initialized
    await initMoralis();
    
    // Cronos chain ID
    const chain = EvmChain.CRONOS;
    
    console.log(`Fetching tokens for address: ${address} (page ${page}, limit ${limit})`);
    
    // Fetch tokens from Moralis
    const options: any = {
      address,
      chain,
    };
    
    // Note: getWalletTokenBalances doesn't support limit or pagination
    // We'll handle pagination on the client side
    const response = await Moralis.EvmApi.token.getWalletTokenBalances(options);
    
    // Client-side pagination
    const allTokens = response.result;
    const pageSize = limit;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTokens = allTokens.slice(startIndex, endIndex);
    
    console.log(`Found ${allTokens.length} tokens, showing page ${page} (${paginatedTokens.length} tokens)`);
    
    // Map Moralis tokens to our format
    return paginatedTokens.map(token => {
      if (!token.token) {
        return {
          address: 'unknown',
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          decimals: 18,
          balance: '0',
          formattedBalance: '0',
          logo: getTokenLogo('unknown', 'UNKNOWN')
        };
      }
      
      const tokenAddress = token.token.contractAddress?.lowercase || 'unknown';
      const symbol = token.token.symbol || 'UNKNOWN';
      
      return {
        address: tokenAddress,
        name: token.token.name || `Unknown Token (${symbol})`,
        symbol,
        decimals: token.token.decimals || 18,
        balance: token.value || '0',
        formattedBalance: formatTokenBalance(token.value || '0', token.token.decimals || 18),
        logo: token.token.logo || token.token.thumbnail || getTokenLogo(tokenAddress, symbol)
      };
    });
  } catch (error) {
    console.error('Error fetching tokens from Moralis:', error);
    return [];
  }
}

/**
 * Search for tokens by name, symbol, or address
 * @param tokens Array of tokens to search
 * @param query Search query
 * @returns Filtered array of tokens
 */
export function searchTokens(tokens: TokenData[], query: string): TokenData[] {
  if (!query) return tokens;
  
  const lowerQuery = query.toLowerCase();
  
  return tokens.filter(token => 
    token.name.toLowerCase().includes(lowerQuery) ||
    token.symbol.toLowerCase().includes(lowerQuery) ||
    token.address.toLowerCase().includes(lowerQuery)
  );
}
