/**
 * Token management functions (stub replacements for Firebase)
 */

import { VVSPair, ImportedToken } from '@/types/tokens';

/**
 * Get enabled VVS pairs
 * Returns empty array - Firebase removed
 */
export async function getEnabledVVSPairs(): Promise<VVSPair[]> {
  console.warn('getEnabledVVSPairs: Firebase removed, returning empty array');
  return [];
}

/**
 * Get imported tokens
 * Returns empty array - Firebase removed
 */
export async function getImportedTokens(): Promise<ImportedToken[]> {
  console.warn('getImportedTokens: Firebase removed, returning empty array');
  return [];
}

/**
 * Add imported token
 * No-op - Firebase removed
 */
export async function addImportedToken(token: Omit<ImportedToken, 'id'>): Promise<string> {
  console.warn('addImportedToken: Firebase removed, no-op');
  return 'stub-id';
}
