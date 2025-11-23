'use client'

import { useState } from 'react'
import { ProjectComponent } from '@/types/project'
import { BaseLayouts, BaseLayoutType } from './BaseLayouts'

interface TemplateSelectorProps {
  onSelect: (components: ProjectComponent[]) => void
  onCancel: () => void
}

/**
 * TemplateSelector component
 * Allows users to choose from predefined page templates
 */
export function TemplateSelector({
  onSelect,
  onCancel
}: TemplateSelectorProps) {
  // We're using BaseLayouts component to provide the template selection UI
  return (
    <BaseLayouts
      onSelect={onSelect}
      onCancel={onCancel}
    />
  )
}
