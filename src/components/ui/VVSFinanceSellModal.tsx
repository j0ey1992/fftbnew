'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { Button } from './button'
import { ethers } from 'ethers'
import { 
  fetchBestTrade, 
  executeTrade, 
  approveIfNeeded, 
  BuiltInChainId, 
  PoolType, 
  TradeType,
  utils as SwapSdkUtils
} from '@vvs-finance/swap-sdk'

// Define cryptocurrency types
interface Cryptocurrency {
  id: string
  name: string
  symbol: string
  logo: string
  address: string
  isNative?: boolean
}

interface VVSFinanceSellModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VVSFinanceSellModal({ isOpen, onClose }: VVSFinanceSellModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('For You')
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null)
  const [swapAmount, setSwapAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSwapInterface, setShowSwapInterface] = useState(false)
  const [tradeDetails, setTradeDetails] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setActiveTab('For You')
      setSelectedCrypto(null)
      setSwapAmount('')
      setIsLoading(false)
      setShowSwapInterface(false)
      setTradeDetails(null)
      setErrorMessage('')
    }
  }, [isOpen])

  // Real Cronos tokens
  const cryptocurrencies: Cryptocurrency[] = [
    {
      id: 'cro',
      name: 'Cronos',
      symbol: 'CRO',
      logo: '/Roo.png', // Using Roo logo as placeholder
      address: 'NATIVE',
      isNative: true
    },
    {
      id: 'wcro',
      name: 'Wrapped CRO',
      symbol: 'WCRO',
      logo: '/Roo.png', // Using Roo logo as placeholder
      address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23' // WCRO on Cronos
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      logo: '/Roo.png', // Using Roo logo as placeholder
      address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59' // USDC on Cronos
    },
    {
      id: 'usdt',
      name: 'Tether',
      symbol: 'USDT',
      logo: '/Roo.png', // Using Roo logo as placeholder
      address: '0x66e428c3f67a68878562e79A0234c1F83c208770' // USDT on Cronos
    },
    {
      id: 'vvs',
      name: 'VVS Finance',
      symbol: 'VVS',
      logo: '/Roo.png', // Using Roo logo as placeholder
      address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03' // VVS on Cronos
    }
  ]

  // Filter cryptocurrencies based on search query
  const filteredCryptocurrencies = cryptocurrencies.filter(crypto => 
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle cryptocurrency selection
  const handleCryptoSelect = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto)
    setShowSwapInterface(true)
  }

  // Handle back button in swap interface
  const handleBackToList = () => {
    setShowSwapInterface(false)
    setSelectedCrypto(null)
    setSwapAmount('')
    setTradeDetails(null)
    setErrorMessage('')
  }

  // Fetch best trade when amount changes
  useEffect(() => {
    const fetchTrade = async () => {
      if (!selectedCrypto || !swapAmount || parseFloat(swapAmount) <= 0) {
        setTradeDetails(null)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        // For selling, we're swapping the selected token for CRO (opposite of buying)
        const inputToken = selectedCrypto.address
        const outputToken = selectedCrypto.isNative ? cryptocurrencies[1].address : 'NATIVE' // Use WCRO if selling CRO, otherwise use native CRO

        // Use the provided API key to fetch real trade data
        const trade = await fetchBestTrade(
          BuiltInChainId.CRONOS_MAINNET,
          inputToken,
          outputToken,
          swapAmount,
          {
            poolTypes: [PoolType.V2, PoolType.V3_100, PoolType.V3_500, PoolType.V3_3000, PoolType.V3_10000],
            maxHops: 3,
            maxSplits: 2,
            quoteApiClientId: 'eb452e7c1be44ec8ba55967f3676f0b9'
          }
        )

        setTradeDetails(trade)
      } catch (error) {
        console.error('Error fetching trade:', error)
        setErrorMessage('Failed to fetch trade details. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)))
      } finally {
        setIsLoading(false)
      }
    }

    if (showSwapInterface) {
      fetchTrade()
    }
  }, [selectedCrypto, swapAmount, showSwapInterface])

  // Execute trade
  const handleSwap = async () => {
    if (!tradeDetails || !selectedCrypto) return

    try {
      setIsLoading(true)
      setErrorMessage('')

      // Import the necessary functions from vvs-service
      const { executeVvsTrade } = await import('@/lib/vvs/vvs-service')
      
      // Get provider from Reown
      let provider;
      let signer;
      
      try {
        console.log('Getting provider from Reown...')
        
        // Import the getAppKit function
        const { getAppKit } = await import('@/lib/reown/init')
        const appKit = getAppKit()
        
        if (!appKit) {
          throw new Error('AppKit not initialized. Please refresh the page and try again.')
        }
        
        // Get provider using the same strategies as in useVvsTrade.ts
        if (appKit && typeof appKit.getProvider === 'function') {
          try {
            const walletProvider = await appKit.getProvider('eip155')
            if (walletProvider) {
              provider = new ethers.providers.Web3Provider(walletProvider as any)
              console.log('Successfully obtained provider from AppKit.getProvider')
            }
          } catch (error) {
            console.error('Error getting provider from AppKit:', error)
            throw new Error('Failed to get provider from AppKit. Please try again.')
          }
        } else {
          throw new Error('AppKit provider not available. Please reconnect your wallet.')
        }
        
        // Get signer from provider
        if (!provider) {
          throw new Error('Provider is undefined. Please reconnect your wallet.')
        }
        
        signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        console.log('Executing trade with signer address:', signerAddress)
      } catch (error) {
        console.error('Error getting provider or signer:', error)
        throw new Error('Failed to connect to your wallet. Please try again.')
      }
      
      // Execute the trade using our enhanced service
      const tx = await executeVvsTrade(tradeDetails, signer, BuiltInChainId.CRONOS_MAINNET)
      console.log('Trade executed successfully, hash:', tx.hash)
      
      // Set transaction hash to display success message
      setTxHash(tx.hash)
      
      // Reset the interface after successful swap with a delay
      setTimeout(() => {
        setShowSwapInterface(false)
        setSelectedCrypto(null)
        setSwapAmount('')
        setTradeDetails(null)
        setTxHash(null)
      }, 5000) // Give user time to see success message
    } catch (error) {
      console.error('Error executing trade:', error)
      setErrorMessage('Failed to execute trade. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  }
  
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  // Return null if modal is not open
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl relative z-10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <GlassCard elevation="raised" className="overflow-hidden">
              {/* Header */}
              <div className="p-5 bg-[#0a0f1f] text-white flex justify-between items-center border-b border-white/5">
                <h3 className="text-xl font-bold">
                  {showSwapInterface ? `Sell ${selectedCrypto?.symbol}` : 'Sell Cryptocurrency'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Risk Warning Banner */}
              <div className="bg-[#0a0f1f]/80 p-4 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-200 text-sm font-medium">
                      Don't invest unless you're prepared to lose all the money you invest. This is a high-risk investment and you should not expect to be protected if something goes wrong.
                    </p>
                    <Link href="/risk-disclosure" className="inline-block mt-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                      Take 2 mins to learn more →
                    </Link>
                  </div>
                </div>
              </div>
              
              {showSwapInterface ? (
                // Swap Interface
                <div className="p-5 max-h-[calc(90vh-180px)] overflow-y-auto">
                  {/* Back Button */}
                  <button 
                    onClick={handleBackToList}
                    className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to list
                  </button>
                  
                  {/* Selected Cryptocurrency */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 mr-3">
                      <Image
                        src={selectedCrypto?.logo || '/Roo.png'}
                        alt={selectedCrypto?.name || ''}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{selectedCrypto?.name}</h4>
                      <p className="text-gray-400 text-sm">{selectedCrypto?.symbol}</p>
                    </div>
                  </div>
                  
                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Amount to sell
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {selectedCrypto?.symbol}
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Enter the amount of {selectedCrypto?.symbol} to swap for {selectedCrypto?.isNative ? 'WCRO' : 'CRO'}
                    </p>
                  </div>
                  
                  {/* Trade Details */}
                  {tradeDetails && (
                    <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                      <h5 className="text-gray-300 font-medium mb-2">Trade Details</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">You sell</span>
                          <span className="text-white text-sm">
                            {typeof tradeDetails.amountIn === 'object' ? 
                              (tradeDetails.amountIn.amount || 
                               (tradeDetails.amountIn.numerator && tradeDetails.amountIn.denominator ? 
                                String(Number(tradeDetails.amountIn.numerator) / Number(tradeDetails.amountIn.denominator)) : 
                                '0')) : 
                              String(tradeDetails.amountIn)} {selectedCrypto?.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">You receive</span>
                          <span className="text-white text-sm">
                            {typeof tradeDetails.amountOut === 'object' ? 
                              (tradeDetails.amountOut.amount || 
                               (tradeDetails.amountOut.numerator && tradeDetails.amountOut.denominator ? 
                                String(Number(tradeDetails.amountOut.numerator) / Number(tradeDetails.amountOut.denominator)) : 
                                '0')) : 
                              String(tradeDetails.amountOut)} {selectedCrypto?.isNative ? 'WCRO' : 'CRO'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Exchange rate</span>
                          <span className="text-white text-sm">
                            1 {selectedCrypto?.symbol} ≈ {
                              (() => {
                                const inAmount = typeof tradeDetails.amountIn === 'object' ? 
                                  parseFloat(tradeDetails.amountIn.amount || 
                                    (tradeDetails.amountIn.numerator && tradeDetails.amountIn.denominator ? 
                                     String(Number(tradeDetails.amountIn.numerator) / Number(tradeDetails.amountIn.denominator)) : 
                                     '0')) : 
                                  parseFloat(String(tradeDetails.amountIn));
                                const outAmount = typeof tradeDetails.amountOut === 'object' ? 
                                  parseFloat(tradeDetails.amountOut.amount || 
                                    (tradeDetails.amountOut.numerator && tradeDetails.amountOut.denominator ? 
                                     String(Number(tradeDetails.amountOut.numerator) / Number(tradeDetails.amountOut.denominator)) : 
                                     '0')) : 
                                  parseFloat(String(tradeDetails.amountOut));
                                return (outAmount / (inAmount || 1)).toFixed(6);
                              })()
                            } {selectedCrypto?.isNative ? 'WCRO' : 'CRO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-6">
                      <p className="text-red-400 text-sm">{errorMessage}</p>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    disabled={!tradeDetails || isLoading}
                    onClick={handleSwap}
                  >
                    {isLoading ? 'Processing...' : `Sell ${selectedCrypto?.symbol}`}
                  </Button>
                  
                  {/* Transaction Status */}
                  {txHash && (
                    <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-green-400 text-sm font-medium">
                            Transaction submitted!
                          </p>
                          <p className="text-green-500/70 text-xs mt-1">
                            Your transaction is being processed on the blockchain.
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-green-800/50">
                        <a 
                          href={`https://cronoscan.com/tx/${txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm flex items-center hover:text-blue-300 transition-colors"
                        >
                          <span>View on Explorer</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Transaction Processing Indicator */}
                  {isLoading && !txHash && (
                    <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0">
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-blue-400 text-sm font-medium">
                            Processing Transaction
                          </p>
                          <p className="text-blue-500/70 text-xs mt-1">
                            Please confirm the transaction in your wallet when prompted.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Cryptocurrency List
                <div>
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
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-800/50 w-full pl-10 pr-4 py-2 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-gray-700/50 px-4">
                    {['For You', 'Favorites', 'Top Gainers', 'Top Losers'].map((tab) => (
                      <button
                        key={tab}
                        className={`py-2 px-4 text-sm font-medium ${
                          activeTab === tab
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  {/* Cryptocurrency List */}
                  <div className="max-h-[calc(90vh-280px)] overflow-y-auto">
                    {filteredCryptocurrencies.length > 0 ? (
                      filteredCryptocurrencies.map((crypto) => (
                        <button
                          key={crypto.id}
                          className="w-full px-4 py-4 border-b border-gray-700/30 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                          onClick={() => handleCryptoSelect(crypto)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 mr-3">
                              <Image
                                src={crypto.logo}
                                alt={crypto.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div className="text-left">
                              <h4 className="text-white font-medium">{crypto.name}</h4>
                              <p className="text-gray-400 text-sm">{crypto.symbol}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-white font-medium">Market Price</span>
                            <span className="text-green-400 text-sm">VVS Finance</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-400">No cryptocurrencies found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
