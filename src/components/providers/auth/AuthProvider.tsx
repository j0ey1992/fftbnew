'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { normalizeAddress } from '@/utils/addressUtils';

/**
 * Authentication context type definition
 * Simplified wallet-based authentication without Firebase
 */
interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  error: string | null;
  userRoles: {
    isAdmin: boolean;
    isProject: boolean;
  };
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  walletAddress: null,
  error: null,
  userRoles: {
    isAdmin: false,
    isProject: false
  },
  logout: async () => {},
  refreshToken: async () => {},
});

/**
 * Hook to use the auth context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Authentication provider component
 * Simplified to use only wallet connection without Firebase
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAppKitAccount();

  // Check if connected wallet is admin
  const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
  const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
  const normalizedCurrentAddress = address ? normalizeAddress(address) : null;
  const isAdmin = normalizedCurrentAddress === normalizedAdminAddress;

  // Simplified logout (just disconnect wallet)
  const logout = async () => {
    // Wallet disconnection is handled by the wallet provider
    console.log('Logout called');
  };

  const refreshToken = async () => {
    // No-op without Firebase
    console.log('Token refresh not needed without Firebase');
  };

  const contextValue: AuthContextType = {
    user: isConnected ? { address } : null,
    isAuthenticated: isConnected,
    isLoading: false,
    walletAddress: address || null,
    error: null,
    userRoles: {
      isAdmin,
      isProject: false,
    },
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
