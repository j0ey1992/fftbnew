import React, { createContext, useContext, ReactNode } from 'react';
import { useReownAuth } from '@/hooks/useReownAuth';
import { User } from 'firebase/auth';

/**
 * Auth context type definition
 */
interface AuthContextType {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: User | null;
  walletAddress?: string;
  isWalletConnected: boolean;
  logout: () => Promise<void>;
}

// Create context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * 
 * Wraps the application with authentication context using the useReownAuth hook
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Use our custom hook for authentication logic
  const auth = useReownAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 * 
 * @returns Authentication context values
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component to protect routes that require authentication
 * 
 * @param Component The component to wrap with authentication protection
 * @returns A new component that includes authentication checks
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please connect your wallet to access this page.</p>
          <ConnectWalletButton />
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

/**
 * Simple connect wallet button component
 */
function ConnectWalletButton() {
  const { open } = useAppKit();
  
  return (
    <button
      onClick={() => open()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  );
}

// Add missing import at the top
import { useAppKit } from '@reown/appkit/react';
