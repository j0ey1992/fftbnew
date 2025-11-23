import { useState } from 'react';
import { useEscrow } from '@/hooks/useEscrow';
import { toast } from '@/components/ui/Toast';

interface VerificationSubmissionProps {
  escrowId: string;
  onSuccess?: () => void;
  verificationInstructions?: string;
}

export default function VerificationSubmission({
  escrowId,
  onSuccess,
  verificationInstructions
}: VerificationSubmissionProps) {
  const { submitVerification, loading } = useEscrow();
  
  const [verificationLink, setVerificationLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!verificationLink.trim()) {
      toast.error('Please enter a verification link');
      return;
    }
    
    // Validate URL format
    try {
      new URL(verificationLink);
    } catch (err) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitVerification(escrowId, verificationLink, notes);
      
      // Clear form
      setVerificationLink('');
      setNotes('');
      
      // Notify success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting verification:', err);
      toast.error(err.message || 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {verificationInstructions && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-gray-300 mb-4">
          <h4 className="text-blue-300 font-medium mb-2">Instructions:</h4>
          <p className="text-sm">{verificationInstructions}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="verificationLink" className="block text-gray-300 text-sm mb-1">
            Verification Link <span className="text-red-400">*</span>
          </label>
          <input
            id="verificationLink"
            type="url"
            value={verificationLink}
            onChange={(e) => setVerificationLink(e.target.value)}
            placeholder="https://example.com/verification"
            className="w-full px-3 py-2 bg-[#041836]/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide a link that verifies you've completed the required actions
          </p>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-gray-300 text-sm mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-[#041836]/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Any additional information about your verification"
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors w-full"
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Verification'
          )}
        </button>
      </form>
    </div>
  );
}