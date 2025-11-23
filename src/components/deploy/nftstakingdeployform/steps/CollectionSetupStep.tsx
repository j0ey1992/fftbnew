'use client'

import { DeploymentData, CollectionData } from '../types'
import { Button } from '@/components/ui/button'
import StepHeader from '../components/StepHeader'
import CollectionCard from '../components/CollectionCard'

interface CollectionSetupStepProps {
  template: any
  deploymentData: DeploymentData
  onUpdateData: (data: Partial<DeploymentData>) => void
  onParameterChange: (paramId: string, value: any) => void
}

/**
 * Step 1: NFT Collections & Contract Setup
 */
export default function CollectionSetupStep({
  template,
  deploymentData,
  onUpdateData,
  onParameterChange
}: CollectionSetupStepProps) {
  // Add collection (for NFT staking)
  const addCollection = () => {
    const newCollection: CollectionData = {
      id: `collection-${Date.now()}`,
      name: '',
      address: '',
      ratio: 100, // Always set to 100
      description: ''
    }
    
    onUpdateData({
      collections: [...deploymentData.collections, newCollection]
    })
  }

  // Update collection
  const updateCollection = (index: number, field: string, value: any) => {
    const updatedCollections = deploymentData.collections.map((col, i) => {
      if (i === index) {
        // Always keep ratio at 100
        if (field === 'ratio') {
          return col // Ignore ratio updates
        }
        return { ...col, [field]: value }
      }
      return col
    })
    onUpdateData({ collections: updatedCollections })
  }

  // Remove collection
  const removeCollection = (index: number) => {
    const updatedCollections = deploymentData.collections.filter((_, i) => i !== index)
    onUpdateData({ collections: updatedCollections })
  }

  const getStepTitle = () => {
    return template.id === 'nft-staking-v1' ? 'NFT Collections & Contract Setup' : 'Contract Setup'
  }

  return (
    <div className="space-y-6">
      <StepHeader 
        stepNumber={1} 
        title={getStepTitle()}
        description="Configure your NFT collections and contract parameters"
      />

      {/* NFT Collections Section (for NFT staking) */}
      {template.id === 'nft-staking-v1' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-medium text-white">NFT Collections</h5>
            <Button type="button" onClick={addCollection} size="sm">
              Add Collection
            </Button>
          </div>

          {deploymentData.collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              onUpdate={(field, value) => updateCollection(index, field, value)}
              onRemove={() => removeCollection(index)}
            />
          ))}

          {deploymentData.collections.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-gray-900/20 rounded-xl border border-gray-700/30">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg font-medium">No collections added yet</p>
              <p className="text-sm mt-1">Add NFT collections that users can stake</p>
            </div>
          )}
        </div>
      )}

      {/* Contract Parameters Section */}
      <div className="space-y-4">
        <h5 className="text-lg font-medium text-white">Contract Parameters</h5>
        
        {template.parameters.map((param: any) => {
          // Skip array parameters as they're auto-populated from collections
          if (param.type === 'array') return null
          
          return (
            <div key={param.id} className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {param.name} {param.required && <span className="text-red-400">*</span>}
              </label>
              <p className="text-gray-400 text-xs mb-3">{param.description}</p>
              
              {param.type === 'address' ? (
                <input
                  type="text"
                  value={deploymentData.parameters[param.id] || ''}
                  onChange={(e) => onParameterChange(param.id, e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all"
                  placeholder={param.placeholder || "0x..."}
                />
              ) : (
                <input
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={deploymentData.parameters[param.id] || ''}
                  onChange={(e) => onParameterChange(param.id, e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all"
                  placeholder={param.placeholder}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
