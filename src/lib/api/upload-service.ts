'use client';

import { API_BASE_URL } from '@/lib/api/config';
import { getAuthToken } from '@/lib/api/auth';

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const name = 'csrf-token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  
  return null;
}

/**
 * Ensure CSRF token is available
 */
async function ensureCSRFToken(): Promise<void> {
  const existingToken = getCsrfTokenFromCookie();
  if (existingToken) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch CSRF token:', response.status);
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
}

/**
 * Upload an image file through the backend API
 * This avoids CORS issues by proxying through our backend
 */
export async function uploadImageThroughBackend(
  file: File,
  path: string
): Promise<string> {
  console.log('uploadImageThroughBackend called with path:', path);
  console.log('File details:', { name: file.name, size: file.size, type: file.type });
  
  try {
    // Ensure CSRF token is available
    await ensureCSRFToken();
    
    const token = await getAuthToken();
    console.log('Auth token obtained for upload');
    
    // Get CSRF token
    const csrfToken = getCsrfTokenFromCookie();
    console.log('CSRF token:', csrfToken ? 'Found' : 'Not found');
    
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    
    // Add CSRF token if available
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    console.log('Sending upload request to:', `${API_BASE_URL}/api/upload/image`);
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image through backend:', error);
    throw error;
  }
}

/**
 * Upload NFT staking contract logo through backend
 */
export async function uploadNftStakingLogoBackend(
  file: File,
  contractId: string
): Promise<string> {
  return uploadImageThroughBackend(file, `nft-staking/${contractId}/logo`);
}

/**
 * Upload NFT staking contract banner through backend
 */
export async function uploadNftStakingBannerBackend(
  file: File,
  contractId: string
): Promise<string> {
  return uploadImageThroughBackend(file, `nft-staking/${contractId}/banner`);
}