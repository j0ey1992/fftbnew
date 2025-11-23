'use client'

import { ReactNode } from 'react'
import { EditableComponent } from './EditableComponent'
import { useComponentStyles } from './ComponentStyleProvider'

interface EditableHeaderProps {
  children?: ReactNode
  className?: string
  componentId?: string
}

/**
 * Editable header component
 * Wraps a header with the EditableComponent wrapper
 */
export function EditableHeader({
  children,
  className = '',
  componentId = 'header-main'
}: EditableHeaderProps) {
  const { isEditMode, updateComponentStyle, styles } = useComponentStyles()

  // Handle style change
  const handleStyleChange = (id: string, css: string) => {
    updateComponentStyle(id, css)
  }

  return (
    <EditableComponent
      componentType="header"
      componentId={componentId}
      isEditMode={isEditMode}
      onStyleChange={handleStyleChange}
    >
      <header className={`component-${componentId} ${className}`}>
        {children}
      </header>
    </EditableComponent>
  )
}
