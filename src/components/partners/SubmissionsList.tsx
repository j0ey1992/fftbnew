import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePartners } from '@/hooks/usePartners';
import { Submission } from '@/types/submission';
import { toast } from '@/components/ui/Toast';
import { formatDate } from '../../lib/dateUtils';

interface SubmissionsListProps {
  projectId: string;
  onReviewComplete?: () => void;
}

export default function SubmissionsList({ projectId, onReviewComplete }: SubmissionsListProps) {
  const { getPartnerProjectSubmissions, reviewSubmission, loading, error } = usePartners();
  
  // Component state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState('pending');
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Load submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await getPartnerProjectSubmissions(projectId);
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        toast.error('Failed to load submissions');
      }
    };
    
    fetchSubmissions();
  }, [projectId, getPartnerProjectSubmissions]);
  
  // Filter submissions when filter or submissions change
  useEffect(() => {
    if (filter === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(s => s.status === filter));
    }
  }, [submissions, filter]);
  
  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  // Handle view submission details
  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };
  
  // Handle approving a submission
  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    try {
      setIsReviewing(true);
      const result = await reviewSubmission(selectedSubmission.id, 'approved', feedback);
      
      // Update local state
      if (result) {
        // Refresh submissions
        const updatedSubmissions = await getPartnerProjectSubmissions(projectId);
        setSubmissions(updatedSubmissions);
      }
      
      // Close modal
      setSelectedSubmission(null);
      setFeedback('');
      
      // Notify success
      toast.success('Submission approved successfully');
      
      if (onReviewComplete) {
        onReviewComplete();
      }
    } catch (err: any) {
      console.error('Error approving submission:', err);
      toast.error(err.message || 'Failed to approve submission');
    } finally {
      setIsReviewing(false);
    }
  };
  
  // Handle rejecting a submission
  const handleReject = async () => {
    if (!selectedSubmission) return;
    
    if (!feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }
    
    try {
      setIsReviewing(true);
      const result = await reviewSubmission(selectedSubmission.id, 'rejected', feedback);
      
      // Update local state
      if (result) {
        // Refresh submissions
        const updatedSubmissions = await getPartnerProjectSubmissions(projectId);
        setSubmissions(updatedSubmissions);
      }
      
      // Close modal
      setSelectedSubmission(null);
      setFeedback('');
      
      // Notify success
      toast.success('Submission rejected with feedback');
      
      if (onReviewComplete) {
        onReviewComplete();
      }
    } catch (err: any) {
      console.error('Error rejecting submission:', err);
      toast.error(err.message || 'Failed to reject submission');
    } finally {
      setIsReviewing(false);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'approved':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  // Render submission proof content
  const renderSubmissionContent = (submission: Submission) => {
    if (!submission.proofLink) return <p className="text-gray-400">No proof available</p>;
    
    try {
      // Determine proof type from requirement type
      let proofType = 'unknown';
      
      if (submission.requirementType) {
        if (submission.requirementType.includes('image')) {
          proofType = 'image';
        } else if (submission.requirementType.includes('link')) {
          proofType = 'link';
        } else if (submission.requirementType.includes('transaction')) {
          proofType = 'transaction';
        } else if (submission.requirementType.includes('text')) {
          proofType = 'text';
        }
      }
      
      // Check if the proof link appears to be an image URL
      if (proofType === 'unknown' && /\.(jpg|jpeg|png|gif|webp)$/i.test(submission.proofLink)) {
        proofType = 'image';
      }
      
      // Check if it appears to be a transaction hash
      if (proofType === 'unknown' && /^0x[a-fA-F0-9]{64}$/.test(submission.proofLink)) {
        proofType = 'transaction';
      }
      
      switch (proofType) {
        case 'image':
          return (
            <div className="mt-2">
              <img
                src={submission.proofLink}
                alt="Submission proof"
                className="max-w-full h-auto max-h-96 rounded-lg border border-gray-700"
              />
            </div>
          );
        case 'transaction':
          return (
            <div className="mt-2">
              <p className="text-gray-300 mb-1">Transaction Hash:</p>
              <a
                href={`https://cronoscan.com/tx/${submission.proofLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                {submission.proofLink}
              </a>
            </div>
          );
        case 'link':
        default:
          return (
            <div className="mt-2">
              <a
                href={submission.proofLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                {submission.proofLink}
              </a>
            </div>
          );
      }
    } catch (err) {
      console.error('Error displaying proof:', err);
      return (
        <div className="mt-2">
          <p className="text-gray-400">Error displaying proof</p>
          <pre className="text-white text-sm whitespace-pre-wrap bg-[#041836]/60 p-4 rounded-lg border border-gray-700 overflow-x-auto">
            {submission.proofLink}
          </pre>
        </div>
      );
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
          onClick={() => handleFilterChange('approved')}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'approved'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Approved
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
      
      {/* Submissions List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          Failed to load submissions. Please try again.
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No {filter !== 'all' ? filter : ''} submissions found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map(submission => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0a1e3d]/50 border border-blue-500/20 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {submission.walletAddress.substring(0, 8)}...{submission.walletAddress.substring(submission.walletAddress.length - 6)}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Quest: {submission.questTitle || 'Unknown Quest'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {submission.submittedAt && formatDate(submission.submittedAt)}
                  </p>
                </div>
                
                <button
                  onClick={() => handleViewSubmission(submission)}
                  className="px-3 py-1 bg-blue-600/30 text-blue-300 text-sm rounded hover:bg-blue-600/50 transition-colors"
                >
                  Review
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Submission Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a1e3d] border border-blue-500/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Review Submission</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Submitted by:</p>
                  <p className="text-white font-medium">
                    {selectedSubmission.walletAddress}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Quest:</p>
                  <p className="text-white font-medium">
                    {selectedSubmission.questTitle || 'Unknown Quest'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Submission Date:</p>
                  <p className="text-white">
                    {selectedSubmission.submittedAt && formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Status:</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Proof:</p>
                  {renderSubmissionContent(selectedSubmission)}
                </div>
                
                {selectedSubmission.status === 'pending' && (
                  <>
                    <div>
                      <label htmlFor="feedback" className="block text-gray-400 text-sm mb-1">
                        Feedback (required for rejection):
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-[#041836]/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter feedback for the user..."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
                      <motion.button
                        onClick={handleReject}
                        className="px-4 py-2 bg-red-600/30 text-red-300 rounded-lg hover:bg-red-600/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isReviewing}
                      >
                        {isReviewing ? 'Rejecting...' : 'Reject'}
                      </motion.button>
                      <motion.button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-green-600/30 text-green-300 rounded-lg hover:bg-green-600/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isReviewing}
                      >
                        {isReviewing ? 'Approving...' : 'Approve'}
                      </motion.button>
                    </div>
                  </>
                )}
                
                {selectedSubmission.status !== 'pending' && (
                  <div>
                    <p className="text-gray-400 text-sm">Feedback:</p>
                    <p className="text-white bg-[#041836]/60 p-3 rounded-lg border border-gray-700">
                      {selectedSubmission.moderationNote || 'No feedback provided'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}