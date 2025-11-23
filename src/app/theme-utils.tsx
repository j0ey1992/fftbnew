'use client'

import { useEffect } from 'react'
import { getAppKit } from '@/lib/reown/init'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

/**
 * This function applies Cronos theming to the Reown AppKit
 * without using hooks that require initialization
 */
export function applyReownTheme() {
  if (typeof window === 'undefined') return;
  
  // Wait for appKit to be available
  const appKit = getAppKit();
  if (!appKit) return;
  
  try {
    // Apply theming directly to the appKit instance
    appKit.setThemeMode?.('dark');
    appKit.setThemeVariables?.({
      '--w3m-color-mix': '#1199fa', // Crypto.com blue
      '--w3m-color-mix-strength': 45,
      '--w3m-accent-color': '#1199fa',
      '--w3m-accent-fill-color': '#FFFFFF',
      '--w3m-background-color': '#041836',
      '--w3m-container-border-radius': '12px',
      '--w3m-button-border-radius': '8px',
      '--w3m-icon-border-radius': '8px',
      '--w3m-wallet-icon-border-radius': '12px',
      '--w3m-font-family': 'Inter, system-ui, sans-serif',
      '--w3m-text-big-bold-size': '20px',
      '--w3m-text-big-bold-weight': '600',
      '--w3m-text-medium-regular-size': '14px',
      '--w3m-text-small-regular-size': '12px',
      '--w3m-text-small-thin-size': '12px',
      '--w3m-text-small-thin-weight': '400',
      '--w3m-text-xsmall-bold-size': '10px',
      '--w3m-text-xsmall-bold-weight': '600'
    });
  } catch (error) {
    console.error('Error applying Reown theme:', error);
  }
}

/**
 * A safer component for theme handling that doesn't use hooks
 * This avoids the "createAppKit before using hooks" error
 */
export function ReownThemeHandler() {
  useEffect(() => {
    // Check for appKit periodically until it's available
    const checkAndApplyTheme = () => {
      const appKit = getAppKit();
      if (appKit) {
        applyReownTheme();
      } else {
        // Try again in a bit
        setTimeout(checkAndApplyTheme, 500);
      }
    };
    
    checkAndApplyTheme();
  }, []);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * Example of using the theme handler in any component
 */
export function CronosThemedButton() {
  useEffect(() => {
    applyReownTheme();
  }, []);
  
  // Import required hooks and components
  const { open } = useAppKit();
  const { status } = useAppKitAccount();
  const isConnecting = status === 'connecting' || status === 'reconnecting';
  
  return (
    <div className="cronos-wallet">
      {/* Display custom wallet button with Crypto.com styling */}
      <div className="wallet-button-container">
        <button 
          className="relative flex items-center justify-center px-4 py-2 min-w-[140px] h-9 rounded-lg font-medium text-xs text-white overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#1199fa] via-[#0e8fe8] to-[#0b85d8] hover:from-[#0d7ac9] hover:via-[#0a80d2] hover:to-[#0970b8] active:from-[#0b6cb2] active:via-[#0972bc] active:to-[#0864a6] shadow-[0_2px_10px_rgba(17,153,250,0.25)] hover:shadow-[0_4px_16px_rgba(17,153,250,0.35)] group backdrop-blur-sm"
          onClick={() => open()}
          disabled={isConnecting}
        >
          {/* Shine effect */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
          
          {/* Button content */}
          <div className="flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
            </svg>
            <span className="font-semibold uppercase tracking-wide text-xs">
              {isConnecting ? 'Connecting...' : 'Connect'}
            </span>
          </div>
          
          {/* Glass effect border */}
          <span className="absolute inset-0 rounded-lg border border-white/10"></span>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[rgba(17,153,250,0.15)] blur-md -z-10"></div>
        </button>
      </div>
    </div>
  )
}
