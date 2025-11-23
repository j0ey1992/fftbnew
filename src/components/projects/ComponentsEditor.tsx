'use client'

import { useState } from 'react'
import { Project, ComponentStyle, ComponentType } from '@/types/project'
import { GlassCard, Button } from '@/components/ui'
import { ComponentStyleProvider } from './ComponentStyleProvider'
import { EditableHeader } from './EditableHeader'
import { EditableSection } from './EditableSection'
import { EditableButton } from './EditableButton'
import { EditableCard } from './EditableCard'
import { ComponentBuilder } from './ComponentBuilder'
import { ComponentTemplates } from './ComponentTemplates'
import { v4 as uuidv4 } from 'uuid'

interface ComponentsEditorProps {
  project: Project
  onChange: (componentStyles: ComponentStyle[]) => void
}

/**
 * Components editor
 * Allows users to customize individual components
 */
export function ComponentsEditor({ project, onChange }: ComponentsEditorProps) {
  const [activePreview, setActivePreview] = useState<'header' | 'hero' | 'card' | 'button'>('header')
  const [componentStyles, setComponentStyles] = useState<ComponentStyle[]>(project.componentStyles || [])
  const [isEditMode, setIsEditMode] = useState(true)

  // Handle component style changes
  const handleComponentStylesChange = (styles: ComponentStyle[]) => {
    setComponentStyles(styles)
    onChange(styles)
  }

  // Preview components
  const previewComponents = {
    header: (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Header Preview</h3>
        <EditableHeader componentId="preview-header">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="ml-2 text-lg font-bold text-white">Project Name</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                  Home
                </a>
                <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                  Features
                </a>
                <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                  About
                </a>
                <EditableButton componentId="preview-header-button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Connect
                </EditableButton>
              </nav>
            </div>
          </div>
        </EditableHeader>
      </div>
    ),
    
    hero: (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Hero Section Preview</h3>
        <EditableSection
          componentId="preview-hero"
          componentType="hero"
          className="py-16 px-4 rounded-lg"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Welcome to Your Project
            </h1>
            <p className="text-xl mb-8 text-white/80">
              A customizable Web3 project with various DeFi features
            </p>
            <EditableButton
              componentId="preview-hero-button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
            >
              Get Started
            </EditableButton>
          </div>
        </EditableSection>
      </div>
    ),
    
    card: (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Card Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <EditableCard key={i} componentId={`preview-card-${i}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Feature {i}</h3>
                <p className="text-gray-300 mb-4">
                  This is a sample feature description. You can customize this card's appearance.
                </p>
                <EditableButton
                  componentId={`preview-card-button-${i}`}
                  className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-4 py-2 rounded-lg text-sm"
                >
                  Learn More
                </EditableButton>
              </div>
            </EditableCard>
          ))}
        </div>
      </div>
    ),
    
    button: (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Button Previews</h3>
        <div className="flex flex-wrap gap-4">
          <EditableButton
            componentId="preview-button-primary"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Primary Button
          </EditableButton>
          
          <EditableButton
            componentId="preview-button-secondary"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Secondary Button
          </EditableButton>
          
          <EditableButton
            componentId="preview-button-outline"
            className="border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-4 py-2 rounded-lg"
          >
            Outline Button
          </EditableButton>
          
          <EditableButton
            componentId="preview-button-glass"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            Glass Button
          </EditableButton>
        </div>
      </div>
    )
  }

  return (
    <ComponentStyleProvider
      project={project}
      onStylesChange={handleComponentStylesChange}
    >
      <div className="space-y-8">
        {/* Instructions */}
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Component Customization</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Customize individual components of your project. Hover over a component and click the "Edit" button to customize its appearance.
            </p>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
              <h4 className="font-medium text-blue-400 mb-2">How it works:</h4>
              <ol className="list-decimal list-inside text-gray-300 space-y-2">
                <li>Select a component type from the tabs below</li>
                <li>Hover over a component to see the edit button</li>
                <li>Click "Edit" to customize the component's appearance</li>
                <li>Choose from templates or use AI to generate custom styles</li>
              </ol>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant={isEditMode ? 'primary' : 'glass'}
                size="md"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              </Button>
            </div>
          </div>
        </GlassCard>
        
        {/* Component Type Tabs */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            <div 
              className={`px-4 py-2 border-b-2 ${
                activePreview === 'header' ? 'border-blue-500 text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'
              } cursor-pointer whitespace-nowrap`}
              onClick={() => setActivePreview('header')}
            >
              Header
            </div>
            <div 
              className={`px-4 py-2 border-b-2 ${
                activePreview === 'hero' ? 'border-blue-500 text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'
              } cursor-pointer whitespace-nowrap`}
              onClick={() => setActivePreview('hero')}
            >
              Hero Section
            </div>
            <div 
              className={`px-4 py-2 border-b-2 ${
                activePreview === 'card' ? 'border-blue-500 text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'
              } cursor-pointer whitespace-nowrap`}
              onClick={() => setActivePreview('card')}
            >
              Cards
            </div>
            <div 
              className={`px-4 py-2 border-b-2 ${
                activePreview === 'button' ? 'border-blue-500 text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'
              } cursor-pointer whitespace-nowrap`}
              onClick={() => setActivePreview('button')}
            >
              Buttons
            </div>
          </div>
        </div>
        
        {/* Preview Area */}
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Component Preview</h3>
          </div>
          <div className="p-6">
            {previewComponents[activePreview]}
          </div>
        </GlassCard>
        
        {/* Custom Component Builder */}
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Create Custom Component</h3>
          </div>
          <div className="p-6">
            <ComponentBuilder 
              onAddComponent={(component) => {
                // Create a new component style
                const newStyle: ComponentStyle = {
                  id: component.id,
                  componentType: component.type,
                  templateId: component.template as any,
                  name: component.name,
                  customStyles: {}
                }
                
                // Add to component styles
                const updatedStyles = [...componentStyles, newStyle]
                handleComponentStylesChange(updatedStyles)
                
                // Show appropriate preview
                setActivePreview(
                  component.type === 'header' ? 'header' :
                  component.type === 'hero' ? 'hero' :
                  component.type === 'card' ? 'card' :
                  component.type === 'button' ? 'button' : 'header'
                )
              }}
            />
          </div>
        </GlassCard>
        
        {/* Component Templates */}
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">Component Templates</h3>
          </div>
          <div className="p-6">
            <ComponentTemplates 
              onSelectTemplate={(templateId) => {
                // Find the template type from the ID
                const templateType = templateId.split('-')[0] as ComponentType
                
                // Create a new component with a unique ID
                const newComponentId = `${templateType}-${uuidv4()}`
                
                // Create a new component style
                const newStyle: ComponentStyle = {
                  id: newComponentId,
                  componentType: templateType,
                  templateId: 1,
                  name: `Custom ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`,
                  customStyles: {}
                }
                
                // Add to component styles
                const updatedStyles = [...componentStyles, newStyle]
                handleComponentStylesChange(updatedStyles)
                
                // Show appropriate preview
                setActivePreview(
                  templateType === 'header' ? 'header' :
                  templateType === 'hero' ? 'hero' :
                  templateType === 'card' ? 'card' :
                  templateType === 'button' ? 'button' : 'header'
                )
              }}
              filterType={activePreview as ComponentType}
            />
          </div>
        </GlassCard>
        
        {/* AI Design Suggestions */}
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
            <h3 className="text-xl font-bold">AI Design Suggestions</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Get AI-powered design suggestions for your components. Click on a suggestion to apply it to the selected component.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200">
                <h4 className="font-medium text-white mb-2">Crypto.com Style</h4>
                <p className="text-sm text-gray-400">
                  Dark theme with glass morphism, subtle gradients, and premium feel inspired by Crypto.com
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200">
                <h4 className="font-medium text-white mb-2">Neon Cyberpunk</h4>
                <p className="text-sm text-gray-400">
                  Futuristic design with neon accents, glowing elements, and high contrast colors
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200">
                <h4 className="font-medium text-white mb-2">Minimal Modern</h4>
                <p className="text-sm text-gray-400">
                  Clean, minimalist design with ample whitespace, subtle shadows, and elegant typography
                </p>
              </div>
              
              <div className="p-4 border border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200">
                <h4 className="font-medium text-white mb-2">Gradient Glow</h4>
                <p className="text-sm text-gray-400">
                  Vibrant gradients with glowing elements, soft shadows, and smooth transitions
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Describe your own style..."
                className="flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                variant="primary"
                size="md"
              >
                Generate
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </ComponentStyleProvider>
  )
}
