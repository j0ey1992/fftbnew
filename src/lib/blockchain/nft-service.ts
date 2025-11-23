'use client'

import { ethers } from 'ethers'
import { convertIpfsUrl } from '@/lib/utils/ipfs-url'

// ERC721 ABI for basic NFT operations
const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)'
]

// ERC721Enumerable interface ID
const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export interface BlockchainNft {
  tokenId: string
  tokenAddress: string
  tokenUri?: string
  metadata?: any
  name?: string
  symbol?: string
  image?: string
  owner: string
}

export interface NftMetadata {
  name?: string
  description?: string
  image?: string
  image_url?: string
  imageUrl?: string
  imageURI?: string
  image_uri?: string
  attributes?: Array<{
    trait_type: string
    value: any
  }>
  [key: string]: any
}

/**
 * Create a provider using the custom RPC endpoint
 */
function createProvider(): ethers.providers.JsonRpcProvider {
  const rpcUrl = process.env.NEXT_PUBLIC_CRONOS_RPC_URL || 'http://88.99.93.159:8545'
  return new ethers.providers.JsonRpcProvider(rpcUrl)
}

/**
 * Fetch metadata from a token URI
 */
async function fetchMetadata(tokenUri: string): Promise<NftMetadata | null> {
  try {
    // Convert IPFS URLs to use our gateway
    const convertedUri = convertIpfsUrl(tokenUri)
    
    console.log(`Fetching metadata from: ${convertedUri}`)
    
    const response = await fetch(convertedUri, {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      console.warn(`Failed to fetch metadata from ${convertedUri}: ${response.status}`)
      return null
    }
    
    const metadata = await response.json()
    console.log(`Successfully fetched metadata:`, metadata)
    
    return metadata
  } catch (error) {
    console.error(`Error fetching metadata from ${tokenUri}:`, error)
    return null
  }
}

/**
 * Check if a contract supports ERC721Enumerable
 */
async function supportsEnumerable(contract: ethers.Contract): Promise<boolean> {
  try {
    return await contract.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID)
  } catch (error) {
    console.warn('Could not check ERC721Enumerable support:', error)
    return false
  }
}

/**
 * Get all NFTs owned by an address from a specific collection using blockchain RPC
 */
