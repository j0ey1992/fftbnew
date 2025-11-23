'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { GlassCard, Button } from '@/components/ui'
import { ComponentType } from '@/types/project'

interface ComponentBuilderProps {
  onAddComponent: (component: {
    id: string
    type: ComponentType
    name: string
    template: number
  }) => void
}

/**
 * Component builder
 * Allows users to create custom components
 */
export function ComponentBuilder({ onAddComponent }: ComponentBuilderProps) {
  const [componentName, setComponentName] = useState('')
  const [componentType, setComponentType] = useState<ComponentType>('section')
  const [templateId, setTemplateId] = useState<number>(1)
  const [isCreating, setIsCreating] = useState(false)

  // Handle component creation
  const handleCreateComponent = () => {
    if (!componentName.trim()) return

    setIsCreating(true)

    try {
      const newComponent = {
        id: `custom-${uuidv4()}`,
        type: componentType,
        name: componentName,
        template: templateId
      }

      onAddComponent(newComponent)
      
      // Reset form
      setComponentName('')
      setComponentType('section')
      setTemplateId(1)
    } catch (error) {
      console.error('Error creating component:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <GlassCard elevation="flat">
      <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
        <h3 className="text-xl font-bold">Create Custom Component</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Component Name */}
          <div className="space-y-2">
            <label htmlFor="component-name" className="block text-sm font-medium text-gray-300">
              Component Name
            </label>
            <input
              id="component-name"
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="e.g., My Custom Header"
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Component Type */}
          <div className="space-y-2">
            <label htmlFor="component-type" className="block text-sm font-medium text-gray-300">
              Component Type
            </label>
            <select
              id="component-type"
              value={componentType}
              onChange={(e) => setComponentType(e.target.value as ComponentType)}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="section">Section</option>
              <option value="header">Header</option>
              <option value="footer">Footer</option>
              <option value="card">Card</option>
              <option value="button">Button</option>
              <option value="navigation">Navigation</option>
              <option value="hero">Hero</option>
            </select>
          </div>

          {/* Starting Template */}
          <div className="space-y-2">
            <label htmlFor="template-id" className="block text-sm font-medium text-gray-300">
              Starting Template
            </label>
            <select
              id="template-id"
              value={templateId}
              onChange={(e) => setTemplateId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Template 1 - Default</option>
              <option value={2}>Template 2 - Minimal</option>
              <option value={3}>Template 3 - Gradient</option>
              <option value={4}>Template 4 - Glass</option>
              <option value={5}>Template 5 - Custom</option>
            </select>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateComponent}
              isLoading={isCreating}
              disabled={isCreating || !componentName.trim()}
            >
              Create Component
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
