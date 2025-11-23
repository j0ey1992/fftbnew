'use client'

import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { convertIpfsUrl } from '@/lib/utils/ipfs-url';

// Define interfaces for NFT data
export interface MoralisNft {
  tokenId: string;
  tokenAddress: string;
  tokenUri?: string;
  metadata?: any;
  name?: string;
  symbol?: string;
  amount?: string;
  contractType?: string;
  ownerOf?: string;
  tokenHash?: string;
  lastMetadataSync?: string;
  lastTokenUriSync?: string;
  image?: string;
}

export interface NftWithMetadata {
  id: string;
  name: string;
  collection: string;
  rarity: string;
  rewardRate: string;
  rewardRateValue: number;
  image: string;
  staked: boolean;
  rewards: string;
  expireDate?: number;
  tokenId: string;
  tokenAddress: string;
  metadata?: any;
}

/**
 * Initialize Moralis with API key
 * This should be called before any other Moralis functions
 */
export async function initMoralis(): Promise<void> {
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

  if (!apiKey) {
    console.error('Moralis API key not found in environment variables');
    console.error('Make sure NEXT_PUBLIC_MORALIS_API_KEY is set in your .env.local file');
    throw new Error('Moralis API key not found in environment variables');
  }

  try {
    if (!Moralis.Core.isStarted) {
      console.log('Initializing Moralis with API key...');
      await Moralis.start({
        apiKey: apiKey,
      });
      console.log('Moralis initialized successfully');
    } else {
      console.log('Moralis already initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Moralis:', error);
    throw error;
  }
}

/**
 * Get NFTs owned by a specific address on Cronos chain
 * @param address Wallet address to fetch NFTs for
 * @param collectionAddress Optional collection address to filter by
 * @returns Array of NFTs owned by the address
 */
export async function getNftsByOwner(
  address: string,
  collectionAddress?: string,
  limit: number = 20,
  cursor?: string
): Promise<{ nfts: MoralisNft[], cursor?: string, hasMore: boolean }> {
  if (!address) {
    console.error('No wallet address provided for getNftsByOwner')
    return { nfts: [], hasMore: false }
  }

  try {
    // Initialize Moralis if not already initialized
    await initMoralis()

    // Cronos chain ID
    const chain = EvmChain.CRONOS

    // Prepare options for the API call
    const options: any = {
      address,
      chain,
      limit,
    }

    // Add cursor for pagination if provided
    if (cursor) {
      options.cursor = cursor
    }

    // Validate collection address before using it
    if (collectionAddress) {
      // Make sure the collection address is a valid Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(collectionAddress)) {
        console.error('Invalid collection address format:', collectionAddress)
        throw new Error('Invalid collection address format')
      }
      
      // Add collection address to options
      options.tokenAddresses = [collectionAddress]
      console.log(`Using NFT collection address for Moralis query: ${collectionAddress}`)
    }

    console.log(`Fetching NFTs for address: ${address}${collectionAddress ? ` from collection: ${collectionAddress}` : ''} (limit: ${limit}${cursor ? `, cursor: ${cursor}` : ''})`)

    // Fetch NFTs from Moralis
    const response = await Moralis.EvmApi.nft.getWalletNFTs(options)
    
    console.log(`Found ${response.result.length} NFTs`)
    
    // Return the NFTs with proper type handling and pagination info
    const nfts = response.result.map(nft => {
      // Parse metadata if it exists
      let parsedMetadata;
      let imageUrl;
      
      console.log(`Processing NFT ${nft.tokenId}:`, {
        tokenUri: nft.tokenUri,
        hasMetadata: !!nft.metadata,
        metadataType: typeof nft.metadata
      });
      
      try {
        if (nft.metadata) {
          // Handle both string and object metadata formats
          if (typeof nft.metadata === 'string') {
            const metadataStr = nft.metadata as unknown as string;
            parsedMetadata = JSON.parse(metadataStr);
          } else {
            parsedMetadata = nft.metadata;
          }
          
          console.log(`Parsed metadata for NFT ${nft.tokenId}:`, parsedMetadata);
          
          // Extract image URL from metadata with fallbacks
          imageUrl = parsedMetadata?.image ||
                    parsedMetadata?.image_url ||
                    parsedMetadata?.imageUrl ||
                    parsedMetadata?.imageURI ||
                    parsedMetadata?.image_uri;
          
          console.log(`Extracted image URL for NFT ${nft.tokenId}:`, imageUrl);
                    
          // Convert IPFS URLs to use custom API
          const convertedUrl = convertIpfsUrl(imageUrl);
          console.log(`Converted image URL for NFT ${nft.tokenId}:`, convertedUrl);
          imageUrl = convertedUrl;
        } else {
          console.log(`No metadata found for NFT ${nft.tokenId}`);
        }
      } catch (err) {
        console.error(`Error parsing NFT metadata for token ID ${nft.tokenId}:`, err);
        parsedMetadata = undefined;
        imageUrl = undefined;
      }
      
      return {
        tokenId: nft.tokenId.toString(),
        tokenAddress: nft.tokenAddress.lowercase,
        tokenUri: nft.tokenUri?.toString(),
        metadata: parsedMetadata,
        name: nft.name,
        symbol: nft.symbol,
        amount: nft.amount?.toString(),
        contractType: nft.contractType,
        ownerOf: nft.ownerOf?.toString(),
        tokenHash: nft.tokenHash,
        lastMetadataSync: nft.lastMetadataSync,
        lastTokenUriSync: nft.lastTokenUriSync,
        image: imageUrl
      } as MoralisNft;
    });

    // Return pagination info
    return {
      nfts,
      cursor: response.pagination?.cursor,
      hasMore: !!response.pagination?.cursor
    };
  } catch (error) {
    console.error('Error fetching NFTs from Moralis:', error);
    // Return empty result instead of throwing to prevent UI from breaking
    return { nfts: [], hasMore: false };
  }
}

