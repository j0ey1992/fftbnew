'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/providers/auth';
import MainLayout from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { API_BASE_URL, ENDPOINTS } from '@/lib/api/config';
import { getAuth } from 'firebase/auth';

/**
 * Admin user management page
 * Updated to use the new wallet-based authentication system
 */
export default function AdminUsersPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleSetAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get the session token
      const sessionToken = await user.getIdToken();
      
      // Call the new set-admin endpoint
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.SET_ADMIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: btoa(sessionToken), // Base64 encode the token
          targetAddress: walletAddress.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set admin privileges');
      }

      const data = await response.json();
      setResult({
        success: true,
        message: `Successfully granted admin privileges to wallet: ${walletAddress}`
      });
      setWalletAddress(''); // Clear the form on success
    } catch (error) {
      console.error('Error setting admin privileges:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while setting admin privileges'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <GlassCard elevation="raised">
            <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
              <h3 className="text-xl font-bold">Admin User Management</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/admin')}
                >
                  Back to Admin Dashboard
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Grant Admin Privileges</h4>
                  
                  <form onSubmit={handleSetAdmin}>
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="0x..."
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Enter the wallet address to grant admin privileges to
                      </p>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={loading}
                      type="submit"
                    >
                      {loading ? 'Processing...' : 'Grant Admin Privileges'}
                    </Button>
                  </form>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Admin Actions</h4>
                  
                  <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-gray-300 text-sm">
                      Admin users have full access to manage tokens, users, and other system settings.
                      Grant admin privileges only to trusted users.
                    </p>
                  </div>
                  
                  {result && (
                    <div className={`p-4 rounded-lg mb-4 ${result.success ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
                      <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.message}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                      onClick={() => router.push('/admin/tokens')}
                    >
                      Manage Tokens
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    </AdminRoute>
  );
}
