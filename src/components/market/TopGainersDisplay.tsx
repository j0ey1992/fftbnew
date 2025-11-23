'use client'

import React from 'react';
import { useTopGainers, DexScreenerPair } from '@/hooks/useTopGainers';
import { ImportedToken } from '@/lib/firebase/tokens';
import { VVSPair } from '@/lib/firebase'; // Assuming VVSPair is exported from firebase index

interface TopGainersDisplayProps {
  // Combined list of tokens known by the app (from Firebase + user imports)
  knownTokens: (VVSPair | ImportedToken)[]; 
  // Callback when a known token from the gainers list is clicked
  onSelectKnownToken: (token: VVSPair | ImportedToken) => void; 
  // Callback to trigger the import modal for an unknown token
  onTriggerImport: (tokenAddress: string) => void; 
}

export function TopGainersDisplay({ 
  knownTokens, 
  onSelectKnownToken, 
  onTriggerImport 
}: TopGainersDisplayProps) {
  const { topGainers, isLoading, error } = useTopGainers();

  const handleGainerClick = (pair: DexScreenerPair) => {
    const clickedAddress = pair.baseToken.address.toLowerCase();
    
    // Find if the clicked token is already known (check address)
    const knownToken = knownTokens.find(
      (token) => token.address.toLowerCase() === clickedAddress
    );

    if (knownToken) {
      console.log('Top Gainer Clicked (Known):', knownToken.symbol);
      onSelectKnownToken(knownToken);
    } else {
      console.log('Top Gainer Clicked (Unknown):', pair.baseToken.symbol, clickedAddress);
      onTriggerImport(pair.baseToken.address); // Pass the original casing just in case
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        Error loading top gainers: {error}
      </div>
    );
  }

  if (!topGainers || topGainers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No top gainers data available right now.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {topGainers.map((pair: DexScreenerPair) => { // Explicitly type 'pair'
        const priceChange = pair.priceChange.h24;
        const isPositive = priceChange >= 0;

        return (
          <button
            key={pair.pairAddress}
            className="w-full px-4 py-3 border-b border-[#1a2c4c]/50 flex items-center justify-between hover:bg-[#162234] transition-colors"
            onClick={() => handleGainerClick(pair)}
            title={`Pair: ${pair.baseToken.symbol}/${pair.quoteToken.symbol}`}
          >
            {/* Token Info */}
            <div className="flex items-center">
              {/* Placeholder for potential logo */}
              <div className="w-8 h-8 rounded-full bg-gray-700 mr-3 flex items-center justify-center text-xs font-bold text-white">
                {pair.baseToken.symbol.substring(0, 3).toUpperCase()} 
              </div>
              <div className="text-left">
                <h4 className="text-white font-medium">{pair.baseToken.symbol}</h4>
                <p className="text-gray-400 text-xs truncate max-w-[150px]">{pair.baseToken.name}</p>
              </div>
            </div>
            
            {/* Price Change */}
            <div className="flex flex-col items-end">
              <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
              <span className="text-gray-500 text-xs">24h Change</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
