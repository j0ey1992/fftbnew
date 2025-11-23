'use client'

import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { firebaseAuth } from './config';

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns Firebase User object
 */
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns Firebase User object or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  return firebaseAuth.currentUser;
};

/**
 * Check if the user has admin privileges
 * @param user Firebase User object
 * @returns Boolean indicating if user is an admin
 */
export const isUserAdmin = async (user: User): Promise<boolean> => {
  try {
    const token = await user.getIdTokenResult();
    return !!token.claims.admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Subscribe to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(firebaseAuth, callback);
};

/**
 * Create a new user with email and password
 * Note: This does not grant admin privileges, which must be done in Firebase Console
 * @param email User email
 * @param password User password
 * @param displayName User display name
 * @returns Firebase User object
 */
export const createUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get the current user's authentication token
 * @returns The auth token or null if not authenticated
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
