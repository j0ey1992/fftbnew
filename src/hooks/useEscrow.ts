'use client'

import { useState, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { QuestsApi } from '@/lib/api/endpoints/quests'
import { useAuth } from './useAuth'

/**
 * Hook for managing escrow operations
 */
export function useEscrow() {
  const { isConnected, address } = useAppKitAccount()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  /**
   * Get escrow records for the current user
   */
  const getUserEscrowRecords = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      setLoadingState('error')
      return []
    }
    
    if (!isAuthenticated) {
      setError('Please wait for authentication to complete')
      setLoadingState('error')
      console.log('Escrow: User not authenticated with Firebase yet')
      return []
    }
    
    setLoading(true)
    setLoadingState('loading')
    setError(null)
    
    try {
      // Add a delay and retry mechanism for API requests
      const maxRetries = 2
      let retryCount = 0
      let lastError = null
      
      while (retryCount <= maxRetries) {
        try {
          const records = await QuestsApi.getUserEscrowRecords()
          setLoadingState('success')
          return records
        } catch (err: any) {
          lastError = err
          console.error(`Attempt ${retryCount + 1}/${maxRetries + 1} failed:`, err)
          
          // If we've reached max retries, throw the error
          if (retryCount === maxRetries) {
            throw err
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
          retryCount++
        }
      }
      
      // This should never be reached due to the throw in the loop
      throw lastError
    } catch (err: any) {
      console.error('Error fetching escrow records:', err)
      setError(err.message || 'Failed to get user escrow records')
      setLoadingState('error')
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, isAuthenticated])
  
  /**
   * Get a specific escrow record
   */
  const getEscrowRecord = useCallback(async (escrowId: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      setLoadingState('error')
      return null
    }
    
    if (!isAuthenticated) {
      setError('Please wait for authentication to complete')
      setLoadingState('error')
      console.log('Escrow: User not authenticated with Firebase yet')
      return null
    }
    
    setLoading(true)
    setLoadingState('loading')
    setError(null)
    
    try {
      // Add retry mechanism for API requests
      const maxRetries = 1
      let retryCount = 0
      let lastError = null
      
      while (retryCount <= maxRetries) {
        try {
          const record = await QuestsApi.getEscrowRecord(escrowId)
          setLoadingState('success')
          return record
        } catch (err: any) {
          lastError = err
          console.error(`Attempt ${retryCount + 1}/${maxRetries + 1} failed:`, err)
          
          // If we've reached max retries, throw the error
          if (retryCount === maxRetries) {
            throw err
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
          retryCount++
        }
      }
      
      // This should never be reached due to the throw in the loop
      throw lastError
    } catch (err: any) {
      console.error(`Error fetching escrow record ${escrowId}:`, err)
      setError(err.message || 'Failed to get escrow record')
      setLoadingState('error')
      return null
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, isAuthenticated])
  
  /**
   * Submit verification for an escrow record
   */
  const submitVerification = useCallback(async (
    escrowId: string,
    verificationLink: string,
    notes?: string
  ) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      setLoadingState('error')
      throw new Error('Wallet not connected')
    }
    
    if (!isAuthenticated) {
      setError('Please wait for authentication to complete')
      setLoadingState('error')
      console.log('Escrow: User not authenticated with Firebase yet')
      throw new Error('Authentication required')
    }
    
    setLoading(true)
    setLoadingState('loading')
    setError(null)
    
    try {
      // Validate verification link
      if (!verificationLink || !verificationLink.trim()) {
        setError('Verification link is required')
        setLoadingState('error')
        throw new Error('Verification link is required')
      }
      
      // Basic URL validation
      try {
        new URL(verificationLink)
      } catch (urlError) {
        setError('Invalid verification link URL format')
        setLoadingState('error')
        throw new Error('Invalid verification link URL format')
      }
      
      // Add retry mechanism for API requests
      const maxRetries = 1
      let retryCount = 0
      let lastError = null
      
      while (retryCount <= maxRetries) {
        try {
          const result = await QuestsApi.submitEscrowVerification(escrowId, verificationLink, notes)
          setLoadingState('success')
          return result
        } catch (err: any) {
          lastError = err
          console.error(`Attempt ${retryCount + 1}/${maxRetries + 1} failed:`, err)
          
          // If we've reached max retries, throw the error
          if (retryCount === maxRetries) {
            throw err
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
          retryCount++
        }
      }
      
      // This should never be reached due to the throw in the loop
      throw lastError
    } catch (err: any) {
      console.error(`Error submitting verification for escrow ${escrowId}:`, err)
      setError(err.message || 'Failed to submit verification')
      setLoadingState('error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, isAuthenticated])
  
  return {
    loading,
    loadingState,
    error,
    isConnected,
    address,
    getUserEscrowRecords,
    getEscrowRecord,
    submitVerification
  }
}

export default useEscrow