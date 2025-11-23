'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Submission } from '@/types';
import { QuestsApi, sseClient, SSEEventType, sseEvents } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import {
  logClientError,
  logSubmissionAction,
  logQuestAction
} from '@/lib/quests/loggingUtils';

/**
 * Custom hook for fetching user submissions
 */
export function useUserSubmissions(walletAddress: string, status?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userSubmissions', walletAddress, status],
    queryFn: async () => {
      if (!walletAddress) return [];
      try {
        const submissions = await QuestsApi.getUserSubmissions(walletAddress);
        
        // Filter by status if provided
        const filteredSubmissions = status
          ? submissions.filter(sub => sub.status === status)
          : submissions;
        
        // Log successful fetch
        logSubmissionAction(
          'fetch_user_submissions',
          'all',
          'all',
          walletAddress,
          { status, count: filteredSubmissions.length }
        ).catch(console.error);
        
        return filteredSubmissions;
      } catch (err) {
        // Log error
        logClientError(
          'fetch_user_submissions',
          err instanceof Error ? err : String(err),
          { userId: walletAddress, status }
        ).catch(console.error);
        
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!walletAddress
  });
  
  return {
    submissions: data || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Custom hook for fetching quest submissions
 */
export function useQuestSubmissions(questId: string, status?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['questSubmissions', questId, status],
    queryFn: async () => {
      if (!questId) return [];
      try {
        // Note: This assumes the API will be extended to support getting submissions by quest ID
        // You may need to implement this endpoint on the backend
        const submissions = await QuestsApi.getAllSubmissions(status);
        
        // Filter by questId since we're getting all submissions
        const filteredSubmissions = submissions.filter(sub => sub.questId === questId);
        
        // Log successful fetch
        logQuestAction(
          'fetch_quest_submissions',
          questId,
          undefined,
          { status, count: filteredSubmissions.length }
        ).catch(console.error);
        
        return filteredSubmissions;
      } catch (err) {
        // Log error
        logClientError(
          'fetch_quest_submissions',
          err instanceof Error ? err : String(err),
          { questId, status }
        ).catch(console.error);
        
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!questId
  });
  
  return {
    submissions: data || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Custom hook for real-time submission updates using SSE
 * Provides real-time updates and notifications for submission status changes
 */
export function useSubmissionRealtime(submissionId: string) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  
  // Initial fetch of submission data
  useEffect(() => {
    if (!submissionId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Fetch submission data
    const fetchSubmission = async () => {
      try {
        // Note: This assumes the API will be extended to support getting a submission by ID
        // You may need to implement this endpoint on the backend
        const allSubmissions = await QuestsApi.getAllSubmissions();
        const foundSubmission = allSubmissions.find(sub => sub.id === submissionId);
        
        if (foundSubmission) {
          setSubmission(foundSubmission);
          setPreviousStatus(foundSubmission.status);
        } else {
          setSubmission(null);
        }
        setIsLoading(false);
      } catch (err) {
        console.error(`Error fetching submission ${submissionId}:`, err);
        
        // Log error
        logClientError(
          'fetch_submission',
          err instanceof Error ? err : String(err),
          { submissionId }
        ).catch(console.error);
        
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    fetchSubmission();
  }, [submissionId]);
  
  // Set up SSE listener for real-time updates
  useEffect(() => {
    if (!submissionId) return;
    
    // Connect to SSE endpoint
    sseClient.connect();
    
    // Subscribe to submission events
    const unsubscribe = sseClient.subscribe(
      SSEEventType.SUBMISSION_UPDATED,
      (event) => {
        if (sseEvents.isSubmissionEvent(event)) {
          const { submission: updatedSubmission } = event.data;
          
          // Only process events for this submission
          if (updatedSubmission.id === submissionId) {
            // Check if status has changed and show notification
            if (previousStatus !== null &&
                previousStatus !== updatedSubmission.status) {
              // Show notification based on new status
              switch(updatedSubmission.status) {
                case 'verified':
                  toast.success('Your submission has been approved!');
                  break;
                case 'rejected':
                  toast.error('Your submission has been rejected.');
                  break;
                case 'pending':
                  toast.info('Your submission is now pending review.');
                  break;
              }
            }
            
            // Update previous status for future comparisons
            setPreviousStatus(updatedSubmission.status);
            setSubmission(updatedSubmission);
          }
        }
      }
    );
    
    // Clean up listener when component unmounts or submissionId changes
    return () => {
      unsubscribe();
    };
  }, [submissionId, previousStatus]);
  
  return { submission, isLoading, error };
}
/**
 * Custom hook for real-time user submissions updates using SSE
 * Listens to all submissions for a specific user
 */
export function useUserSubmissionsRealtime(walletAddress: string, status?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initial fetch of user submissions
  useEffect(() => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Normalize wallet address
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Fetch user submissions
    const fetchSubmissions = async () => {
      try {
        const allSubmissions = await QuestsApi.getUserSubmissions(normalizedAddress);
        
        // Filter by status if provided
        const filteredSubmissions = status
          ? allSubmissions.filter(sub => sub.status === status)
          : allSubmissions;
        
        setSubmissions(filteredSubmissions);
        setIsLoading(false);
        
        // Log successful fetch
        logSubmissionAction(
          'user_submissions_update',
          'all',
          'all',
          walletAddress,
          { status, count: filteredSubmissions.length }
        ).catch(console.error);
      } catch (err) {
        console.error(`Error fetching user submissions for ${walletAddress}:`, err);
        
        // Log error
        logClientError(
          'fetch_user_submissions',
          err instanceof Error ? err : String(err),
          { userId: walletAddress, status }
        ).catch(console.error);
        
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [walletAddress, status]);
  
  // Set up SSE listener for real-time updates
  useEffect(() => {
    if (!walletAddress) return;
    
    // Normalize wallet address
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Connect to SSE endpoint
    sseClient.connect();
    
    // Subscribe to submission events
    const unsubscribe = sseClient.subscribeToMany(
      [SSEEventType.SUBMISSION_CREATED, SSEEventType.SUBMISSION_UPDATED],
      (event) => {
        if (sseEvents.isSubmissionEvent(event)) {
          const { submission: updatedSubmission, action } = event.data;
          
          // Only process events for this user
          if (updatedSubmission.walletAddress.toLowerCase() === normalizedAddress) {
            // Filter by status if provided
            if (!status || updatedSubmission.status === status) {
              if (action === 'created') {
                setSubmissions(prev => [updatedSubmission, ...prev]);
              } else if (action === 'updated' || action === 'status_changed') {
                setSubmissions(prev =>
                  prev.map(sub => sub.id === updatedSubmission.id ? updatedSubmission : sub)
                );
              }
              
              // Log successful update
              logSubmissionAction(
                'user_submissions_update',
                'all',
                'all',
                walletAddress,
                { status, action }
              ).catch(console.error);
            }
          }
        }
      }
    );
    
    // Clean up listener when component unmounts or parameters change
    return () => {
      unsubscribe();
    };
  }, [walletAddress, status]);
  
  return { submissions, isLoading, error };
}
/**
 * Custom hook for real-time quest submissions updates using SSE
 * Listens to all submissions for a specific quest
 */
export function useQuestSubmissionsRealtime(questId: string, status?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initial fetch of quest submissions
  useEffect(() => {
    if (!questId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Fetch quest submissions
    const fetchSubmissions = async () => {
      try {
        // Note: This assumes the API will be extended to support getting submissions by quest ID
        // You may need to implement this endpoint on the backend
        const allSubmissions = await QuestsApi.getAllSubmissions(status);
        
        // Filter by questId
        const filteredSubmissions = allSubmissions.filter(sub => sub.questId === questId);
        
        setSubmissions(filteredSubmissions);
        setIsLoading(false);
        
        // Log successful fetch
        logQuestAction(
          'quest_submissions_update',
          questId,
          undefined,
          { status, count: filteredSubmissions.length }
        ).catch(console.error);
      } catch (err) {
        console.error(`Error fetching quest submissions for ${questId}:`, err);
        
        // Log error
        logClientError(
          'fetch_quest_submissions',
          err instanceof Error ? err : String(err),
          { questId, status }
        ).catch(console.error);
        
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [questId, status]);
  
  // Set up SSE listener for real-time updates
  useEffect(() => {
    if (!questId) return;
    
    // Connect to SSE endpoint
    sseClient.connect();
    
    // Subscribe to submission events
    const unsubscribe = sseClient.subscribeToMany(
      [SSEEventType.SUBMISSION_CREATED, SSEEventType.SUBMISSION_UPDATED],
      (event) => {
        if (sseEvents.isSubmissionEvent(event)) {
          const { submission: updatedSubmission, action, questId: eventQuestId } = event.data;
          
          // Only process events for this quest
          if (eventQuestId === questId || updatedSubmission.questId === questId) {
            // Filter by status if provided
            if (!status || updatedSubmission.status === status) {
              if (action === 'created') {
                setSubmissions(prev => [updatedSubmission, ...prev]);
              } else if (action === 'updated' || action === 'status_changed') {
                setSubmissions(prev =>
                  prev.map(sub => sub.id === updatedSubmission.id ? updatedSubmission : sub)
                );
              }
              
              // Log successful update
              logQuestAction(
                'quest_submissions_update',
                questId,
                undefined,
                { status, action }
              ).catch(console.error);
            }
          }
        }
      }
    );
    
    // Clean up listener when component unmounts or parameters change
    return () => {
      unsubscribe();
    };
  }, [questId, status]);
  
  return { submissions, isLoading, error };
}

/**
 * Custom hook for handling submission state
 */
export function useSubmissionState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const resetState = () => {
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
  };
  
  return {
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    success,
    setSuccess,
    resetState,
    submissionStatus: { isSubmitting, error, success }
  };
}
