import { ContractTemplate } from '@/types/contract-templates'
import { nftStakingTemplate } from './nft-staking'
import { erc20FixedSupplyTemplate } from './erc20-fixed-supply'
import { lpStakingTemplate } from './lp-staking'
import { tokenStakingTemplate } from './token-staking'
import { v3VaultTemplate } from './v3-vault'

/**
 * All available contract templates
 * Templates are stored as code in the codebase instead of Firebase
 */
export const contractTemplates: Record<string, ContractTemplate> = {
  [nftStakingTemplate.id]: nftStakingTemplate,
  [erc20FixedSupplyTemplate.id]: erc20FixedSupplyTemplate,
  [lpStakingTemplate.id]: lpStakingTemplate,
  [tokenStakingTemplate.id]: tokenStakingTemplate,
  [v3VaultTemplate.id]: v3VaultTemplate,
}

/**
 * Get all available templates
 */
export function getAllTemplates(): ContractTemplate[] {
  return Object.values(contractTemplates)
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ContractTemplate | null {
  return contractTemplates[id] || null
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): ContractTemplate[] {
  return Object.values(contractTemplates).filter(template => template.category === category)
}

/**
 * Get enabled templates only
 */
export function getEnabledTemplates(): ContractTemplate[] {
  return Object.values(contractTemplates).filter(template => template.enabled)
}
