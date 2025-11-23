'use client'

import { ReactNode, useEffect } from 'react'
import { getAppKit } from '@/lib/reown/init'
import { applyReownTheme } from '@/app/theme-utils'

interface ReownProviderProps {
  children: ReactNode
}

export function ReownProvider({ children }: ReownProviderProps) {
  // Set up AppKit theming and global event handlers
  useEffect(() => {
    console.log('ReownProvider mounted')
    
    // Get the already initialized AppKit instance and apply theming
    const setupAppKit = () => {
      try {
        const appKit = getAppKit()
        if (appKit) {
          console.log('AppKit instance retrieved in ReownProvider')
          applyReownTheme()
        } else {
          console.warn('AppKit instance not available yet')
        }
      } catch (error) {
        console.error('Error setting up AppKit in ReownProvider:', error)
      }
    }
    
    setupAppKit()
    
    // Set up global event handlers for modal display
    const handleModalOpen = () => {
      document.body.setAttribute('data-appkit-active', 'true')
      console.log('AppKit modal opened')
    }
    
    const handleModalClose = () => {
      document.body.removeAttribute('data-appkit-active')
      console.log('AppKit modal closed')
    }
    
    // Listen for global events from AppKit
    window.addEventListener('web3modal:open', handleModalOpen)
    window.addEventListener('web3modal:close', handleModalClose)
    
    return () => {
      // Remove event listeners
      window.removeEventListener('web3modal:open', handleModalOpen)
      window.removeEventListener('web3modal:close', handleModalClose)
    }
  }, [])

  return <>{children}</>
}
