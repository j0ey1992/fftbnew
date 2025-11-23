'use client';

import { getAuthToken } from '@/lib/firebase/auth';
import { API_BASE_URL } from '@/lib/api/config';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Upload an image to local storage (no Firebase)
 * @param file File to upload
 * @param path Storage path (default: 'uploads')
 * @param onProgress Progress callback
 * @returns Promise with download URL and file metadata
 */
export async function uploadImage(
  file: File,
  path: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<{ url: string; fileName: string; contentType: string; size: number }> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size (5MB)`);
  }
  
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed types: JPEG, PNG, GIF, WebP`);
  }
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    // Simulate progress for better UX
    if (onProgress) {
      onProgress(10);
    }
    
    // Get auth token
    const token = await getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Upload to backend storage API
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include' // Include credentials for authentication
    });
    
    if (onProgress) {
      onProgress(50);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    const result = await response.json();
    
    if (onProgress) {
      onProgress(100);
    }
    
    // The backend returns the full Firebase Storage URL
    return {
      url: result.url,
      fileName: result.filename || result.fileName || file.name,
      contentType: file.type,
      size: file.size
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete an image (deprecated - use admin panel)
 * @param url Download URL of the image to delete
 * @returns Promise that resolves when the image is deleted
 */
export async function deleteImage(url: string): Promise<void> {
  console.warn('deleteImage is deprecated. Use admin panel for image management.');
}