'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { normalizeAddress } from '@/utils/addressUtils';

/**
 * Higher-order component to protect admin routes
 * Updated to work with the new simplified wallet-based authentication
 */
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, userRoles, isLoading, isAuthenticated, walletAddress, error } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if this is the admin wallet address
  const isAdminWalletAddress = useCallback(() => {
    if (!walletAddress) return false;
    
    const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
    const normalizedAdminAddress = normalizeAddress(adminWalletAddress);
    const normalizedCurrentAddress = normalizeAddress(walletAddress);
    
    return normalizedCurrentAddress === normalizedAdminAddress;
  }, [walletAddress]);

  useEffect(() => {
    // Log authentication state for debugging
    console.log('AdminRoute - Auth State:', {
      isLoading,
      isAuthenticated,
      user: !!user,
      walletAddress,
      isAdmin: userRoles.isAdmin,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });

    // Only proceed if loading is complete
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log('AdminRoute - No user found, redirecting to login');
        setAuthError('Please connect your wallet to access the admin panel');
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else if (!userRoles.isAdmin && !isAdminWalletAddress()) {
        console.log('AdminRoute - User is not an admin, redirecting to login');
        setAuthError('You do not have admin privileges');
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        console.log('AdminRoute - User is authenticated and is an admin');
        setAuthError(null);
      }
      
      setAuthChecked(true);
    }
  }, [user, userRoles.isAdmin, isLoading, isAuthenticated, walletAddress, router, error, isAdminWalletAddress]);

  // Show loading indicator while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Verifying admin access...</p>
      </div>
    );
  }

  // Show error message if there's an auth error
  if (authError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-6 py-4 rounded-lg relative max-w-md backdrop-blur-sm">
          <strong className="font-bold">Authentication Error:</strong>
          <span className="block sm:inline"> {authError}</span>
          <p className="mt-2 text-gray-300">Redirecting to login page...</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show error message if there's an auth hook error
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-400 px-6 py-4 rounded-lg relative max-w-md backdrop-blur-sm">
          <strong className="font-bold">Authentication Issue:</strong>
          <span className="block sm:inline"> {error}</span>
          <div className="mt-4">
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Allow access if user is admin or has admin wallet address
  if (userRoles.isAdmin || isAdminWalletAddress()) {
    return <>{children}</>;
  }

  // Fallback - should not normally reach here
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-300">Checking admin permissions...</p>
    </div>
  );
}
