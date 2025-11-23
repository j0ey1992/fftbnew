'use client'

import { DeploymentData } from '../types'
import StepHeader from '../components/StepHeader'

interface ReviewDeployStepProps {
  template: any
  deploymentData: DeploymentData
}

/**
 * Step 3: Review & Deploy
 */
export default function ReviewDeployStep({
  template,
  deploymentData
}: ReviewDeployStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader 
        stepNumber={3} 
        title="Review & Deploy"
        description="Review your configuration before deploying the contract"
      />

      {/* Contract Summary */}
      <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-700/50">
        <h5 className="text-white font-medium mb-4">Contract Summary</h5>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Template:</span>
            <span className="text-white font-medium">{template.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Project Name:</span>
            <span className="text-white">{deploymentData.projectName || 'Not set'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Description:</span>
            <span className="text-white text-right max-w-xs truncate">
              {deploymentData.description || 'Not set'}
            </span>
          </div>
          
          {template.id === 'nft-staking-v1' && (
            <div className="flex justify-between">
              <span className="text-gray-400">NFT Collections:</span>
              <span className="text-white">{deploymentData.collections.length} collection(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* NFT Collections Details */}
      {template.id === 'nft-staking-v1' && deploymentData.collections.length > 0 && (
        <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-700/50">
          <h5 className="text-white font-medium mb-4">NFT Collections</h5>
          
          <div className="space-y-3">
            {deploymentData.collections.map((collection, index) => (
              <div key={collection.id} className="bg-gray-800/30 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{collection.name}</span>
                  <span className="text-[#00c2ff] text-sm">{collection.ratio} tokens/day</span>
                </div>
                <div className="text-gray-400 text-sm font-mono break-all">
                  {collection.address}
                </div>
                {collection.description && (
                  <div className="text-gray-500 text-sm mt-1">
                    {collection.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Parameters */}
      <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-700/50">
        <h5 className="text-white font-medium mb-4">Contract Parameters</h5>
        
        <div className="space-y-3">
          {template.parameters.map((param: any) => {
            if (param.type === 'array') {
              // Handle array parameters
              if (param.id === 'collections') {
                return (
                  <div key={param.id} className="flex justify-between">
                    <span className="text-gray-400">{param.name}:</span>
                    <span className="text-white text-sm">
                      [{deploymentData.collections.map(col => col.address).join(', ')}]
                    </span>
                  </div>
                )
              } else if (param.id === 'ratios') {
                return (
                  <div key={param.id} className="flex justify-between">
                    <span className="text-gray-400">{param.name}:</span>
                    <span className="text-white text-sm">
                      [{deploymentData.collections.map(col => col.ratio).join(', ')}]
                    </span>
                  </div>
                )
              }
              return null
            }
            
            const value = deploymentData.parameters[param.id]
            return (
              <div key={param.id} className="flex justify-between">
                <span className="text-gray-400">{param.name}:</span>
                <span className="text-white font-mono text-sm">
                  {value || 'Not set'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Social Links */}
      {Object.values(deploymentData.socialLinks).some(link => link.trim()) && (
        <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-700/50">
          <h5 className="text-white font-medium mb-4">Social Links</h5>
          
          <div className="space-y-2">
            {Object.entries(deploymentData.socialLinks).map(([platform, url]) => {
              if (!url.trim()) return null
              
              return (
                <div key={platform} className="flex justify-between">
                  <span className="text-gray-400 capitalize">
                    {platform === 'whereToBuy' ? 'Where to Buy' : platform}:
                  </span>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00c2ff] hover:text-[#0072ff] transition-colors text-sm truncate max-w-xs"
                  >
                    {url}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Deployment Notice */}
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h6 className="text-blue-300 font-medium mb-1">Deployment Notice</h6>
            <p className="text-blue-200 text-sm">
              Your contract will be deployed to the Cronos network. After deployment, 
              it will be submitted for admin approval before appearing in the public listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
