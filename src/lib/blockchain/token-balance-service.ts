'use client'

import { ethers } from 'ethers';
import { getTokenSymbol, getTokenDecimals, getTokenName } from '@/lib/tokens/token-service';

// ERC20 ABI for token interactions
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Common token addresses on Cronos mainnet
export const CRONOS_TOKENS = [
  { address: '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', symbol: 'WCRO', name: 'Wrapped CRO' },
  { address: '0xc21223249ca28397b4b6541dffaecc539bff0c59', symbol: 'USDC', name: 'USD Coin' },
  { address: '0x66e428c3f67a68878562e79a0234c1f83c208770', symbol: 'USDT', name: 'Tether USD' },
  { address: '0xf2001b145b43032aaf5ee2884e456ccd805f677d', symbol: 'DAI', name: 'Dai Stablecoin' },
  { address: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  { address: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', symbol: 'WETH', name: 'Wrapped Ether' },
  { address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03', symbol: 'VVS', name: 'VVS Finance' },
  { address: '0xadbd1231fb360047525BEdF962581F3eee7b49fe', symbol: 'TONIC', name: 'Tectonic' },
  { address: '0xCbDE0E17d14F49e10a10302a32d17AE88a7Ecb8B', symbol: 'ATOM', name: 'Cosmos Hub' },
  { address: '0x97749c9B61F878a880DfE312d2594AE07AEd7656', symbol: 'MMF', name: 'Mad Meerkat Finance' },
  { address: '0x062E66477Faf219F25D27dCED647BF57C3107d52', symbol: 'WBTC', name: 'Wrapped BTC' },
  { address: '0xca2503482e5D6D762b524978f400f03E38d5F962', symbol: 'SHIB', name: 'Shiba Inu' },
  { address: '0x9e5bd780dff875Dd85848a65549791445AE25De0', symbol: 'BIFI', name: 'Beefy Finance' },
  { address: '0x39cC0E14795A8e6e9D02A21091b81FE0d61D82f9', symbol: 'SINGLE', name: 'Single Finance' },
  { address: '0x5fD9F73286b7E8683Bab45019C94553b93e015Cf', symbol: 'ELK', name: 'Elk Finance' },
  { address: '0x8b876C2556a5C1b056C0e9B36f7665C6925B2670', symbol: 'DARK', name: 'Dark Crypto' }
];

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  balanceUSD?: number;
  logo?: string;
}

export interface FetchTokenBalancesOptions {
  includeNativeToken?: boolean;
  includeZeroBalances?: boolean;
  tokenAddresses?: string[]; // Specific tokens to check
  minBalanceUSD?: number;
}

/**
 * Format token balance for display
 */
export function formatTokenBalance(balance: ethers.BigNumber, decimals: number): string {
  const divisor = ethers.BigNumber.from(10).pow(decimals);
  const beforeDecimal = balance.div(divisor).toString();
  const afterDecimal = balance.mod(divisor).toString().padStart(decimals, '0');
  
  // Remove trailing zeros
  let trimmedAfterDecimal = afterDecimal.replace(/0+$/, '');
  
  // Format with commas
  const formattedBeforeDecimal = parseInt(beforeDecimal).toLocaleString();
  
  if (trimmedAfterDecimal.length === 0) {
    return formattedBeforeDecimal;
  }
  
  // Show max 6 decimal places
  if (trimmedAfterDecimal.length > 6) {
    trimmedAfterDecimal = trimmedAfterDecimal.substring(0, 6);
  }
  
  return `${formattedBeforeDecimal}.${trimmedAfterDecimal}`;
}

/**
 * Fetch native token balance (CRO on Cronos)
 */
export async function getNativeTokenBalance(
  provider: ethers.providers.Provider,
  address: string
): Promise<TokenBalance> {
  const balance = await provider.getBalance(address);
  
  return {
    address: 'native',
    symbol: 'CRO',
    name: 'Cronos',
    decimals: 18,
    balance: balance.toString(),
    formattedBalance: formatTokenBalance(balance, 18),
    logo: '/crypto-logos/cronos.svg'
  };
}

/**
 * Fetch single token balance
 */
export async function getTokenBalance(
  provider: ethers.providers.Provider,
  walletAddress: string,
  tokenAddress: string
): Promise<TokenBalance | null> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Fetch token info and balance in parallel
    const [balance, symbol, name, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      getTokenSymbol(tokenAddress, provider),
      getTokenName(tokenAddress, provider),
      getTokenDecimals(tokenAddress, provider)
    ]);
    
    // Skip if balance is zero and includeZeroBalances is false
    if (balance.isZero()) {
      return null;
    }
    
    return {
      address: tokenAddress.toLowerCase(),
      symbol,
      name,
      decimals,
      balance: balance.toString(),
      formattedBalance: formatTokenBalance(balance, decimals)
    };
  } catch (error) {
    console.error(`Error fetching balance for token ${tokenAddress}:`, error);
    return null;
  }
}

/**
 * Fetch all token balances for a wallet
 */
