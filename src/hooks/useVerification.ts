'use client';

import { useState } from 'react';
import { VerificationResult } from '@/types';
import { verifySubmission } from '@/lib/quests/verificationService';

/**
 * Custom hook for handling quest verification
 */
export function useVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const verify = async (
    questId: string,
    proofType: string,
    proofData: any,
    walletAddress: string
  ) => {
    try {
      setIsVerifying(true);
      setError(null);
      
      const result = await verifySubmission(
        questId,
        proofType,
        proofData,
        walletAddress
      );
      
      setVerificationResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify submission';
      setError(errorMessage);
      return {
        verified: false,
        reason: errorMessage
      };
    } finally {
      setIsVerifying(false);
    }
  };
  
  const reset = () => {
    setIsVerifying(false);
    setError(null);
    setVerificationResult(null);
  };
  
  return {
    isVerifying,
    error,
    verificationResult,
    verify,
    reset
  };
}

/**
 * Custom hook for handling image uploads
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const uploadImage = async (file: File, path: string = 'quest-proofs') => {
    if (!file) {
      setError('No file selected');
      return null;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return null;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return null;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      
      // In a real implementation, you would upload to Firebase Storage
      // For now, we'll simulate the upload
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a local URL for the image (in a real implementation, this would be the Firebase Storage URL)
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return {
        result: url,
        fileName: file.name,
        contentType: file.type,
        size: file.size
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const reset = () => {
    setIsUploading(false);
    setError(null);
    setImageUrl(null);
    setProgress(0);
  };
  
  return {
    isUploading,
    error,
    imageUrl,
    progress,
    uploadImage,
    reset
  };
}
