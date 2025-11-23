'use client'

import { useEffect } from 'react'
import { initViewportHeightFix } from '@/utils/viewportFix'

/**
 * Component that initializes the viewport height fix
 * This is a client component that runs the viewport height fix on mount
 */
export function ViewportHeightFix() {
  useEffect(() => {
    // Initialize the viewport height fix
    const cleanup = initViewportHeightFix()
    
    // Return cleanup function if provided
    return cleanup
  }, [])
  
  // This component doesn't render anything
  return null
}