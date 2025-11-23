import { useState } from 'react';
import { motion } from 'framer-motion';
import { EscrowRecord } from '@/lib/api/endpoints/quests';
import { formatDate } from '@/lib/dateUtils';
import { useEscrow } from '@/hooks/useEscrow';
import { toast } from '@/components/ui/Toast';
import VerificationSubmission from './VerificationSubmission';

interface EscrowDetailModalProps {
  escrowRecord: EscrowRecord;
  onClose: () => void;
  onVerificationSubmitted?: () => void;
}

export default function EscrowDetailModal({
  escrowRecord,
  onClose,
  onVerificationSubmitted
}: EscrowDetailModalProps) {
  const { loading } = useEscrow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(
    escrowRecord.status === 'pending' && !escrowRecord.verificationLink
  );
  
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
  
  // Handle successful verification submission
  const handleVerificationSuccess = () => {
    setShowVerificationForm(false);
    if (onVerificationSubmitted) {
      onVerificationSubmitted();
    }
    toast.success('Verification submitted successfully');
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a1e3d] border border-blue-500/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white">Escrow Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Quest Details */}
            <div>
              <p className="text-gray-400 text-sm">Quest:</p>
              <p className="text-white font-medium">
                {escrowRecord.questTitle || 'Unknown Quest'}
              </p>
              {escrowRecord.questDetails && (
                <p className="text-gray-300 text-sm mt-1">
                  {escrowRecord.questDetails.description}
                </p>
              )}
            </div>
            
            {/* Reward Details */}
            <div>
              <p className="text-gray-400 text-sm">Reward:</p>
              <p className="text-white font-medium">
                {escrowRecord.amount} {escrowRecord.tokenType}
              </p>
            </div>
            
            {/* Status */}
            <div>
              <p className="text-gray-400 text-sm">Status:</p>
              <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(escrowRecord.status)}`}>
                {escrowRecord.status}
              </span>
            </div>
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Created:</p>
                <p className="text-white">
                  {escrowRecord.createdAt && formatDate(escrowRecord.createdAt)}
                </p>
              </div>
              {escrowRecord.releasedAt && (
                <div>
                  <p className="text-gray-400 text-sm">Released:</p>
                  <p className="text-white">
                    {formatDate(escrowRecord.releasedAt)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Verification Link */}
            {escrowRecord.verificationLink && (
              <div>
                <p className="text-gray-400 text-sm">Verification Link:</p>
                <a
                  href={escrowRecord.verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {escrowRecord.verificationLink}
                </a>
              </div>
            )}
            
            {/* Verification Notes */}
            {escrowRecord.verificationNotes && (
              <div>
                <p className="text-gray-400 text-sm">Verification Notes:</p>
                <p className="text-white bg-[#041836]/60 p-3 rounded-lg border border-gray-700">
                  {escrowRecord.verificationNotes}
                </p>
              </div>
            )}
            
            {/* Verification Form */}
            {showVerificationForm ? (
              <div className="border-t border-gray-700/30 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Submit Verification</h3>
                <VerificationSubmission 
                  escrowId={escrowRecord.id}
                  onSuccess={handleVerificationSuccess}
                  verificationInstructions={escrowRecord.questDetails?.verificationInstructions}
                />
              </div>
            ) : escrowRecord.status === 'pending' && !escrowRecord.verificationLink ? (
              <div className="border-t border-gray-700/30 pt-4 mt-4">
                <button
                  onClick={() => setShowVerificationForm(true)}
                  className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-colors"
                  disabled={isSubmitting || loading}
                >
                  Submit Verification
                </button>
              </div>
            ) : null}
            
            {/* Rejection Reason */}
            {escrowRecord.status === 'rejected' && (
              <div className="border-t border-gray-700/30 pt-4 mt-4">
                <p className="text-gray-400 text-sm">Rejection Reason:</p>
                <p className="text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/30 mt-1">
                  {escrowRecord.verificationNotes || 'No reason provided'}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-700/30">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}