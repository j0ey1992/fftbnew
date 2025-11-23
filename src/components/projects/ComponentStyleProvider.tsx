'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Project, ComponentStyle } from '@/types/project'
import { v4 as uuidv4 } from 'uuid'

// Context for component styles
interface ComponentStyleContextType {
  styles: Record<string, string>
  isEditMode: boolean
  setIsEditMode: (isEditMode: boolean) => void
  updateComponentStyle: (componentId: string, css: string) => void
}

const ComponentStyleContext = createContext<ComponentStyleContextType>({
  styles: {},
  isEditMode: false,
  setIsEditMode: () => {},
  updateComponentStyle: () => {}
})

// Hook to use component styles
export const useComponentStyles = () => useContext(ComponentStyleContext)

interface ComponentStyleProviderProps {
  project: Project
  children: React.ReactNode
  onStylesChange?: (styles: ComponentStyle[]) => void
}

/**
 * Component style provider
 * Manages component styles for a project
 */
export function ComponentStyleProvider({
  project,
  children,
  onStylesChange
}: ComponentStyleProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [componentStyles, setComponentStyles] = useState<ComponentStyle[]>(project.componentStyles || [])
  const [styleMap, setStyleMap] = useState<Record<string, string>>({})

  // Initialize styles - with optimized dependencies
  useEffect(() => {
    // Create a map of component ID to CSS
    const styles: Record<string, string> = {}
    
    console.log("Loading component styles from project:", project.componentStyles);
    
    // Filter out deleted components and create style map
    if (project.componentStyles) {
      // Log all components with their deleted status
      project.componentStyles.forEach(style => {
        console.log(`Component ${style.id}: deleted=${!!style.deleted}, CSS=${style.aiGeneratedCSS?.substring(0, 30)}...`);
      });
      
      // Filter out components marked as deleted
      const filteredStyles = project.componentStyles.filter(style => !style.deleted);
      console.log(`Filtered out ${project.componentStyles.length - filteredStyles.length} deleted components`);
      
      // Create style map from filtered styles
      filteredStyles.forEach(style => {
        if (style.aiGeneratedCSS) {
          styles[style.id] = style.aiGeneratedCSS
        }
      });
      
      // Set the filtered styles - using functional update to avoid dependency on componentStyles
      setComponentStyles(prevStyles => {
        const currentStylesJson = JSON.stringify(prevStyles);
        const newStylesJson = JSON.stringify(filteredStyles);
        return currentStylesJson !== newStylesJson ? filteredStyles : prevStyles;
      });
      
      // Update the style map using functional update to avoid dependency on styleMap
      setStyleMap(prevMap => {
        const currentMapJson = JSON.stringify(prevMap);
        const newMapJson = JSON.stringify(styles);
        return currentMapJson !== newMapJson ? styles : prevMap;
      });
    }
  }, [project.componentStyles]) // Only depend on project.componentStyles

  // Update component style
  const updateComponentStyle = (componentId: string, css: string) => {
    console.log(`updateComponentStyle called for ${componentId} with css length: ${css.length}`);
    
    // Check if this is a delete operation (empty CSS)
    if (css === '') {
      console.log(`Deleting component ${componentId}`);
      
      // Instead of removing the component, mark it as deleted with a special CSS class
      const deletedCSS = `.component-${componentId} { display: none !important; }`;
      
      // Update style map with the "deleted" CSS
      setStyleMap(prev => ({
        ...prev,
        [componentId]: deletedCSS
      }));
      
      // Update component styles to mark as deleted
      const updatedStyles = [...componentStyles];
      const existingStyleIndex = updatedStyles.findIndex(style => style.id === componentId);
      
      if (existingStyleIndex >= 0) {
        // Mark existing style as deleted
        updatedStyles[existingStyleIndex] = {
          ...updatedStyles[existingStyleIndex],
          deleted: true,
          aiGeneratedCSS: deletedCSS
        };
      } else {
        // Create new style with deleted flag
        updatedStyles.push({
          id: componentId,
          componentType: 'section', // Default type
          templateId: 1,
          name: 'Deleted Component',
          customStyles: {},
          aiGeneratedCSS: deletedCSS,
          deleted: true
        });
      }
      
      console.log(`Updated styles with deleted flag`);
      setComponentStyles(updatedStyles);
      
      // Notify parent of style changes
      if (onStylesChange) {
        console.log(`Notifying parent of deletion`);
        onStylesChange(updatedStyles);
      }
      
      return;
    }
    
    // Enhance CSS specificity by adding !important to key properties
    // This helps prevent other styles from overriding our custom styles
    let enhancedCSS = css;
    
    // Only add !important if it's not already there
    if (!enhancedCSS.includes('!important')) {
      // Add !important to common properties that might be overridden
      const propertiesToEnhance = [
        'background-color', 'color', 'border', 'border-radius', 
        'padding', 'margin', 'font-size', 'font-weight'
      ];
      
      propertiesToEnhance.forEach(prop => {
        // Regex to find the property and add !important if it doesn't already have it
        const regex = new RegExp(`(${prop}\\s*:\\s*[^;!]+)(?!\\s*!important)(;|$)`, 'g');
        enhancedCSS = enhancedCSS.replace(regex, '$1 !important$2');
      });
      
      console.log(`Enhanced CSS specificity for ${componentId}`);
    }
    
    // Update style map
    setStyleMap(prev => ({
      ...prev,
      [componentId]: enhancedCSS
    }));
    
    // Update component styles
    const updatedStyles = [...componentStyles];
    const existingStyleIndex = updatedStyles.findIndex(style => style.id === componentId);
    
    if (existingStyleIndex >= 0) {
      // Update existing style
      updatedStyles[existingStyleIndex] = {
        ...updatedStyles[existingStyleIndex],
        aiGeneratedCSS: enhancedCSS,
        deleted: false // Ensure it's not marked as deleted
      };
    } else {
      // Create new style
      updatedStyles.push({
        id: componentId,
        componentType: 'section', // Default type, should be overridden by the component
        templateId: 1,
        name: 'Custom Style',
        customStyles: {},
        aiGeneratedCSS: enhancedCSS,
        deleted: false
      });
    }
    
    setComponentStyles(updatedStyles);
    
    // Notify parent of style changes
    if (onStylesChange) {
      console.log(`Notifying parent of style changes for ${componentId}`);
      onStylesChange(updatedStyles);
    }
    
    // Also save to localStorage for backup
    try {
      localStorage.setItem(`component-style-${componentId}`, enhancedCSS);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  return (
    <ComponentStyleContext.Provider
      value={{
        styles: styleMap,
        isEditMode,
        setIsEditMode,
        updateComponentStyle
      }}
    >
      {/* Render all styles */}
      <style dangerouslySetInnerHTML={{ __html: Object.values(styleMap).join('\n') }} />
      
      {/* Edit mode toggle - always render but conditionally show */}
      <div 
        className="fixed bottom-4 right-4 z-50" 
        style={{ display: onStylesChange ? 'block' : 'none' }}
      >
        <button
          className={`px-4 py-2 rounded-lg shadow-lg font-medium transition-colors ${
            isEditMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Edit Components'}
        </button>
      </div>
      
      {children}
    </ComponentStyleContext.Provider>
  )
}
