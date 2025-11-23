'use client';

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
 * Upload an image to Firebase Storage via API endpoint
 * @param file File to upload
 * @param path Storage path (default: 'quest-proofs')
 * @param onProgress Progress callback
 * @returns Promise with download URL and file metadata
 */
export async function uploadImage(
  file: File,
  path: string = 'quest-proofs',
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
    
    // Upload via API endpoint
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
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
    
    return {
      url: result.url,
      fileName: result.fileName,
      contentType: result.contentType,
      size: result.size
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete an image from Firebase Storage
 * @param url Download URL of the image to delete
 * @returns Promise that resolves when the image is deleted
 */
export async function deleteImage(url: string): Promise<void> {
  // This function is no longer used with the API approach
  // Images should be deleted via admin panel or cleanup scripts
  console.warn('deleteImage is deprecated. Use admin panel for image management.');
}
