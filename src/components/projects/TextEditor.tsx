'use client'

import { useState, useEffect } from 'react'

interface TextEditorProps {
  initialText: string
  onTextChange: (text: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  textAlign?: 'left' | 'center' | 'right'
  textColor?: string
}

/**
 * Text editor component
 * Allows users to edit text content with formatting options
 */
export function TextEditor({
  initialText,
  onTextChange,
  placeholder = 'Enter text here',
  multiline = false,
  className = '',
  fontSize = 'md',
  fontWeight = 'normal',
  textAlign = 'left',
  textColor = '#ffffff'
}: TextEditorProps) {
  const [text, setText] = useState(initialText)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFontSize, setSelectedFontSize] = useState(fontSize)
  const [selectedFontWeight, setSelectedFontWeight] = useState(fontWeight)
  const [selectedTextAlign, setSelectedTextAlign] = useState(textAlign)
  const [selectedTextColor, setSelectedTextColor] = useState(textColor)

  // Update local state when initialText changes
  useEffect(() => {
    setText(initialText)
  }, [initialText])

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  // Handle save
  const handleSave = () => {
    onTextChange(text)
    setIsEditing(false)
  }

  // Handle cancel
  const handleCancel = () => {
    setText(initialText)
    setIsEditing(false)
  }

  // Handle font size change
  const handleFontSizeChange = (size: TextEditorProps['fontSize']) => {
    if (size) {
      setSelectedFontSize(size)
    }
  }

  // Handle font weight change
  const handleFontWeightChange = (weight: TextEditorProps['fontWeight']) => {
    if (weight) {
      setSelectedFontWeight(weight)
    }
  }

  // Handle text align change
  const handleTextAlignChange = (align: TextEditorProps['textAlign']) => {
    if (align) {
      setSelectedTextAlign(align)
    }
  }

  // Handle text color change
  const handleTextColorChange = (color: string) => {
    setSelectedTextColor(color)
  }

  // Apply formatting to text
  const applyFormatting = () => {
    // Generate CSS class based on selected formatting options
    const formattingClass = `text-${selectedFontSize} font-${selectedFontWeight} text-${selectedTextAlign}`
    
    // Apply formatting to text
    onTextChange(text)
    
    // Store formatting in localStorage
    try {
      localStorage.setItem(`text-format-${text.substring(0, 20)}`, JSON.stringify({
        fontSize: selectedFontSize,
        fontWeight: selectedFontWeight,
        textAlign: selectedTextAlign,
        textColor: selectedTextColor
      }))
    } catch (error) {
      console.error('Error saving text formatting:', error)
    }
    
    setIsEditing(false)
  }

  // Font size options
  const fontSizeOptions = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: '2X Large' },
    { value: '3xl', label: '3X Large' },
    { value: '4xl', label: '4X Large' },
    { value: '5xl', label: '5X Large' }
  ]

  // Font weight options
  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semi Bold' },
    { value: 'bold', label: 'Bold' }
  ]

  // Text align options
  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ]

  // Color presets
  const colorPresets = [
    { value: '#ffffff', label: 'White' },
    { value: '#f3f4f6', label: 'Gray 100' },
    { value: '#3b82f6', label: 'Blue 500' },
    { value: '#8b5cf6', label: 'Purple 500' },
    { value: '#10b981', label: 'Green 500' },
    { value: '#f59e0b', label: 'Amber 500' },
    { value: '#ef4444', label: 'Red 500' }
  ]

  return (
    <div className={`relative ${className}`}>
      {isEditing ? (
        <div className="space-y-4">
          {/* Text input */}
          {multiline ? (
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          )}
          
          {/* Formatting options */}
          <div className="space-y-3 p-4 bg-[#0a0f1f] border border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Text Formatting</h4>
            
            {/* Font size */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Font Size</label>
              <select
                value={selectedFontSize}
                onChange={(e) => handleFontSizeChange(e.target.value as TextEditorProps['fontSize'])}
                className="bg-[#0a0f1f] border border-gray-700 rounded text-xs px-2 py-1"
              >
                {fontSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Font weight */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Font Weight</label>
              <select
                value={selectedFontWeight}
                onChange={(e) => handleFontWeightChange(e.target.value as TextEditorProps['fontWeight'])}
                className="bg-[#0a0f1f] border border-gray-700 rounded text-xs px-2 py-1"
              >
                {fontWeightOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Text align */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Text Align</label>
              <div className="flex space-x-1">
                {textAlignOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTextAlign === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => handleTextAlignChange(option.value as TextEditorProps['textAlign'])}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Text color */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Text Color</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded border border-gray-600"
                  style={{ backgroundColor: selectedTextColor }}
                />
                <input
                  type="color"
                  value={selectedTextColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-8 h-8 rounded overflow-hidden cursor-pointer bg-transparent"
                />
              </div>
            </div>
            
            {/* Color presets */}
            <div className="flex flex-wrap gap-1 mt-2">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  className={`w-6 h-6 rounded-full border ${
                    selectedTextColor === color.value ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleTextColorChange(color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div className="p-4 border border-gray-700 rounded-lg">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Preview</h4>
            <div 
              className={`text-${selectedFontSize} font-${selectedFontWeight} text-${selectedTextAlign}`}
              style={{ color: selectedTextColor }}
            >
              {text || placeholder}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              className="px-3 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded text-sm"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              onClick={applyFormatting}
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`cursor-pointer ${className}`}
          onClick={() => setIsEditing(true)}
          style={{ color: selectedTextColor }}
        >
          <div className={`text-${selectedFontSize} font-${selectedFontWeight} text-${selectedTextAlign}`}>
            {text || placeholder}
          </div>
          <div className="absolute inset-0 bg-blue-500/0 hover:bg-blue-500/10 transition-colors duration-200"></div>
        </div>
      )}
    </div>
  )
}
