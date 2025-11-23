import useSWR from 'swr';

// Define the structure of a DexScreener pair (simplified)
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  pairCreatedAt: number;
}

// Define the structure of the API response
interface DexScreenerApiResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<DexScreenerPair[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorInfo = await res.text();
    throw new Error(`Failed to fetch DexScreener data: ${res.status} ${errorInfo}`);
  }
  const data: DexScreenerApiResponse = await res.json();
  console.log('Raw DexScreener Response:', data); // Log raw response
  
  // Filter out pairs that don't have basic info or h24 price change
  const filteredPairs = data.pairs?.filter(pair => 
    pair.baseToken?.address && 
    pair.baseToken?.symbol &&
    pair.priceChange?.h24 !== undefined
  ) ?? [];
  
  console.log('Filtered DexScreener Pairs:', filteredPairs); // Log filtered pairs
  return filteredPairs;
};

/**
 * Hook to fetch top gaining pairs from DexScreener for Cronos.
 * @returns { data, error, isLoading }
 */
export function useTopGainers() {
  // Reverting to the simpler query that worked, as the sorting query was unreliable
  const url = 'https://api.dexscreener.com/latest/dex/search?q=WCRO%20USDC%20cronos'; 
  
  // Let SWR infer the type from the fetcher's return type
  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
    revalidateOnFocus: true, // Revalidate when window gets focus
    dedupingInterval: 30000, // Avoid refetching within 30 seconds
  });

  return {
    topGainers: data,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  };
}
