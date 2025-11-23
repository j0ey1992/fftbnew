'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectPage } from '@/types/project'
import { Timestamp } from 'firebase/firestore'
import { useProjects } from '@/hooks/useProjects'
import { v4 as uuidv4 } from 'uuid'
import { BaseLayouts, BaseLayoutType } from './BaseLayouts'
import { deepSanitize } from '@/utils/sanitizeUtils'

interface PageSelectorProps {
  project: Project
  currentPage?: ProjectPage
  onPageChange: (page: ProjectPage) => void
}

/**
 * PageSelector component
 * Allows users to switch between pages and create new pages
 */
export function PageSelector({
  project,
  currentPage,
  onPageChange
}: PageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [isCreatingPage, setIsCreatingPage] = useState(false)
  const [showLayoutSelector, setShowLayoutSelector] = useState(false)
  const { update } = useProjects()

  // Handle page selection
  const handlePageSelect = (page: ProjectPage) => {
    onPageChange(page)
    setIsOpen(false)
  }

  // Handle new page creation
  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return
    
    setIsCreatingPage(true)
    setShowLayoutSelector(true)
  }

  // Handle layout selection for new page
  const handleLayoutSelect = async (components: any[]) => {
    try {
      // Create a new page with the selected layout
      const newPage: ProjectPage = {
        id: uuidv4(),
        slug: newPageTitle.toLowerCase().replace(/\s+/g, '-'),
        title: newPageTitle,
        isHomePage: false,
        componentRegistry: components,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      // Get current pages or create an empty array
      const currentPages = project.pages || []
      
      // If this is the first page, mark it as home page
      if (currentPages.length === 0) {
        newPage.isHomePage = true
      }
      
      // Add the new page to the project
      const updatedPages = [...currentPages, newPage]
      
      // Update the project in Firebase
      const sanitizedData = deepSanitize({ pages: updatedPages })
      await update(project.id, sanitizedData)
      
      // Switch to the new page
      onPageChange(newPage)
      
      // Reset state
      setNewPageTitle('')
      setIsCreatingPage(false)
      setShowLayoutSelector(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating page:', error)
      setIsCreatingPage(false)
      setShowLayoutSelector(false)
    }
  }

  // Handle layout selection cancellation
  const handleLayoutCancel = () => {
    setIsCreatingPage(false)
    setShowLayoutSelector(false)
  }

  return (
    <div className="relative">
      {/* Current page display / dropdown trigger */}
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-[rgba(30,35,55,0.6)] hover:bg-[rgba(40,45,65,0.8)] rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white font-medium">
          {currentPage?.title || project.name || 'Select Page'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[rgba(20,25,45,0.95)] rounded-lg shadow-xl border border-white/10 z-50">
          <div className="p-2">
            <h3 className="text-white/70 text-sm font-medium px-3 py-2">Pages</h3>
            
            {/* List of pages */}
            <div className="max-h-60 overflow-y-auto">
              {project.pages && project.pages.length > 0 ? (
                project.pages.map(page => (
                  <button
                    key={page.id}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      currentPage?.id === page.id
                        ? 'bg-blue-600 text-white'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => handlePageSelect(page)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{page.title}</span>
                      {page.isHomePage && (
                        <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded">
                          Home
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-white/50 text-sm px-3 py-2">No pages yet</div>
              )}
            </div>
            
            {/* Create new page */}
            <div className="mt-2 p-2 border-t border-white/10">
              <h3 className="text-white/70 text-sm font-medium px-1 py-1">Create New Page</h3>
              
              <div className="flex mt-1">
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={e => setNewPageTitle(e.target.value)}
                  placeholder="Page Title"
                  className="flex-1 px-3 py-1.5 bg-[rgba(50,55,75,0.6)] text-white rounded-l-md border border-white/10 focus:outline-none focus:border-blue-500"
                />
                <button
                  className={`px-3 py-1.5 rounded-r-md ${
                    newPageTitle.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600/50 text-white/70 cursor-not-allowed'
                  }`}
                  onClick={handleCreatePage}
                  disabled={!newPageTitle.trim() || isCreatingPage}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout selector modal */}
      {showLayoutSelector && (
        <BaseLayouts
          onSelect={handleLayoutSelect}
          onCancel={handleLayoutCancel}
        />
      )}
    </div>
  )
}
