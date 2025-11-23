'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletIcon } from '@/components/icons'
import { useAppKitAccount, useDisconnect, useAppKit } from '@reown/appkit/react'
import { getAppKit } from '@/lib/reown/init'
import { applyReownTheme } from '@/app/theme-utils'
import styles from '@/styles/components/ConnectWallet.module.css'
import { ethers } from 'ethers'

// Custom Connect Button Component
const CustomConnectButton = ({ onClick, isConnecting }: { onClick: () => void, isConnecting?: boolean }) => {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className="relative flex items-center justify-center px-4 py-2 min-w-[140px] h-9 rounded-lg font-medium text-xs text-white overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#1199fa] via-[#0e8fe8] to-[#0b85d8] hover:from-[#0d7ac9] hover:via-[#0a80d2] hover:to-[#0970b8] active:from-[#0b6cb2] active:via-[#0972bc] active:to-[#0864a6] shadow-[0_2px_10px_rgba(17,153,250,0.25)] hover:shadow-[0_4px_16px_rgba(17,153,250,0.35)] group backdrop-blur-sm"
    >
      {/* Shine effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
      
      {/* Button content */}
      <div className="flex items-center justify-center gap-1.5">
        <WalletIcon className="h-3.5 w-3.5" />
        <span className="font-semibold uppercase tracking-wide text-xs">
          {isConnecting ? 'Connecting...' : 'Connect'}
        </span>
      </div>
      
      {/* Glass effect border */}
      <span className="absolute inset-0 rounded-lg border border-white/10"></span>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[rgba(17,153,250,0.15)] blur-md -z-10"></div>
    </button>
  )
}

export default function ConnectWallet() {
  const [showBalance, setShowBalance] = useState(false)
  const { address, isConnected, status } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const [balance, setBalance] = useState<string>('0.00')
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false)
  
  // Apply Reown theme when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to apply theme periodically until AppKit is initialized
      const tryApplyTheme = () => {
        const appKit = getAppKit()
        if (appKit) {
          applyReownTheme()
        } else {
          setTimeout(tryApplyTheme, 500)
        }
      }
      
      tryApplyTheme()
    }
  }, [])
  
  // Fetch CRO balance when connected
  useEffect(() => {
    const fetchCroBalance = async () => {
      if (!address || !isConnected) {
        setBalance('0.00')
        return
      }

      try {
        setIsLoadingBalance(true)

        // Use ethers v5 to get native token balance
        const provider = new ethers.providers.JsonRpcProvider('https://evm.cronos.org')
        const balanceWei = await provider.getBalance(address)
        const balanceFormatted = ethers.utils.formatEther(balanceWei)
        const balanceNumber = parseFloat(balanceFormatted).toFixed(4)

        setBalance(balanceNumber)
      } catch (error) {
        console.error('Error fetching CRO balance:', error)
        setBalance('0.00')
      } finally {
        setIsLoadingBalance(false)
      }
    }

    // Fetch immediately
    fetchCroBalance()

    // Set up interval to refresh balance periodically
    const intervalId = setInterval(fetchCroBalance, 30000) // Every 30 seconds

    return () => clearInterval(intervalId)
  }, [address, isConnected])
  
  const isConnecting = status === 'connecting' || status === 'reconnecting'

  // Using the AppKit hook
  const { open } = useAppKit()
  
  // Function to open the wallet dialog
  const connectWallet = () => {
    try {
      open()
    } catch (error) {
      console.error('Error opening wallet dialog:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      setShowBalance(false)
      setTimeout(async () => {
        if (disconnect) {
          await disconnect()
        } else {
          console.warn('Disconnect function not available')
        }
      }, 200)
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  const formatAddress = (address: string | undefined) => {
    if (!address) return ''
    try {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    } catch (error) {
      console.error('Error formatting address:', error)
      return 'Invalid Address'
    }
  }

  useEffect(() => {
    if (!isConnected) {
      setShowBalance(false)
    } else {
      // Show balance with a slight delay for animation effect
      setTimeout(() => {
        setShowBalance(true)
      }, 300)
    }
  }, [isConnected])

  return (
    <div className="wallet-connect">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <CustomConnectButton onClick={connectWallet} isConnecting={isConnecting} />
          </motion.div>
        ) : address ? (
          <motion.div 
            className={`${styles.walletConnected} animate-fade-in backdrop-blur-md bg-gradient-to-r from-[#1e2a4d]/80 to-[#141e3a]/80 border border-gray-700 shadow-lg`}
            key="connected"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`${styles.walletConnected__status} bg-success shadow-[0_0_6px_rgba(12,205,146,0.5)]`}></div>
            <div className="flex flex-col">
              <div className={`${styles.walletConnected__address} font-medium`}>
                {formatAddress(address)}
              </div>
              <AnimatePresence>
                {showBalance && (
                  <motion.div 
                    className={styles.walletConnected__balance}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {isLoadingBalance ? (
                      <span className="text-gray-400 text-sm">Loading...</span>
                    ) : (
                      <>
                        <span className="text-success font-medium">{balance}</span> CRO
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={disconnectWallet}
              className={`${styles.walletConnected__disconnect} bg-gray-700/30 hover:bg-gray-700/50 active:bg-gray-700/70`}
              aria-label="Disconnect wallet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
