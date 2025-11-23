'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { StakingCustomizer } from '@/components/staking'
import { useStakingCustomization } from '@/hooks/useStakingCustomization'
import { useAuth } from '@/components/providers/auth'
import { useAppKitAccount } from '@reown/appkit/react'

interface ContractManagementPanelProps {
  contractId: string
  contractType: 'token-staking' | 'lp-staking' | 'nft-staking' | 'vault'
  contractAddress: string
  className?: string
}

export function ContractManagementPanel({
  contractId,
  contractType,
  contractAddress,
  className = ''
}: ContractManagementPanelProps) {
  const [showCustomizer, setShowCustomizer] = useState(false)
  const { address, isConnected } = useAppKitAccount()
  const { userRoles, isLoading: authLoading } = useAuth()
  
  // Get customization data
  const {
    customization,
    isLoading: customizationLoading,
    updateCustomization,
    isOwner
  } = useStakingCustomization(
    contractId,
    contractType
  )
  
  // Check admin status from auth context
  const isAdmin = userRoles.isAdmin
  
  console.log(`[ADMIN PANEL] Admin status for contract ${contractId} (${contractType}): ${isAdmin ? 'IS ADMIN' : 'NOT ADMIN'}`)
  console.log(`[ADMIN PANEL] Contract owner status: ${isOwner ? 'IS OWNER' : 'NOT OWNER'}`)
  
  if (authLoading || customizationLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  // Only show this panel to site admins, not regular users
  // Contract owners will see the ContractOwnerPanel instead
  if (!isAdmin) {
    console.log(`[ADMIN PANEL] Not rendering admin panel - user is not an admin`)
    return null
  }
  
  console.log(`[ADMIN PANEL] Rendering admin panel for admin user`)
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Admin Management Panel</h2>
            <p className="text-gray-300 text-sm">
              As an administrator, you can manage this contract's appearance and information.
            </p>
          </div>
          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCustomizer(!showCustomizer)}
            >
              {showCustomizer ? 'Hide Customizer' : 'Customize Contract'}
            </Button>
          </div>
        </div>
        
        {showCustomizer && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <StakingCustomizer
              customization={customization}
              onUpdate={updateCustomization}
              isLoading={customizationLoading}
            />
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Contract Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Type:</span>
                <span className="text-white">{contractType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contract ID:</span>
                <span className="text-white">{contractId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Address:</span>
                <span className="text-white">{`${contractAddress.substring(0, 6)}...${contractAddress.substring(contractAddress.length - 4)}`}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Admin Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  // Toggle contract visibility (to be implemented)
                  alert('Toggle visibility functionality to be implemented')
                }}
              >
                Toggle Visibility
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  // Feature contract (to be implemented)
                  alert('Feature contract functionality to be implemented')
                }}
              >
                Feature Contract
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
