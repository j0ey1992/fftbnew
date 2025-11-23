'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { 
  ChainSelector, 
  TokenSelector, 
  BridgeForm,
  TransactionStatus,
  Chain,
  Token
} from '@/components/bridge'
import { useXYBridge } from '@/lib/xy/useXYBridge'

// Chain and token configurations
const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: 'Ethereum', logo: '/Roo.png' },  // Use a default placeholder image
  { id: 56, name: 'BSC', logo: '/Roo.png' },
  { id: 137, name: 'Polygon', logo: '/Roo.png' },
  { id: 42161, name: 'Arbitrum', logo: '/Roo.png' },
  { id: 10, name: 'Optimism', logo: '/Roo.png' },
  { id: 43114, name: 'Avalanche', logo: '/Roo.png' }
  // Add more supported chains as needed
]

// Sample tokens (in a production app, these would be fetched from an API)
const SAMPLE_TOKENS: Record<number, Token[]> = {
  1: [ // Ethereum
    { address: 'NATIVE', symbol: 'ETH', name: 'Ethereum', logo: '/Roo.png' },
    { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', name: 'Tether USD', logo: '/Roo.png' },
    { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', logo: '/Roo.png' }
  ],
  56: [ // BSC
    { address: 'NATIVE', symbol: 'BNB', name: 'Binance Coin', logo: '/Roo.png' },
    { address: '0x55d398326f99059ff775485246999027b3197955', symbol: 'USDT', name: 'Tether USD', logo: '/Roo.png' },
    { address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', symbol: 'USDC', name: 'USD Coin', logo: '/Roo.png' }
  ],
  137: [ // Polygon
    { address: 'NATIVE', symbol: 'MATIC', name: 'Polygon', logo: '/Roo.png' },
    { address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', symbol: 'USDT', name: 'Tether USD', logo: '/Roo.png' },
    { address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', symbol: 'USDC', name: 'USD Coin', logo: '/Roo.png' }
  ],
  42161: [ // Arbitrum
    { address: 'NATIVE', symbol: 'ETH', name: 'Ethereum', logo: '/Roo.png' },
    { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', symbol: 'USDT', name: 'Tether USD', logo: '/Roo.png' },
    { address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', symbol: 'USDC', name: 'USD Coin', logo: '/Roo.png' }
  ],
  10: [ // Optimism
    { address: 'NATIVE', symbol: 'ETH', name: 'Ethereum', logo: '/Roo.png' },
    { address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e8f', symbol: 'USDT', name: 'Tether USD', logo: '/Roo.png' },
    { address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', symbol: 'USDC', name: 'USD Coin', logo: '/Roo.png' }
  ],
  43114: [ // Avalanche
    { address: 'NATIVE', symbol: 'AVAX', name: 'Avalanche', logo: '/Roo.png' },
    { address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', symbol: 'USDT', name: 'Tether USD', logo: '/Roo.png' },
    { address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', symbol: 'USDC', name: 'USD Coin', logo: '/Roo.png' }
  ]
  // Add more chains as needed
}

// Kris token details
const KRIS_TOKEN_ADDRESS = '0x2829955d8Aac64f184E363516FDfbb0394042B90'
const CRONOS_CHAIN_ID = 25 // Cronos Mainnet

export default function BridgePage() {
  const [sourceChain, setSourceChain] = useState<Chain | null>(SUPPORTED_CHAINS[0])
  const [sourceToken, setSourceToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loadingTokens, setLoadingTokens] = useState(false)
  const [slippage, setSlippage] = useState<number>(1) // Default to 1% slippage
  const [amountInUsd, setAmountInUsd] = useState('0.00')
  const [estimatedKrisAmount, setEstimatedKrisAmount] = useState('0')
  
  const router = useRouter()
  const { address, isConnected } = useAppKitAccount()
  const { open } = useAppKit()
  
  // Use our custom hook for XY Finance bridge functionality
  const {
    quoteDetails,
    loading: bridgeLoading,
    error: bridgeError,
    txHash,
    status,
    executeBridge,
    isConnected: walletConnected
  } = useXYBridge(
    sourceChain?.id ?? 0,
    sourceToken?.address ?? '',
    CRONOS_CHAIN_ID,
    KRIS_TOKEN_ADDRESS,
    amount,
    slippage // Pass slippage to the hook
  )
  
  // Common tokens for quick selection
  const commonTokens = [
    { symbol: 'USDT', name: 'Tether USD' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'NATIVE', name: 'Native Token' }
  ]

  // Update tokens when chain changes
  useEffect(() => {
    if (sourceChain) {
      setLoadingTokens(true)
      
      // In a production app, we would fetch tokens from an API
      // For now, use the sample tokens with a small delay to simulate API call
      setTimeout(() => {
        const chainTokens = SAMPLE_TOKENS[sourceChain.id] || []
        setTokens(chainTokens)
        setLoadingTokens(false)
        
        // Auto-select USDT or first available token
        const usdtToken = chainTokens.find(t => t.symbol === 'USDT')
        if (usdtToken) {
          setSourceToken(usdtToken)
        } else if (chainTokens.length > 0) {
          setSourceToken(chainTokens[0])
        } else {
          setSourceToken(null)
        }
      }, 500)
    }
  }, [sourceChain])
  
  // Update USD value and estimated Kris amount when quote changes
  useEffect(() => {
    if (quoteDetails) {
      // For this demo, just set a simple conversion - in a real app, use real prices
      setAmountInUsd((parseFloat(amount) * (sourceToken?.symbol === 'USDT' || sourceToken?.symbol === 'USDC' ? 1 : 2000)).toFixed(2))
      setEstimatedKrisAmount(quoteDetails.outputAmount)
    } else if (amount && parseFloat(amount) > 0) {
      // Simple placeholder estimates
      setAmountInUsd((parseFloat(amount) * (sourceToken?.symbol === 'USDT' || sourceToken?.symbol === 'USDC' ? 1 : 2000)).toFixed(2))
      setEstimatedKrisAmount((parseFloat(amount) * 10).toFixed(2)) // Simple conversion rate for demo
    } else {
      setAmountInUsd('0.00')
      setEstimatedKrisAmount('0')
    }
  }, [amount, quoteDetails, sourceToken])
  
  // Handle bridge execution
  const handleBridge = async () => {
    if (!walletConnected) {
      open({ view: 'Connect' })
      return
    }
    
    await executeBridge()
  }

  // Handle max amount
  const handleMaxAmount = () => {
    if (sourceToken?.balance) {
      setAmount(sourceToken.balance)
    }
  }

  // Get button text based on state
  const getButtonText = () => {
    if (!walletConnected) return 'Connect Wallet'
    if (!sourceChain) return 'Select Chain'
    if (!sourceToken) return 'Select Token'
    if (!amount || parseFloat(amount) <= 0) return 'Enter Amount'
    if (!quoteDetails) return 'Getting Quote...'
    if (bridgeLoading) return 'Processing...'
    return `Buy ${estimatedKrisAmount} $Kris`
  }

  const buttonText = getButtonText()
  const canBridge = walletConnected && sourceChain && sourceToken && parseFloat(amount) > 0 && quoteDetails && !bridgeLoading
  
  return (
    <MainLayout>
      <div className="mt-4 mb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-xl h-full">
          {/* Main Card - Beautiful UI with gradient background */}
          <div className="bg-gradient-to-b from-[#0d1520] to-[#0a101a] rounded-2xl shadow-xl p-6 border border-[#1e2c3c]">
            <h2 className="text-2xl font-bold mb-6 text-center">Buy $Kris <span className="text-blue-400">Cross-Chain</span></h2>
            
            {/* One-page simplified form with minimal clicks */}
            <div className="space-y-5">
              {/* From Chain - Single select with cleaner UI */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">From Chain</label>
                <div className="relative">
                  <ChainSelector
                    chains={SUPPORTED_CHAINS}
                    selectedChain={sourceChain}
                    onChainSelect={setSourceChain}
                  />
                </div>
              </div>
              
              {/* Token with quick select for common tokens */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Token</label>
                {/* Quick select common tokens */}
                <div className="flex gap-2 mb-2 flex-wrap">
                  {commonTokens.map(token => {
                    // Find the actual token with this symbol for the current chain
                    const matchedToken = tokens.find(t =>
                      t.symbol === (token.symbol === 'NATIVE' ?
                        (sourceChain?.id === 1 || sourceChain?.id === 42161 || sourceChain?.id === 10 ? 'ETH' :
                         sourceChain?.id === 56 ? 'BNB' :
                         sourceChain?.id === 137 ? 'MATIC' :
                         sourceChain?.id === 43114 ? 'AVAX' : 'Native')
                      : token.symbol)
                    )
                    
                    return (
                      <button
                        key={token.symbol}
                        className={`px-3 py-1 rounded-full text-sm ${
                          sourceToken?.symbol === (matchedToken?.symbol || token.symbol)
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#162234] text-gray-300 hover:bg-[#1a2c4c]'
                        } transition-colors`}
                        onClick={() => matchedToken && setSourceToken(matchedToken)}
                        disabled={!matchedToken || loadingTokens}
                      >
                        {token.symbol === 'NATIVE' ?
                          (sourceChain?.id === 1 || sourceChain?.id === 42161 || sourceChain?.id === 10 ? 'ETH' :
                           sourceChain?.id === 56 ? 'BNB' :
                           sourceChain?.id === 137 ? 'MATIC' :
                           sourceChain?.id === 43114 ? 'AVAX' : 'Native')
                        : token.symbol}
                      </button>
                    )
                  })}
                </div>
                
                {/* Full token selector */}
                <TokenSelector
                  chainId={sourceChain?.id || 0}
                  tokens={tokens}
                  selectedToken={sourceToken}
                  onTokenSelect={setSourceToken}
                  loading={loadingTokens}
                />
              </div>
              
              {/* Amount with improved UI */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                        setAmount(value);
                      }
                    }}
                    placeholder="0.0"
                    className="w-full bg-[#162234] border border-[#243b55] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {sourceToken && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <div className="text-gray-400">
                        {sourceToken.symbol}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">≈ ${amountInUsd}</span>
                  {sourceToken?.balance && (
                    <button
                      className="text-blue-400 hover:text-blue-300"
                      onClick={handleMaxAmount}
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>
              
              {/* Slippage simplified to just 1% default */}
              <div className="hidden">
                <input type="hidden" value={slippage} />
              </div>
              
              {/* Destination preset to Cronos + Kris with beautiful display */}
              <div className="bg-[#12192a] p-4 rounded-lg border border-[#243b55]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-400">You will receive</span>
                    <div className="text-xl font-semibold text-white">{estimatedKrisAmount} $Kris</div>
                    {quoteDetails && quoteDetails.estimatedTime && (
                      <div className="text-xs text-gray-400 mt-1">
                        Estimated time: ~{quoteDetails.estimatedTime} seconds
                      </div>
                    )}
                  </div>
                  <div className="bg-[#162234] p-3 rounded-md flex flex-col items-center">
                    <Image
                      src="/Roo.png"
                      alt="Kris"
                      width={32}
                      height={32}
                      className="object-cover rounded-full"
                    />
                    <div className="text-xs text-center mt-1 text-gray-300">Cronos</div>
                  </div>
                </div>
              </div>
              
              {/* Bridge details if available */}
              {quoteDetails && (
                <div className="bg-[#162234]/50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Min. received:</span>
                    <span className="text-white">{quoteDetails.minReceiveAmount} KRIS</span>
                  </div>
                  {quoteDetails.estimatedGas && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas (estimated):</span>
                      <span className="text-white">{quoteDetails.estimatedGas}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Error Message */}
              {bridgeError && (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{bridgeError}</p>
                </div>
              )}
              
              {/* Action Button - Clear, attractive CTA */}
              <button
                className={`w-full ${
                  canBridge
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                    : 'bg-gray-700/50 cursor-not-allowed'
                } text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 flex justify-center items-center`}
                onClick={handleBridge}
                disabled={!canBridge}
              >
                {bridgeLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {buttonText}
              </button>
              
              {/* Transaction Status - Only shown when active */}
              {txHash && (
                <div className="mt-4 animate-fadeIn">
                  <TransactionStatus
                    txHash={txHash}
                    status={status}
                    sourceChainId={sourceChain?.id || 0}
                    destinationChainId={CRONOS_CHAIN_ID}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}