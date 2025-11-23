'use client';

import { useState, useRef, ChangeEvent } from 'react';
import useImageStorage from '@/hooks/useImageStorage';

interface AIImageAnalysisProps {
  requirement: any;
  onSubmit: (result: { imageUrl: string; aiAnalysis?: any }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function AIImageAnalysis({ 
  requirement, 
  onSubmit, 
  onError, 
  className = '' 
}: AIImageAnalysisProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { isUploading, error, progress, upload, reset } = useImageStorage('quest-proofs');

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  // Process file upload and AI analysis
  const processFile = async (file: File) => {
    // Create preview
    setPreviewUrl(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('questId', requirement.questId || '');
      formData.append('requirementType', requirement.type || '');
      formData.append('platform', requirement.platform || 'twitter');
      
      // Add platform-specific data
      if (requirement.targetUsername) {
        formData.append('targetUsername', requirement.targetUsername);
      }
      if (requirement.tweetId) {
        formData.append('tweetId', requirement.tweetId);
      }
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      
      // Call photo verification endpoint
      const response = await fetch('/api/quests/photo/verify-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Photo verification failed' }));
        throw new Error(errorData.message || 'Photo verification failed');
      }

      const result = await response.json();
      
      // Format analysis result
      const analysis = {
        verified: result.verified,
        confidence: result.confidence,
        requiresManualReview: result.requiresManualReview,
        details: result.verified 
          ? `Verification successful with ${Math.round(result.confidence * 100)}% confidence`
          : result.requiresManualReview 
            ? 'Your submission requires manual review' 
            : 'Verification failed. Please ensure the screenshot clearly shows the required action.',
        analysis: result.analysis
      };
      
      setAnalysisResult(analysis);
      
      // Auto-submit if analysis is successful
      if (analysis.verified) {
        onSubmit({
          imageUrl: URL.createObjectURL(file),
          aiAnalysis: analysis,
          verified: true,
          confidence: analysis.confidence
        });
      } else if (analysis.requiresManualReview) {
        // Still submit for manual review
        onSubmit({
          imageUrl: URL.createObjectURL(file),
          aiAnalysis: analysis,
          requiresManualReview: true
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      if (onError) onError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      if (onError) onError('File must be an image');
      return;
    }
    
    await processFile(file);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Reset the component
  const handleReset = () => {
    setPreviewUrl(null);
    setAnalysisResult(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Retry analysis
  const handleRetry = () => {
    handleReset();
  };

  return (
    <div className={`w-full ${className}`} role="region" aria-label="AI Image Verification">
      {!previewUrl ? (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-brand-primary bg-brand-primary/10' 
              : 'border-gray-300 dark:border-gray-700 hover:border-brand-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          role="button"
          tabIndex={0}
          aria-label="Upload image for AI verification. Click or drag and drop an image file here."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleButtonClick();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-brand-primary/10" aria-hidden="true">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-brand-primary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload an image for AI verification
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The AI will analyze your image to verify completion
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="File input for image upload"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Uploaded image for verification" 
              className="w-full h-auto object-cover rounded-xl"
            />
            
            {(isUploading || isAnalyzing) && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center" role="status" aria-live="polite">
                {isUploading && (
                  <>
                    <div className="w-3/4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                      <div 
                        className="bg-brand-primary h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-white text-sm" aria-label={`Uploading: ${progress} percent complete`}>{progress}% Uploading...</p>
                  </>
                )}
                {isAnalyzing && !isUploading && (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3" aria-hidden="true"></div>
                    <p className="text-white text-sm">AI is analyzing your image...</p>
                  </>
                )}
              </div>
            )}
            
            {!isAnalyzing && !isUploading && (
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                aria-label="Remove uploaded image and start over"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
          
          {/* Analysis Result */}
          {analysisResult && (
            <div 
              className={`p-4 rounded-lg border ${
                analysisResult.verified 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0" aria-hidden="true">
                  {analysisResult.verified ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h4 className={`text-sm font-medium ${
                    analysisResult.verified 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {analysisResult.verified ? 'Verification Successful' : 'Verification Pending'}
                  </h4>
                  <p className={`mt-1 text-sm ${
                    analysisResult.verified 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {analysisResult.details || 'AI analysis complete'}
                  </p>
                  {analysisResult.confidence && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="sr-only">Verification confidence level:</span>
                      Confidence: {Math.round(analysisResult.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
              
              {!analysisResult.verified && (
                <div className="mt-3">
                  <button
                    onClick={handleRetry}
                    className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
                    aria-label="Try uploading a different image for verification"
                  >
                    Try a different image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert" aria-live="assertive">
          <span className="sr-only">Error:</span>
          {error}
        </p>
      )}
    </div>
  );
}