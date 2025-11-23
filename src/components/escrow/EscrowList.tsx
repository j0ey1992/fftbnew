import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEscrow } from '@/hooks/useEscrow';
import { EscrowRecord } from '@/lib/api/endpoints/quests';
import { formatDate } from '@/lib/dateUtils';
import { toast } from '@/components/ui/Toast';
import EscrowDetailModal from './EscrowDetailModal';

interface EscrowListProps {
  userId?: string;
  projectId?: string;
  onVerificationSubmitted?: () => void;
}

export default function EscrowList({ userId, projectId, onVerificationSubmitted }: EscrowListProps) {
  const { getUserEscrowRecords, loading, loadingState, error } = useEscrow();
  
  // Component state
  const [escrowRecords, setEscrowRecords] = useState<EscrowRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EscrowRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EscrowRecord | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Load escrow records
  useEffect(() => {
    const fetchEscrowRecords = async () => {
      try {
        const records = await getUserEscrowRecords();
        setEscrowRecords(records);
      } catch (err: any) {
        console.error('Error fetching escrow records:', err);
        
        // Provide more specific error messages based on error type
        if (err.status === 401 || err.status === 403) {
          toast.error('Authentication error. Please sign in again and try again.');
        } else if (err.status === 404) {
          toast.error('Escrow records endpoint not found. Please contact support.');
        } else if (err.status === 500) {
          toast.error('Server error while loading escrow records. Please try again later.');
        } else {
          toast.error(`Failed to load escrow records: ${err.message || 'Unknown error'}`);
        }
      }
    };
    
    fetchEscrowRecords();
  }, [getUserEscrowRecords]);
  
  // Filter records when filter or records change
  useEffect(() => {
    if (filter === 'all') {
      setFilteredRecords(escrowRecords);
    } else {
      setFilteredRecords(escrowRecords.filter(record => record.status === filter));
    }
    
    // If projectId is provided, filter by project
    if (projectId) {
      setFilteredRecords(prev => 
        prev.filter(record => 
          record.questDetails && 
          record.questId.includes(projectId)
        )
      );
    }
    
    // If userId is provided, filter by user
    if (userId) {
      setFilteredRecords(prev => prev.filter(record => record.userId === userId));
    }
  }, [escrowRecords, filter, projectId, userId]);
  
  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  // Handle view record details
  const handleViewRecord = (record: EscrowRecord) => {
    setSelectedRecord(record);
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    setSelectedRecord(null);
  };
  
  // Handle verification submitted
  const handleVerificationSubmitted = () => {
    // Refresh the list
    getUserEscrowRecords()
      .then(records => {
        setEscrowRecords(records);
        if (onVerificationSubmitted) {
          onVerificationSubmitted();
        }
        toast.success('Escrow records refreshed successfully');
      })
      .catch(err => {
        console.error('Error refreshing escrow records:', err);
        toast.error('Failed to refresh escrow records. Please try again.');
      });
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'verified':
        return 'bg-blue-500/20 text-blue-300';
      case 'released':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex border-b border-gray-700/30">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'all'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('pending')}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'pending'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => handleFilterChange('verified')}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'verified'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Verified
        </button>
        <button
          onClick={() => handleFilterChange('released')}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'released'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Released
        </button>
        <button
          onClick={() => handleFilterChange('rejected')}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'rejected'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Rejected
        </button>
      </div>
      
      {/* Escrow Records List */}
      {loadingState === 'loading' ? (
        <div className="flex flex-col justify-center items-center py-8 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-400">Loading escrow records...</p>
        </div>
      ) : error || localError ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg space-y-3">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error || localError}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setLocalError(null);
                getUserEscrowRecords().then(records => {
                  setEscrowRecords(records);
                }).catch(err => {
                  console.error('Error retrying escrow records fetch:', err);
                  setLocalError(err.message || 'Failed to load escrow records');
                });
              }}
              className="px-3 py-1 bg-red-600/30 text-red-300 text-sm rounded hover:bg-red-600/50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No {filter !== 'all' ? filter : ''} escrow records found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map(record => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0a1e3d]/50 border border-blue-500/20 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {record.questTitle || 'Unknown Quest'}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-1">
                    Reward: {record.amount} {record.tokenType}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {record.createdAt && formatDate(record.createdAt)}
                  </p>
                </div>
                
                <button
                  onClick={() => handleViewRecord(record)}
                  className="px-3 py-1 bg-blue-600/30 text-blue-300 text-sm rounded hover:bg-blue-600/50 transition-colors"
                >
                  {record.status === 'pending' ? 'Submit Verification' : 'View Details'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Escrow Detail Modal */}
      {selectedRecord && (
        <EscrowDetailModal
          escrowRecord={selectedRecord}
          onClose={handleCloseModal}
          onVerificationSubmitted={handleVerificationSubmitted}
        />
      )}
    </div>
  );
}