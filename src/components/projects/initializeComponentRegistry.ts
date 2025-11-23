'use client'

import { Project, ProjectComponent, ComponentType, ProjectPage } from '@/types/project'
import { v4 as uuidv4 } from 'uuid'
import { deepSanitize } from '@/utils/sanitizeUtils'

/**
 * Initialize component registry for a project
 * This function creates a component registry from the existing project structure
 * It's used for migrating existing projects to the new component registry format
 */
export function initializeComponentRegistry(project: Project): ProjectComponent[] {
  // If the project already has a component registry, return it
  if (project.componentRegistry && project.componentRegistry.length > 0) {
    return project.componentRegistry
  }

  // Create a new component registry
  const registry: ProjectComponent[] = []

  // Add header component
  registry.push({
    id: 'header-main',
    type: 'header',
    position: 'header',
    isActive: true,
    content: {
      logo: project.theme.logoImage,
      title: project.name,
      navigation: project.modules ? Object.entries(project.modules)
        .filter(([_, config]) => config.enabled)
        .map(([key, config]) => ({
          key,
          name: config.name || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        })) : []
    },
    styles: project.componentStyles?.find(style => style.id === 'header-main')
  })

  // Add hero section
  registry.push({
    id: 'hero-section',
    type: 'hero',
    position: 'top',
    isActive: true,
    content: {
      title: project.content.heroTitle,
      subtitle: project.content.description,
      backgroundImage: project.theme.backgroundImage
    },
    styles: project.componentStyles?.find(style => style.id === 'hero-section')
  })

  // Add content sections
  if (project.content.sections) {
    project.content.sections.forEach(section => {
      registry.push({
        id: section.id || `section-${uuidv4()}`,
        type: section.type as ComponentType,
        position: section.position,
        isActive: true,
        content: section,
        styles: project.componentStyles?.find(style => style.id === section.id)
      })
    })
  }

  // Add footer component
  registry.push({
    id: 'footer-main',
    type: 'footer',
    position: 'footer',
    isActive: true,
    content: {
      logo: project.theme.logoImage,
      title: project.name,
      description: project.content.description,
      navigation: project.modules ? Object.entries(project.modules)
        .filter(([_, config]) => config.enabled)
        .map(([key, config]) => ({
          key,
          name: config.name || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        })) : [],
      socialLinks: project.content.sections
        .filter(section => section.type === 'social')
        .flatMap(section => (section as any).links || [])
    },
    styles: project.componentStyles?.find(style => style.id === 'footer-main')
  })

  return registry
}

/**
 * Update project with component registry
 * This function adds the component registry to the project object
 * and initializes pages if they don't exist
 */
export function updateProjectWithRegistry(project: Project): Project {
  // Initialize component registry if it doesn't exist
  const registry = initializeComponentRegistry(project)
  
  // Sanitize the registry to remove any undefined values
  const sanitizedRegistry = deepSanitize(registry);
  
  // Check if the project has pages
  if (!project.pages || project.pages.length === 0) {
    // Create a default home page with the component registry
    const homePage: ProjectPage = {
      id: uuidv4(),
      slug: 'home',
      title: 'Home',
      isHomePage: true,
      componentRegistry: sanitizedRegistry,
      createdAt: project.settings?.createdAt,
      updatedAt: project.settings?.updatedAt
    };
    
    // Return updated project with pages
    return {
      ...project,
      componentRegistry: sanitizedRegistry,
      pages: [homePage]
    };
  }
  
  // Return updated project with component registry
  return {
    ...project,
    componentRegistry: sanitizedRegistry
  };
}
