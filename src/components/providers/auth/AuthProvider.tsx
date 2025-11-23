'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useReownAuth } from '@/hooks/useReownAuth';
import { normalizeAddress } from '@/utils/addressUtils';

/**
 * Authentication context type definition
 * Updated to use the new simplified wallet-based authentication
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
  isLoading: true,
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
 * Updated to use the new simplified wallet-based authentication flow
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use the new simplified authentication hook
  const auth = useReownAuth();
  const [userRoles, setUserRoles] = useState({
    isAdmin: false,
    isProject: false,
  });

  // Get user roles from Firebase custom claims
  useEffect(() => {
    const getUserRoles = async () => {
      if (auth.user) {
        try {
          // Get the ID token result to access custom claims
          const idTokenResult = await auth.user.getIdTokenResult();
          const claims = idTokenResult.claims;
          
          // Check if this is the admin wallet address
          const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
          const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
          const normalizedCurrentAddress = auth.walletAddress ? normalizeAddress(auth.walletAddress) : null;
          const isAdminWallet = normalizedCurrentAddress === normalizedAdminAddress;
          
          // Set roles based on claims or admin wallet address
          setUserRoles({
            isAdmin: !!claims.admin || isAdminWallet,
            isProject: !!claims.project,
          });
          
          console.log('AuthProvider - User roles updated:', {
            adminClaim: claims.admin,
            projectClaim: claims.project,
            isAdminWallet,
            finalRoles: {
              isAdmin: !!claims.admin || isAdminWallet,
              isProject: !!claims.project,
            },
            walletAddress: auth.walletAddress,
            normalizedWalletAddress: normalizedCurrentAddress,
          });
        } catch (error) {
          console.error('Error getting user roles:', error);
          setUserRoles({
            isAdmin: false,
            isProject: false,
          });
        }
      } else {
        setUserRoles({
          isAdmin: false,
          isProject: false,
        });
      }
    };

    getUserRoles();
  }, [auth.user, auth.walletAddress]);

  // Function to refresh Firebase token and update user roles
  const refreshToken = async () => {
    if (auth.user) {
      try {
        console.log('AuthProvider - Refreshing Firebase token...');
        // Force refresh the ID token
        await auth.user.getIdToken(true);
        
        // Get updated token result with fresh claims
        const idTokenResult = await auth.user.getIdTokenResult();
        const claims = idTokenResult.claims;
        
        // Check if this is the admin wallet address
        const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
        const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
        const normalizedCurrentAddress = auth.walletAddress ? normalizeAddress(auth.walletAddress) : null;
        const isAdminWallet = normalizedCurrentAddress === normalizedAdminAddress;
        
        // Update roles with fresh claims
        setUserRoles({
          isAdmin: !!claims.admin || isAdminWallet,
          isProject: !!claims.project,
        });
        
        console.log('AuthProvider - Token refreshed, roles updated:', {
          adminClaim: claims.admin,
          projectClaim: claims.project,
          isAdminWallet,
          finalRoles: {
            isAdmin: !!claims.admin || isAdminWallet,
            isProject: !!claims.project,
          },
        });
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  };

  // Transform the auth data to match the expected interface
  const contextValue: AuthContextType = {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    walletAddress: auth.walletAddress || null,
    error: auth.error,
    userRoles,
    logout: auth.logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
