'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Submission } from '@/types/submission';
import { API_BASE_URL, ENDPOINTS } from '@/lib/api/config';
import '@/styles/components/CryptoComInspired.css';

interface VerificationDashboardProps {
  projectId: string;
  onVerificationUpdate?: () => void;
}

interface VerificationStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  averageTime: number;
  todayProcessed: number;
}

export const VerificationDashboard: React.FC<VerificationDashboardProps> = ({
  projectId,
  onVerificationUpdate
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);
  
  if (!projectId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No project selected</p>
      </div>
    );
  }

  useEffect(() => {
    if (projectId) {
      fetchSubmissions();
    }
  }, [projectId, filterStatus]);

  // Fetch stats after submissions are loaded
  useEffect(() => {
    if (!loading) {
      fetchStats();
    }
  }, [submissions, loading]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Get auth headers
      const authModule = await import('@/lib/api/auth');
      const authHeaders = await authModule.getAuthHeaders();
      
      const endpoint = filterStatus === 'all' 
        ? `${API_BASE_URL}${ENDPOINTS.PARTNERS.PROJECT_SUBMISSIONS(projectId)}`
        : `${API_BASE_URL}${ENDPOINTS.PARTNERS.PROJECT_SUBMISSIONS(projectId)}?status=${filterStatus}`;
      
      const response = await fetch(endpoint, {
        headers: authHeaders
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch submissions: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle both direct array response and wrapped response
      const submissionsData = Array.isArray(data) ? data : (data.submissions || []);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Since the analytics endpoint might not exist, calculate stats from submissions
      const allSubmissions = submissions;
      
      if (allSubmissions.length === 0) {
        // Fetch all submissions to calculate stats
        const authModule = await import('@/lib/api/auth');
        const authHeaders = await authModule.getAuthHeaders();
        
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PARTNERS.PROJECT_SUBMISSIONS(projectId)}`, {
          headers: authHeaders
        });
        
        if (response.ok) {
          const data = await response.json();
          const allSubs = Array.isArray(data) ? data : (data.submissions || []);
          
          // Calculate stats from submissions
          const stats: VerificationStats = {
            total: allSubs.length,
            pending: allSubs.filter((s: any) => s.status === 'pending').length,
            verified: allSubs.filter((s: any) => s.status === 'verified' || s.status === 'approved').length,
            rejected: allSubs.filter((s: any) => s.status === 'rejected').length,
            averageTime: 24, // Default to 24 hours
            todayProcessed: allSubs.filter((s: any) => {
              const submittedDate = new Date(s.submittedAt || s.createdAt);
              const today = new Date();
              return submittedDate.toDateString() === today.toDateString();
            }).length
          };
          
          setStats(stats);
        }
      } else {
        // Calculate stats from current submissions
        const stats: VerificationStats = {
          total: allSubmissions.length,
          pending: allSubmissions.filter(s => s.status === 'pending').length,
          verified: allSubmissions.filter(s => s.status === 'verified' || s.status === 'approved').length,
          rejected: allSubmissions.filter(s => s.status === 'rejected').length,
          averageTime: 24, // Default to 24 hours
          todayProcessed: allSubmissions.filter(s => {
            const submittedDate = new Date(s.submittedAt || s.createdAt);
            const today = new Date();
            return submittedDate.toDateString() === today.toDateString();
          }).length
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
      // Set default stats
      setStats({
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
        averageTime: 0,
        todayProcessed: 0
      });
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    const filteredSubmissions = submissions.filter(s => s.status === 'pending');
    setSelectedSubmissions(
      selectedSubmissions.length === filteredSubmissions.length
        ? []
        : filteredSubmissions.map(s => s.id)
    );
  };

  const handleBulkVerification = async () => {
    if (!bulkAction || selectedSubmissions.length === 0) return;

    setProcessing(true);
    try {
      // Since bulk verification endpoint might not exist, process individually
      const authModule = await import('@/lib/api/auth');
      const authHeaders = await authModule.getAuthHeaders();
      
      let successCount = 0;
      const errors: string[] = [];
      
      // Process each submission individually
      for (const submissionId of selectedSubmissions) {
        try {
          const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PARTNERS.REVIEW_SUBMISSION(submissionId)}`, {
            method: 'PATCH',
            headers: {
              ...authHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: bulkAction === 'approve' ? 'approved' : 'rejected',
              feedback: `Bulk ${bulkAction}`
            })
          });
          
          if (response.ok) {
            successCount++;
          } else {
            errors.push(`Failed to ${bulkAction} submission ${submissionId}`);
          }
        } catch (error) {
          console.error(`Error processing submission ${submissionId}:`, error);
          errors.push(`Error processing submission ${submissionId}`);
        }
      }
      
      if (successCount > 0) {
        toast.success(
          `Successfully ${bulkAction}d ${successCount} of ${selectedSubmissions.length} submissions`
        );
      }
      
      if (errors.length > 0) {
        console.error('Bulk verification errors:', errors);
      }
      
      setSelectedSubmissions([]);
      setBulkAction(null);
      fetchSubmissions();
      fetchStats();
      
      if (onVerificationUpdate) {
        onVerificationUpdate();
      }
    } catch (error) {
      console.error('Bulk verification error:', error);
      toast.error('Failed to process bulk verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleIndividualVerification = async (
    submissionId: string,
    action: 'approve' | 'reject',
    note?: string
  ) => {
    try {
      const authModule = await import('@/lib/api/auth');
      const authHeaders = await authModule.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PARTNERS.REVIEW_SUBMISSION(submissionId)}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          feedback: note
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Verification failed');
      }

      toast.success(`Submission ${action}d successfully`);
      fetchSubmissions();
      fetchStats();
      
      if (onVerificationUpdate) {
        onVerificationUpdate();
      }
    } catch (error) {
      console.error('Individual verification error:', error);
      toast.error('Failed to verify submission');
    }
  };

  const exportSubmissions = async () => {
    try {
      // Since export endpoint might not exist, create CSV client-side
      if (submissions.length === 0) {
        toast.error('No submissions to export');
        return;
      }
      
      // Create CSV content
      const headers = ['ID', 'User', 'Quest', 'Status', 'Submitted Date', 'Proof Link'];
      const rows = submissions.map(submission => [
        submission.id,
        submission.walletAddress || submission.userId || 'Unknown',
        submission.questTitle || submission.questId,
        submission.status,
        new Date(submission.submittedAt || submission.createdAt).toISOString(),
        submission.proofLink || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${filterStatus}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Submissions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export submissions');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <h3 className="text-sm text-gray-400 mb-1">Total Submissions</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <h3 className="text-sm text-gray-400 mb-1">Pending Review</h3>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <h3 className="text-sm text-gray-400 mb-1">Approval Rate</h3>
            <p className="text-2xl font-bold text-green-400">
              {stats.total > 0 
                ? ((stats.verified / stats.total) * 100).toFixed(1)
                : 0}%
            </p>
          </GlassCard>
          
          <GlassCard className="p-4">
            <h3 className="text-sm text-gray-400 mb-1">Avg. Review Time</h3>
            <p className="text-2xl font-bold">{stats.averageTime}h</p>
          </GlassCard>
        </div>
      )}

      {/* Verification Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Submission Verification</h2>
          
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="crypto-select"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            
            {/* Export Button */}
            <Button
              onClick={exportSubmissions}
              variant="outline"
              className="crypto-button"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSubmissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {selectedSubmissions.length} submission(s) selected
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setBulkAction('approve');
                    handleBulkVerification();
                  }}
                  disabled={processing}
                  className="crypto-button crypto-button-primary"
                  size="sm"
                >
                  Approve All
                </Button>
                
                <Button
                  onClick={() => {
                    setBulkAction('reject');
                    handleBulkVerification();
                  }}
                  disabled={processing}
                  variant="outline"
                  className="crypto-button"
                  size="sm"
                >
                  Reject All
                </Button>
                
                <button
                  onClick={() => setSelectedSubmissions([])}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={
                      submissions.filter(s => s.status === 'pending').length > 0 &&
                      selectedSubmissions.length === submissions.filter(s => s.status === 'pending').length
                    }
                    onChange={handleSelectAll}
                    className="crypto-checkbox"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-gray-400">Quest</th>
                <th className="text-left py-3 px-4 text-gray-400">Submitted</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-400">Proof</th>
                <th className="text-right py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 px-4">
                      {submission.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(submission.id)}
                          onChange={() => handleSelectSubmission(submission.id)}
                          className="crypto-checkbox"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="font-medium">
                          {submission.walletAddress || submission.userId 
                            ? `${(submission.walletAddress || submission.userId).slice(0, 6)}...${(submission.walletAddress || submission.userId).slice(-4)}`
                            : 'Unknown'
                          }
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{submission.questTitle || submission.questId.slice(0, 8)}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {submission.proofLink && (
                        <a
                          href={submission.proofLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Proof
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {submission.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleIndividualVerification(submission.id, 'approve')}
                            className="text-green-400 hover:text-green-300"
                            title="Approve"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleIndividualVerification(submission.id, 'reject')}
                            className="text-red-400 hover:text-red-300"
                            title="Reject"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};