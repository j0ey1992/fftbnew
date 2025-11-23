'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContractTemplate } from '@/types/contract-templates'
import { getAllTemplates } from '@/data/templates'

interface MobileTemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void
}

export function MobileTemplateSelector({ onSelectTemplate }: MobileTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
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
  const categories = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'token', label: 'Tokens', icon: '🪙' },
    { id: 'staking', label: 'Staking', icon: '💰' },
    { id: 'lp-staking', label: 'LP Staking', icon: '🌊' },
    { id: 'nft', label: 'NFTs', icon: '🎨' },
    { id: 'vault', label: 'Vaults', icon: '🏦' }
  ]
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(template => template.category === selectedCategory)
  
  // Get template features
  const getTemplateFeatures = (template: ContractTemplate): string[] => {
    const features: string[] = []
    
    switch (template.category) {
      case 'staking':
        features.push('Earn rewards', 'Flexible periods')
        break
      case 'lp-staking':
        features.push('LP rewards', 'Multiple pools')
        break
      case 'token':
        features.push('Custom supply', 'ERC-20 standard')
        break
      case 'nft':
        features.push('NFT collection', 'Metadata support')
        break
      case 'vault':
        features.push('Secure storage', 'Time locks')
        break
    }
    
    return features.slice(0, 2)
  }
  
  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'token': return 'bg-yellow-500/20 text-yellow-400'
      case 'staking': return 'bg-green-500/20 text-green-400'
      case 'lp-staking': return 'bg-blue-500/20 text-blue-400'
      case 'nft': return 'bg-purple-500/20 text-purple-400'
      case 'vault': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }
  
  return (
    <div className="min-h-screen bg-[#041836] pb-20">
      {/* Header */}
      <div className="bg-[#0a1e3d] border-b border-gray-700/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-white">Select Template</h1>
          <p className="text-sm text-gray-400">Choose a smart contract to deploy</p>
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#0a1e3d] text-gray-400'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      {error ? (
        <div className="px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No templates found
              </div>
            ) : (
              filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectTemplate(template.id)}
                  className="bg-[#0a1e3d] rounded-xl p-4 hover:bg-[#0c2347] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      {template.category === 'token' && '🪙'}
                      {template.category === 'staking' && '💰'}
                      {template.category === 'lp-staking' && '🌊'}
                      {template.category === 'nft' && '🎨'}
                      {template.category === 'vault' && '🏦'}
                    </div>
                    
                    <div className="flex-1">
                      {/* Title and Version */}
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-white font-medium">{template.name}</h3>
                        <span className="text-xs text-gray-500">v{template.version}</span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                      
                      {/* Category Badge and Features */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(template.category)}`}>
                          {template.category.replace('-', ' ')}
                        </span>
                        {getTemplateFeatures(template).map((feature, idx) => (
                          <span key={idx} className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Popular Templates Section */}
      {!loading && !error && selectedCategory === 'all' && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold text-white mb-3">Popular Templates</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-600/30">
              <div className="text-2xl mb-2">🪙</div>
              <h3 className="text-sm font-medium text-white">ERC-20 Token</h3>
              <p className="text-xs text-gray-400 mt-1">Create your own token</p>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-600/30">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="text-sm font-medium text-white">Staking Pool</h3>
              <p className="text-xs text-gray-400 mt-1">Reward your holders</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}