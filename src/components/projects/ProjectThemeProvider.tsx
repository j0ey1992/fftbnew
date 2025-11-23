'use client'

import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react'
import { ProjectTheme } from '@/types/project'

// Theme context
interface ThemeContextType {
  theme: ProjectTheme;
  applyTheme: (element: HTMLElement) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider props
interface ProjectThemeProviderProps {
  theme: ProjectTheme;
  children: ReactNode;
}

/**
 * Project theme provider component
 * Applies the selected theme to the project page
 */
export function ProjectThemeProvider({ theme, children }: ProjectThemeProviderProps) {
  // Generate CSS variables for the theme
  const cssVariables = useMemo(() => {
    return {
      '--theme-primary-color': theme.primaryColor,
      '--theme-secondary-color': theme.secondaryColor,
      '--theme-text-color': theme.textColor,
      '--theme-font-family': theme.fontFamily || 'inherit',
      '--theme-background-color': theme.backgroundColor || 'transparent',
      '--theme-background-gradient': theme.backgroundGradient || 'none',
    }
  }, [theme])
  
  // Apply theme to the document root
  useEffect(() => {
    const root = document.documentElement
    
    // Apply CSS variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value as string)
    })
    
    // Apply background
    if (theme.backgroundType === 'solid' && theme.backgroundColor) {
      root.style.setProperty('background-color', theme.backgroundColor)
      root.style.setProperty('background-image', 'none')
    } else if (theme.backgroundType === 'gradient' && theme.backgroundGradient) {
      root.style.setProperty('background-image', theme.backgroundGradient)
    } else if (theme.backgroundType === 'image' && theme.backgroundImage) {
      root.style.setProperty('background-image', `url(${theme.backgroundImage})`)
      root.style.setProperty('background-size', 'cover')
      root.style.setProperty('background-position', 'center')
    }
    
    // Apply template-specific styles
    root.dataset.themeTemplate = theme.templateId.toString()
    
    // Clean up
    return () => {
      // Remove CSS variables
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key)
      })
      
      // Remove background
      root.style.removeProperty('background-color')
      root.style.removeProperty('background-image')
      root.style.removeProperty('background-size')
      root.style.removeProperty('background-position')
      
      // Remove template-specific styles
      delete root.dataset.themeTemplate
    }
  }, [theme, cssVariables])
  
  // Function to apply theme to a specific element
  const applyTheme = (element: HTMLElement) => {
    // Apply CSS variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      element.style.setProperty(key, value as string)
    })
    
    // Apply template-specific styles
    element.dataset.themeTemplate = theme.templateId.toString()
  }
  
  // Context value
  const contextValue = useMemo(() => ({
    theme,
    applyTheme
  }), [theme])
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`theme-template-${theme.templateId}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

/**
 * Hook to use the project theme
 */
export function useProjectTheme() {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useProjectTheme must be used within a ProjectThemeProvider')
  }
  
  return context
}

/**
 * Generate CSS for the theme templates
 * This can be included in a global CSS file
 */
export const themeTemplateCSS = `
  /* Crypto Pro (Template 1) */
  .theme-template-1 {
    --card-bg: rgba(10, 15, 31, 0.85);
    --card-border: rgba(255, 255, 255, 0.05);
    --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    --button-glow: 0 0 15px var(--theme-primary-color);
    --transition-speed: 0.3s;
    --border-radius: 12px;
  }
  
  /* Minimal Modern (Template 2) */
  .theme-template-2 {
    --card-bg: rgba(10, 15, 31, 0.95);
    --card-border: var(--theme-primary-color);
    --card-shadow: none;
    --button-glow: none;
    --transition-speed: 0.2s;
    --border-radius: 4px;
  }
  
  /* Gradient Glow (Template 3) */
  .theme-template-3 {
    --card-bg: rgba(10, 15, 31, 0.7);
    --card-border: rgba(255, 255, 255, 0.1);
    --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    --button-glow: 0 0 20px var(--theme-primary-color);
    --transition-speed: 0.4s;
    --border-radius: 16px;
  }
  
  /* Enterprise (Template 4) */
  .theme-template-4 {
    --card-bg: rgba(10, 15, 31, 0.9);
    --card-border: rgba(255, 255, 255, 0.1);
    --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    --button-glow: none;
    --transition-speed: 0.25s;
    --border-radius: 8px;
  }
`
