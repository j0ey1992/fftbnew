'use client'

import { useState, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { QuestsApi, PartnerProject } from '@/lib/api/endpoints/quests'
import { normalizeAddress } from '@/utils/addressUtils'

/**
 * Hook for managing partner operations
 */
export function usePartners() {
  const { isConnected, address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  /**
   * Get all partner projects for the current user
   */
  const getPartnerProjects = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const projects = await QuestsApi.getPartnerProjects()
      return projects
    } catch (err: any) {
      setError(err.message || 'Failed to get partner projects')
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Get a partner project by ID
   */
  const getPartnerProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    console.log('PERMISSION DEBUG: getPartnerProject - Fetching project:', projectId);
    
    try {
      const project = await QuestsApi.getPartnerProject(projectId);
      
      console.log('PERMISSION DEBUG: getPartnerProject - Project data received:', {
        id: project.id,
        name: project.name,
        ownerId: project.ownerId,
        collaboratorsCount: project.collaborators ? project.collaborators.length : 0,
        collaborators: project.collaborators
      });
      
      return project;
    } catch (err: any) {
      // Extract the most useful error message
      const errorMessage = err.message || 'Failed to get partner project';
      
      // Log detailed error information for debugging
      console.error(`PERMISSION DEBUG: Partner project error (${projectId}):`, {
        message: errorMessage,
        status: err.status,
        data: err.data
      });
      
      // Set user-friendly error message
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [])
  
  /**
   * Get a public partner project by ID (no auth required)
   */
  const getPublicPartnerProject = useCallback(async (projectId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const project = await QuestsApi.getPublicPartnerProject(projectId)
      return project
    } catch (err: any) {
      setError(err.message || 'Failed to get public partner project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  
  /**
   * Get quests for a partner project
   */
  const getPartnerProjectQuests = useCallback(async (projectId: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const quests = await QuestsApi.getPartnerProjectQuests(projectId)
      return quests
    } catch (err: any) {
      // Extract the most useful error message
      const errorMessage = err.message || 'Failed to get partner project quests'
      
      // Log detailed error information for debugging
      console.error(`Partner project quests error (${projectId}):`, {
        message: errorMessage,
        status: err.status,
        data: err.data
      })
      
      // Set user-friendly error message
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Get quests for a public partner project (no auth required)
   */
  const getPublicPartnerProjectQuests = useCallback(async (projectId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const quests = await QuestsApi.getPublicPartnerQuests(projectId)
      return quests
    } catch (err: any) {
      setError(err.message || 'Failed to get public partner project quests')
      return []
    } finally {
      setLoading(false)
    }
  }, [])
  
  /**
   * Create a new partner project
   */
  const createPartnerProject = useCallback(async (
    projectData: Omit<PartnerProject, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'embeddedQuests'> & {
      walletAddress?: string;
    }
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Log the project data being sent (excluding sensitive information)
      console.log('Creating partner project with data:', {
        name: projectData.name,
        description: projectData.description?.substring(0, 50) + '...',
        hasLogo: !!projectData.logo,
        hasBanner: !!projectData.banner,
        hasSocials: !!projectData.socials,
        walletAddress: projectData.walletAddress ? 'present (normalized)' : 'not present'
      })
      
      // Normalize the project data
      let normalizedProjectData: any = {
        ...projectData,
      };
      
      // Use the provided wallet address or the connected one
      if (projectData.walletAddress) {
        normalizedProjectData.walletAddress = normalizeAddress(projectData.walletAddress);
      } else {
        // Default to normalized wallet address
        normalizedProjectData.walletAddress = normalizeAddress(address);
      }
      
      console.log('Creating project with wallet address:', {
        walletFormat: normalizedProjectData.walletAddress?.substring(0, 10) + '...'
      });
      
      const result = await QuestsApi.createPartnerProject(normalizedProjectData)
      
      if (!result || !result.success) {
        console.error('Partner project creation failed:', result)
        throw new Error(
          result?.id
            ? `Failed to create partner project (ID: ${result.id})`
            : 'Failed to create partner project: Invalid server response'
        )
      }
      
      console.log('Partner project created successfully:', result.id)
      return result // Return the full result object with id and success properties
    } catch (err: any) {
      // Log detailed error information
      console.error('Partner project creation error:', {
        message: err.message,
        status: err.status,
        data: err.data
      })
      
      // Create a user-friendly error message
      let errorMessage = err.message || 'Failed to create partner project'
      
      // Add more context based on error status
      if (err.status === 403) {
        errorMessage = `Permission denied: ${errorMessage}`
      } else if (err.status === 400) {
        errorMessage = `Invalid project data: ${errorMessage}`
      } else if (err.status === 401) {
        errorMessage = `Authentication failed: ${errorMessage}`
      }
      
      setError(errorMessage)
      
      // Rethrow with enhanced error information
      throw new Error(`Error creating project: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update a partner project
   */
  const updatePartnerProject = useCallback(async (
    projectId: string,
    projectData: Partial<PartnerProject>
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await QuestsApi.updatePartnerProject(projectId, projectData)
      
      if (!result.success) {
        throw new Error('Failed to update partner project')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update partner project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Create a new quest for a partner project
   */
  const createPartnerQuest = useCallback(async (
    projectId: string,
    questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'participantsJoined'> & {
      rewardType?: string;
      startDate?: string;
      escrowEnabled?: boolean;
      verificationInstructions?: string;
    }
  ) => {
    console.log('PERMISSION DEBUG: createPartnerQuest - Starting quest creation for project:', projectId);
    
    if (!isConnected || !address) {
      console.log('PERMISSION DEBUG: createPartnerQuest - Wallet not connected, aborting');
      throw new Error('Wallet not connected');
    }
    
    console.log('PERMISSION DEBUG: createPartnerQuest - User wallet address:', address);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('PERMISSION DEBUG: createPartnerQuest - Sending quest data to API:', {
        title: questData.title,
        category: questData.category,
        difficulty: questData.difficulty,
        reward: questData.reward,
        tokenSymbol: questData.tokenSymbol,
        requirementsCount: questData.requirements?.length || 0
      });
      
      const result = await QuestsApi.createPartnerQuest(projectId, questData);
      
      console.log('PERMISSION DEBUG: createPartnerQuest - API response:', result);
      
      if (!result.success) {
        console.error('PERMISSION DEBUG: createPartnerQuest - Failed to create quest:', result);
        throw new Error('Failed to create partner quest');
      }
      
      console.log('PERMISSION DEBUG: createPartnerQuest - Quest created successfully with ID:', result.id);
      return result.id;
    } catch (err: any) {
      console.error('PERMISSION DEBUG: createPartnerQuest - Error creating quest:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      
      setError(err.message || 'Failed to create partner quest');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address])
  
  /**
   * Get submissions for a partner project
   */
  const getPartnerProjectSubmissions = useCallback(async (
    projectId: string,
    status?: string
  ) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const submissions = await QuestsApi.getPartnerProjectSubmissions(projectId, status)
      return submissions
    } catch (err: any) {
      setError(err.message || 'Failed to get partner project submissions')
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Review a submission
   */
  const reviewSubmission = useCallback(async (
    submissionId: string,
    status: 'approved' | 'rejected',
    feedback?: string
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await QuestsApi.reviewPartnerSubmission(submissionId, status, feedback)
      
      if (!result.success) {
        throw new Error('Failed to review submission')
      }
      
      return result.submission
    } catch (err: any) {
      setError(err.message || 'Failed to review submission')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Get escrow records for partner's projects
   */
  const getPartnerEscrowRecords = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const records = await QuestsApi.getPartnerEscrowRecords()
      return records
    } catch (err: any) {
      setError(err.message || 'Failed to get partner escrow records')
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Review an escrow verification
   */
  const reviewEscrowVerification = useCallback(async (
    escrowId: string,
    action: 'approve' | 'reject',
    reason?: string
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await QuestsApi.reviewEscrowVerification(escrowId, action, reason)
      
      if (!result.success) {
        throw new Error('Failed to review escrow verification')
      }
      
      return result.escrow
    } catch (err: any) {
      setError(err.message || 'Failed to review escrow verification')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Get analytics for a partner project
   */
  const getPartnerAnalytics = useCallback(async (projectId: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return null
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const analytics = await QuestsApi.getPartnerAnalytics(projectId)
      return analytics
    } catch (err: any) {
      setError(err.message || 'Failed to get partner analytics')
      return null
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  return {
    loading,
    error,
    isConnected,
    address,
    getPartnerProjects,
    getPartnerProject,
    getPublicPartnerProject,
    getPartnerProjectQuests,
    getPublicPartnerProjectQuests,
    createPartnerProject,
    updatePartnerProject,
    createPartnerQuest,
    getPartnerProjectSubmissions,
    reviewSubmission,
    getPartnerEscrowRecords,
    reviewEscrowVerification,
    getPartnerAnalytics
  }
}

export default usePartners