export async function fetchUserTokenBalances(
  provider: ethers.providers.Provider,
  walletAddress: string,
  options: FetchTokenBalancesOptions = {}
): Promise<TokenBalance[]> {
  const {
    includeNativeToken = true,
    includeZeroBalances = false,
    tokenAddresses = CRONOS_TOKENS.map(t => t.address),
    minBalanceUSD = 0
  } = options;
  
  const balances: TokenBalance[] = [];
  
  // Fetch native token balance
  if (includeNativeToken) {
    try {
      const nativeBalance = await getNativeTokenBalance(provider, walletAddress);
      if (includeZeroBalances || nativeBalance.balance !== '0') {
        balances.push(nativeBalance);
      }
    } catch (error) {
      console.error('Error fetching native token balance:', error);
    }
  }
  
  // Fetch ERC20 token balances in parallel batches
  const batchSize = 10;
  for (let i = 0; i < tokenAddresses.length; i += batchSize) {
    const batch = tokenAddresses.slice(i, i + batchSize);
    const batchPromises = batch.map(tokenAddress => 
      getTokenBalance(provider, walletAddress, tokenAddress)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const tokenBalance of batchResults) {
      if (tokenBalance && (includeZeroBalances || tokenBalance.balance !== '0')) {
        balances.push(tokenBalance);
      }
    }
  }
  
  // Sort by balance (descending)
  balances.sort((a, b) => {
    try {
      const balanceA = ethers.BigNumber.from(a.balance);
      const balanceB = ethers.BigNumber.from(b.balance);
      return balanceB.gt(balanceA) ? 1 : -1;
    } catch {
      return 0;
    }
  });
  
  return balances;
}

/**
 * Discover tokens by scanning Transfer events
 * This is a more comprehensive but slower method
 */
export async function discoverUserTokens(
  provider: ethers.providers.Provider,
  walletAddress: string,
  fromBlock: number = 0,
  toBlock: number | 'latest' = 'latest'
): Promise<string[]> {
  const tokenAddresses = new Set<string>();
  
  try {
    // Create filter for Transfer events TO the wallet
    const filterTo = {
      topics: [
        ethers.utils.id('Transfer(address,address,uint256)'),
        null,
        ethers.utils.hexZeroPad(walletAddress, 32)
      ],
      fromBlock,
      toBlock
    };
    
    // Create filter for Transfer events FROM the wallet
    const filterFrom = {
      topics: [
        ethers.utils.id('Transfer(address,address,uint256)'),
        ethers.utils.hexZeroPad(walletAddress, 32),
        null
      ],
      fromBlock,
      toBlock
    };
    
    // Get logs
    const [logsTo, logsFrom] = await Promise.all([
      provider.getLogs(filterTo),
      provider.getLogs(filterFrom)
    ]);
    
    // Extract unique token addresses
    [...logsTo, ...logsFrom].forEach(log => {
      tokenAddresses.add(log.address.toLowerCase());
    });
    
    return Array.from(tokenAddresses);
  } catch (error) {
    console.error('Error discovering user tokens:', error);
    return [];
  }
}

/**
 * Get token balance changes over time
 */
export async function getTokenBalanceHistory(
  provider: ethers.providers.Provider,
  walletAddress: string,
  tokenAddress: string,
  fromBlock: number,
  toBlock: number | 'latest' = 'latest'
): Promise<{ block: number; balance: string; timestamp: number }[]> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const history: { block: number; balance: string; timestamp: number }[] = [];
  
  try {
    // Get Transfer events
    const filterTo = contract.filters.Transfer(null, walletAddress);
    const filterFrom = contract.filters.Transfer(walletAddress, null);
    
    const [eventsTo, eventsFrom] = await Promise.all([
      contract.queryFilter(filterTo, fromBlock, toBlock),
      contract.queryFilter(filterFrom, fromBlock, toBlock)
    ]);
    
    // Combine and sort events by block number
    const allEvents = [...eventsTo, ...eventsFrom].sort((a, b) => a.blockNumber - b.blockNumber);
    
    // Get balance at each block where a transfer occurred
    for (const event of allEvents) {
      const balance = await contract.balanceOf(walletAddress, { blockTag: event.blockNumber });
      const block = await provider.getBlock(event.blockNumber);
      
      history.push({
        block: event.blockNumber,
        balance: balance.toString(),
        timestamp: block.timestamp
      });
    }
    
    // Get current balance
    const currentBalance = await contract.balanceOf(walletAddress);
    const currentBlock = await provider.getBlock('latest');
    
    history.push({
      block: currentBlock.number,
      balance: currentBalance.toString(),
      timestamp: currentBlock.timestamp
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching token balance history:', error);
    return [];
  }
}

/**
 * Monitor token balance changes in real-time
 */
export function watchTokenBalance(
  provider: ethers.providers.Provider,
  walletAddress: string,
  tokenAddress: string,
  callback: (balance: TokenBalance) => void
): () => void {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  
  // Handler for Transfer events
  const handleTransfer = async (from: string, to: string, value: ethers.BigNumber, event: ethers.Event) => {
    // Only process if wallet is involved
    if (from.toLowerCase() === walletAddress.toLowerCase() || 
        to.toLowerCase() === walletAddress.toLowerCase()) {
      const balance = await getTokenBalance(provider, walletAddress, tokenAddress);
      if (balance) {
        callback(balance);
      }
    }
  };
  
  // Subscribe to Transfer events
  contract.on('Transfer', handleTransfer);
  
  // Return cleanup function
  return () => {
    contract.off('Transfer', handleTransfer);
  };
}