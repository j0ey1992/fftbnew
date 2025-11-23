'use client';

import React, { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/providers/auth';
import MainLayout from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
// Remove Table import as we'll use plain HTML table
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
// We'll use a simple date formatter instead of date-fns
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

// Custom icon components
const DollarSign = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Copy = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Send = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ExternalLink = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

interface Payout {
  id: string;
  userId: string;
  questId: string;
  questTitle: string;
  recipientAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  amount: string;
  network: string;
  status: 'pending_payout' | 'completed' | 'rejected';
  transactionHash?: string;
  createdAt: string;
  userDetails?: {
    displayName: string;
    email: string;
    walletAddress: string;
  };
}

interface PayoutStats {
  total: number;
  pending: number;
  completed: number;
  rejected: number;
  totalValue: {
    pending: number;
    completed: number;
    rejected: number;
  };
  byToken: {
    [key: string]: {
      total: number;
      pending: number;
      completed: number;
      rejected: number;
    };
  };
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, []);

  const fetchPayouts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payouts/pending`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch payouts');

      const data = await response.json();
      setPayouts(data.payouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payouts/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getAuthToken = async () => {
    const auth = await import('@/lib/api/auth');
    return auth.getAuthToken();
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout || !transactionHash) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/payouts/${selectedPayout.id}/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify({
            transactionHash,
            network: selectedPayout.network
          })
        }
      );

      if (!response.ok) throw new Error('Failed to process payout');

      toast.success('Payout processed successfully!');
      setShowProcessModal(false);
      setTransactionHash('');
      fetchPayouts();
      fetchStats();
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.error('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayout = async () => {
    if (!selectedPayout || !rejectReason) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/payouts/${selectedPayout.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify({
            reason: rejectReason,
            refundSubmission: true
          })
        }
      );

      if (!response.ok) throw new Error('Failed to reject payout');

      toast.success('Payout rejected');
      setShowRejectModal(false);
      setRejectReason('');
      fetchPayouts();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting payout:', error);
      toast.error('Failed to reject payout');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payout':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getExplorerUrl = (network: string, txHash: string) => {
    const explorers: { [key: string]: string } = {
      cronos: 'https://cronoscan.com/tx/',
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
      bsc: 'https://bscscan.com/tx/'
    };
    return explorers[network] ? `${explorers[network]}${txHash}` : '#';
  };

  return (
    <AdminRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reward Payouts</h1>
          <p className="text-gray-400">Manage and process manual token reward payouts</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400">Total Payouts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Payouts Table */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6">Pending Payouts</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Quest</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Recipient</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{payout.userDetails?.displayName || 'Unknown'}</p>
                        <p className="text-sm text-gray-400">{payout.userDetails?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{payout.questTitle}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{payout.amount} {payout.tokenSymbol}</p>
                        <p className="text-xs text-gray-400">{payout.network}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{payout.recipientAddress.slice(0, 6)}...{payout.recipientAddress.slice(-4)}</code>
                        <button
                          onClick={() => copyToClipboard(payout.recipientAddress)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payout.status)}
                        <span className="capitalize">{payout.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-400">
                        {formatTimeAgo(payout.createdAt)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowProcessModal(true);
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Process
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowRejectModal(true);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payouts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No pending payouts</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Process Modal */}
        {showProcessModal && selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowProcessModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full max-w-md"
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Process Payout</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="font-medium">{selectedPayout.amount} {selectedPayout.tokenSymbol}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Recipient</p>
                    <code className="text-sm">{selectedPayout.recipientAddress}</code>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Network</p>
                    <p className="capitalize">{selectedPayout.network}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Transaction Hash
                    </label>
                    <input
                      type="text"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleProcessPayout}
                    disabled={!transactionHash || processing}
                    className="flex-1"
                  >
                    {processing ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProcessModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowRejectModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full max-w-md"
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Reject Payout</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Payout Details</p>
                    <p className="font-medium">
                      {selectedPayout.amount} {selectedPayout.tokenSymbol} to{' '}
                      {selectedPayout.recipientAddress.slice(0, 6)}...{selectedPayout.recipientAddress.slice(-4)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRejectPayout}
                    disabled={!rejectReason || processing}
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    {processing ? 'Rejecting...' : 'Reject Payout'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
    </AdminRoute>
  );
}