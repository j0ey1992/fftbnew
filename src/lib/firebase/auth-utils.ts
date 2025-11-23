'use client';

import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';
import { requestWalletChallenge, authenticateWithWallet as apiAuthenticateWithWallet } from '../api/auth';

/**
 * Authenticate a user with their wallet address using challenge-response
 * @param walletAddress The user's wallet address
 * @param signMessage Function to sign the challenge message (from wallet provider)
 * @returns The authenticated user and additional data
 */
export async function authenticateWithWallet(
  walletAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<any> {
  try {
    console.log('Authenticating with wallet address:', walletAddress);
    
    // Step 1: Request a challenge from the server
    const { challenge, message } = await requestWalletChallenge(walletAddress);
    console.log('Received challenge:', challenge);
    
    // Step 2: Sign the challenge with the wallet
    console.log('Signing message:', message);
    const signature = await signMessage(message);
    console.log('Signature:', signature);
    
    // Step 3: Authenticate with the signature
    const authResult = await apiAuthenticateWithWallet(walletAddress, signature);
    console.log('Authentication result:', authResult);
    
    return {
      user: auth.currentUser,
      ...authResult
    };
  } catch (error) {
    console.error('Error authenticating with wallet:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export function getCurrentUser() {
  return auth.currentUser;
}
