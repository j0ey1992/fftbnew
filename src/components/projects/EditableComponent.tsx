'use client'

import { useState, useEffect, Children, cloneElement, isValidElement } from 'react'
import { ComponentType } from '@/types/project'
import { ComponentEditor } from '@/components/projects/ComponentEditor'
import { EditableText } from '@/components/projects/EditableText'
import { useComponentStyles } from './ComponentStyleProvider'

interface EditableComponentProps {
  componentType: ComponentType
  componentId: string
  children: React.ReactNode
  isEditMode: boolean
  onStyleChange?: (componentId: string, css: string) => void
}

/**
 * Editable component wrapper
 * Adds edit functionality to components when in edit mode
 */
export function EditableComponent({
  componentType,
  componentId,
  children,
  isEditMode,
  onStyleChange
}: EditableComponentProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [componentStyle, setComponentStyle] = useState<{
    colors?: Record<string, string>;
    images?: {
      backgroundImage?: string | null;
      logoImage?: string | null;
      iconImage?: string | null;
    };
  } | null>(null)

  // Load component style from localStorage
  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem(`component-style-${componentId}`)
      if (savedStyle) {
        setComponentStyle(JSON.parse(savedStyle))
      }
    } catch (error) {
      console.error('Error loading component style:', error)
    }
  }, [componentId])

  // Get component style from context
  const { styles } = useComponentStyles();
  
  // Check if this component has been marked as deleted
  // Either by having the display:none CSS or by being in a deleted component style
  const isDeleted = styles[componentId]?.includes('display: none !important');
  
  // If component is deleted, don't render it
  if (isDeleted) {
    return null;
  }
  
  // If not in edit mode, just render the children
  if (!isEditMode) {
    return <>{children}</>
  }

  // Handle style change
  const handleStyleChange = (css: string) => {
    if (onStyleChange) {
      onStyleChange(componentId, css)
    }
    setIsEditorOpen(false)
  }

  // Generate inline style based on component style
  const generateInlineStyle = () => {
    if (!componentStyle) return {}
    
    const style: React.CSSProperties = {}
    
    // Apply background image if available
    if (componentStyle.images?.backgroundImage) {
      style.backgroundImage = `url('${componentStyle.images.backgroundImage}')`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
    }
    
    return style
  }
  
  // Check if we need to render logo or icon
  const hasLogo = componentStyle?.images?.logoImage
  const hasIcon = componentStyle?.images?.iconImage
  
  // Make text content editable
  const makeTextEditable = (children: React.ReactNode, parentId: string): React.ReactNode => {
    return Children.map(children, (child, index) => {
      // If it's a string, wrap it with EditableText
      if (typeof child === 'string' && child.trim() !== '') {
        return (
          <EditableText
            componentId={`${parentId}-text-${index}`}
            isEditMode={isEditMode}
          >
            {child}
          </EditableText>
        )
      }
      
      // If it's a valid React element with children, recursively process its children
      if (isValidElement(child)) {
        const childElement = child as React.ReactElement<any>;
        
        // Special handling for paragraph tags to avoid invalid nesting
        if (childElement.type === 'p') {
          // For paragraph tags, we need to be careful about what we put inside
          // Check if the children are just strings, which is safe
          const pChildren = childElement.props.children;
          const isSimpleText = typeof pChildren === 'string' || 
                              (Array.isArray(pChildren) && 
                               pChildren.every(c => typeof c === 'string'));
          
          if (isSimpleText) {
            // If it's just text, we can safely make it editable
            return cloneElement(
              childElement,
              childElement.props,
              makeTextEditable(childElement.props.children, `${parentId}-${index}`)
            );
          } else {
            // If it might contain complex elements, convert the p to a div to avoid nesting issues
            return (
              <div className="paragraph-like">
                {makeTextEditable(childElement.props.children, `${parentId}-${index}`)}
              </div>
            );
          }
        }
        
        // For other elements, process normally
        if (childElement.props && 'children' in childElement.props) {
          // Clone the element with processed children
          return cloneElement(
            childElement,
            childElement.props,
            makeTextEditable(childElement.props.children, `${parentId}-${index}`)
          );
        }
      }
      
      // Otherwise, return the child as is
      return child
    })
  }
  
  return (
    <div className="relative group">
      {/* The actual component with applied styles */}
      <div style={generateInlineStyle()}>
        {/* If we have a logo and this is a header or card, show it */}
        {hasLogo && (componentType === 'header' || componentType === 'card') && (
          <div className="absolute top-2 left-2 z-10">
            <img 
              src={componentStyle?.images?.logoImage || ''} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
        )}
        
        {/* If we have an icon and this is a button or card, show it */}
        {hasIcon && (componentType === 'button' || componentType === 'card') && (
          <div className="absolute top-2 right-2 z-10">
            <img 
              src={componentStyle?.images?.iconImage || ''} 
              alt="Icon" 
              className="h-6 w-auto object-contain"
            />
          </div>
        )}
        
        {/* Make text content editable */}
        {makeTextEditable(children, componentId)}
      </div>

      {/* Edit overlay */}
      <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500/0 group-hover:border-blue-500/50 transition-all duration-200 pointer-events-none"></div>

      {/* Edit and Delete buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex space-x-2">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg pointer-events-auto flex items-center"
          onClick={() => setIsEditorOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </button>
        
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg pointer-events-auto flex items-center"
          onClick={(e) => {
            // Prevent event bubbling
            e.stopPropagation();
            
            // Confirm before deleting
            if (window.confirm(`Are you sure you want to delete this ${componentType}?`)) {
              // Remove the component style from localStorage
              try {
                localStorage.removeItem(`component-style-${componentId}`);
              } catch (error) {
                console.error('Error removing component style from localStorage:', error);
              }
              
              // Notify parent component about deletion
              if (onStyleChange) {
                // Pass empty CSS to indicate deletion
                onStyleChange(componentId, '');
              }
              
              // Add a console log to debug
              console.log(`Deleting component: ${componentId}`);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Delete
        </button>
      </div>

      {/* Component editor modal */}
      {isEditorOpen && (
        <ComponentEditor
          componentType={componentType}
          componentId={componentId}
          onClose={() => setIsEditorOpen(false)}
          onStyleChange={handleStyleChange}
        />
      )}
    </div>
  )
}
