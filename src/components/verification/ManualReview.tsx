'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';
import LinkProof from './LinkProof';
import { Requirement } from '@/types';

interface ManualReviewProps {
  requirement: Requirement;
  onSubmit: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ManualReview({
  requirement,
  onSubmit,
  onError,
  className = ''
}: ManualReviewProps) {
  const [proofType, setProofType] = useState<'image' | 'link' | 'text'>('text');
  const [textProof, setTextProof] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handle text submission
  const handleTextSubmit = () => {
    if (!textProof.trim()) {
      if (onError) onError('Please provide proof details');
      return;
    }

    onSubmit({
      type: 'text',
      content: textProof,
      requiresManualReview: true
    });
    setSubmitted(true);
  };

  // Handle image submission
  const handleImageSubmit = (result: any) => {
    onSubmit({
      type: 'image',
      ...result,
      requiresManualReview: true
    });
    setSubmitted(true);
  };

  // Handle link submission
  const handleLinkSubmit = (result: any) => {
    onSubmit({
      type: 'link',
      ...result,
      requiresManualReview: true
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`${className}`}>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Submission Received
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Your proof has been submitted for manual review. You'll be notified once it's reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Proof Type Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Select proof type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setProofType('text')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              proofType === 'text'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setProofType('image')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              proofType === 'image'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => setProofType('link')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              proofType === 'link'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Link
          </button>
        </div>
      </div>

      {/* Manual Review Notice */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Manual Review Required
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              This submission will be reviewed by a moderator. Please provide clear proof of completion.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Input Based on Type */}
      {proofType === 'text' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Describe how you completed this requirement
          </label>
          <textarea
            value={textProof}
            onChange={(e) => setTextProof(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Provide details about how you completed this requirement..."
          />
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!textProof.trim()}
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit for Review
          </button>
        </div>
      )}

      {proofType === 'image' && (
        <ImageUpload
          onUploadComplete={handleImageSubmit}
          onError={onError}
        />
      )}

      {proofType === 'link' && (
        <LinkProof
          requirement={requirement}
          onSubmit={handleLinkSubmit}
          onError={onError}
        />
      )}
    </div>
  );
}