'use client'

import React, { ReactNode, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Project, ComponentStyle, ProjectComponent } from '@/types/project'
import { ProjectThemeProvider } from '@/components/projects/ProjectThemeProvider'
import { ComponentStyleProvider } from '@/components/projects/ComponentStyleProvider'
import { EditableHeader } from '@/components/projects/EditableHeader'
import { EditableSection } from '@/components/projects/EditableSection'
import { EditableButton } from '@/components/projects/EditableButton'
import { Button } from '@/components/ui'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useProjects } from '@/hooks/useProjects'
import { DynamicComponentRenderer } from './DynamicComponentRenderer'
import { v4 as uuidv4 } from 'uuid'
import { PageSelector } from './PageSelector'

interface ProjectLayoutProps {
  project: Project
  children: ReactNode
}

/**
 * Custom layout for project pages
 * Provides a standalone layout without using the main app layout
 */
export function ProjectLayout({ project, children }: ProjectLayoutProps) {
  const router = useRouter()
  const { open } = useAppKit()
  const { isConnected, address, status } = useAppKitAccount()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Check if current user is the owner - always return a boolean to avoid conditional hook issues
  const isOwner = Boolean(isConnected && address && address?.toLowerCase() === project.owner?.toLowerCase())
  
  // Page management
  const [currentPageId, setCurrentPageId] = useState<string>('')
  
  // Handle page change from PageSelector
  const handlePageChange = (page: any) => {
    setCurrentPageId(page.id)
  }
  
  // Initialize pages if they don't exist
  const pages = useMemo(() => {
    if (!project.pages || project.pages.length === 0) {
      // Create a default home page with the existing component registry
      return [{
        id: uuidv4(),
        slug: 'home',
        title: 'Home',
        isHomePage: true,
        componentRegistry: project.componentRegistry || [],
        createdAt: project.settings?.createdAt,
        updatedAt: project.settings?.updatedAt
      }];
    }
    return project.pages;
  }, [project.pages, project.componentRegistry, project.settings]);
  
  // Set initial current page
  useEffect(() => {
    if (pages.length > 0 && !currentPageId) {
      // Find home page or use the first page
      const homePage = pages.find(page => page.isHomePage) || pages[0];
      setCurrentPageId(homePage.id);
    }
  }, [pages, currentPageId]);
  
  // Get current page
  const currentPage = useMemo(() => {
    return pages.find(page => page.id === currentPageId) || pages[0];
  }, [pages, currentPageId]);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Set page title
  useEffect(() => {
    document.title = project.name
  }, [project.name])
  
  // Get enabled modules
  const enabledModules = project.modules 
    ? Object.entries(project.modules)
        .filter(([_, config]) => config.enabled)
        .map(([key, config]) => ({
          key,
          name: config.name || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        }))
    : []
  
  // Get projects hook
  const { update } = useProjects()
  
  // Handle component style changes
  const handleComponentStylesChange = async (styles: ComponentStyle[]) => {
    // Prevent unnecessary updates by checking if styles have actually changed
    const currentStyles = project.componentStyles || [];
    const currentStylesJson = JSON.stringify(currentStyles);
    const newStylesJson = JSON.stringify(styles);
    
    // Only proceed if the styles have actually changed
    if (currentStylesJson === newStylesJson) {
      console.log('Styles unchanged, skipping update');
      return;
    }
    
    try {
      console.log('Saving component styles to Firebase:', styles);
      
      // Log deleted components
      const deletedComponents = styles.filter(style => style.deleted);
      console.log(`Saving ${deletedComponents.length} deleted components:`, deletedComponents);
      
      // Use the dedicated function to update component styles
      // This ensures proper merging with existing styles
      const { updateComponentStyles } = await import('@/lib/firebase/projects');
      await updateComponentStyles(project.id, styles);
      
      console.log('Component styles saved to Firebase successfully');
      
      // Show a success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Changes saved successfully!';
      document.body.appendChild(successMessage);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
      // If there are deleted components, force a page refresh to reload the project data
      if (deletedComponents.length > 0) {
        console.log('Deleted components detected, refreshing page in 1 second...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving component styles:', error);
      
      // Show an error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed bottom-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Failed to save changes. Please try again.';
      document.body.appendChild(errorMessage);
      
      // Remove the error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  }
  
  return (
    <ProjectThemeProvider theme={project.theme}>
      <ComponentStyleProvider 
        project={project}
        onStylesChange={isOwner ? handleComponentStylesChange : undefined}
      >
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <EditableHeader
            componentId="header-main"
            className={`sticky top-0 z-40 transition-all duration-300 ${
              scrolled 
                ? 'bg-[rgba(10,15,31,0.85)] shadow-[0_8px_32px_rgba(0,0,0,0.2)]' 
                : 'bg-[rgba(10,15,31,0.65)]'
            } backdrop-blur-xl border-b border-white/5`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                {/* Logo */}
                <div className="flex items-center">
                  {project.theme.logoImage ? (
                    <div className="h-10 w-10 relative">
                      <Image
                        src={project.theme.logoImage}
                        alt={project.name}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="ml-3 text-xl font-bold text-white">{project.name}</span>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  {/* Page Selector - always render but conditionally show */}
                  <div style={{ display: isOwner && pages.length > 0 ? 'block' : 'none' }}>
                    <PageSelector
                      project={project}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                  {enabledModules.map((module) => (
                    <a 
                      key={module.key} 
                      href={`#${module.key}`}
                      className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      {module.name}
                    </a>
                  ))}
                  
                  {/* Connect Wallet Button - Always render both states but conditionally show */}
                  <div style={{ display: !isConnected ? 'block' : 'none' }}>
                    <EditableButton
                      componentId="connect-wallet-btn"
                      variant="primary"
                      size="md"
                      onClick={() => open()}
                    >
                      Connect Wallet
                    </EditableButton>
                  </div>
                  
                  <div style={{ display: isConnected ? 'flex' : 'none' }} className="flex items-center">
                    <div className="px-3 py-1 bg-[rgba(255,255,255,0.1)] rounded-lg mr-3">
                      <span className="text-sm text-white/80">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <div style={{ display: isOwner ? 'block' : 'none' }}>
                      <EditableButton
                        componentId="edit-project-btn"
                        variant="glass"
                        size="sm"
                        onClick={() => router.push(`/projects/${project.slug}/edit`)}
                      >
                        Edit
                      </EditableButton>
                    </div>
                  </div>
                </nav>
                
                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <button
                    type="button"
                    className="text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-[rgba(10,15,31,0.95)] border-t border-white/5">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {enabledModules.map((module) => (
                    <a
                      key={module.key}
                      href={`#${module.key}`}
                      className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {module.name}
                    </a>
                  ))}
                  
                  {/* Connect Wallet Button (Mobile) - Always render both states but conditionally show */}
                  <div style={{ display: !isConnected ? 'block' : 'none' }} className="px-3 py-2">
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        open()
                        setMobileMenuOpen(false)
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </div>
                  
                  <div style={{ display: isConnected ? 'block' : 'none' }} className="px-3 py-2 space-y-2">
                    <div className="px-3 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg text-center">
                      <span className="text-sm text-white/80">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <div style={{ display: isOwner ? 'block' : 'none' }}>
                      <Button
                        variant="glass"
                        size="md"
                        fullWidth
                        onClick={() => {
                          router.push(`/projects/${project.slug}/edit`)
                          setMobileMenuOpen(false)
                        }}
                      >
                        Edit Project
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </EditableHeader>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* 
              Wrap DynamicComponentRenderer in a simple div to avoid React hooks issues
              This ensures consistent component structure regardless of conditions
            */}
            <div className="dynamic-component-wrapper">
              <DynamicComponentRenderer 
                project={project}
                isEditMode={Boolean(isOwner)}
                currentPage={currentPage}
              />
            </div>
          </main>
          
          {/* Footer */}
          <EditableSection
            componentId="footer-main"
            componentType="footer"
            className="bg-[rgba(10,15,31,0.85)] border-t border-white/5 py-8"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:justify-between">
                <div className="mb-8 md:mb-0">
                  <div className="flex items-center">
                    {project.theme.logoImage ? (
                      <div className="h-8 w-8 relative">
                        <Image
                          src={project.theme.logoImage}
                          alt={project.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {project.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="ml-2 text-lg font-bold text-white">{project.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/60 max-w-md">
                    {project.content?.description || ''}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                  {/* Quick Links */}
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                      Features
                    </h3>
                    <ul className="space-y-2">
                      {enabledModules.map((module) => (
                        <li key={module.key}>
                          <a 
                            href={`#${module.key}`}
                            className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                          >
                            {module.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Social Links */}
                  {project.content?.sections?.some(section => section.type === 'social') && (
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                        Connect
                      </h3>
                      <ul className="space-y-2">
                        {project.content.sections
                          .filter(section => section.type === 'social')
                          .flatMap(section => (section as any).links || [])
                          .map((link: any, index: number) => (
                            <li key={index}>
                              <a 
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                              >
                                {link.label || link.platform}
                              </a>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 md:flex md:items-center md:justify-between">
                <div className="flex space-x-6 md:order-2">
                  {/* Powered by link */}
                  <Link
                    href="/"
                    className="text-white/40 hover:text-white/60"
                  >
                    Powered by Kris Token
                  </Link>
                </div>
                <p className="mt-8 text-base text-white/40 md:mt-0 md:order-1">
                  &copy; {new Date().getFullYear()} {project.name}. All rights reserved.
                </p>
              </div>
            </div>
          </EditableSection>
        </div>
      </ComponentStyleProvider>
    </ProjectThemeProvider>
  )
}
