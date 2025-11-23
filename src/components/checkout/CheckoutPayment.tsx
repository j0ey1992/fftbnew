'use client'

import React, { useState, useEffect } from 'react'
import { useWalletTransfer } from '@/hooks/useWalletTransfer'
import { useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'

interface CheckoutPaymentProps {
  recipientAddress: string
  amount?: string
  tokenAddress?: string // If provided, will use ERC20 token instead of CRO
  onSuccess?: (txHash: string) => void
  onError?: (error: string) => void
}

export default function CheckoutPayment({
  recipientAddress,
  amount: initialAmount = '',
  tokenAddress,
  onSuccess,
  onError
}: CheckoutPaymentProps) {
  const [amount, setAmount] = useState(initialAmount)
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tokenInfo, setTokenInfo] = useState<{ symbol: string; name: string; decimals: number } | null>(null)
  
  const { address, isConnected } = useAppKitAccount()
  const { sendCRO, sendToken, getTokenInfo, isTransferring, isWalletConnected } = useWalletTransfer()

  // Fetch token info if tokenAddress is provided
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (tokenAddress && ethers.utils.isAddress(tokenAddress)) {
        const info = await getTokenInfo(tokenAddress)
        if (info) {
          setTokenInfo(info)
        }
      }
    }

    fetchTokenInfo()
  }, [tokenAddress, getTokenInfo])

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset states
    setError(null)
    setTxHash(null)
    setIsProcessing(true)
    
    try {
      // Validate recipient address
      if (!ethers.utils.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address')
      }
      
      // Validate amount
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount greater than 0')
      }
      
      let result
      
      // Send payment based on token type
      if (tokenAddress && ethers.utils.isAddress(tokenAddress)) {
        // Send ERC20 token
        result = await sendToken(tokenAddress, recipientAddress, amount)
      } else {
        // Send native CRO
        result = await sendCRO(recipientAddress, amount)
      }
      
      if (result.success && result.txHash) {
        setTxHash(result.txHash)
        onSuccess?.(result.txHash)
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-[#1e2a4d]/80 to-[#141e3a]/80 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {tokenInfo ? `Pay with ${tokenInfo.symbol}` : 'Pay with CRO'}
      </h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-300 mb-4">Please connect your wallet to continue</p>
          <appkit-button />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-400">From</p>
            <p className="text-white font-medium">{address ? formatAddress(address) : 'Loading...'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-400">To</p>
            <p className="text-white font-medium">{formatAddress(recipientAddress)}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm text-gray-400 mb-1">
                Amount
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing || isTransferring}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">
                    {tokenInfo ? tokenInfo.symbol : 'CRO'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isProcessing || isTransferring || !isWalletConnected}
              className="w-full py-2 px-4 bg-gradient-to-r from-[#1199fa] to-[#0b85d8] hover:from-[#0d7ac9] hover:to-[#0970b8] rounded-lg text-white font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing || isTransferring ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ${amount ? amount : '0'} ${tokenInfo ? tokenInfo.symbol : 'CRO'}`
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {txHash && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-green-400 text-sm font-medium">Payment successful!</p>
              <a
                href={`https://cronoscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:underline mt-1 inline-block"
              >
                View transaction on Cronoscan
              </a>
            </div>
          )}
        </>
      )}
    </div>
  )
}