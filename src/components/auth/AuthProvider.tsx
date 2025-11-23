'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  getCurrentUser, 
  onAuthStateChangedListener, 
  refreshAuthToken,
  getCurrentUserIdToken,
  isCurrentUserAdmin
} from '@/lib/auth-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshToken: () => Promise<string | null>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  refreshToken: async () => null,
  checkAdminStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set initial user
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChangedListener(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Check if user is admin
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Function to refresh the token
  const refreshToken = async (): Promise<string | null> => {
    return await refreshAuthToken();
  };
  
  // Function to check admin status
  const checkAdminStatus = async (): Promise<boolean> => {
    const adminStatus = await isCurrentUserAdmin();
    setIsAdmin(adminStatus);
    return adminStatus;
  };
  
  // Refresh token every 30 minutes
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      await refreshToken();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  const value = {
    user,
    loading,
    isAdmin,
    refreshToken,
    checkAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