export async function getNftsByOwnerFromBlockchain(
  ownerAddress: string,
  collectionAddress: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ nfts: BlockchainNft[], hasMore: boolean, total: number }> {
  if (!ownerAddress || !collectionAddress) {
    console.error('Owner address and collection address are required')
    return { nfts: [], hasMore: false, total: 0 }
  }

  try {
    const provider = createProvider()
    const contract = new ethers.Contract(collectionAddress, ERC721_ABI, provider)
    
    console.log(`Fetching NFTs for ${ownerAddress} from collection ${collectionAddress} (limit: ${limit}, offset: ${offset})`)
    
    // Get basic contract info
    const [name, symbol, balance] = await Promise.all([
      contract.name().catch(() => 'Unknown'),
      contract.symbol().catch(() => 'UNK'),
      contract.balanceOf(ownerAddress).catch(() => ethers.BigNumber.from(0))
    ])
    
    const totalBalance = balance.toNumber()
    console.log(`Collection: ${name} (${symbol}), Total Balance: ${totalBalance}`)
    
    if (totalBalance === 0) {
      console.log('No NFTs found for this address in this collection')
      return { nfts: [], hasMore: false, total: 0 }
    }
    
    const nfts: BlockchainNft[] = []
    
    // Check if contract supports ERC721Enumerable
    const isEnumerable = await supportsEnumerable(contract)
    
    if (isEnumerable) {
      console.log('Contract supports ERC721Enumerable, using tokenOfOwnerByIndex with pagination')
      
      // Calculate pagination bounds
      const startIndex = offset
      const endIndex = Math.min(offset + limit, totalBalance)
      
      // Use ERC721Enumerable to get token IDs with pagination
      for (let i = startIndex; i < endIndex; i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i)
          const tokenUri = await contract.tokenURI(tokenId).catch(() => null)
          
          console.log(`Found NFT ${tokenId.toString()} with URI: ${tokenUri}`)
          
          // Fetch metadata if tokenURI exists
          let metadata: NftMetadata | null = null
          let image: string | undefined
          
          if (tokenUri) {
            metadata = await fetchMetadata(tokenUri)
            if (metadata) {
              // Extract image from metadata
              image = metadata.image ||
                     metadata.image_url ||
                     metadata.imageUrl ||
                     metadata.imageURI ||
                     metadata.image_uri
              
              if (image) {
                image = convertIpfsUrl(image)
              }
            }
          }
          
          nfts.push({
            tokenId: tokenId.toString(),
            tokenAddress: collectionAddress,
            tokenUri,
            metadata,
            name: metadata?.name || `${name} #${tokenId.toString()}`,
            symbol,
            image,
            owner: ownerAddress
          })
        } catch (error) {
          console.error(`Error fetching NFT at index ${i}:`, error)
          continue
        }
      }
      
      const hasMore = endIndex < totalBalance
      console.log(`Successfully fetched ${nfts.length} NFTs from blockchain (${startIndex}-${endIndex-1} of ${totalBalance})`)
      return { nfts, hasMore, total: totalBalance }
      
    } else {
      console.log('Contract does not support ERC721Enumerable, using alternative method with pagination')
      
      // Alternative method: try to get total supply and check ownership
      try {
        const totalSupply = await contract.totalSupply()
        console.log(`Total supply: ${totalSupply.toString()}`)
        
        // This is less efficient but works for non-enumerable contracts
        // We'll check a reasonable range of token IDs
        const maxCheck = Math.min(totalSupply.toNumber(), 10000) // Limit to prevent infinite loops
        
        let foundCount = 0
        let skippedCount = 0
        
        for (let tokenId = 1; tokenId <= maxCheck && nfts.length < limit; tokenId++) {
          try {
            const owner = await contract.ownerOf(tokenId)
            
            if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
              // Skip if we haven't reached the offset yet
              if (skippedCount < offset) {
                skippedCount++
                foundCount++
                continue
              }
              
              const tokenUri = await contract.tokenURI(tokenId).catch(() => null)
              
              console.log(`Found owned NFT ${tokenId} with URI: ${tokenUri}`)
              
              // Fetch metadata if tokenURI exists
              let metadata: NftMetadata | null = null
              let image: string | undefined
              
              if (tokenUri) {
                metadata = await fetchMetadata(tokenUri)
                if (metadata) {
                  // Extract image from metadata
                  image = metadata.image ||
                         metadata.image_url ||
                         metadata.imageUrl ||
                         metadata.imageURI ||
                         metadata.image_uri
                  
                  if (image) {
                    image = convertIpfsUrl(image)
                  }
                }
              }
              
              nfts.push({
                tokenId: tokenId.toString(),
                tokenAddress: collectionAddress,
                tokenUri,
                metadata,
                name: metadata?.name || `${name} #${tokenId}`,
                symbol,
                image,
                owner: ownerAddress
              })
              
              foundCount++
            }
          } catch (error) {
            // Token might not exist or be burned, continue
            continue
          }
        }
        
        // For non-enumerable contracts, we can't easily determine if there are more
        // We'll assume there might be more if we found exactly the limit
        const hasMore = nfts.length === limit
        
        console.log(`Successfully fetched ${nfts.length} NFTs from blockchain (non-enumerable)`)
        return { nfts, hasMore, total: foundCount }
        
      } catch (error) {
        console.error('Error using alternative NFT fetching method:', error)
        return { nfts: [], hasMore: false, total: 0 }
      }
    }
    
  } catch (error) {
    console.error('Error fetching NFTs from blockchain:', error)
    return { nfts: [], hasMore: false, total: 0 }
  }
}

