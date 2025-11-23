'use client'

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { getAppKit } from '@/lib/reown/init'

// ERC20 token ABI (minimal for transfers)
const ERC20_ABI = [
  // Transfer function
  "function transfer(address to, uint amount) returns (bool)",
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
]

interface TransferResult {
  success: boolean
  txHash?: string
  error?: string
}

/**
 * Hook for handling wallet transfers (both native CRO and ERC20 tokens)
 */
export function useWalletTransfer() {
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const [isTransferring, setIsTransferring] = useState(false)

  /**
   * Get a signer from the connected wallet
   */
  const getSigner = useCallback(async () => {
    if (!walletProvider || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      const provider = new ethers.providers.Web3Provider(walletProvider as any)
      return provider.getSigner(address)
    } catch (error) {
      console.error('Error getting signer:', error)
      throw new Error('Failed to get wallet signer')
    }
  }, [walletProvider, address])

  /**
   * Send native CRO tokens to a recipient address
   * @param recipientAddress The recipient's wallet address
   * @param amount The amount to send in CRO (as a string, e.g. "0.1")
   * @returns Transaction result
   */
  const sendCRO = useCallback(async (
    recipientAddress: string,
    amount: string
  ): Promise<TransferResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    if (!ethers.utils.isAddress(recipientAddress)) {
      return { success: false, error: 'Invalid recipient address' }
    }

    if (parseFloat(amount) <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    setIsTransferring(true)

    try {
      const signer = await getSigner()
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount)
      
      // Create transaction
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: amountWei,
        // Optional: You can specify gas limit and gas price if needed
        // gasLimit: ethers.utils.hexlify(100000),
        // gasPrice: ethers.utils.parseUnits('5', 'gwei')
      })
      
      console.log('CRO transfer transaction sent:', tx.hash)
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log('CRO transfer confirmed in block:', receipt.blockNumber)
      
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('Error sending CRO:', error)
      
      // Format error message
      let errorMessage = 'Failed to send CRO'
      if (error instanceof Error) {
        // Check for common errors
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete this transaction'
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user'
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsTransferring(false)
    }
  }, [address, getSigner])

  /**
   * Send ERC20 tokens to a recipient address
   * @param tokenAddress The ERC20 token contract address
   * @param recipientAddress The recipient's wallet address
   * @param amount The amount to send (as a string, e.g. "10")
   * @returns Transaction result
   */
  const sendToken = useCallback(async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ): Promise<TransferResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    if (!ethers.utils.isAddress(tokenAddress)) {
      return { success: false, error: 'Invalid token address' }
    }

    if (!ethers.utils.isAddress(recipientAddress)) {
      return { success: false, error: 'Invalid recipient address' }
    }

    if (parseFloat(amount) <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    setIsTransferring(true)

    try {
      const signer = await getSigner()
      
      // Create token contract instance
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      
      // Get token decimals
      const decimals = await tokenContract.decimals()
      
      // Convert amount to token units
      const amountInTokenUnits = ethers.utils.parseUnits(amount, decimals)
      
      // Send tokens
      const tx = await tokenContract.transfer(recipientAddress, amountInTokenUnits)
      console.log('Token transfer transaction sent:', tx.hash)
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log('Token transfer confirmed in block:', receipt.blockNumber)
      
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('Error sending tokens:', error)
      
      // Format error message
      let errorMessage = 'Failed to send tokens'
      if (error instanceof Error) {
        // Check for common errors
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete this transaction'
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user'
        } else if (error.message.includes('exceeds balance')) {
          errorMessage = 'Token balance too low for this transaction'
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsTransferring(false)
    }
  }, [address, getSigner])

  /**
   * Get token information (symbol, name, decimals)
   * @param tokenAddress The ERC20 token contract address
   * @returns Token information
   */
  const getTokenInfo = useCallback(async (tokenAddress: string) => {
    if (!walletProvider || !ethers.utils.isAddress(tokenAddress)) {
      return null
    }

    try {
      const provider = new ethers.providers.Web3Provider(walletProvider as any)
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      
      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals()
      ])
      
      return { symbol, name, decimals }
    } catch (error) {
      console.error('Error getting token info:', error)
      return null
    }
  }, [walletProvider])

  return {
    sendCRO,
    sendToken,
    getTokenInfo,
    isTransferring,
    isWalletConnected: !!address && !!walletProvider
  }
}

export default useWalletTransfer