/**
 * Convert Moralis NFTs to the app's NFT format
 * @param nfts Array of Moralis NFTs
 * @param collectionName Name of the collection
 * @param rewardRate Reward rate value for the collection
 * @param tokenSymbol Token symbol for rewards
 * @returns Array of NFTs in the app's format
 */
export function convertMoralisNftsToAppFormat(
  nfts: MoralisNft[],
  collectionName: string,
  rewardRate: string,
  tokenSymbol: string
): NftWithMetadata[] {
  if (!nfts || nfts.length === 0) {
    console.log('No NFTs to convert to app format');
    return [];
  }
  
  console.log(`Converting ${nfts.length} NFTs to app format`);
  
  return nfts.map(nft => {
    // Extract metadata
    const metadata = nft.metadata || {};
    
    // Get image URL from metadata with multiple fallbacks
    let imageUrl = nft.image;
    
    if (!imageUrl) {
      // Try various common metadata image fields
      imageUrl = metadata.image || 
                metadata.image_url || 
                metadata.imageUrl ||
                metadata.imageURI ||
                metadata.image_uri;
      
      // Convert IPFS URLs to use custom API
      imageUrl = convertIpfsUrl(imageUrl);
      
      // If still no image, use default
      if (!imageUrl) {
        imageUrl = '/kris-logo.svg';
      }
    }
    
    // Get name from metadata or construct one
    const name = nft.name || 
      (metadata.name || `${collectionName} #${nft.tokenId}`);
    
    // Get rarity from metadata or use a default
    let rarity = '';
    
    if (metadata.attributes && Array.isArray(metadata.attributes)) {
      const rarityAttr = metadata.attributes.find((attr: any) =>
        attr.trait_type?.toLowerCase() === 'rarity' ||
        attr.trait_type?.toLowerCase() === 'tier' ||
        attr.trait_type?.toLowerCase() === 'rank'
      );
      
      if (rarityAttr) {
        rarity = rarityAttr.value || '';
      }
    }

    // Parse reward rate value safely
    let rewardRateValue = 0;
    try {
      rewardRateValue = parseFloat(rewardRate.replace('%', ''));
      if (isNaN(rewardRateValue)) rewardRateValue = 0;
    } catch (e) {
      console.error('Error parsing reward rate value:', e);
    }

    return {
      id: `nft-${nft.tokenId}`,
      name,
      collection: collectionName,
      rarity,
      rewardRate,
      rewardRateValue,
      image: imageUrl,
      staked: false, // This will be set separately for staked NFTs
      rewards: '', // No rewards shown for unstaked NFTs
      tokenId: nft.tokenId,
      tokenAddress: nft.tokenAddress,
      metadata
    };
  });
}

/**
 * Get NFT metadata from Moralis
 * @param tokenAddress Contract address of the NFT
 * @param tokenId Token ID of the NFT
 * @returns NFT metadata
 */
export async function getNftMetadata(
  tokenAddress: string,
  tokenId: string
): Promise<any> {
  try {
    // Initialize Moralis if not already initialized
    await initMoralis();

    // Cronos chain ID
    const chain = EvmChain.CRONOS;

    // Fetch NFT metadata from Moralis
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      address: tokenAddress,
      tokenId,
      chain,
    });

    // Return the metadata if response exists
    return response ? response.toJSON() : null;
  } catch (error) {
    console.error('Error fetching NFT metadata from Moralis:', error);
    throw error;
  }
}
