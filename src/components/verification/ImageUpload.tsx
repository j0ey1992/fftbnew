'use client';

import { useState, useRef, ChangeEvent } from 'react';
import useImageStorage from '@/hooks/useImageStorage';

interface ImageUploadProps {
  onUploadComplete: (result: { result: string; fileName: string; contentType: string; size: number }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ImageUpload({ onUploadComplete, onError, className = '' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { isUploading, error, progress, upload, reset } = useImageStorage('quest-proofs');

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    setPreviewUrl(URL.createObjectURL(file));
    
    // Upload the file
    const result = await upload(file);
    
    if (result) {
      onUploadComplete({
        result: result.url,
        fileName: result.fileName,
        contentType: result.contentType,
        size: result.size
      });
    } else if (error && onError) {
      onError(error);
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
    
    // Create preview
    setPreviewUrl(URL.createObjectURL(file));
    
    // Upload the file
    const result = await upload(file);
    
    if (result) {
      onUploadComplete({
        result: result.url,
        fileName: result.fileName,
        contentType: result.contentType,
        size: result.size
      });
    } else if (error && onError) {
      onError(error);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Reset the component
  const handleReset = () => {
    setPreviewUrl(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
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
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-brand-primary/10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-brand-primary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Drag and drop an image, or <span className="text-brand-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-auto object-cover rounded-xl"
          />
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                <div 
                  className="bg-brand-primary h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-white text-sm">{progress}% Uploading...</p>
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            disabled={isUploading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
