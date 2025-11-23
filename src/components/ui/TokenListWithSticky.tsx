'use client'

import React from 'react'
import { SafeImage } from '@/components/ui/SafeImage'
import { WalletIcon } from 'lucide-react'
import { VirtualizedTokenList } from '@/components/swap/VirtualizedTokenList'

// Define standard tokens that should always appear at the top
const STANDARD_TOKENS = [
  { address: 'NATIVE', symbol: 'CRO', name: 'Cronos', logo: 'https://cryptologos.cc/logos/crypto-com-coin-cro-logo.png' },
  { address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { address: '0x66e428c3f67a68878562e79A0234c1F83c208770', symbol: 'USDT', name: 'Tether USD', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { address: '0xF2001B145b43032AAF5Ee2884e456CCd805F677D', symbol: 'DAI', name: 'Dai Stablecoin', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' },
  { address: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', symbol: 'WETH', name: 'Wrapped Ether', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23', symbol: 'WCRO', name: 'Wrapped CRO', logo: 'https://cryptologos.cc/logos/crypto-com-coin-cro-logo.png' },
]

interface TokenListWithStickyProps {
  tokens: any[]
  onTokenSelect: (token: any) => void
  searchQuery: string
}

export function TokenListWithSticky({ tokens, onTokenSelect, searchQuery }: TokenListWithStickyProps) {
  // Find standard tokens in the provided token list to get their balance info
  const standardTokensWithData = STANDARD_TOKENS.map(standardToken => {
    const tokenWithData = tokens.find(
      t => t.address.toLowerCase() === standardToken.address.toLowerCase() || 
          (standardToken.address === 'NATIVE' && t.symbol === 'CRO' && t.address === 'native')
    )
    return tokenWithData || { ...standardToken, chainId: 25 }
  })

  // Filter out standard tokens from the main list to avoid duplicates
  const nonStandardTokens = tokens.filter(token => 
    !STANDARD_TOKENS.some(st => 
      st.address.toLowerCase() === token.address.toLowerCase() ||
      (st.address === 'NATIVE' && token.symbol === 'CRO' && token.address.toLowerCase() === 'native')
    )
  )

  // If searching, don't show sticky tokens separately
  if (searchQuery) {
    return (
      <VirtualizedTokenList
        tokens={tokens}
        onTokenSelect={onTokenSelect}
        searchQuery={searchQuery}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Standard Tokens */}
      <div className="border-b border-[#1a2c4c]/50 bg-[#0F1823]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Popular Tokens</p>
        </div>
        <div className="grid grid-cols-1">
          {standardTokensWithData.map((token) => (
            <button
              key={token.address}
              onClick={() => onTokenSelect(token)}
              className="px-4 py-3 hover:bg-[#1a2c4c]/30 transition-colors duration-150 flex items-center gap-3"
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <SafeImage
                  src={token.logo || token.logoURI || '/Roo.png'}
                  alt={token.symbol}
                  width={40}
                  height={40}
                  className="rounded-full"
                  fallbackSrc="/Roo.png"
                />
                {token.hasBalance && (
                  <div className="absolute -bottom-1 -right-1">
                    <WalletIcon className="w-4 h-4 text-[var(--swap-accent-color)]" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{token.symbol}</span>
                  {token.verified && (
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-sm text-gray-400">{token.name}</div>
              </div>
              
              <div className="text-right">
                {token.balanceFormatted !== undefined && token.balanceFormatted > 0 && (
                  <div className="text-white font-medium">
                    {token.balanceFormatted < 0.0001 
                      ? '<0.0001' 
                      : token.balanceFormatted.toFixed(4)}
                  </div>
                )}
                {token.balanceUSD !== undefined && token.balanceUSD > 0 && (
                  <div className="text-sm text-gray-400">
                    ${token.balanceUSD.toFixed(2)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* All Other Tokens */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2 bg-[#0F1823]/30">
          <p className="text-xs text-gray-500 uppercase tracking-wider">All Tokens</p>
        </div>
        <VirtualizedTokenList
          tokens={nonStandardTokens}
          onTokenSelect={onTokenSelect}
          searchQuery={searchQuery}
          height={300}
        />
      </div>
    </div>
  )
}