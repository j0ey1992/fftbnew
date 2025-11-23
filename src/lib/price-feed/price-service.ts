'use client'

/**
 * Service for fetching token prices from external APIs
 */

// Cache for token prices to reduce API calls
interface PriceCache {
  [tokenSymbol: string]: {
    price: number;
    timestamp: number;
    expiresAt: number;
  };
}

// Cache token prices for 5 minutes
const CACHE_EXPIRY_MS = 5 * 60 * 1000;
const priceCache: PriceCache = {};

/**
 * Get token price from GeckoTerminal API
 * @param tokenSymbol Token symbol (e.g., 'CRO', 'BTC')
 * @param chainId Optional chain ID (default: 'cronos')
 * @returns Token price in USD
 */
export async function getTokenPrice(tokenSymbol: string, chainId: string = 'cronos'): Promise<number> {
  // Normalize token symbol to lowercase
  const normalizedSymbol = tokenSymbol.toLowerCase();
  
  // Create a cache key that includes the chain ID
  const cacheKey = `${chainId}:${normalizedSymbol}`;
  
  // Check cache first
  const cachedPrice = priceCache[cacheKey];
  if (cachedPrice && cachedPrice.expiresAt > Date.now()) {
    return cachedPrice.price;
  }
  
  try {
    // Map common token symbols to their contract addresses on Cronos
    // This is a fallback in case the token symbol search doesn't work
    const tokenAddressMap: { [key: string]: { [chainId: string]: string } } = {
      'cro': {
        'cronos': '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23'
      },
      'usdc': {
        'cronos': '0xc21223249ca28397b4b6541dffaecc539bff0c59'
      },
      'usdt': {
        'cronos': '0x66e428c3f67a68878562e79a0234c1f83c208770'
      },
      'dai': {
        'cronos': '0xf2001b145b43032aaf5ee2884e456ccd805f677d'
      },
      'wbtc': {
        'cronos': '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8'
      },
      'weth': {
        'cronos': '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a'
      },
      'vvs': {
        'cronos': '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03'
      },
      // Add more mappings as needed
    };
    
    // Map chain IDs to GeckoTerminal format
    const geckoChainMap: { [key: string]: string } = {
      'cronos': 'cronos',
      'ethereum': 'eth',
      'bsc': 'bsc',
      'polygon': 'polygon',
      'avalanche': 'avalanche',
      'fantom': 'ftm',
      'arbitrum': 'arbitrum',
      'optimism': 'optimism'
    };
    
    // Get the correct chain ID format for GeckoTerminal
    const geckoChainId = geckoChainMap[chainId] || chainId;
    
    // Try to get the token price using the GeckoTerminal API
    // First, try to search for the token by symbol
    let response;
    let data;
    let tokenAddress = '';
    
    try {
      response = await fetch(
        `https://api.geckoterminal.com/api/v2/search?query=${normalizedSymbol}&chain_ids=${geckoChainId}`
      );
      
      if (!response.ok) {
        console.warn(`GeckoTerminal search API returned ${response.status} for ${normalizedSymbol}`);
      } else {
        data = await response.json();
        
        // Try to find the token in the search results
        if (data.data && data.data.length > 0) {
          // Look for an exact match on the token symbol
          const exactMatch = data.data.find((item: any) => 
            item.attributes.symbol?.toLowerCase() === normalizedSymbol
          );
          
          if (exactMatch) {
            tokenAddress = exactMatch.attributes.address;
          } else if (data.data[0].attributes?.address) {
            // Use the first result if no exact match
            tokenAddress = data.data[0].attributes.address;
          }
        }
      }
    } catch (error) {
      console.warn(`Error searching for token ${normalizedSymbol}:`, error);
    }
    
    // If we couldn't find the token via search, try using the address map
    if (!tokenAddress && tokenAddressMap[normalizedSymbol] && tokenAddressMap[normalizedSymbol][chainId]) {
      tokenAddress = tokenAddressMap[normalizedSymbol][chainId];
    }
    
    // If we still don't have a token address, try alternative price sources
    if (!tokenAddress) {
      console.warn(`Could not find token address for symbol: ${tokenSymbol} on chain: ${chainId}`);
      
      // Try alternative price sources here if needed
      // For now, use hardcoded fallback prices for common tokens
      const fallbackPrices: { [key: string]: number } = {
        'cro': 0.085,
        'usdc': 1.0,
        'usdt': 1.0,
        'dai': 1.0,
        'wbtc': 60000,
        'weth': 3000,
        'vvs': 0.000005
      };
      
      if (fallbackPrices[normalizedSymbol]) {
        console.log(`Using fallback price for ${tokenSymbol}: $${fallbackPrices[normalizedSymbol]}`);
        
        // Cache the fallback price (but with shorter expiry)
        priceCache[cacheKey] = {
          price: fallbackPrices[normalizedSymbol],
          timestamp: Date.now(),
          expiresAt: Date.now() + (CACHE_EXPIRY_MS / 2) // Cache for half the normal time
        };
        
        return fallbackPrices[normalizedSymbol];
      }
      
      return 0;
    }
    
    // Now get the token price using the token address
    let price = 0;
    try {
      response = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/${geckoChainId}/tokens/${tokenAddress}`
      );
      
      if (!response.ok) {
        console.warn(`GeckoTerminal token API returned ${response.status} for ${tokenAddress}`);
      } else {
        data = await response.json();
        price = data.data?.attributes?.price_usd ? parseFloat(data.data.attributes.price_usd) : 0;
      }
    } catch (error) {
      console.warn(`Error fetching price for token ${tokenSymbol}:`, error);
    }
    
    // Cache the price
    priceCache[cacheKey] = {
      price,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY_MS
    };
    
    return price;
  } catch (error) {
    console.error('Error fetching token price:', error);
    
    // Try fallback prices for common tokens
    const fallbackPrices: { [key: string]: number } = {
      'cro': 0.085,
      'usdc': 1.0,
      'usdt': 1.0,
      'dai': 1.0,
      'wbtc': 60000,
      'weth': 3000,
      'vvs': 0.000005
    };
    
    if (fallbackPrices[normalizedSymbol]) {
      console.log(`Using fallback price for ${tokenSymbol}: $${fallbackPrices[normalizedSymbol]}`);
      return fallbackPrices[normalizedSymbol];
    }
    
    // Return 0 if there's an error and no fallback
    return 0;
  }
}

/**
 * Calculate APR based on reward rate, reward duration, and token prices
 * @param rewardRate Reward rate in tokens per second
 * @param rewardsDuration Rewards duration in seconds
 * @param rewardTokenSymbol Reward token symbol
 * @param totalStakedValue Total value of staked assets in USD
 * @returns APR value as a percentage
 */
export async function calculateAccurateApr(
  rewardRate: string,
  rewardsDuration: number,
  rewardTokenSymbol: string,
  totalStakedValue: number = 1000 // Default to $1000 if not provided
): Promise<number> {
  try {
    // Get token price
    const tokenPrice = await getTokenPrice(rewardTokenSymbol);
    
    if (tokenPrice === 0) {
      console.warn('Token price is 0, using fallback APR calculation');
      
      // Use a more reasonable fallback calculation
      // Assuming a modest APR if we can't calculate it accurately
      const fallbackAprMap: { [key: string]: number } = {
        'cro': 5.0,
        'vvs': 15.0,
        // Add more tokens as needed
      };
      
      const normalizedSymbol = rewardTokenSymbol.toLowerCase();
      if (fallbackAprMap[normalizedSymbol]) {
        return fallbackAprMap[normalizedSymbol];
      }
      
      // Default fallback APR of 8%
      return 8.0;
    }
    
    // Calculate rewards per year
    const rewardsPerSecond = parseFloat(rewardRate);
    const secondsPerYear = 365 * 24 * 60 * 60;
    const rewardsPerYear = rewardsPerSecond * (secondsPerYear / rewardsDuration);
    
    // Calculate value of rewards per year
    const rewardsValuePerYear = rewardsPerYear * tokenPrice;
    
    // Calculate APR
    const aprValue = (rewardsValuePerYear / totalStakedValue) * 100;
    
    // Cap the APR at a reasonable maximum to prevent unrealistic values
    const maxApr = 1000; // 1000% APR cap
    return Math.min(aprValue, maxApr);
  } catch (error) {
    console.error('Error calculating accurate APR:', error);
    
    // More reasonable fallback APR
    return 8.0;
  }
}

/**
 * Format reward rate value as a string
 * @param aprValue Reward rate value as a number
 * @returns Formatted reward rate string (e.g., "8.5")
 */
export function formatApr(aprValue: number): string {
  return `${aprValue.toFixed(2)}`;
}
