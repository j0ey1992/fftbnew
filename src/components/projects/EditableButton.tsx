'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import { EditableComponent } from './EditableComponent'
import { useComponentStyles } from './ComponentStyleProvider'

interface EditableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  className?: string
  componentId: string
  variant?: string
  size?: string
  fullWidth?: boolean
}

/**
 * Editable button component
 * Wraps a button with the EditableComponent wrapper
 */
export function EditableButton({
  children,
  className = '',
  componentId,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}: EditableButtonProps) {
  const { isEditMode, updateComponentStyle } = useComponentStyles()

  // Handle style change
  const handleStyleChange = (id: string, css: string) => {
    updateComponentStyle(id, css)
  }

  return (
    <EditableComponent
      componentType="button"
      componentId={componentId}
      isEditMode={isEditMode}
      onStyleChange={handleStyleChange}
    >
      <button 
        className={`component-${componentId} ${className}`}
        {...props}
      >
        {children}
      </button>
    </EditableComponent>
  )
}
