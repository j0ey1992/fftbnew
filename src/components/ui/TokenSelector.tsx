'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAppKitAccount } from '@reown/appkit/react';
import { getEnabledVVSPairs, getImportedTokens } from '@/lib/tokens';
import { VVSPair, ImportedToken } from '@/types/tokens';
import { ImportTokenModal } from './ImportTokenModal';
import { TopGainersDisplay } from '@/components/market/TopGainersDisplay';
import { VirtualizedTokenList } from '@/components/swap/VirtualizedTokenList';
import { getVVSTokensFromAPI, vvsTokenToVVSPair } from '@/lib/api/vvs-tokens-api';
import { useEnhancedTokenList, EnhancedToken } from '@/hooks/useEnhancedTokenList';
import { WalletIcon } from 'lucide-react';

type SelectableToken = (VVSPair | ImportedToken) & { isImported?: boolean };

interface TokenSelectorProps {
  onTokenSelect: (token: SelectableToken) => void;
  // Optional: Filter out a specific token address (e.g., the other token in the pair)
  excludeTokenAddress?: string | null; 
}

export function TokenSelector({ onTokenSelect, excludeTokenAddress }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'For You' | 'Top Gainers'>('For You');
  
  // Use enhanced token list hook for balance-aware token listing
  const { tokens: enhancedTokens, isLoading: enhancedLoading, isConnected } = useEnhancedTokenList();
  
  // State for tokens (keeping for compatibility with existing code)
  const [predefinedTokens, setPredefinedTokens] = useState<VVSPair[]>([]);
  const [importedTokens, setImportedTokens] = useState<ImportedToken[]>([]);
  const [vvsTokens, setVvsTokens] = useState<VVSPair[]>([]);
  const [isLoadingPredefined, setIsLoadingPredefined] = useState(true);
  const [isLoadingImported, setIsLoadingImported] = useState(true);
  const [isLoadingVVS, setIsLoadingVVS] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importTriggerAddress, setImportTriggerAddress] = useState<string | null>(null); // Pre-fill address if triggered by gainer

  const { address: userAddress } = useAppKitAccount();

  // Fetch predefined tokens
  useEffect(() => {
    const fetchPredefined = async () => {
      setIsLoadingPredefined(true);
      setError(null);
      try {
        const tokens = await getEnabledVVSPairs();
        setPredefinedTokens(tokens);
      } catch (err) {
        console.error('Error fetching predefined tokens:', err);
        setError('Failed to load standard tokens.');
      } finally {
        setIsLoadingPredefined(false);
      }
    };
    fetchPredefined();
  }, []);
  
  // Fetch VVS tokens from API (only first page for initial load)
  useEffect(() => {
    const fetchVVSTokens = async () => {
      setIsLoadingVVS(true);
      try {
        const result = await getVVSTokensFromAPI(1, 50); // Only load first 50 tokens initially
        // Convert to VVSPair format
        const vvsPairs = result.tokens.map(token => vvsTokenToVVSPair(token));
        setVvsTokens(vvsPairs);
      } catch (err) {
        console.error('Error fetching VVS tokens:', err);
        // Don't show error for VVS tokens, just log it
      } finally {
        setIsLoadingVVS(false);
      }
    };
    fetchVVSTokens();
  }, []);

  // Fetch imported tokens when user connects
  useEffect(() => {
    const fetchImported = async () => {
      if (!userAddress || !isConnected) {
        setImportedTokens([]); // Clear if user disconnects
        setIsLoadingImported(false);
        return;
      }
      setIsLoadingImported(true);
      setError(null);
      try {
        // Fetch global imported tokens (no user ID needed)
        const tokens = await getImportedTokens(); 
        setImportedTokens(tokens);
      } catch (err) {
        console.error('Error fetching imported tokens:', err);
        // Don't block UI for this, just log it
      } finally {
        setIsLoadingImported(false);
      }
    };
    fetchImported();
  }, [userAddress, isConnected]);

  // Combine and filter tokens
  const combinedTokens = useMemo(() => {
    // Use enhanced tokens if available, otherwise fall back to manual combination
    if (enhancedTokens.length > 0) {
      // Convert enhanced tokens to SelectableToken format
      const selectableTokens = enhancedTokens.map(token => ({
        ...token,
        isImported: importedTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())
      } as SelectableToken));
      
      // Filter out the excluded token if specified
      return excludeTokenAddress 
        ? selectableTokens.filter(t => t.address.toLowerCase() !== excludeTokenAddress.toLowerCase())
        : selectableTokens;
    }
    
    // Fallback to original logic if enhanced tokens not available
    const tokenMap = new Map<string, SelectableToken>();
    
    vvsTokens.forEach(token => {
      const key = token.address.toLowerCase();
      tokenMap.set(key, { ...token, isVVS: true } as SelectableToken);
    });
    
    predefinedTokens.forEach(token => {
      const key = token.address.toLowerCase();
      tokenMap.set(key, token);
    });
    
    importedTokens.forEach(token => {
      const key = token.address.toLowerCase();
      tokenMap.set(key, { ...token, isImported: true });
    });
    
    const uniqueTokens = Array.from(tokenMap.values());

    return excludeTokenAddress 
      ? uniqueTokens.filter(t => t.address.toLowerCase() !== excludeTokenAddress.toLowerCase())
      : uniqueTokens;

  }, [predefinedTokens, importedTokens, vvsTokens, excludeTokenAddress, enhancedTokens]);

  // Filter based on search query
  const filteredTokens = useMemo(() => {
    if (activeTab !== 'For You') return []; // Only filter 'For You' tab
    return combinedTokens.filter(token => 
      token.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [combinedTokens, searchQuery, activeTab]);

  const handleTokenImported = (newToken: ImportedToken) => {
    // Add to state immediately for responsiveness
    setImportedTokens(prev => {
       // Avoid duplicates if already fetched
       if (!prev.some(t => t.address.toLowerCase() === newToken.address.toLowerCase())) {
         return [...prev, newToken];
       }
       return prev;
    });
    // Optionally select the newly imported token immediately
    // onTokenSelect({ ...newToken, isImported: true }); 
  };

  const handleOpenImportModal = (address?: string) => {
    if (!isConnected) {
      // Maybe prompt user to connect first?
      alert("Please connect your wallet to import tokens.");
      return;
    }
    setImportTriggerAddress(address || null); // Pre-fill if address provided
    setIsModalOpen(true);
  };
  
  const handleCloseImportModal = () => {
    setIsModalOpen(false);
    setImportTriggerAddress(null); // Clear pre-fill on close
  };

  const isLoading = enhancedLoading || isLoadingPredefined || (isConnected && isLoadingImported) || isLoadingVVS;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search name, symbol, or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#162234] w-full pl-10 pr-4 py-2 border border-[#1a2c4c] rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#1a2c4c] px-4">
        {(['For You', 'Top Gainers'] as const).map((tab) => (
          <button
            key={tab}
            className={`py-2 px-3 text-sm font-medium ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <div className="flex-grow"></div> {/* Spacer */}
        {/* Import Button */}
        <button
          onClick={() => handleOpenImportModal()}
          className="py-2 px-3 text-sm font-medium text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          disabled={!isConnected}
          title={isConnected ? "Import custom token" : "Connect wallet to import"}
        >
          Import Token
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
           <div className="p-4 text-center text-red-400">{error}</div>
        ) : activeTab === 'For You' ? (
          // Token List with VVS data
          <VirtualizedTokenList
            tokens={filteredTokens}
            onTokenSelect={onTokenSelect}
          />
        ) : (
          // Top Gainers List
          <TopGainersDisplay 
            knownTokens={combinedTokens}
            onSelectKnownToken={onTokenSelect}
            onTriggerImport={handleOpenImportModal}
          />
        )}
      </div>

      {/* Import Modal */}
      <ImportTokenModal 
        isOpen={isModalOpen}
        onClose={handleCloseImportModal}
        onTokenImported={handleTokenImported}
        // key={importTriggerAddress} // Force re-render if triggered address changes? Maybe not needed.
        // initialAddress={importTriggerAddress} // Pass initial address to modal if needed
      />
    </div>
  );
}