/**
 * Get NFT metadata directly from blockchain
 */
export async function getNftMetadataFromBlockchain(
  tokenAddress: string,
  tokenId: string
): Promise<BlockchainNft | null> {
  try {
    const provider = createProvider()
    const contract = new ethers.Contract(tokenAddress, ERC721_ABI, provider)
    
    console.log(`Fetching metadata for NFT ${tokenId} from ${tokenAddress}`)
    
    const [name, symbol, tokenUri, owner] = await Promise.all([
      contract.name().catch(() => 'Unknown'),
      contract.symbol().catch(() => 'UNK'),
      contract.tokenURI(tokenId).catch(() => null),
      contract.ownerOf(tokenId).catch(() => null)
    ])
    
    if (!owner) {
      console.log(`NFT ${tokenId} does not exist or is burned`)
      return null
    }
    
    // Fetch metadata if tokenURI exists
    let metadata: NftMetadata | null = null
    let image: string | undefined
    
    if (tokenUri) {
      metadata = await fetchMetadata(tokenUri)
      if (metadata) {
        // Extract image from metadata
        image = metadata.image || 
               metadata.image_url || 
               metadata.imageUrl ||
               metadata.imageURI ||
               metadata.image_uri
        
        if (image) {
          image = convertIpfsUrl(image)
        }
      }
    }
    
    return {
      tokenId,
      tokenAddress,
      tokenUri,
      metadata,
      name: metadata?.name || `${name} #${tokenId}`,
      symbol,
      image,
      owner
    }
    
  } catch (error) {
    console.error(`Error fetching NFT metadata from blockchain:`, error)
    return null
  }
}

/**
 * Convert blockchain NFTs to app format
 */
export function convertBlockchainNftsToAppFormat(
  nfts: BlockchainNft[],
  collectionName: string,
  rewardRate: string,
  tokenSymbol: string
): Array<{
  id: string
  name: string
  collection: string
  rarity: string
  rewardRate: string
  rewardRateValue: number
  image: string
  staked: boolean
  rewards: string
  tokenId: string
  tokenAddress: string
  metadata?: any
}> {
  if (!nfts || nfts.length === 0) {
    console.log('No blockchain NFTs to convert to app format')
    return []
  }
  
  console.log(`Converting ${nfts.length} blockchain NFTs to app format`)
  
  return nfts.map(nft => {
    // Get image URL with fallback
    let imageUrl = nft.image || '/placeholder-nft.png'
    
    // Get rarity from metadata or use default
    let rarity = ''
    
    if (nft.metadata?.attributes && Array.isArray(nft.metadata.attributes)) {
      const rarityAttr = nft.metadata.attributes.find((attr: any) =>
        attr.trait_type?.toLowerCase() === 'rarity' ||
        attr.trait_type?.toLowerCase() === 'tier' ||
        attr.trait_type?.toLowerCase() === 'rank'
      )
      
      if (rarityAttr) {
        rarity = rarityAttr.value || ''
      }
    }

    // Parse reward rate value safely
    let rewardRateValue = 0
    try {
      rewardRateValue = parseFloat(rewardRate.replace('%', ''))
      if (isNaN(rewardRateValue)) rewardRateValue = 0
    } catch (e) {
      console.error('Error parsing reward rate value:', e)
    }

    return {
      id: `nft-${nft.tokenId}`,
      name: nft.name || `${collectionName} #${nft.tokenId}`,
      collection: collectionName,
      rarity,
      rewardRate,
      rewardRateValue,
      image: imageUrl,
      staked: false, // This will be set separately for staked NFTs
      rewards: '', // No rewards shown for unstaked NFTs
      tokenId: nft.tokenId,
      tokenAddress: nft.tokenAddress,
      metadata: nft.metadata
    }
  })
}