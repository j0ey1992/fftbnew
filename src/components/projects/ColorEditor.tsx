'use client'

import { useState, useEffect } from 'react'

interface ColorEditorProps {
  initialColors?: Record<string, string>
  onColorsChange: (colors: Record<string, string>) => void
  componentType: string
}

/**
 * Color editor component
 * Allows users to customize component colors
 */
export function ColorEditor({
  initialColors = {},
  onColorsChange,
  componentType
}: ColorEditorProps) {
  const [colors, setColors] = useState<Record<string, string>>(initialColors)

  // Update local state when initialColors changes
  useEffect(() => {
    setColors(initialColors)
  }, [initialColors])

  // Handle color change
  const handleColorChange = (property: string, value: string) => {
    const updatedColors = {
      ...colors,
      [property]: value
    }
    setColors(updatedColors)
    onColorsChange(updatedColors)
  }

  // Get color property label
  const getColorLabel = (property: string) => {
    switch (property) {
      case 'background':
        return 'Background Color'
      case 'text':
        return 'Text Color'
      case 'border':
        return 'Border Color'
      case 'hoverBackground':
        return 'Hover Background'
      case 'hoverText':
        return 'Hover Text'
      case 'hoverBorder':
        return 'Hover Border'
      case 'accent':
        return 'Accent Color'
      default:
        return property.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }
  }

  // Get default colors based on component type
  const getDefaultColorProperties = () => {
    const commonProperties = ['background', 'text', 'border']
    
    switch (componentType) {
      case 'button':
        return [...commonProperties, 'hoverBackground', 'hoverText']
      case 'header':
        return [...commonProperties]
      case 'card':
        return [...commonProperties, 'accent']
      case 'hero':
        return [...commonProperties, 'accent']
      default:
        return commonProperties
    }
  }

  // Get color properties to display
  const colorProperties = Object.keys(colors).length > 0 
    ? Object.keys(colors) 
    : getDefaultColorProperties()

  return (
    <div className="space-y-4">
      {colorProperties.map(property => (
        <div key={property} className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">
              {getColorLabel(property)}
            </label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded border border-gray-600"
                style={{ backgroundColor: colors[property] || 'transparent' }}
              />
              <input
                type="color"
                value={colors[property] || '#ffffff'}
                onChange={(e) => handleColorChange(property, e.target.value)}
                className="w-8 h-8 rounded overflow-hidden cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <input
            type="text"
            value={colors[property] || ''}
            onChange={(e) => handleColorChange(property, e.target.value)}
            placeholder={`Enter ${property} color`}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg text-sm"
          />
        </div>
      ))}

      {/* Add new color property */}
      <div className="pt-2">
        <button
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          onClick={() => {
            const newProperty = prompt('Enter color property name (e.g., accent, highlight):')
            if (newProperty && !colors[newProperty]) {
              handleColorChange(newProperty, '#ffffff')
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Color Property
        </button>
      </div>

      {/* Gradient option */}
      <div className="pt-2">
        <button
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          onClick={() => {
            if (!colors.background?.includes('gradient')) {
              handleColorChange('background', 'linear-gradient(135deg, #3b82f6, #8b5cf6)')
            } else {
              // If already a gradient, prompt to edit
              const newGradient = prompt('Edit gradient:', colors.background)
              if (newGradient) {
                handleColorChange('background', newGradient)
              }
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          {colors.background?.includes('gradient') ? 'Edit Gradient' : 'Use Gradient Background'}
        </button>
      </div>

      {/* Color presets */}
      <div className="pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Color Presets</h4>
        <div className="grid grid-cols-4 gap-2">
          <button
            className="h-8 rounded-md border border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600"
            onClick={() => {
              handleColorChange('background', 'linear-gradient(90deg, #3b82f6, #8b5cf6)')
              handleColorChange('text', '#ffffff')
            }}
            title="Blue to Purple Gradient"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-gradient-to-r from-green-400 to-blue-500"
            onClick={() => {
              handleColorChange('background', 'linear-gradient(90deg, #10b981, #3b82f6)')
              handleColorChange('text', '#ffffff')
            }}
            title="Green to Blue Gradient"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => {
              handleColorChange('background', 'linear-gradient(90deg, #8b5cf6, #ec4899)')
              handleColorChange('text', '#ffffff')
            }}
            title="Purple to Pink Gradient"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-gradient-to-r from-yellow-400 to-orange-500"
            onClick={() => {
              handleColorChange('background', 'linear-gradient(90deg, #fbbf24, #f97316)')
              handleColorChange('text', '#ffffff')
            }}
            title="Yellow to Orange Gradient"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-[#0f172a]"
            onClick={() => {
              handleColorChange('background', '#0f172a')
              handleColorChange('text', '#ffffff')
            }}
            title="Dark Blue"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-[#1e293b]"
            onClick={() => {
              handleColorChange('background', '#1e293b')
              handleColorChange('text', '#ffffff')
            }}
            title="Slate"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-[#3b82f6]"
            onClick={() => {
              handleColorChange('background', '#3b82f6')
              handleColorChange('text', '#ffffff')
            }}
            title="Blue"
          />
          <button
            className="h-8 rounded-md border border-gray-700 bg-[#8b5cf6]"
            onClick={() => {
              handleColorChange('background', '#8b5cf6')
              handleColorChange('text', '#ffffff')
            }}
            title="Purple"
          />
        </div>
      </div>
    </div>
  )
}
