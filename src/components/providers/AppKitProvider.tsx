'use client'

import { ReactNode, useEffect, useState } from 'react'
import { getAppKit, isConnected, reconnectWallet } from '@/lib/reown/init'
import { applyReownTheme } from '@/app/theme-utils'
import { useAppKitAccount } from '@reown/appkit/react'
import { useReownAuth } from '@/hooks/useReownAuth'

interface AppKitProviderProps {
  children: ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  const [isAppKitReady, setIsAppKitReady] = useState(false)
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const [reconnectionAttempted, setReconnectionAttempted] = useState(false)

  // Initialize AppKit on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Get AppKit instance (already initialized synchronously)
        const instance = getAppKit()
        if (instance) {
          console.log('AppKit initialized successfully in provider')
          
          // Apply theme
          applyReownTheme()
          
          // Force defining custom elements if needed
          if (!customElements.get('appkit-button')) {
            console.log('AppKit button custom element not found, waiting for registration')
          }
          
          // AppKit instance is ready for use
          console.log('AppKit instance ready for hooks')
          
          setIsAppKitReady(true)
        } else {
          console.warn('AppKit initialization returned null')
          setInitializationError('Failed to initialize AppKit')
          
          // Keep checking if AppKit is available
          const checkInterval = setInterval(() => {
            const appKit = getAppKit()
            if (appKit) {
              clearInterval(checkInterval)
              setIsAppKitReady(true)
              setInitializationError(null)
              console.log('AppKit found in periodic check')
              
              // Apply theme when found
              applyReownTheme()
            }
          }, 300)
          
          // Clear interval after a timeout to prevent infinite checking
          setTimeout(() => {
            clearInterval(checkInterval)
            if (!isAppKitReady) {
              console.warn('AppKit not available after timeout, proceeding anyway')
              setIsAppKitReady(true) // Proceed anyway after timeout
            }
          }, 5000)
        }
      } catch (error) {
        console.error('Error initializing AppKit in provider:', error)
        setInitializationError(error instanceof Error ? error.message : 'Unknown error initializing AppKit')
        // Continue anyway in case of error
        setIsAppKitReady(true)
      }
    }
    
    init()
  }, [])

  // Handle reconnection when AppKit is ready
  useEffect(() => {
    if (isAppKitReady && !reconnectionAttempted) {
      const attemptReconnection = async () => {
        // Check if we have a saved connection state
        if (isConnected()) {
          console.log('Attempting to reconnect wallet from saved state')
          try {
            await reconnectWallet()
          } catch (error) {
            console.error('Error during reconnection attempt:', error)
          }
        }
        setReconnectionAttempted(true)
      }
      
      attemptReconnection()
    }
  }, [isAppKitReady, reconnectionAttempted])

  // Connection state monitoring and authentication
  const ConnectionMonitor = () => {
    const { isConnected, address, status } = useAppKitAccount()
    const { isLoading, error, isAuthenticated, user } = useReownAuth()
    
    useEffect(() => {
      console.log('Connection state changed:', { isConnected, address, status })
      console.log('Auth state:', { isLoading, error, isAuthenticated, user: user?.uid })
    }, [isConnected, address, status, isLoading, error, isAuthenticated, user])
    
    return null // This is just a monitoring component, it doesn't render anything
  }

  // Only render children once AppKit is initialized
  // This prevents "Please call createAppKit before using hooks" errors
  if (!isAppKitReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#041836] text-white">
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-blue-500/20 animate-ping"></div>
          <div className="relative z-10 w-16 h-16 overflow-hidden rounded-full flex items-center justify-center">
            <img src="/fftb.png" alt="FFTB" className="w-16 h-16 object-contain" />
          </div>
        </div>
        <div className="text-center max-w-xs mx-auto">
          <div className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-3">
            Loading...
          </div>
          <div className="text-sm text-blue-300/80 mb-6">
            {initializationError ?
              `Error: ${initializationError}. Retrying...` :
              'Connecting to secure services...'}
          </div>
          <div className="w-48 h-1.5 mx-auto bg-blue-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full animate-shimmer"
                 style={{
                   animation: 'progressAnimation 1.5s ease-in-out infinite',
                   backgroundSize: '200% 100%',
                   width: '100%'
                 }}>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes progressAnimation {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* Include the connection monitor component */}
      <ConnectionMonitor />
      {children}
    </>
  )
}
