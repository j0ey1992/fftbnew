'use client'

import { useState } from 'react'
import { ProjectComponent } from '@/types/project'
import { v4 as uuidv4 } from 'uuid'

export type BaseLayoutType = 'blank' | 'landing' | 'info' | 'portfolio' | 'blog'

interface BaseLayoutsProps {
  onSelect: (components: ProjectComponent[]) => void
  onCancel: () => void
}

/**
 * BaseLayouts component
 * Provides predefined page layouts for users to choose from
 */
export function BaseLayouts({
  onSelect,
  onCancel
}: BaseLayoutsProps) {
  const [selectedLayout, setSelectedLayout] = useState<BaseLayoutType | null>(null)
  
  // Generate components for the selected layout
  const generateComponents = (layoutType: BaseLayoutType): ProjectComponent[] => {
    switch (layoutType) {
      case 'blank':
        return []
      
      case 'landing':
        return [
          {
            id: uuidv4(),
            type: 'hero',
            content: {
              title: 'Welcome to Our Platform',
              subtitle: 'The next generation Web3 experience',
              ctaText: 'Get Started',
              ctaLink: '#features'
            },
            position: 'hero-main',
            isActive: true
          },
          {
            id: uuidv4(),
            type: 'section',
            content: {
              title: 'Features',
              items: [
                { title: 'Feature 1', description: 'Description of feature 1' },
                { title: 'Feature 2', description: 'Description of feature 2' },
                { title: 'Feature 3', description: 'Description of feature 3' }
              ]
            },
            position: 'features-section',
            isActive: true
          }
        ]
      
      case 'info':
        return [
          {
            id: uuidv4(),
            type: 'section',
            content: {
              title: 'About Us',
              text: 'Information about your project or organization.'
            },
            position: 'about-section',
            isActive: true
          },
          {
            id: uuidv4(),
            type: 'section',
            content: {
              title: 'Our Mission',
              text: 'Description of your mission and goals.'
            },
            position: 'mission-section',
            isActive: true
          }
        ]
      
      case 'portfolio':
        return [
          {
            id: uuidv4(),
            type: 'section',
            content: {
              title: 'My Projects',
              items: [
                { title: 'Project 1', description: 'Description of project 1' },
                { title: 'Project 2', description: 'Description of project 2' },
                { title: 'Project 3', description: 'Description of project 3' }
              ]
            },
            position: 'portfolio-section',
            isActive: true
          }
        ]
      
      case 'blog':
        return [
          {
            id: uuidv4(),
            type: 'section',
            content: {
              title: 'Latest Articles',
              items: [
                { title: 'Article 1', description: 'Summary of article 1' },
                { title: 'Article 2', description: 'Summary of article 2' }
              ]
            },
            position: 'blog-section',
            isActive: true
          }
        ]
      
      default:
        return []
    }
  }
  
  // Handle layout selection
  const handleLayoutSelect = (layoutType: BaseLayoutType) => {
    setSelectedLayout(layoutType)
    const components = generateComponents(layoutType)
    onSelect(components)
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[rgba(20,25,45,0.95)] rounded-lg shadow-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Choose a Layout Template</h2>
          <p className="text-white/60 mt-1">Select a layout for your new page</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Blank Layout */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLayout === 'blank' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
            onClick={() => setSelectedLayout('blank')}
          >
            <div className="h-32 bg-white/10 rounded flex items-center justify-center mb-3">
              <span className="text-white/60">Empty Page</span>
            </div>
            <h3 className="text-white font-medium">Blank</h3>
            <p className="text-white/60 text-sm mt-1">Start with a clean slate</p>
          </div>
          
          {/* Landing Page Layout */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLayout === 'landing' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
            onClick={() => setSelectedLayout('landing')}
          >
            <div className="h-32 bg-white/10 rounded flex flex-col mb-3">
              <div className="h-1/2 bg-blue-500/20 rounded-t flex items-center justify-center">
                <span className="text-white/60 text-xs">Hero Section</span>
              </div>
              <div className="h-1/2 bg-white/10 rounded-b flex items-center justify-center">
                <span className="text-white/60 text-xs">Features Section</span>
              </div>
            </div>
            <h3 className="text-white font-medium">Landing Page</h3>
            <p className="text-white/60 text-sm mt-1">Hero section with features</p>
          </div>
          
          {/* Info Page Layout */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLayout === 'info' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
            onClick={() => setSelectedLayout('info')}
          >
            <div className="h-32 bg-white/10 rounded flex flex-col mb-3">
              <div className="h-1/2 bg-purple-500/20 rounded-t flex items-center justify-center">
                <span className="text-white/60 text-xs">About Section</span>
              </div>
              <div className="h-1/2 bg-white/10 rounded-b flex items-center justify-center">
                <span className="text-white/60 text-xs">Mission Section</span>
              </div>
            </div>
            <h3 className="text-white font-medium">Info Page</h3>
            <p className="text-white/60 text-sm mt-1">About and mission sections</p>
          </div>
          
          {/* Portfolio Layout */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLayout === 'portfolio' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
            onClick={() => setSelectedLayout('portfolio')}
          >
            <div className="h-32 bg-white/10 rounded flex flex-col mb-3">
              <div className="h-full bg-green-500/20 rounded flex items-center justify-center">
                <span className="text-white/60 text-xs">Portfolio Grid</span>
              </div>
            </div>
            <h3 className="text-white font-medium">Portfolio</h3>
            <p className="text-white/60 text-sm mt-1">Showcase your projects</p>
          </div>
          
          {/* Blog Layout */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLayout === 'blog' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
            onClick={() => setSelectedLayout('blog')}
          >
            <div className="h-32 bg-white/10 rounded flex flex-col mb-3">
              <div className="h-full bg-amber-500/20 rounded flex items-center justify-center">
                <span className="text-white/60 text-xs">Blog Articles</span>
              </div>
            </div>
            <h3 className="text-white font-medium">Blog</h3>
            <p className="text-white/60 text-sm mt-1">Display articles or news</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedLayout
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600/50 text-white/70 cursor-not-allowed'
            }`}
            onClick={() => selectedLayout && handleLayoutSelect(selectedLayout)}
            disabled={!selectedLayout}
          >
            Select Layout
          </button>
        </div>
      </div>
    </div>
  )
}
