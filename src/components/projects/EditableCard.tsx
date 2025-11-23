'use client'

import { ReactNode } from 'react'
import { EditableComponent } from './EditableComponent'
import { useComponentStyles } from './ComponentStyleProvider'

interface EditableCardProps {
  children?: ReactNode
  className?: string
  componentId: string
}

/**
 * Editable card component
 * Wraps a card with the EditableComponent wrapper
 */
export function EditableCard({
  children,
  className = '',
  componentId
}: EditableCardProps) {
  const { isEditMode, updateComponentStyle } = useComponentStyles()

  // Handle style change
  const handleStyleChange = (id: string, css: string) => {
    updateComponentStyle(id, css)
  }

  return (
    <EditableComponent
      componentType="card"
      componentId={componentId}
      isEditMode={isEditMode}
      onStyleChange={handleStyleChange}
    >
      <div className={`component-${componentId} ${className}`}>
        {children}
      </div>
    </EditableComponent>
  )
}
