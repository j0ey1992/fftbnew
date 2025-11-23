'use client'

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseApp, firebaseAuth } from './firebase/config';

// Initialize Firebase Auth
const auth = firebaseAuth;
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google
 * @returns Promise with user credentials
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get the user's ID token
    const token = await result.user.getIdToken();
    
    // Store the token in localStorage
    localStorage.setItem('authToken', token);
    
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns Promise
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    
    // Remove the token from localStorage
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current user
 * @returns The current user or null if not signed in
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Get the current user's ID token
 * @returns Promise with the ID token or null if not signed in
 */
export const getCurrentUserIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const token = await user.getIdToken();
    
    // Store the token in localStorage
    localStorage.setItem('authToken', token);
    
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Listen for auth state changes
 * @param callback Callback function to handle auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, get and store the token
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
    } else {
      // User is signed out, remove the token
      localStorage.removeItem('authToken');
    }
    
    callback(user);
  });
};

/**
 * Check if the current user is an admin
 * @returns Promise with boolean indicating if the user is an admin
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return false;
    }
    
    const token = await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    
    return !!tokenResult.claims.admin;
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
};

/**
 * Refresh the authentication token
 * @returns Promise with the new token or null if not signed in
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const token = await user.getIdToken(true);
    
    // Store the token in localStorage
    localStorage.setItem('authToken', token);
    
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
