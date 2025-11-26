/**
 * Token type definitions (previously from Firebase)
 */

export interface VVSPair {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  address: string;
  isNative?: boolean;
  decimals: number;
  enabled: boolean;
  chainId: number;
}

export interface ImportedToken {
  id?: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  chainId: number;
  userId?: string;
}
