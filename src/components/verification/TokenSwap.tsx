'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Requirement } from '@/types';
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';

interface TokenSwapProps {
  requirement: Requirement;
  onSubmit: (result: { txHash: string; tokenAddress: string; amount: string }) => void;
  onError: (error: string) => void;
  className?: string;
}

export default function TokenSwap({
  requirement,
  onSubmit,
  onError,
  className = ''
}: TokenSwapProps) {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');
  const isConnected = !!address && !!walletProvider;
  
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  
  // Check if requirement has necessary token info
  const hasTokenInfo = !!(
    requirement.tokenAddress &&
    requirement.minAmount
  );
  
  // Load token info
  useEffect(() => {
    if (!isConnected || !walletProvider || !requirement.tokenAddress) return;
    
    const loadTokenInfo = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
        const tokenContract = new ethers.Contract(
          requirement.tokenAddress!,
          [
            'function balanceOf(address owner) view returns (uint256)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint8)'
          ],
          provider
        );
        
        // Get token symbol
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
        
        // Get token decimals
        const decimals = await tokenContract.decimals();
        setTokenDecimals(decimals);
        
        // Get token balance
        if (address) {
          const balance = await tokenContract.balanceOf(address);
          setTokenBalance(ethers.utils.formatUnits(balance, decimals));
        }
      } catch (err) {
        console.error('Error loading token info:', err);
        setError('Failed to load token information');
      }
    };
    
    loadTokenInfo();
  }, [isConnected, walletProvider, address, chainId, requirement.tokenAddress]);
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === '' || /^[0-9]*[.]?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };
  
  // Handle max amount
  const handleMaxAmount = () => {
    setAmount(tokenBalance);
  };
  
  // Check if amount is valid
  const isAmountValid = () => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (requirement.minAmount && parseFloat(amount) < parseFloat(requirement.minAmount)) return false;
    if (parseFloat(amount) > parseFloat(tokenBalance)) return false;
    return true;
  };
  
  // Handle token swap
  const handleSwap = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to swap tokens');
      onError('Please connect your wallet to swap tokens');
      return;
    }
    
    if (!hasTokenInfo) {
      setError('Token information is missing');
      onError('Token information is missing');
      return;
    }
    
    if (!walletProvider) {
      setError('Wallet provider not available');
      onError('Wallet provider not available');
      return;
    }
    
    if (!isAmountValid()) {
      setError(`Please enter a valid amount (min: ${requirement.minAmount || '0'})`);
      onError(`Please enter a valid amount (min: ${requirement.minAmount || '0'})`);
      return;
    }
    
    setIsSwapping(true);
    setError(null);
    
    try {
      // Initialize provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider as any, Number(chainId));
      const signer = provider.getSigner(address);
      
      // Create token contract instance
      const tokenContract = new ethers.Contract(
        requirement.tokenAddress!,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function approve(address spender, uint256 amount) returns (bool)'
        ],
        signer
      );
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseUnits(amount, tokenDecimals);
      
      // For demonstration, we'll just transfer tokens to a predefined address
      // In a real implementation, this would interact with a DEX or swap contract
      const swapAddress = requirement.contractAddress || '0x000000000000000000000000000000000000dEaD'; // Burn address as fallback
      
      // Transfer tokens
      const tx = await tokenContract.transfer(swapAddress, amountWei);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Set transaction hash
      setTxHash(receipt.transactionHash);
      
      // Submit result
      onSubmit({
        txHash: receipt.transactionHash,
        tokenAddress: requirement.tokenAddress!,
        amount: amount
      });
      
      // Update token balance
      const newBalance = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.utils.formatUnits(newBalance, tokenDecimals));
      
      setIsSwapping(false);
    } catch (err) {
      console.error('Token swap error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to swap tokens';
      setError(errorMessage);
      onError(errorMessage);
      setIsSwapping(false);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Token Information */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Token Swap Required
        </h4>
        
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Token Address:</span>
            <span className="text-sm text-gray-900 dark:text-gray-200 font-mono break-all">
              {requirement.tokenAddress || 'Not specified'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Minimum Amount:</span>
            <span className="text-sm text-gray-900 dark:text-gray-200">
              {requirement.minAmount || '0'} {tokenSymbol}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Your Balance:</span>
            <span className="text-sm text-gray-900 dark:text-gray-200">
              {parseFloat(tokenBalance).toFixed(4)} {tokenSymbol}
            </span>
          </div>
        </div>
      </div>
      
      {/* Amount Input */}
      {!txHash && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Amount to Swap
          </label>
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                disabled={isSwapping || !!txHash}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={`Enter amount (min: ${requirement.minAmount || '0'})`}
              />
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {tokenSymbol}
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleMaxAmount}
              disabled={isSwapping || !!txHash}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>
          
          {/* Amount validation message */}
          {amount && !isAmountValid() && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {parseFloat(amount) > parseFloat(tokenBalance)
                ? 'Insufficient balance'
                : requirement.minAmount && parseFloat(amount) < parseFloat(requirement.minAmount)
                  ? `Amount must be at least ${requirement.minAmount} ${tokenSymbol}`
                  : 'Please enter a valid amount'
              }
            </p>
          )}
        </div>
      )}
      
      {/* Transaction Result */}
      {txHash && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Swap Successful
          </h4>
          
          <div className="flex flex-col">
            <span className="text-xs text-green-700 dark:text-green-300">Transaction Hash:</span>
            <span className="text-sm text-green-800 dark:text-green-200 font-mono break-all">
              {txHash}
            </span>
          </div>
          
          <div className="flex flex-col mt-2">
            <span className="text-xs text-green-700 dark:text-green-300">Amount Swapped:</span>
            <span className="text-sm text-green-800 dark:text-green-200">
              {amount} {tokenSymbol}
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
      
      {/* Swap Button */}
      {!txHash && (
        <button
          type="button"
          onClick={handleSwap}
          disabled={isSwapping || !!txHash || !hasTokenInfo || !isAmountValid()}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSwapping 
            ? 'Swapping Tokens...' 
            : txHash 
              ? 'Swap Complete' 
              : 'Swap Tokens'
          }
        </button>
      )}
      
      {/* Connection Warning */}
      {!isConnected && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please connect your wallet to swap tokens.
          </p>
        </div>
      )}
      
      {/* Missing Token Info Warning */}
      {!hasTokenInfo && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Token information is incomplete. Please contact support.
          </p>
        </div>
      )}
    </div>
  );
}
