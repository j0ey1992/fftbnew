'use client'

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/react'; // Only need useAppKitAccount here
import { getAppKit } from '@/lib/reown/init'; // Import the helper function
import { Button } from './button'; // Assuming Button component exists
import { addImportedToken } from '@/lib/tokens';
import { ImportedToken } from '@/types/tokens';
import { BuiltInChainId } from '@vvs-finance/swap-sdk'; // Assuming this is the correct chain ID enum

interface ImportTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenImported: (token: ImportedToken) => void; // Callback after successful import
}

// Minimal ERC20 ABI for fetching symbol and decimals
const minERC20ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export function ImportTokenModal({ isOpen, onClose, onTokenImported }: ImportTokenModalProps) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenDetails, setTokenDetails] = useState<{ symbol: string; decimals: number } | null>(null);

  // Use useAppKitAccount for user address and connection status
  const { address: userAddress, isConnected } = useAppKitAccount(); 

  // Validate address format
  useEffect(() => {
    setIsValidAddress(ethers.utils.isAddress(tokenAddress));
    setTokenDetails(null); // Reset details when address changes
    setError(null);
  }, [tokenAddress]);

  // Fetch token details when a valid address is entered
  const fetchTokenDetails = useCallback(async () => {
    if (!isValidAddress || !isConnected) return; // Check isConnected as well

    setIsLoading(true);
    setError(null);
    setTokenDetails(null);

    try {
      const appKit = getAppKit(); // Get the AppKit instance
      if (!appKit) {
        throw new Error('AppKit not initialized.');
      }
      const walletProvider = await appKit.getProvider('eip155'); // Call getProvider on the instance
      if (!walletProvider) {
        throw new Error('Wallet provider not available.');
      }
      const provider = new ethers.providers.Web3Provider(walletProvider as any);
      const contract = new ethers.Contract(tokenAddress, minERC20ABI, provider);

      // Fetch symbol and decimals concurrently
      const [symbol, decimals] = await Promise.all([
        contract.symbol(),
        contract.decimals()
      ]);

      if (typeof symbol !== 'string' || typeof decimals !== 'number') {
        throw new Error('Invalid token data received from contract.');
      }

      setTokenDetails({ symbol, decimals });
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError('Failed to fetch token details. Ensure the address is correct and on the Cronos network.');
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, isValidAddress, isConnected]); // Add isConnected dependency

  // Trigger fetch when address becomes valid
  useEffect(() => {
    if (isValidAddress) {
      fetchTokenDetails();
    }
  }, [isValidAddress, fetchTokenDetails]);

  // Handle the import action
  const handleImport = async () => {
    if (!tokenDetails || !userAddress || !isValidAddress || !isConnected) {
      setError('Cannot import token. Ensure wallet is connected and token details are loaded.');
      return;
    }

    setIsLoading(true);
    setError(null);

    let currentChainId: number | undefined;
    try {
      // Get provider again to check current chain ID
      const appKit = getAppKit();
      if (!appKit) throw new Error('AppKit not initialized.');
      const walletProvider = await appKit.getProvider('eip155');
      if (!walletProvider) throw new Error('Wallet provider not available.');
      const provider = new ethers.providers.Web3Provider(walletProvider as any);
      const network = await provider.getNetwork();
      currentChainId = network.chainId;

      // Basic check if connected to Cronos Mainnet (adjust if testnet is needed)
      if (currentChainId !== BuiltInChainId.CRONOS_MAINNET) {
         setError(`Please connect to the Cronos Mainnet (ID: ${BuiltInChainId.CRONOS_MAINNET}) to import tokens. You are currently on chain ID ${currentChainId}.`);
         setIsLoading(false);
         return;
      }
    } catch (err) {
       console.error("Error getting chain ID:", err);
       setError("Could not verify network connection. Please try again.");
       setIsLoading(false);
       return;
    }

    const newToken: ImportedToken = {
      address: tokenAddress,
      symbol: tokenDetails.symbol,
      decimals: tokenDetails.decimals,
      chainId: currentChainId, // Use the fetched chain ID
      // logo: could potentially fetch from a service later
    };

    try {
      // Call addImportedToken without userAddress
      await addImportedToken(newToken); 
      onTokenImported(newToken); // Notify parent component
      onClose(); // Close modal on success
      // Reset state for next time
      setTokenAddress('');
      setTokenDetails(null);
    } catch (err) {
      console.error('Error saving imported token:', err);
      setError(err instanceof Error ? err.message : 'Failed to save token.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c1522] rounded-2xl shadow-xl border border-[#1a2c4c] w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-4">Import Token</h3>

        <div className="mb-4">
          <label htmlFor="tokenAddress" className="block text-gray-300 text-sm font-medium mb-2">
            Token Contract Address (Cronos)
          </label>
          <input
            id="tokenAddress"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className={`w-full bg-[#162234] border ${isValidAddress ? 'border-green-600' : 'border-[#1a2c4c]'} rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {!isValidAddress && tokenAddress.length > 0 && (
            <p className="text-red-400 text-xs mt-1">Invalid address format.</p>
          )}
        </div>

        {isLoading && !tokenDetails && (
          <div className="flex items-center justify-center my-4">
            <div className="w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-gray-300">Fetching token details...</span>
          </div>
        )}

        {tokenDetails && (
          <div className="bg-[#162234] rounded-lg p-4 mb-4 border border-[#1a2c4c]">
            <p className="text-white font-semibold text-lg">{tokenDetails.symbol}</p>
            <p className="text-gray-400 text-sm">Decimals: {tokenDetails.decimals}</p>
            <p className="text-gray-500 text-xs mt-2 break-all">Address: {tokenAddress}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!isValidAddress || !tokenDetails || isLoading}
          onClick={handleImport}
        >
          {isLoading ? 'Importing...' : 'Import Token'}
        </Button>
      </div>
    </div>
  );
}
