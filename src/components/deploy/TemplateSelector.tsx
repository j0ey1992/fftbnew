'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, Button } from '@/components/ui'
import { ContractTemplate } from '@/types/contract-templates'
import { getAllTemplates } from '@/data/templates'
import { ethers } from 'ethers'

/**
 * TemplateFeatures Component
 * Displays key features of a contract template
 */
function TemplateFeatures({ template }: { template: ContractTemplate }) {
  // Get constructor parameters from ABI
  const getConstructorParams = () => {
    const constructor = template.abi.find((item: any) => item.type === 'constructor');
    return constructor?.inputs || [];
  };

  // Format parameter type for display
  const formatParamType = (type: string) => {
    if (type.includes('[]')) return 'Array';
    if (type.includes('address')) return 'Address';
    if (type.includes('uint')) return 'Number';
    if (type.includes('string')) return 'Text';
    if (type.includes('bool')) return 'Yes/No';
    return type;
  };

  // Get key features based on template category
  const getFeatures = () => {
    const params = getConstructorParams();
    const features: string[] = [];

    // Define a type for constructor parameter
    interface ConstructorParam {
      name: string;
      type: string;
      [key: string]: any;
    }

    // Helper function to check if any parameter includes a specific string
    const hasParam = (nameIncludes: string): boolean => {
      return params.some((p: ConstructorParam) => 
        p.name && typeof p.name === 'string' && p.name.includes(nameIncludes)
      );
    };

    // Add category-specific features
    switch (template.category) {
      case 'staking':
        features.push('Stake tokens to earn rewards');
        if (hasParam('duration') || hasParam('period'))
          features.push('Configurable staking periods');
        if (hasParam('reward'))
          features.push('Customizable reward rates');
        break;
      case 'lp-staking':
        features.push('Stake LP tokens to earn rewards');
        features.push('Support for multiple pools');
        break;
      case 'token':
        features.push('Create your own token');
        if (hasParam('supply'))
          features.push('Configurable token supply');
        break;
      case 'nft':
        features.push('Create your own NFT collection');
        break;
      case 'vault':
        features.push('Secure token storage');
        if (hasParam('lock'))
          features.push('Time-locked deposits');
        break;
      default:
        break;
    }

    // Add general features
    if (hasParam('fee'))
      features.push('Configurable fees');
    if (hasParam('owner') || hasParam('admin'))
      features.push('Admin controls');

    return features.slice(0, 3); // Limit to 3 features
  };

  const features = getFeatures();
  const params = getConstructorParams().slice(0, 2); // Show only first 2 params

  if (features.length === 0 && params.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {features.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-gray-400">Features</div>
          </div>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-center">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mr-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {params.length > 0 && (
        <div className="space-y-2 mt-3">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-gray-400">Parameters</div>
          </div>
          <ul className="space-y-2">
            {params.map((param: any, index: number) => (
              <li key={index} className="text-sm text-gray-300 flex items-center">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                </div>
                {param.name.replace(/^_/, '')}: <span className="text-green-400 ml-1">{formatParamType(param.type)}</span>
              </li>
            ))}
            {getConstructorParams().length > 2 && (
              <li className="text-sm text-gray-400 italic flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-500/10 flex items-center justify-center mr-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                </div>
                +{getConstructorParams().length - 2} more parameters
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void
  className?: string
}

export function TemplateSelector({ onSelectTemplate, className = '' }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Fetch templates
  useEffect(() => {
    const fetchTemplates = () => {
      try {
        setLoading(true)
        const templates = getAllTemplates()
        setTemplates(templates)
        setError(null)
      } catch (error) {
        console.error('Error fetching contract templates:', error)
        setError('Failed to fetch contract templates')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTemplates()
  }, [])
  
  // Get unique categories
  const categories = [...new Set(templates.map(template => template.category))]
  
  // Filter templates by category
  const filteredTemplates = selectedCategory
    ? templates.filter(template => template.category === selectedCategory)
    : templates
  
  // Format category for display
  const formatCategory = (category: string) => {
    switch (category) {
      case 'staking':
        return 'Staking'
      case 'lp-staking':
        return 'LP Staking'
      case 'token':
        return 'Token'
      case 'nft':
        return 'NFT'
      case 'vault':
        return 'Vault'
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'token':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        )
      case 'staking':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        )
      case 'lp-staking':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
        )
      case 'nft':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      case 'vault':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }
  
  return (
    <div className={`w-full ${className}`}>
      <GlassCard elevation="raised">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold text-gradient-blue">Select Contract Template</h3>
        </div>
        <div className="p-6">
          {/* Ambient gradients */}
          <div className="deploy-gradient-top"></div>
          <div className="deploy-gradient-bottom"></div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 blue-glow"></div>
            </div>
          ) : (
            <>
              {/* Category filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg ${selectedCategory === null ? 'btn-gradient' : 'border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'} text-white transition-all`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === category ? 'btn-gradient' : 'border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'} text-white transition-all`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="mr-2">{getCategoryIcon(category)}</span>
                      {formatCategory(category)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Templates grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No templates found
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer h-full"
                      onClick={() => onSelectTemplate(template.id)}
                    >
                      <div className="crypto-card premium-border h-full relative overflow-hidden animate-fade-in">
                        {/* Top accent line with gradient */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600/50 via-blue-400/50 to-purple-500/50"></div>
                        
                        {/* Card content */}
                        <div className="p-5 flex flex-col h-full relative z-10">
                          {/* Category badge */}
                          <div className="template-badge">
                            {formatCategory(template.category)}
                          </div>
                          
                          {/* Header with icon and title */}
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0 mr-3 border border-blue-500/20 flex items-center justify-center blue-glow">
                              {getCategoryIcon(template.category)}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white">{template.name}</h4>
                              <div className="text-xs text-blue-400 flex items-center">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></span>
                                v{template.version}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-4 flex-grow">
                            {template.description}
                          </p>
                          
                          {/* Template features in glass panel */}
                          <div className="glass-panel-dark rounded-xl p-4 mb-5">
                            <TemplateFeatures template={template} />
                          </div>
                          
                          <button
                            className="btn-gradient w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectTemplate(template.id)
                            }}
                          >
                            Select Template
                          </button>
                          
                          {/* Decorative corner accent */}
                          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-tl-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
