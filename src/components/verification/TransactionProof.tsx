'use client';

import { useState, FormEvent } from 'react';
import { ethers } from 'ethers';
import { Requirement } from '@/types';

interface TransactionProofProps {
  onSubmit: (result: { result: string }) => void;
  onError?: (error: string) => void;
  requirement?: Requirement;
  className?: string;
  chainId?: number;
}

export default function TransactionProof({ 
  onSubmit, 
  onError, 
  requirement, 
  className = '',
  chainId = 25 // Default to Cronos chain ID
}: TransactionProofProps) {
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get explorer URL based on chain ID
  const getExplorerUrl = () => {
    switch (chainId) {
      case 25: // Cronos Mainnet
        return 'https://cronoscan.com/tx/';
      case 338: // Cronos Testnet
        return 'https://testnet.cronoscan.com/tx/';
      default:
        return 'https://cronoscan.com/tx/';
    }
  };

  // Get requirement-specific helper text
  const getHelperText = () => {
    if (!requirement) return 'Enter the transaction hash as proof';
    
    switch (requirement.type) {
      case 'contract_interaction':
        return `Enter the transaction hash for your interaction with ${requirement.contractAddress}`;
      case 'token_swap':
        return `Enter the transaction hash for your token swap of at least ${requirement.minAmount} ${requirement.tokenAddress}`;
      case 'nft_purchase':
        return `Enter the transaction hash for your NFT purchase from ${requirement.nftAddress}`;
      default:
        return 'Enter the transaction hash as proof';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate transaction hash
    if (!txHash.trim()) {
      const errorMsg = 'Please enter a transaction hash';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    // Check if transaction hash is valid format
    if (!ethers.utils.isHexString(txHash, 32) && !txHash.startsWith('0x')) {
      const errorMsg = 'Please enter a valid transaction hash';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit the transaction hash
      onSubmit({ result: txHash });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit transaction hash';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tx-hash-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transaction Hash
          </label>
          
          <div className="relative">
            <input
              id="tx-hash-input"
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={isSubmitting}
            />
            
            {txHash && (
              <button
                type="button"
                onClick={() => setTxHash('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
          
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getHelperText()}
          </p>
        </div>
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !txHash.trim()}
            className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
          </button>
          
          {txHash && (
            <a
              href={`${getExplorerUrl()}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
            >
              View on Explorer
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
