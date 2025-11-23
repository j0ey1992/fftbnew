'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SafeImage } from '@/components/ui/SafeImage'
import { MobileBottomSheet } from '@/components/ui/MobileBottomSheet'
import { useAppKitAccount } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/Toast'

interface DeploymentOption {
  id: string
  name: string
  description: string
  icon: string
  category: 'token' | 'staking' | 'nft' | 'dao' | 'custom'
  features: string[]
  price?: string
  estimatedGas?: string
  deploymentTime?: string
  templateId?: string
}

interface MobileDeployInterfaceProps {
  deploymentOptions: DeploymentOption[]
  onDeploy: (optionId: string, params: any) => Promise<void>
}

export function MobileDeployInterface({
  deploymentOptions,
  onDeploy
}: MobileDeployInterfaceProps) {
  const { isConnected } = useAppKitAccount()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedOption, setSelectedOption] = useState<DeploymentOption | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'staking', label: 'Staking' },
    { id: 'token', label: 'Tokens' },
    { id: 'nft', label: 'NFTs' },
    { id: 'custom', label: 'Custom' }
  ]

  const filteredOptions = selectedCategory === 'all' 
    ? deploymentOptions 
    : deploymentOptions.filter(option => option.category === selectedCategory)

  const handleDeploy = async () => {
    if (!selectedOption || isDeploying) return

    setIsDeploying(true)
    try {
      router.push(`/deploy/${selectedOption.templateId || selectedOption.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to start deployment')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#041836] pb-20">
      {/* Header */}
      <div className="bg-[#0a1e3d] border-b border-gray-700/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-white">Deploy</h1>
          <p className="text-sm text-gray-400">Choose a contract template</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-blue-800 to-purple-900 px-4 py-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">1,234</p>
            <p className="text-xs text-gray-200">Deployed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">$45.6M</p>
            <p className="text-xs text-gray-200">Total TVL</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Cronos</p>
            <p className="text-xs text-gray-200">Network</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#0a1e3d] text-gray-400 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deployment Options */}
      <div className="px-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOptions.map((option, index) => (
            <motion.div
              key={option.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (option.templateId) {
                  if (option.templateId.startsWith('/')) {
                    router.push(option.templateId)
                  } else {
                    router.push(`/deploy/${option.templateId}`)
                  }
                } else {
                  setSelectedOption(option)
                  setShowDetails(true)
                }
              }}
              className="bg-[#0a1e3d] rounded-xl p-4 hover:bg-[#0c2347] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
                  {option.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium">{option.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                  
                  {/* Quick Features */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {option.features.slice(0, 2).map((feature, idx) => (
                      <span key={idx} className="text-xs bg-blue-900/20 text-blue-400 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {option.features.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{option.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Why Deploy Section */}
      <div className="px-4 py-8">
        <h2 className="text-lg font-semibold text-white mb-4">Why Deploy with Kris</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0a1e3d] rounded-lg p-3">
            <div className="text-xl mb-1">🔒</div>
            <p className="text-sm text-white">Audited</p>
            <p className="text-xs text-gray-400">Security first</p>
          </div>
          <div className="bg-[#0a1e3d] rounded-lg p-3">
            <div className="text-xl mb-1">⚡</div>
            <p className="text-sm text-white">Fast Deploy</p>
            <p className="text-xs text-gray-400">Under 1 minute</p>
          </div>
          <div className="bg-[#0a1e3d] rounded-lg p-3">
            <div className="text-xl mb-1">💰</div>
            <p className="text-sm text-white">Low Cost</p>
            <p className="text-xs text-gray-400">Optimized gas</p>
          </div>
          <div className="bg-[#0a1e3d] rounded-lg p-3">
            <div className="text-xl mb-1">🛠️</div>
            <p className="text-sm text-white">No Code</p>
            <p className="text-xs text-gray-400">Simple setup</p>
          </div>
        </div>
      </div>

      {/* Deployment Details Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showDetails && !!selectedOption}
        onClose={() => {
          setShowDetails(false)
          setSelectedOption(null)
        }}
        title={selectedOption?.name || ''}
        height="75%"
      >
        {selectedOption && (
          <div className="px-4 pb-4">
            {/* Option Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-900/30 rounded-xl flex items-center justify-center text-3xl">
                {selectedOption.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{selectedOption.name}</h3>
                <p className="text-sm text-gray-400">{selectedOption.category} contract</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-300">{selectedOption.description}</p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Features</h4>
              <div className="space-y-2">
                {selectedOption.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deploy Info */}
            {(selectedOption.price || selectedOption.estimatedGas || selectedOption.deploymentTime) && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {selectedOption.price && (
                  <div className="bg-[#041836] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-white font-medium">{selectedOption.price}</p>
                  </div>
                )}
                {selectedOption.estimatedGas && (
                  <div className="bg-[#041836] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Gas</p>
                    <p className="text-white font-medium">{selectedOption.estimatedGas}</p>
                  </div>
                )}
                {selectedOption.deploymentTime && (
                  <div className="bg-[#041836] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-white font-medium">{selectedOption.deploymentTime}</p>
                  </div>
                )}
              </div>
            )}

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={!isConnected || isDeploying}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors"
            >
              {!isConnected ? 'Connect Wallet' : isDeploying ? 'Starting...' : 'Continue to Deploy'}
            </button>
          </div>
        )}
      </MobileBottomSheet>
    </div>
  )
}