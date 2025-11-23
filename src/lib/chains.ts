'use client'

/**
 * Cronos chain definition (id: 25)
 * Using standard chain format compatible with Reown AppKit
 */
export const cronos = {
  id: 25,
  name: 'Cronos',
  nativeCurrency: {
    decimals: 18,
    name: 'CRO',
    symbol: 'CRO',
  },
  rpcUrls: {
    default: {
      http: ['http://88.99.93.159:8545', 'https://evm.cronos.org'],
      webSocket: ['ws://88.99.93.159:8546'],
    },
  },
  blockExplorers: {
    default: { name: 'CronoScan', url: 'https://cronoscan.com' },
  },
  testnet: false,
}

/**
 * Custom RPC URLs for Cronos network
 * This allows overriding default RPC URLs for better performance
 */
export const customRpcUrls = {
  'eip155:25': [
    { url: 'http://88.99.93.159:8545' },
    { url: 'https://evm.cronos.org' },
    { url: 'https://cronos-evm.publicnode.com' },
    { url: 'https://cronos.blockpi.network/v1/rpc/public' }
  ]
}

/**
 * Register chain with SIWX verifier
 * This ensures that the chain is properly available for SIWX authentication
 * 
 * @param siwx - The SIWX instance to register the chain with
 * @returns true if chain was registered successfully, false if there was an error
 */
export function registerChainWithSIWX(siwx: any): boolean {
  if (!siwx) {
    console.error('SIWX-CHAIN-REGISTER: Failed to register chain - SIWX is not initialized');
    return false;
  }

  try {
    // Some SIWX implementations may have a registerChain or registerNetwork method
    // If not available, the chain should already be registered through the AppKit initialization
    if (typeof siwx.registerChain === 'function') {
      console.log('SIWX-CHAIN-REGISTER: Explicitly registering chain with SIWX', {
        chainId: cronos.id,
        chainName: cronos.name
      });
      siwx.registerChain(cronos);
      return true;
    }

    // Verify chain is registered by checking if we can get the chain info
    // This approach depends on the SIWX implementation
    const caipNetworkId = `eip155:${cronos.id}`;
    if (typeof siwx.getChainInfo === 'function') {
      const chainInfo = siwx.getChainInfo(caipNetworkId);
      console.log('SIWX-CHAIN-REGISTER: Verified chain registration', {
        chainFound: !!chainInfo,
        chainInfo: chainInfo
      });
      return !!chainInfo;
    }

    // If there's no explicit way to register or verify, trust that the chain
    // was registered through AppKit initialization
    console.log('SIWX-CHAIN-REGISTER: Chain should be registered through AppKit initialization', {
      chainId: cronos.id,
      chainName: cronos.name,
      caipNetworkId: caipNetworkId
    });
    return true;
  } catch (error) {
    console.error('SIWX-CHAIN-REGISTER: Error registering chain with SIWX', {
      error,
      chainId: cronos.id,
      chainName: cronos.name
    });
    return false;
  }
}
