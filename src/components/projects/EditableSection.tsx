'use client'

import { ReactNode, CSSProperties } from 'react'
import { EditableComponent } from './EditableComponent'
import { useComponentStyles } from './ComponentStyleProvider'
import { ComponentType } from '@/types/project'

interface EditableSectionProps {
  children?: ReactNode
  className?: string
  componentId: string
  componentType?: ComponentType
  style?: CSSProperties
}

/**
 * Editable section component
 * Wraps a section with the EditableComponent wrapper
 */
export function EditableSection({
  children,
  className = '',
  componentId,
  componentType = 'section',
  style
}: EditableSectionProps) {
  const { isEditMode, updateComponentStyle } = useComponentStyles()

  // Handle style change
  const handleStyleChange = (id: string, css: string) => {
    updateComponentStyle(id, css)
  }

  return (
    <EditableComponent
      componentType={componentType}
      componentId={componentId}
      isEditMode={isEditMode}
      onStyleChange={handleStyleChange}
    >
      <section className={`component-${componentId} ${className}`} style={style}>
        {children}
      </section>
    </EditableComponent>
  )
}
