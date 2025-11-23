'use client';

import { useState, useCallback } from 'react';
import { uploadImage, deleteImage } from '@/lib/firebase/storage-service';

export default function useImageStorage(path: string = 'quest-proofs') {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    fileName: string;
    contentType: string;
    size: number;
  } | null>(null);
  
  // Upload image
  const upload = useCallback(async (file: File) => {
    if (!file) {
      setError('No file selected');
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = await uploadImage(
        file,
        path,
        (progress) => setProgress(progress)
      );
      
      setImageUrl(result.url);
      setImageMetadata({
        fileName: result.fileName,
        contentType: result.contentType,
        size: result.size
      });
      
      return {
        url: result.url,
        fileName: result.fileName,
        contentType: result.contentType,
        size: result.size
      };
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [path]);
  
  // Delete image
  const remove = useCallback(async (url: string) => {
    if (!url) {
      setError('No image URL provided');
      return false;
    }
    
    try {
      await deleteImage(url);
      setImageUrl(null);
      setImageMetadata(null);
      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      return false;
    }
  }, []);
  
  // Reset state
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setImageUrl(null);
    setImageMetadata(null);
  }, []);
  
  return {
    isUploading,
    progress,
    error,
    imageUrl,
    imageMetadata,
    upload,
    remove,
    reset
  };
}
