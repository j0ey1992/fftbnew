'use client'

/**
 * @deprecated Use the functions from init.ts instead
 * This file is kept for backward compatibility
 */

import { getAppKit } from './init'

// Re-export the getAppKit function for backward compatibility
export const appKit = typeof window !== 'undefined' ? getAppKit() : null

// Hook to get the appKit instance (for backward compatibility)
export function useAppKit() {
  return appKit
}
