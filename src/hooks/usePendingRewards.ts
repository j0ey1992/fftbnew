'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAppKitAccount } from '@reown/appkit/react'
import apiClient from '@/lib/api/client'

interface PendingReward {
  id: string
  questId: string
  questTitle: string
  reward: number
  rewardType: string
  status: string
  submittedAt: string
  approvedAt?: string
}

interface PendingRewardsData {
  claimable: PendingReward[]
  claimableTotal: number
  pending: PendingReward[]
  pendingTotal: number
  escrow: any[]
  escrowTotal: number
  totalPending: number
}

export function usePendingRewards() {
  const { user, isAuthenticated } = useAuth()
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingRewards, setPendingRewards] = useState<PendingRewardsData>({
    claimable: [],
    claimableTotal: 0,
    pending: [],
    pendingTotal: 0,
    escrow: [],
    escrowTotal: 0,
    totalPending: 0
  })

  const fetchPendingRewards = useCallback(async () => {
    if (!isAuthenticated || !user || !address) {
      console.log('Not fetching pending rewards - not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch pending rewards from the API
      const response = await apiClient.get<{
        rewards: PendingReward[]
        pending: PendingReward[]
        approved: PendingReward[]
        pendingTotal: number
        approvedTotal: number
        total: number
      }>('/api/quests/rewards/pending', { requireAuth: true })

      // Use the pre-separated data from the API
      const claimable = response.approved || []
      const pending = response.pending || []
      const claimableTotal = response.approvedTotal || 0
      const pendingTotal = response.pendingTotal || 0
      
      console.log('[usePendingRewards] API Response:', {
        claimableCount: claimable.length,
        claimableTotal,
        pendingCount: pending.length,
        pendingTotal,
        totalFromAPI: response.total
      })

      // Also fetch escrow records
      let escrowRecords = []
      let escrowTotal = 0
      try {
        const escrowResponse = await apiClient.get<any[]>('/api/quests/rewards/escrow', { requireAuth: true })
        escrowRecords = escrowResponse.filter(r => r.status === 'pending')
        escrowTotal = escrowRecords.reduce((sum, r) => sum + (r.amount || 0), 0)
      } catch (escrowError) {
        console.log('Could not fetch escrow records:', escrowError)
      }

      const totalPendingAmount = pendingTotal + claimableTotal + escrowTotal
      
      console.log('[usePendingRewards] Setting state:', {
        pendingTotal,
        claimableTotal,
        escrowTotal,
        totalPending: totalPendingAmount
      })
      
      setPendingRewards({
        claimable,
        claimableTotal,
        pending,
        pendingTotal,
        escrow: escrowRecords,
        escrowTotal,
        totalPending: totalPendingAmount
      })
    } catch (err: any) {
      console.error('Error fetching pending rewards:', err)
      setError(err.message || 'Failed to fetch pending rewards')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, address])

  useEffect(() => {
    fetchPendingRewards()
  }, [fetchPendingRewards])

  return {
    pendingRewards,
    loading,
    error,
    refetch: fetchPendingRewards
  }
}