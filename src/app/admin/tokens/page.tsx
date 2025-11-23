'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/providers/auth';
import { 
  getAllVVSPairs, 
  toggleVVSPairStatus, 
  deleteVVSPair, 
  VVSPair,
  signOutUser
} from '@/lib/firebase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { TokenFormModal } from './';

/**
 * Admin token management page
 * Protected by AdminRoute to ensure only admins can access
 */
export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<VVSPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingToken, setEditingToken] = useState<VVSPair | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all tokens
  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTokens = await getAllVVSPairs();
      setTokens(fetchedTokens);
    } catch (err: any) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTokens();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/admin/login');
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError('Failed to sign out: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle token status toggle
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleVVSPairStatus(id, !currentStatus);
      
      // Update local state
      setTokens(tokens.map(token => 
        token.id === id ? { ...token, enabled: !currentStatus } : token
      ));
    } catch (err: any) {
      console.error('Error toggling token status:', err);
      setError('Failed to update token status: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle token deletion
  const handleDeleteToken = async (id: string) => {
    try {
      await deleteVVSPair(id);
      
      // Update local state
      setTokens(tokens.filter(token => token.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('Error deleting token:', err);
      setError('Failed to delete token: ' + (err.message || 'Unknown error'));
    }
  };

  // Open modal to add new token
  const handleAddToken = () => {
    setEditingToken(null);
    setShowModal(true);
  };

  // Open modal to edit existing token
  const handleEditToken = (token: VVSPair) => {
    setEditingToken(token);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = (tokenUpdated: boolean) => {
    setShowModal(false);
    setEditingToken(null);
    
    // Refresh token list if a token was added or updated
    if (tokenUpdated) {
      fetchTokens();
    }
  };

  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <GlassCard elevation="raised">
            <div className="p-5 bg-[#0a0f1f] text-white flex justify-between items-center border-b border-white/5">
              <h3 className="text-xl font-bold">VVS Token Pair Management</h3>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="mb-6 flex justify-end">
                <Button variant="primary" size="md" onClick={handleAddToken}>
                  Add New Token
                </Button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No tokens found. Add your first token to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800/50 text-left">
                        <th className="p-3 text-gray-300">Name</th>
                        <th className="p-3 text-gray-300">Symbol</th>
                        <th className="p-3 text-gray-300">Address</th>
                        <th className="p-3 text-gray-300">Decimals</th>
                        <th className="p-3 text-gray-300">Status</th>
                        <th className="p-3 text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map(token => (
                        <tr key={token.id} className="border-b border-gray-700/30">
                          <td className="p-3 text-white">{token.name}</td>
                          <td className="p-3 text-white">{token.symbol}</td>
                          <td className="p-3 text-gray-400 text-sm">
                            {token.address === 'NATIVE' ? 'NATIVE' : 
                              `${token.address.substring(0, 6)}...${token.address.substring(token.address.length - 4)}`
                            }
                          </td>
                          <td className="p-3 text-white">{token.decimals}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              token.enabled ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                            }`}>
                              {token.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3">
                            {deleteConfirmId === token.id ? (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleDeleteToken(token.id)}
                                  className="px-3 py-1 rounded text-xs bg-red-900/50 text-red-400"
                                >
                                  Confirm
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-3 py-1 rounded text-xs bg-gray-800/50 text-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleToggleStatus(token.id, token.enabled)}
                                  className={`px-3 py-1 rounded text-xs ${
                                    token.enabled ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                                  }`}
                                >
                                  {token.enabled ? 'Disable' : 'Enable'}
                                </button>
                                <button 
                                  onClick={() => handleEditToken(token)}
                                  className="px-3 py-1 rounded text-xs bg-blue-900/30 text-blue-400"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmId(token.id)}
                                  className="px-3 py-1 rounded text-xs bg-red-900/30 text-red-400"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
        
        {/* Token Form Modal */}
        {showModal && (
          <TokenFormModal 
            token={editingToken} 
            onClose={handleModalClose} 
          />
        )}
      </MainLayout>
    </AdminRoute>
  );
}
