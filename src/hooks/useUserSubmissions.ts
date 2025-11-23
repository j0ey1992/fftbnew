'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAppKitAccount } from '@reown/appkit/react'
import apiClient from '@/lib/api/client'
import { Submission } from '@/types/submission'

export function useUserSubmissions() {
  const { user, isAuthenticated } = useAuth()
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsByQuestId, setSubmissionsByQuestId] = useState<Record<string, Submission>>({})

  const fetchUserSubmissions = useCallback(async () => {
    if (!isAuthenticated || !user || !address) {
      console.log('Not fetching submissions - not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch user submissions
      const response = await apiClient.get<Submission[]>(
        `/api/quests/submissions/user`,
        { requireAuth: true }
      )

      setSubmissions(response)
      
      // Create a map of questId to submission for easy lookup
      const submissionsMap = response.reduce((acc, submission) => {
        acc[submission.questId] = submission
        return acc
      }, {} as Record<string, Submission>)
      
      setSubmissionsByQuestId(submissionsMap)
    } catch (err: any) {
      console.error('Error fetching user submissions:', err)
      setError(err.message || 'Failed to fetch submissions')
      setSubmissions([])
      setSubmissionsByQuestId({})
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, address])

  useEffect(() => {
    fetchUserSubmissions()
  }, [fetchUserSubmissions])

  // Helper function to get submission status for a quest
  const getQuestSubmissionStatus = (questId: string): 'not_started' | 'pending' | 'approved' | 'rejected' => {
    const submission = submissionsByQuestId[questId]
    if (!submission) return 'not_started'
    
    if (submission.status === 'verified') return 'approved'
    return submission.status as any
  }

  // Helper to check if quest has been submitted
  const hasSubmittedQuest = (questId: string): boolean => {
    return !!submissionsByQuestId[questId]
  }

  // Get submission for a specific quest
  const getQuestSubmission = (questId: string): Submission | null => {
    return submissionsByQuestId[questId] || null
  }

  return {
    submissions,
    submissionsByQuestId,
    loading,
    error,
    refetch: fetchUserSubmissions,
    getQuestSubmissionStatus,
    hasSubmittedQuest,
    getQuestSubmission
  }
}