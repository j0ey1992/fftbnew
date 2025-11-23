'use client'

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseStorage } from './config';

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The path to store the file at (including filename)
 * @returns The download URL of the uploaded file
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    // Create a storage reference
    const storageRef = ref(firebaseStorage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload a token logo to Firebase Storage
 * @param file The image file to upload
 * @param contractId The ID of the staking contract
 * @returns The download URL of the uploaded image
 */
export const uploadTokenLogo = async (file: File, contractId: string): Promise<string> => {
  // Generate a unique filename
  const fileExtension = file.name.split('.').pop();
  const path = `token-logos/${contractId}.${fileExtension}`;
  
  // Upload the file
  return await uploadFile(file, path);
};

/**
 * Delete a file from Firebase Storage
 * @param path The path of the file to delete
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(firebaseStorage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Extract filename from a Firebase Storage URL
 * @param url The Firebase Storage download URL
 * @returns The path in storage
 */
export const getStoragePathFromUrl = (url: string): string | null => {
  try {
    // Firebase Storage URLs contain a token after a question mark
    const urlWithoutToken = url.split('?')[0];
    
    // The path is everything after the last slash in o/ segment
    const matches = urlWithoutToken.match(/o\/([^?]+)/);
    
    if (matches && matches[1]) {
      // The path is URL encoded, so decode it
      return decodeURIComponent(matches[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
};
