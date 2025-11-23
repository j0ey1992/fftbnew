'use client'

import { ContractTemplate } from '@/types/contract-templates'
import { NftStakingDeployForm } from './nftstakingdeployform'
import Erc20DeploymentForm from './Erc20DeploymentForm'
import LpStakingTemplateDeployForm from './LpStakingTemplateDeployForm'
import SmartChefFactoryDeployForm from './SmartChefFactoryDeployForm'

interface ContractDeploymentFormProps {
  template: ContractTemplate
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}

/**
 * Main contract deployment form that routes to the appropriate modular form
 * Routes to specialized forms based on template type and category
 */
export default function ContractDeploymentForm({
  template,
  onClose,
  onSuccess
}: ContractDeploymentFormProps) {
  // Route to the appropriate form based on template category and ID
  if (template.category === 'token' && template.id === 'erc20-fixed-supply') {
    return (
      <Erc20DeploymentForm
        template={template}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )
  }
  
  // Route LP staking to simplified form
  if (template.id === 'lp-staking') {
    return (
      <LpStakingTemplateDeployForm
        template={template}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )
  }
  
  // Route token staking to Smart Chef Factory deployment
  if (template.id === 'token-staking') {
    return (
      <SmartChefFactoryDeployForm
        template={template}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )
  }
  
  // V3 Vault - Show info instead of deployment form since it's already deployed
  if (template.id === 'v3-vault') {
    // Immediately trigger success with the existing vault address
    onSuccess('0x7b1B4A0565f9843313eD27D9Eb8DdbC886207DA7')
    return null
  }
  
  // Default to NFT Staking Deploy Form for other templates
  return (
    <NftStakingDeployForm
      template={template}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
