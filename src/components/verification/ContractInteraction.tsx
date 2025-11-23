'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Requirement } from '@/types';
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';

interface ContractInteractionProps {
  requirement: Requirement;
  onSubmit: (result: { txHash: string; contractAddress: string; functionName: string }) => void;
  onError: (error: string) => void;
  className?: string;
}

export default function ContractInteraction({
  requirement,
  onSubmit,
  onError,
  className = ''
}: ContractInteractionProps) {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');
  const isConnected = !!address && !!walletProvider;
  const [isInteracting, setIsInteracting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check if requirement has necessary contract info
  const hasContractInfo = !!(
    requirement.contractAddress &&
    requirement.functionName
  );
  
  // Handle contract interaction
  const handleInteraction = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to interact with the contract');
      onError('Please connect your wallet to interact with the contract');
      return;
    }
    
    if (!hasContractInfo) {
      setError('Contract information is missing');
      onError('Contract information is missing');
      return;
    }
    
    if (!walletProvider) {
      setError('Wallet provider not available');
      onError('Wallet provider not available');
      return;
    }
    
    setIsInteracting(true);
    setError(null);
    
    try {
      // Initialize provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
      const signer = provider.getSigner(address);
      
      // Create contract instance
      const contractAbi = ['function ' + requirement.functionName + '(' + (requirement.parameters?.map(() => 'address').join(',') || '') + ')'];
      const contract = new ethers.Contract(requirement.contractAddress!, contractAbi, signer);
      
      // Call contract function
      const parameters = requirement.parameters || [];
      const tx = await contract[requirement.functionName!](...parameters);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Set transaction hash
      setTxHash(receipt.transactionHash);
      
      // Submit result
      onSubmit({
        txHash: receipt.transactionHash,
        contractAddress: requirement.contractAddress!,
        functionName: requirement.functionName!
      });
      
      setIsInteracting(false);
    } catch (err) {
      console.error('Contract interaction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to interact with contract';
      setError(errorMessage);
      onError(errorMessage);
      setIsInteracting(false);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contract Information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Contract Interaction Required
        </h4>
        
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Contract Address:</span>
            <span className="text-sm text-gray-900 dark:text-gray-200 font-mono break-all">
              {requirement.contractAddress || 'Not specified'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Function:</span>
            <span className="text-sm text-gray-900 dark:text-gray-200 font-mono">
              {requirement.functionName || 'Not specified'}
            </span>
          </div>
          
          {requirement.parameters && requirement.parameters.length > 0 && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Parameters:</span>
              <div className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                {requirement.parameters.map((param, index) => (
                  <div key={index} className="ml-2">
                    {index}: {param.toString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Result */}
      {txHash && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Transaction Successful
          </h4>
          
          <div className="flex flex-col">
            <span className="text-xs text-green-700 dark:text-green-300">Transaction Hash:</span>
            <span className="text-sm text-green-800 dark:text-green-200 font-mono break-all">
              {txHash}
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
      
      {/* Interaction Button */}
      <button
        type="button"
        onClick={handleInteraction}
        disabled={isInteracting || !!txHash || !hasContractInfo}
        className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isInteracting 
          ? 'Interacting with Contract...' 
          : txHash 
            ? 'Contract Interaction Complete' 
            : 'Interact with Contract'
        }
      </button>
      
      {/* Connection Warning */}
      {!isConnected && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please connect your wallet to interact with the contract.
          </p>
        </div>
      )}
      
      {/* Missing Contract Info Warning */}
      {!hasContractInfo && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Contract information is incomplete. Please contact support.
          </p>
        </div>
      )}
    </div>
  );
}
