'use client'

import { createContext, useContext, ReactNode, useState } from 'react';

/**
 * Simplified Authentication context type definition
 * Placeholder for when authentication is needed
 */
interface AuthContextType {
  user: null;
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
 * Simplified Authentication provider component
 * Placeholder provider - no actual authentication
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRoles] = useState({
    isAdmin: false,
    isProject: false,
  });

  // Simplified context value - no authentication
  const contextValue: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    walletAddress: null,
    error: null,
    userRoles,
    logout: async () => {},
    refreshToken: async () => {},
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
