'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface Chain {
  id: number;
  name: string;
  logo: string;
}

interface ChainSelectorProps {
  chains: Chain[];
  selectedChain: Chain | null;
  onChainSelect: (chain: Chain) => void;
}

export function ChainSelector({ chains, selectedChain, onChainSelect }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <div
        className="flex items-center p-3 bg-[#162234] border border-[#243b55] rounded-lg cursor-pointer transition-colors hover:bg-[#1a2c4c]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedChain ? (
          <>
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-[#0c1522] p-1">
              <Image
                src={selectedChain.logo}
                alt={selectedChain.name}
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <div className="text-white font-medium">{selectedChain.name}</div>
              <div className="text-xs text-gray-400">Click to change</div>
            </div>
          </>
        ) : (
          <div className="text-gray-400">Select Chain</div>
        )}
        
        <div className="ml-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-[#0c1522] border border-[#1a2c4c] rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fadeIn">
          <div className="p-2 bg-[#0a101a] text-xs text-gray-400 font-medium border-b border-[#1a2c4c]">
            Select Source Chain
          </div>
          <div className="grid grid-cols-2 gap-1 p-2">
            {chains.map(chain => (
              <div
                key={chain.id}
                className="flex items-center p-3 hover:bg-[#162234] cursor-pointer rounded-md transition-colors"
                onClick={() => {
                  onChainSelect(chain);
                  setIsOpen(false);
                }}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-[#162234] border border-[#1a2c4c] p-1 flex items-center justify-center">
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="text-white">{chain.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}