'use client'

import { useState } from 'react'
import { ContractTemplate } from '@/types/contract-templates'
import { Button } from '@/components/ui/button'
import ContractDeploymentForm from './ContractDeploymentForm'

interface TemplateDeployerProps {
  template: ContractTemplate
  onClose: () => void
}

/**
 * Template deployer component that uses the new ContractDeploymentForm
 * for the comprehensive deployment flow
 */
export default function TemplateDeployer({ template, onClose }: TemplateDeployerProps) {
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null)

  const handleDeploymentSuccess = (contractAddress: string) => {
    setDeploymentSuccess(contractAddress)
  }

  const handleClose = () => {
    setDeploymentSuccess(null)
    onClose()
  }

  // Show success message
  if (deploymentSuccess) {
    const isPending = deploymentSuccess === 'pending'
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#0a0f1f] rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isPending ? 'Project Submitted Successfully!' : 'Contract Deployed Successfully!'}
            </h3>
            <p className="text-gray-400 mb-4">
              {isPending 
                ? 'Your LP staking project has been submitted and is pending admin review.'
                : 'Your contract has been deployed and is pending admin approval.'
              }
            </p>
            {!isPending && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Contract Address:</p>
                <p className="text-sm text-white font-mono break-all">{deploymentSuccess}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mb-4">
              {isPending
                ? 'The admin will deploy your LP staking contract once your submission is approved. You will receive an email notification when your pool goes live.'
                : 'You will receive an email notification once your contract is approved and live on the platform.'
              }
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Use the new comprehensive deployment form
  return (
    <ContractDeploymentForm
      template={template}
      onClose={onClose}
      onSuccess={handleDeploymentSuccess}
    />
  )
}
