import { ethers } from 'ethers';

/**
 * Get a read-only provider for the current network
 */
export function getProvider(): ethers.providers.JsonRpcProvider {
  // Default to Cronos mainnet
  const rpcUrl = process.env.NEXT_PUBLIC_CRONOS_RPC_URL || 'http://88.99.93.159:8545';
  return new ethers.providers.JsonRpcProvider(rpcUrl);
}

/**
 * Get a signer from the connected wallet
 * This should be called from within a component that has access to wallet context
 */
export async function getSigner(): Promise<ethers.Signer> {
  // This is a placeholder - in actual usage, this would be called from a component
  // that has access to useAppKitProvider hook
  throw new Error('getSigner must be called from within a React component with wallet context');
}

/**
 * Get contract instance with signer or provider
 */
export function getContract(
  address: string,
  abi: any[],
  signerOrProvider: ethers.Signer | ethers.providers.Provider
): ethers.Contract {
  return new ethers.Contract(address, abi, signerOrProvider);
}