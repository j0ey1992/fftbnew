'use client'

import { useState, useEffect, ReactNode, useCallback } from 'react'
import { Project, ProjectComponent, ComponentType, ComponentStyle, ProjectPage } from '@/types/project'
import { EditableHeader } from './EditableHeader'
import { EditableSection } from './EditableSection'
import { EditableButton } from './EditableButton'
import { useProjects } from '@/hooks/useProjects'
import { ComponentSelector } from './ComponentSelector'
import { v4 as uuidv4 } from 'uuid'
import { deepSanitize, findUndefinedValues } from '@/utils/sanitizeUtils'
import { DragDropProvider, DraggableComponent, DropZone } from './DragDropProvider'

interface DynamicComponentRendererProps {
  project: Project
  isEditMode?: boolean
  currentPage?: ProjectPage
}

/**
 * Dynamic Component Renderer
 * Renders components from the project's component registry
 */
export function DynamicComponentRenderer({
  project,
  isEditMode = false,
  currentPage
}: DynamicComponentRendererProps) {
  const [components, setComponents] = useState<ProjectComponent[]>([])
  const [showComponentSelector, setShowComponentSelector] = useState(false)
  const { update } = useProjects()

  // Load components from the registry
  useEffect(() => {
    // If we have a current page with a component registry, use that
    if (currentPage?.componentRegistry) {
      // Filter out inactive components
      const activeComponents = currentPage.componentRegistry.filter(comp => comp.isActive)
      setComponents(activeComponents)
    } 
    // Otherwise fall back to the project's component registry
    else if (project.componentRegistry) {
      // Filter out inactive components
      const activeComponents = project.componentRegistry.filter(comp => comp.isActive)
      setComponents(activeComponents)
    } else {
      setComponents([])
    }
  }, [project.componentRegistry, currentPage?.componentRegistry, currentPage?.id])

  // Handle component deletion
  const handleDeleteComponent = async (componentId: string) => {
    // Get the current registry to update
    const registryToUpdate = currentPage?.componentRegistry || project.componentRegistry;
    if (!registryToUpdate) return;

    // Find the component in the registry and mark it as inactive
    const updatedRegistry = registryToUpdate.map(comp => 
      comp.id === componentId 
        ? { ...comp, isActive: false } // Mark as inactive instead of deleting
        : comp
    );

    try {
      // Check for undefined values (for debugging)
      const undefinedPaths = findUndefinedValues({ componentRegistry: updatedRegistry });
      if (undefinedPaths.length > 0) {
        console.warn('Found undefined values at paths:', undefinedPaths);
      }

      // Deep sanitize the data before sending to Firebase
      let sanitizedData;
      
      // If we have a current page, update its component registry
      if (currentPage) {
        sanitizedData = deepSanitize({ 
          pages: project.pages?.map(page => 
            page.id === currentPage.id 
              ? { ...page, componentRegistry: updatedRegistry }
              : page
          )
        });
      } 
      // Otherwise update the project's component registry
      else {
        sanitizedData = deepSanitize({ componentRegistry: updatedRegistry });
      }
      
      // Update the project in Firebase
      await update(project.id, sanitizedData);
      console.log(`Component ${componentId} marked as inactive`);
      
      // Update local state
      setComponents(components.filter(comp => comp.id !== componentId));
    } catch (error) {
      console.error('Error updating component registry:', error);
    }
  }

  // Handle component style changes
  const handleComponentStyleChange = async (componentId: string, css: string) => {
    if (!project.componentRegistry) return

    // Find the component in the registry
    const updatedRegistry = project.componentRegistry.map(comp => {
      if (comp.id === componentId) {
        // Create a proper ComponentStyle object with defaults for all required fields
        const updatedStyle: ComponentStyle = {
          id: componentId,
          componentType: comp.type,
          templateId: 1,
          name: `${comp.type} Style`,
          customStyles: {},
          aiGeneratedCSS: css,
          ...(comp.styles || {}) // Merge with existing styles if any
        };
        
        return {
          ...comp,
          styles: updatedStyle
        };
      }
      return comp;
    });

    try {
      // Check for undefined values (for debugging)
      const undefinedPaths = findUndefinedValues({ componentRegistry: updatedRegistry });
      if (undefinedPaths.length > 0) {
        console.warn('Found undefined values at paths:', undefinedPaths);
      }
      
      // Deep sanitize the data before sending to Firebase
      const sanitizedData = deepSanitize({ componentRegistry: updatedRegistry });
      
      // Update the project in Firebase with sanitized data
      await update(project.id, sanitizedData);
      console.log(`Component ${componentId} styles updated`);
    } catch (error) {
      console.error('Error updating component styles:', error);
    }
  }

  // Convert component content to ReactNode
  const getContentAsReactNode = (content: string | Record<string, any> | undefined): ReactNode => {
    if (typeof content === 'string') {
      return content;
    } else if (typeof content === 'object' && content !== null) {
      // Render different content types based on structure
      if (content.title || content.subtitle) {
        return (
          <div className="component-content">
            {content.title && <h2 className="text-2xl font-bold mb-2">{content.title}</h2>}
            {content.subtitle && <div className="text-lg text-gray-300 mb-4">{content.subtitle}</div>}
            {content.description && <div className="text-gray-400">{content.description}</div>}
            {content.ctaText && content.ctaLink && (
              <a href={content.ctaLink} className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                {content.ctaText}
              </a>
            )}
          </div>
        );
      }
      
      // Handle navigation links
      if (content.navigation && Array.isArray(content.navigation)) {
        return (
          <nav className="flex flex-wrap gap-4">
            {content.navigation.map((item: any, index: number) => (
              <a 
                key={index} 
                href={`#${item.key}`} 
                className="text-white/80 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>
        );
      }
      
      // Handle social links
      if (content.socialLinks && Array.isArray(content.socialLinks)) {
        return (
          <div className="flex gap-4">
            {content.socialLinks.map((link: any, index: number) => (
              <a 
                key={index} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                {link.label || link.platform}
              </a>
            ))}
          </div>
        );
      }
      
      // If we don't have a specific renderer for this content type,
      // render a more user-friendly representation instead of raw JSON
      return (
        <div className="component-content p-4">
          {Object.entries(content).map(([key, value]) => {
            // Skip rendering arrays and objects directly
            if (typeof value === 'object') return null;
            return (
              <div key={key} className="mb-2">
                <span className="font-medium text-white/80">{key}: </span>
                <span className="text-white">{String(value)}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return '';
  };

  // Check if a component is protected (cannot be deleted)
  const isProtectedComponent = (component: ProjectComponent): boolean => {
    // Header and footer are protected components by default
    // But we're making them deletable by returning false
    // This maintains the same hook call structure to avoid React hook errors
    return false;
  };

  // Create a wrapper for components that adds delete functionality
  const ComponentWrapper = ({ 
    component, 
    children 
  }: { 
    component: ProjectComponent, 
    children: ReactNode 
  }) => {
    // Always calculate isProtected to maintain consistent hook calls
    const isProtected = isProtectedComponent(component);
    
    // If not in edit mode, just render children without wrapper
    if (!isEditMode) {
      return <>{children}</>;
    }
    
    return (
      <div className="relative group">
        {children}
        
        {/* Delete button overlay or protected indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
          {isProtected ? (
            <div className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protected
            </div>
          ) : (
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg"
              onClick={() => handleDeleteComponent(component.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render a component based on its type
  const renderComponent = (component: ProjectComponent) => {
    // Convert content to ReactNode
    const contentNode = getContentAsReactNode(component.content);
    
    switch (component.type) {
      case 'header':
        return (
          <ComponentWrapper key={component.id} component={component}>
            <EditableHeader
              componentId={component.id}
              className={component.position}
            >
              {contentNode}
            </EditableHeader>
          </ComponentWrapper>
        )
      
      case 'footer':
        return (
          <ComponentWrapper key={component.id} component={component}>
            <EditableSection
              componentId={component.id}
              componentType="footer"
              className={component.position}
            >
              {contentNode}
            </EditableSection>
          </ComponentWrapper>
        )
      
      case 'section':
      case 'hero':
        return (
          <ComponentWrapper key={component.id} component={component}>
            <EditableSection
              componentId={component.id}
              componentType={component.type as ComponentType}
              className={component.position}
            >
              {contentNode}
            </EditableSection>
          </ComponentWrapper>
        )
      
      case 'button':
        return (
          <ComponentWrapper key={component.id} component={component}>
            <EditableButton
              componentId={component.id}
              className={component.position}
            >
              {typeof component.content === 'string' ? component.content : 'Button'}
            </EditableButton>
          </ComponentWrapper>
        )
      
      default:
        return (
          <div key={component.id} className="p-4 border border-red-500 rounded">
            <p>Unknown component type: {component.type}</p>
          </div>
        )
    }
  }

  // Get default content for a component type
  const getDefaultContent = (type: ComponentType): string | Record<string, any> => {
    switch (type) {
      case 'header':
        return {
          title: 'Header Title',
          subtitle: 'Header Subtitle',
          links: []
        };
      case 'hero':
        return {
          title: 'Hero Title',
          subtitle: 'Hero Subtitle',
          ctaText: 'Learn More'
        };
      case 'section':
        return 'This is a new section. Edit this content to add your own.';
      case 'button':
        return 'Button Text';
      case 'card':
        return {
          title: 'Card Title',
          content: 'Card content goes here'
        };
      case 'navigation':
        return {
          links: [
            { text: 'Home', url: '#' },
            { text: 'About', url: '#' },
            { text: 'Contact', url: '#' }
          ]
        };
      default:
        return '';
    }
  };

  // Handle adding a new component
  const handleAddComponent = async (type: ComponentType, position: string) => {
    // Close the component selector
    setShowComponentSelector(false);
    
    // Create a new component with all required fields explicitly set
    const newComponent: ProjectComponent = {
      id: `${type}-${uuidv4()}`,
      type,
      position: position || 'main',
      isActive: true,
      content: getDefaultContent(type) || '',
      children: []
    };
    
    // Get the current registry or create a new one
    const currentRegistry = project.componentRegistry || [];
    
      // Add the new component to the registry
      const updatedRegistry = [...currentRegistry, newComponent];
      
      try {
        // Check for undefined values (for debugging)
        const undefinedPaths = findUndefinedValues({ componentRegistry: updatedRegistry });
        if (undefinedPaths.length > 0) {
          console.warn('Found undefined values at paths:', undefinedPaths);
        }
        
        // Deep sanitize the data before sending to Firebase
        let sanitizedData;
        
        // If we have a current page, update its component registry
        if (currentPage) {
          sanitizedData = deepSanitize({ 
            pages: project.pages?.map(page => 
              page.id === currentPage.id 
                ? { ...page, componentRegistry: updatedRegistry }
                : page
            )
          });
        } 
        // Otherwise update the project's component registry
        else {
          sanitizedData = deepSanitize({ componentRegistry: updatedRegistry });
        }
        
        console.log('Sanitized data for Firebase:', JSON.stringify(sanitizedData));
        
        // Update the project in Firebase with sanitized data
        await update(project.id, sanitizedData);
        console.log(`Component ${newComponent.id} added`);
        
        // Update local state
        setComponents([...components, newComponent]);
      } catch (error) {
        console.error('Error adding component:', error);
      }
  };

  // We'll use this variable to determine what to render, but we won't use early returns
  // This ensures consistent hook calls regardless of component state
  const shouldShowEmptyState = components.length === 0 && isEditMode;

  // Handle component order changes from drag and drop
  const handleComponentsChange = useCallback(async (updatedComponents: ProjectComponent[]) => {
    try {
      // Check for undefined values (for debugging)
      const undefinedPaths = findUndefinedValues({ componentRegistry: updatedComponents });
      if (undefinedPaths.length > 0) {
        console.warn('Found undefined values at paths:', undefinedPaths);
      }
      
      // Deep sanitize the data before sending to Firebase
      let sanitizedData;
      
      // If we have a current page, update its component registry
      if (currentPage) {
        sanitizedData = deepSanitize({ 
          pages: project.pages?.map(page => 
            page.id === currentPage.id 
              ? { ...page, componentRegistry: updatedComponents }
              : page
          )
        });
      } 
      // Otherwise update the project's component registry
      else {
        sanitizedData = deepSanitize({ componentRegistry: updatedComponents });
      }
      
      // Update the project in Firebase with sanitized data
      await update(project.id, sanitizedData);
      console.log('Component order updated');
      
      // Update local state
      setComponents(updatedComponents);
    } catch (error) {
      console.error('Error updating component order:', error);
    }
  }, [project.id, update, currentPage, project.pages]);
  
  // Handle dropping a component at the end of the list
  const handleDropAtEnd = (item: { id: string; index: number }) => {
    console.log(`Moving component ${item.id} to the end of the list`);
    // Implementation will be added if needed
  };

  // Render all active components
  return (
    <DragDropProvider 
      initialComponents={components}
      onComponentsChange={handleComponentsChange}
    >
      <div className="dynamic-component-container">
        {/* Empty state message - conditionally shown but always rendered */}
        <div style={{ display: shouldShowEmptyState ? 'block' : 'none' }} className="p-8 text-center">
          <p className="text-gray-400 mb-4">No components in this project yet.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => setShowComponentSelector(true)}
          >
            Add Component
          </button>
        </div>
        
        {/* Component list - always rendered but conditionally populated */}
        <div style={{ display: shouldShowEmptyState ? 'none' : 'block' }}>
          {components.map((component, index) => (
            <DraggableComponent
              key={component.id}
              id={component.id}
              index={index}
              isEditMode={isEditMode}
            >
              {renderComponent(component)}
            </DraggableComponent>
          ))}
          
          {/* Drop zone at the end of the list */}
          {isEditMode && components.length > 0 && (
            <DropZone
              onDrop={handleDropAtEnd}
              className="h-16 my-4 border-2 border-dashed border-gray-500/30 rounded-lg flex items-center justify-center"
            >
              <p className="text-gray-500">Drop components here</p>
            </DropZone>
          )}
          
          {/* Add component button (only in edit mode) */}
          {isEditMode && (
            <div className="flex justify-center my-8">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                onClick={() => setShowComponentSelector(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Component
              </button>
            </div>
          )}
        </div>
        
        {/* Component selector modal - always rendered but conditionally shown */}
        <div style={{ display: showComponentSelector ? 'block' : 'none' }}>
          <ComponentSelector
            onSelect={handleAddComponent}
            onCancel={() => setShowComponentSelector(false)}
          />
        </div>
      </div>
    </DragDropProvider>
  )
}
