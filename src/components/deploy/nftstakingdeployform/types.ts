/**
 * Type definitions for NFT Staking Deploy Form module
 */

export interface CollectionData {
  id: string
  name: string
  address: string
  ratio: number
  description: string
  logoFile?: File
}

export interface SocialLinks {
  twitter: string
  facebook: string
  website: string
  whereToBuy: string
  discord: string
  telegram: string
}

export interface DeploymentData {
  // Contract parameters
  parameters: Record<string, any>
  
  // Project details for Firebase storage
  projectName: string
  description: string
  logoFile?: File
  bannerFile?: File
  socialLinks: SocialLinks
  
  // NFT Collections (for NFT staking)
  collections: CollectionData[]
}

export interface StepValidation {
  isValid: boolean
  error?: string
}

export interface DeploymentFormProps {
  template: any // ContractTemplate type
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}
