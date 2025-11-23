'use client';

import { storage } from '@/lib/firebase/firebase-config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

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
 * Upload an image to Firebase Storage (client-side with updated rules)
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
    // Generate unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fullPath = `${path}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return promise that resolves when upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              fileName,
              contentType: file.type,
              size: file.size
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
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