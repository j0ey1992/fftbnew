'use client'

import { useEffect, useState } from 'react'
import { getAppKit } from '@/lib/reown/init'
import { applyReownTheme } from '@/app/theme-utils'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

export default function ReownClient() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const [initialized, setInitialized] = useState(false)
  
  // Initialize AppKit on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Get AppKit instance (already initialized synchronously)
        const appKit = getAppKit()
        if (appKit) {
          console.log('Reown AppKit initialized in client component')
          applyReownTheme()
          
          // Make AppKit instance globally available for debugging
          if (typeof window !== 'undefined') {
            window.appKitInstance = appKit
            console.log('Reown AppKit instance available globally')
          }
          
          setInitialized(true)
        }
      } catch (error) {
        console.error('Error initializing AppKit in client component:', error)
      }
    }
    
    init()
  }, [])
  
  // Log connection status changes
  useEffect(() => {
    if (initialized) {
      console.log('Wallet connection status:', isConnected ? 'Connected' : 'Disconnected')
      if (isConnected) {
        console.log('Connected address:', address)
        console.log('Connected chain ID:', chainId)
      }
    }
  }, [initialized, isConnected, address, chainId])
  
  return null
}

// Add TypeScript type declaration for window
declare global {
  interface Window {
    appKitInstance: any;
  }
}
