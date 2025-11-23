'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit } from '@reown/appkit/react';
import { useAuth } from '@/components/providers/auth';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { normalizeAddress } from '@/utils/addressUtils';

// Force dynamic rendering to avoid Firebase auth errors during build
export const dynamic = 'force-dynamic';

/**
 * Admin login page
 * Updated to use the new simplified wallet-based authentication flow
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const appKit = useAppKit();
  const { user, userRoles, isLoading, walletAddress, error } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && user && (userRoles.isAdmin || isAdminWallet())) {
      router.push('/admin');
    }
  }, [user, userRoles.isAdmin, isLoading, router, walletAddress]);

  // Check if this is the admin wallet address
  const isAdminWallet = () => {
    if (!walletAddress) return false;
    const adminWalletAddress = '0xd3ebf04f76b67e47093bddd8b14f9090f1c80976';
    return normalizeAddress(walletAddress) === normalizeAddress(adminWalletAddress);
  };

  const handleConnectWallet = async () => {
    try {
      console.log('Admin Login: Opening wallet connection modal');
      await appKit.open();
    } catch (err) {
      console.error('Failed to open wallet connection:', err);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto">
          <GlassCard elevation="raised">
            <div className="p-6 text-center">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Checking authentication...</p>
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <GlassCard elevation="raised">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Admin Login</h3>
            <p className="text-gray-400 text-sm mt-1">Connect your wallet to access admin features</p>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {walletAddress ? (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-800 rounded-lg">
                <p className="text-blue-400 text-sm font-medium">Connected Wallet:</p>
                <p className="text-gray-300 text-xs font-mono mt-1 break-all">{walletAddress}</p>
                {userRoles.isAdmin || isAdminWallet() ? (
                  <p className="text-green-400 text-sm mt-2 font-medium">
                    ✓ Admin access granted
                  </p>
                ) : (
                  <p className="text-red-400 text-sm mt-2">
                    This wallet does not have admin privileges.
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-gray-300 text-sm">
                  Connect your wallet to access the admin interface. Only wallets with admin privileges can access this area.
                </p>
              </div>
            )}
            
            {!walletAddress ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            ) : (userRoles.isAdmin || isAdminWallet()) ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/admin')}
              >
                Access Admin Dashboard
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleConnectWallet}
                >
                  Connect Different Wallet
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/')}
                >
                  Return to App
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
}
