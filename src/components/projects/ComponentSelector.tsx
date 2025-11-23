'use client'

import { useState } from 'react'
import { ComponentType } from '@/types/project'
import { v4 as uuidv4 } from 'uuid'

interface ComponentOption {
  type: ComponentType
  name: string
  description: string
  icon: React.ReactNode
}

interface ComponentSelectorProps {
  onSelect: (type: ComponentType, position: string) => void
  onCancel: () => void
}

/**
 * Component selector modal
 * Allows users to select a component type to add to the project
 */
export function ComponentSelector({ onSelect, onCancel }: ComponentSelectorProps) {
  const [selectedType, setSelectedType] = useState<ComponentType | null>(null)
  const [position, setPosition] = useState<string>('main')

  // Component options
  const componentOptions: ComponentOption[] = [
    {
      type: 'section',
      name: 'Content Section',
      description: 'A general content section for text, images, and other content',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    },
    {
      type: 'hero',
      name: 'Hero Section',
      description: 'A large banner section with title, subtitle, and optional background image',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      type: 'card',
      name: 'Card',
      description: 'A card component for displaying content in a contained box',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      type: 'button',
      name: 'Button',
      description: 'A clickable button component',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    {
      type: 'navigation',
      name: 'Navigation',
      description: 'A navigation menu component',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      )
    }
  ]

  // Position options
  const positionOptions = [
    { value: 'top', label: 'Top' },
    { value: 'main', label: 'Main Content' },
    { value: 'bottom', label: 'Bottom' }
  ]

  // Handle component selection
  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType, position)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0a0f1f] rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Add Component</h3>
          <p className="text-gray-400 mt-1">Select a component type to add to your project</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {componentOptions.map((option) => (
              <div
                key={option.type}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedType === option.type
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
                onClick={() => setSelectedType(option.type)}
              >
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-md ${
                    selectedType === option.type ? 'bg-blue-500/20' : 'bg-white/5'
                  }`}>
                    {option.icon}
                  </div>
                  <h4 className="ml-3 font-medium text-white">{option.name}</h4>
                </div>
                <p className="text-sm text-gray-400">{option.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-[#1a2035] border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {positionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedType
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600/50 text-white/70 cursor-not-allowed'
              }`}
              onClick={handleSelect}
              disabled={!selectedType}
            >
              Add Component
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
