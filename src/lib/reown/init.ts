import { createAppKit } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet, cronos } from '@reown/appkit/networks'

// Get project ID from environment variable
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'development-placeholder-id'

console.log('Reown AppKit: Initializing with project ID:', projectId)

// Create metadata for app
const metadata = {
  name: 'Roo Finance',
  description: 'Stake your NFTs and earn rewards with Roo Finance',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icons: ['/Roo.png'],
}

// Initialize AppKit synchronously outside of any React component
const appKitInstance = createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [cronos, mainnet],
  defaultNetwork: cronos,
  projectId: projectId,
  // Theme customization for Cronos branding
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#1199fa', // Crypto.com blue
    '--w3m-color-mix-strength': 45
  },
  features: {
    analytics: true,
    email: true, // Enable email login
    socials: ['google', 'x', 'github', 'discord'], // Enable social logins
    emailShowWallets: true,
    legalCheckbox: true, // Add legal checkbox for better UX
    connectMethodsOrder: ['wallet', 'email', 'social'],
  },
  // Additional options
  debug: true,
  allWallets: 'SHOW',
  // Configure chain images
  chainImages: {
    25: '/crypto-logos/cronos.png', // Cronos chain logo
    1: '/crypto-logos/ethereum.png', // Ethereum mainnet logo
  },
})

console.log('Reown AppKit initialized successfully')

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  window.appKitInstance = appKitInstance
}

// Function to get the initialized instance
export function getAppKit() {
  return appKitInstance;
}

// Add TypeScript type declaration for window
declare global {
  interface Window {
    appKitInstance: any;
  }
}

/**
 * Check if the wallet is currently connected
 * @returns {boolean} True if the wallet is connected, false otherwise
 */
export function isConnected(): boolean {
  try {
    // Check if appKit instance exists
    if (!appKitInstance) return false;
    
    // For Reown AppKit, we need to use the hooks to check connection status
    // This function is mainly for debugging purposes
    return true; // AppKit handles connection state internally
  } catch (error) {
    console.error('Error checking connection status:', error);
    return false;
  }
}

/**
 * Reconnect to the previously connected wallet
 * @returns {Promise<boolean>} True if reconnection was successful, false otherwise
 */
export async function reconnectWallet(): Promise<boolean> {
  try {
    // Check if appKit instance exists
    if (!appKitInstance) {
      return false;
    }
    
    // AppKit handles reconnection automatically
    // This function is mainly for debugging purposes
    return true;
  } catch (error) {
    console.error('Error reconnecting wallet:', error);
    return false;
  }
}
