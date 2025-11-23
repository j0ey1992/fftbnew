'use client'

import { useEffect, useState } from 'react';
import { initializeDefaultVVSPairs } from './vvs-pairs';
import { useAuth } from '@/components/providers/auth';

/**
 * Hook to initialize Firebase data
 * This should be used in a client component that loads early in the application
 */
export const useInitializeFirebaseData = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userRoles, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) {
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Only initialize data if user is authenticated and has admin privileges
        if (user && userRoles.isAdmin) {
          // Initialize VVS pairs
          await initializeDefaultVVSPairs();
          
          setInitialized(true);
          console.log('Firebase data initialized successfully');
        } else {
          console.log('Skipping Firebase data initialization: User not authenticated or not admin');
        }
      } catch (err) {
        console.error('Error initializing Firebase data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error initializing Firebase data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, userRoles.isAdmin, authLoading]);

  return { initialized, error, loading };
};

/**
 * Component to initialize Firebase data
 * This can be added to the application layout or a provider component
 */
export const FirebaseDataInitializer: React.FC = () => {
  const { initialized, error, loading } = useInitializeFirebaseData();
  
  // This component doesn't render anything visible
  return null;
};

export default FirebaseDataInitializer;
