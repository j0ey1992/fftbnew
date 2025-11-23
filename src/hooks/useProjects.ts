'use client'

import { useState, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { 
  ProjectTheme, 
  ProjectModules, 
  ProjectContent, 
  ProjectDomain 
} from '@/types/project'
import { 
  getPublicProjects, 
  getProjectBySlug, 
  getProjectsByOwner,
  createProject,
  updateProject,
  deleteProject,
  updateProjectTheme,
  updateProjectModules,
  updateProjectContent,
  updateProjectDomain,
  updateProjectVisibility,
  isSlugAvailable
} from '@/lib/firebase/projects'

/**
 * Hook for managing projects
 */
export function useProjects() {
  const { isConnected, address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  /**
   * Get all public projects
   */
  const getPublicProjectsList = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const projects = await getPublicProjects()
      return projects
    } catch (err: any) {
      setError(err.message || 'Failed to get public projects')
      return []
    } finally {
      setLoading(false)
    }
  }, [])
  
  /**
   * Get a project by slug
   */
  const getProject = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const project = await getProjectBySlug(slug)
      return project
    } catch (err: any) {
      setError(err.message || 'Failed to get project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  
  /**
   * Get projects owned by the current user
   */
  const getUserProjects = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const projects = await getProjectsByOwner(address)
      return projects
    } catch (err: any) {
      setError(err.message || 'Failed to get user projects')
      return []
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Create a new project
   */
  const create = useCallback(async (projectData: Parameters<typeof createProject>[0]) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Ensure owner is set to current user
      const projectId = await createProject({
        ...projectData,
        owner: address
      })
      return projectId
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update a project
   */
  const update = useCallback(async (
    id: string,
    projectData: Parameters<typeof updateProject>[1]
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateProject(id, projectData, address)
    } catch (err: any) {
      setError(err.message || 'Failed to update project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Delete a project
   */
  const remove = useCallback(async (id: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await deleteProject(id, address)
    } catch (err: any) {
      setError(err.message || 'Failed to delete project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update project theme
   */
  const updateTheme = useCallback(async (
    id: string,
    theme: Partial<ProjectTheme>
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateProjectTheme(id, theme, address)
    } catch (err: any) {
      setError(err.message || 'Failed to update project theme')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update project modules
   */
  const updateModules = useCallback(async (
    id: string,
    modules: Partial<ProjectModules>
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateProjectModules(id, modules, address)
    } catch (err: any) {
      setError(err.message || 'Failed to update project modules')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update project content
   */
  const updateContent = useCallback(async (
    id: string,
    content: Partial<ProjectContent>
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateProjectContent(id, content, address)
    } catch (err: any) {
      setError(err.message || 'Failed to update project content')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update project domain
   */
  const updateDomain = useCallback(async (
    id: string,
    domain: Partial<ProjectDomain>
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateProjectDomain(id, domain, address)
    } catch (err: any) {
      setError(err.message || 'Failed to update project domain')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Update project visibility
   */
  const updateVisibility = useCallback(async (
    id: string,
    visibility: Parameters<typeof updateProjectVisibility>[1]
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateProjectVisibility(id, visibility, address)
    } catch (err: any) {
      setError(err.message || 'Failed to update project visibility')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])
  
  /**
   * Check if a slug is available
   */
  const checkSlugAvailability = useCallback(async (slug: string) => {
    try {
      return await isSlugAvailable(slug)
    } catch (err: any) {
      setError(err.message || 'Failed to check slug availability')
      throw err
    }
  }, [])
  
  return {
    loading,
    error,
    isConnected,
    address,
    getPublicProjects: getPublicProjectsList,
    getProject,
    getUserProjects,
    create,
    update,
    remove,
    updateTheme,
    updateModules,
    updateContent,
    updateDomain,
    updateVisibility,
    checkSlugAvailability
  }
}
