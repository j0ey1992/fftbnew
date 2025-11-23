'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface Token {
  address: string;
  symbol: string;
  name: string;
  logo: string;
  balance?: string;
}

interface TokenSelectorProps {
  chainId: number;
  tokens: Token[];
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  loading: boolean;
}

export function TokenSelector({ chainId, tokens, selectedToken, onTokenSelect, loading }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group popular tokens at the top
  const popularTokenSymbols = ['USDT', 'USDC', 'WETH', 'WBTC', 'DAI'];
  
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const aIsPopular = popularTokenSymbols.includes(a.symbol);
    const bIsPopular = popularTokenSymbols.includes(b.symbol);
    
    if (aIsPopular && !bIsPopular) return -1;
    if (!aIsPopular && bIsPopular) return 1;
    
    // Native token always first
    if (a.address === 'NATIVE') return -1;
    if (b.address === 'NATIVE') return 1;
    
    return 0;
  });
  
  return (
    <div className="relative">
      <div
        className="flex items-center p-3 bg-[#162234] border border-[#243b55] rounded-lg cursor-pointer transition-colors hover:bg-[#1a2c4c]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedToken ? (
          <>
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-[#0c1522] p-1 flex items-center justify-center">
              <Image
                src={selectedToken.logo}
                alt={selectedToken.symbol}
                width={28}
                height={28}
                className="object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const imgElement = e.currentTarget as HTMLImageElement;
                  imgElement.src = '/Roo.png';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-white font-medium">{selectedToken.symbol}</span>
                {selectedToken.balance && (
                  <span className="ml-2 text-gray-400 text-sm">
                    Balance: {selectedToken.balance}
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-xs truncate max-w-[180px]">{selectedToken.name}</div>
            </div>
            <div className="ml-auto pl-2">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-400">Select Token</div>
            <div className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-[#0c1522] border border-[#1a2c4c] rounded-lg shadow-lg max-h-80 overflow-hidden animate-fadeIn">
          <div className="p-3 bg-[#0a101a] border-b border-[#1a2c4c]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens by name or symbol"
                className="w-full p-3 pl-10 bg-[#162234] border border-[#243b55] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                autoFocus
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-6 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : sortedTokens.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>No tokens found</div>
                <div className="text-xs mt-1">Try a different search term</div>
              </div>
            ) : (
              <div className="p-1">
                {sortedTokens.map(token => (
                  <div
                    key={token.address}
                    className="flex items-center p-3 hover:bg-[#162234] cursor-pointer rounded-md transition-colors"
                    onClick={() => {
                      onTokenSelect(token);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-[#162234] border border-[#243b55] p-1 flex items-center justify-center">
                      <Image
                        src={token.logo}
                        alt={token.symbol}
                        width={32}
                        height={32}
                        className="object-contain"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const imgElement = e.currentTarget as HTMLImageElement;
                          imgElement.src = '/Roo.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline">
                        <div className="text-white font-medium">{token.symbol}</div>
                        {token.address === 'NATIVE' && (
                          <div className="ml-2 text-xs px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded-sm">
                            Native
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs truncate">{token.name}</div>
                    </div>
                    {token.balance && (
                      <div className="ml-auto pl-3 text-right">
                        <div className="text-white text-sm">{token.balance}</div>
                        <div className="text-gray-400 text-xs">Balance</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}