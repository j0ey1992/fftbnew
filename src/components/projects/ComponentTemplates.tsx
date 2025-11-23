'use client'

import { useState } from 'react'
import { GlassCard, Button } from '@/components/ui'
import { ComponentType } from '@/types/project'

// Template categories
type TemplateCategory = 'all' | ComponentType

// Template interface
interface ComponentTemplate {
  id: string
  name: string
  type: ComponentType
  description: string
  previewImage?: string
  tags: string[]
}

// Sample templates
const sampleTemplates: ComponentTemplate[] = [
  // Headers
  {
    id: 'header-standard',
    name: 'Standard Header',
    type: 'header',
    description: 'A standard header with logo, navigation, and call-to-action button',
    tags: ['header', 'navigation', 'logo']
  },
  {
    id: 'header-transparent',
    name: 'Transparent Header',
    type: 'header',
    description: 'A transparent header that overlays content with a glass effect',
    tags: ['header', 'transparent', 'glass']
  },
  {
    id: 'header-sidebar',
    name: 'Sidebar Navigation',
    type: 'header',
    description: 'A header with a collapsible sidebar navigation for mobile',
    tags: ['header', 'sidebar', 'mobile']
  },
  
  // Cards
  {
    id: 'card-feature',
    name: 'Feature Card',
    type: 'card',
    description: 'A card for showcasing features with icon, title, and description',
    tags: ['card', 'feature', 'icon']
  },
  {
    id: 'card-pricing',
    name: 'Pricing Card',
    type: 'card',
    description: 'A card for displaying pricing information with features list',
    tags: ['card', 'pricing', 'list']
  },
  {
    id: 'card-nft',
    name: 'NFT Card',
    type: 'card',
    description: 'A card for displaying NFT items with image and metadata',
    tags: ['card', 'nft', 'image']
  },
  {
    id: 'card-stats',
    name: 'Stats Card',
    type: 'card',
    description: 'A card for displaying statistics with numbers and labels',
    tags: ['card', 'stats', 'numbers']
  },
  
  // Buttons
  {
    id: 'button-primary',
    name: 'Primary Button',
    type: 'button',
    description: 'A primary action button with gradient background',
    tags: ['button', 'primary', 'gradient']
  },
  {
    id: 'button-animated',
    name: 'Animated Button',
    type: 'button',
    description: 'A button with hover animations and effects',
    tags: ['button', 'animated', 'hover']
  },
  {
    id: 'button-icon',
    name: 'Icon Button',
    type: 'button',
    description: 'A button with an icon and text',
    tags: ['button', 'icon', 'text']
  },
  {
    id: 'button-connect',
    name: 'Connect Wallet Button',
    type: 'button',
    description: 'A specialized button for connecting Web3 wallets',
    tags: ['button', 'wallet', 'web3']
  },
  
  // Sections
  {
    id: 'section-hero',
    name: 'Hero Section',
    type: 'hero',
    description: 'A hero section with heading, subheading, and call-to-action',
    tags: ['section', 'hero', 'cta']
  },
  {
    id: 'section-features',
    name: 'Features Grid',
    type: 'section',
    description: 'A grid layout for displaying multiple features',
    tags: ['section', 'features', 'grid']
  },
  {
    id: 'section-tokenomics',
    name: 'Tokenomics Section',
    type: 'section',
    description: 'A section for displaying token distribution and metrics',
    tags: ['section', 'tokenomics', 'chart']
  },
  {
    id: 'section-roadmap',
    name: 'Roadmap Section',
    type: 'section',
    description: 'A timeline-based section for displaying project roadmap',
    tags: ['section', 'roadmap', 'timeline']
  },
  {
    id: 'section-team',
    name: 'Team Section',
    type: 'section',
    description: 'A section for showcasing team members with photos and bios',
    tags: ['section', 'team', 'profiles']
  }
]

interface ComponentTemplatesProps {
  onSelectTemplate: (templateId: string) => void
  filterType?: ComponentType
}

/**
 * Component templates
 * Displays a list of component templates that users can choose from
 */
export function ComponentTemplates({ onSelectTemplate, filterType }: ComponentTemplatesProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>(filterType || 'all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter templates by category and search query
  const filteredTemplates = sampleTemplates.filter(template => {
    // Filter by category
    if (activeCategory !== 'all' && template.type !== activeCategory) {
      return false
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return true
  })

  // Get unique categories
  const categories: TemplateCategory[] = ['all', ...new Set(sampleTemplates.map(t => t.type))]

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors duration-200 cursor-pointer"
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Template preview */}
            <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto mb-2 bg-blue-500/10 rounded-full flex items-center justify-center">
                    {template.type === 'header' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    )}
                    {template.type === 'card' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {template.type === 'button' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    )}
                    {(template.type === 'section' || template.type === 'hero') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-blue-400">{template.name}</p>
                </div>
              )}
            </div>
            
            {/* Template info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{template.name}</h4>
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                  {template.type}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="p-8 text-center border border-gray-700 rounded-lg">
          <p className="text-gray-400">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
