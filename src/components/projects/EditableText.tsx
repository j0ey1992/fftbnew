'use client'

import { useState, useEffect } from 'react'
import { TextEditor } from './TextEditor'

interface EditableTextProps {
  children: React.ReactNode
  isEditMode?: boolean
  componentId: string
  onTextChange?: (text: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
}

/**
 * Editable text component
 * Allows inline text editing when in edit mode
 */
export function EditableText({
  children,
  isEditMode = true,
  componentId,
  onTextChange,
  className = '',
  placeholder = 'Click to edit text',
  multiline = false
}: EditableTextProps) {
  const [text, setText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [textFormatting, setTextFormatting] = useState({
    fontSize: 'md',
    fontWeight: 'normal',
    textAlign: 'left',
    textColor: '#ffffff'
  })

  // Extract text from children on mount
  useEffect(() => {
    if (typeof children === 'string') {
      setText(children)
    } else if (
      children && 
      typeof children === 'object' && 
      'props' in (children as any) && 
      typeof (children as any).props.children === 'string'
    ) {
      setText((children as any).props.children)
    }
    
    // Try to load saved formatting from localStorage
    try {
      const savedFormatting = localStorage.getItem(`text-format-${componentId}`)
      if (savedFormatting) {
        setTextFormatting(JSON.parse(savedFormatting))
      }
    } catch (error) {
      console.error('Error loading text formatting:', error)
    }
  }, [children, componentId])

  // Handle text change
  const handleTextChange = (newText: string) => {
    setText(newText)
    
    if (onTextChange) {
      onTextChange(newText)
    }
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem(`text-content-${componentId}`, newText)
    } catch (error) {
      console.error('Error saving text content:', error)
    }
    
    setIsEditing(false)
  }

  // If not in edit mode, just render the children
  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div className={`relative group ${className}`}>
      {isEditing ? (
        <TextEditor
          initialText={text}
          onTextChange={handleTextChange}
          placeholder={placeholder}
          multiline={multiline}
          fontSize={textFormatting.fontSize as any}
          fontWeight={textFormatting.fontWeight as any}
          textAlign={textFormatting.textAlign as any}
          textColor={textFormatting.textColor}
        />
      ) : (
        <div 
          className="cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          <span 
            className={`text-${textFormatting.fontSize} font-${textFormatting.fontWeight} text-${textFormatting.textAlign} inline-block`}
            style={{ color: textFormatting.textColor }}
          >
            {text || placeholder}
          </span>
          
          {/* Edit indicator */}
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-200"></div>
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md">
              Edit Text
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
