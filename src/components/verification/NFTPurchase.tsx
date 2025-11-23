'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Requirement } from '@/types';
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';
import { convertIpfsUrl } from '@/lib/utils/ipfs-url';

interface NFTPurchaseProps {
  requirement: Requirement;
  onSubmit: (result: { txHash: string; nftAddress: string; nftId: string }) => void;
  onError: (error: string) => void;
  className?: string;
}

export default function NFTPurchase({
  requirement,
  onSubmit,
  onError,
  className = ''
}: NFTPurchaseProps) {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');
  const isConnected = !!address && !!walletProvider;
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftName, setNftName] = useState<string>('');
  const [nftSymbol, setNftSymbol] = useState<string>('');
  const [nftPrice, setNftPrice] = useState<string>('0');
  const [nftImage, setNftImage] = useState<string | null>(null);
  const [nftOwned, setNftOwned] = useState<boolean>(false);
  
  // Check if requirement has necessary NFT info
  const hasNftInfo = !!(
    requirement.nftAddress &&
    requirement.nftId
  );
  
  // Load NFT info
  useEffect(() => {
    if (!isConnected || !walletProvider || !hasNftInfo) return;
    
    const loadNftInfo = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
        
        // Create NFT contract instance (ERC721)
        const nftContract = new ethers.Contract(
          requirement.nftAddress!,
          [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function tokenURI(uint256 tokenId) view returns (string)',
            'function ownerOf(uint256 tokenId) view returns (address)',
            'function balanceOf(address owner) view returns (uint256)'
          ],
          provider
        );
        
        // Get NFT name and symbol
        const [name, symbol] = await Promise.all([
          nftContract.name(),
          nftContract.symbol()
        ]);
        
        setNftName(name);
        setNftSymbol(symbol);
        
        // Check if user already owns the NFT
        try {
          const owner = await nftContract.ownerOf(requirement.nftId);
          setNftOwned(owner.toLowerCase() === address?.toLowerCase());
        } catch (err) {
          // NFT might not exist yet or other error
          setNftOwned(false);
        }
        
        // Try to get NFT metadata
        try {
          const tokenURI = await nftContract.tokenURI(requirement.nftId);
          // If tokenURI is IPFS URI, convert to HTTP URL
          const httpUri = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
          
          // Fetch metadata
          const response = await fetch(httpUri);
          if (response.ok) {
            const metadata = await response.json();
            
            // Get image URL
            const imageUrl = convertIpfsUrl(metadata.image);
            setNftImage(imageUrl);
            
            // Get price if available
            if (metadata.price) {
              setNftPrice(metadata.price.toString());
            }
          }
        } catch (err) {
          console.error('Error fetching NFT metadata:', err);
          // Not critical, so we don't set an error
        }
        
        // If no price was set from metadata, use the requirement's minAmount if available
        if (nftPrice === '0' && requirement.minAmount) {
          setNftPrice(requirement.minAmount);
        }
        
      } catch (err) {
        console.error('Error loading NFT info:', err);
        setError('Failed to load NFT information');
      }
    };
    
    loadNftInfo();
  }, [isConnected, walletProvider, address, chainId, hasNftInfo, requirement.nftAddress, requirement.nftId, requirement.minAmount, nftPrice]);
  
  // Handle NFT purchase
  const handlePurchase = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to purchase the NFT');
      onError('Please connect your wallet to purchase the NFT');
      return;
    }
    
    if (!hasNftInfo) {
      setError('NFT information is missing');
      onError('NFT information is missing');
      return;
    }
    
    if (!walletProvider) {
      setError('Wallet provider not available');
      onError('Wallet provider not available');
      return;
    }
    
    if (nftOwned) {
      // If user already owns the NFT, we can just submit the verification
      onSubmit({
        txHash: 'already-owned',
        nftAddress: requirement.nftAddress!,
        nftId: requirement.nftId!
      });
      return;
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      // Initialize provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
      const signer = provider.getSigner(address);
      
      // For this example, we'll simulate a purchase by minting the NFT
      // In a real implementation, this would interact with a marketplace contract
      
      // Create NFT contract instance (ERC721 with mint function)
      const nftContract = new ethers.Contract(
        requirement.nftAddress!,
        [
          'function mint(address to, uint256 tokenId) returns (bool)',
          'function safeMint(address to, uint256 tokenId) returns (bool)',
          'function purchase(uint256 tokenId) payable returns (bool)'
        ],
        signer
      );
      
      // Try different mint/purchase functions based on what's available
      let tx;
      try {
        // Try purchase function first (most common for NFT marketplaces)
        const price = ethers.utils.parseEther(nftPrice || '0');
        tx = await nftContract.purchase(requirement.nftId, { value: price });
      } catch (err) {
        try {
          // Try safeMint if purchase fails
          tx = await nftContract.safeMint(address, requirement.nftId);
        } catch (err) {
          // Try regular mint as last resort
          tx = await nftContract.mint(address, requirement.nftId);
        }
      }
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Set transaction hash
      setTxHash(receipt.transactionHash);
      
      // Submit result
      onSubmit({
        txHash: receipt.transactionHash,
        nftAddress: requirement.nftAddress!,
        nftId: requirement.nftId!
      });
      
      // Update NFT ownership status
      setNftOwned(true);
      
      setIsPurchasing(false);
    } catch (err) {
      console.error('NFT purchase error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase NFT';
      setError(errorMessage);
      onError(errorMessage);
      setIsPurchasing(false);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* NFT Information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          NFT Purchase Required
        </h4>
        
        <div className="space-y-4">
          {/* NFT Image */}
          {nftImage && (
            <div className="flex justify-center">
              <img 
                src={nftImage} 
                alt={`${nftName} #${requirement.nftId}`}
                className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">NFT Collection:</span>
              <span className="text-sm text-gray-900 dark:text-gray-200">
                {nftName || 'Unknown'} ({nftSymbol || '?'})
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">NFT Address:</span>
              <span className="text-sm text-gray-900 dark:text-gray-200 font-mono break-all">
                {requirement.nftAddress || 'Not specified'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">NFT ID:</span>
              <span className="text-sm text-gray-900 dark:text-gray-200">
                #{requirement.nftId || '0'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Price:</span>
              <span className="text-sm text-gray-900 dark:text-gray-200">
                {nftPrice} ETH
              </span>
            </div>
            
            {nftOwned && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  You already own this NFT
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Transaction Result */}
      {txHash && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Purchase Successful
          </h4>
          
          <div className="flex flex-col">
            <span className="text-xs text-green-700 dark:text-green-300">Transaction Hash:</span>
            <span className="text-sm text-green-800 dark:text-green-200 font-mono break-all">
              {txHash}
            </span>
          </div>
          
          <div className="flex flex-col mt-2">
            <span className="text-xs text-green-700 dark:text-green-300">NFT ID:</span>
            <span className="text-sm text-green-800 dark:text-green-200">
              #{requirement.nftId}
            </span>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}
      
      {/* Purchase Button */}
      <button
        type="button"
        onClick={handlePurchase}
        disabled={isPurchasing || !!txHash || !hasNftInfo}
        className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPurchasing 
          ? 'Purchasing NFT...' 
          : txHash 
            ? 'Purchase Complete' 
            : nftOwned
              ? 'Verify Ownership'
              : 'Purchase NFT'
        }
      </button>
      
      {/* Connection Warning */}
      {!isConnected && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please connect your wallet to purchase the NFT.
          </p>
        </div>
      )}
      
      {/* Missing NFT Info Warning */}
      {!hasNftInfo && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            NFT information is incomplete. Please contact support.
          </p>
        </div>
      )}
    </div>
  );
}
