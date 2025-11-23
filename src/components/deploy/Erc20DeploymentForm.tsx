'use client'

import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui'
import { ContractTemplate } from '@/types/contract-templates'

interface Erc20DeploymentFormProps {
  template: ContractTemplate
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}

interface Erc20FormData {
  name: string
  symbol: string
  totalSupply: string
  projectName: string
  description: string
  logoFile?: File
  bannerFile?: File
  socialLinks: {
    twitter: string
    website: string
    telegram: string
    discord: string
  }
}

/**
 * ERC-20 Token Deployment Form
 * Specialized form for deploying ERC-20 tokens with proper validation and UI
 */
export default function Erc20DeploymentForm({
  template,
  onClose,
  onSuccess
}: Erc20DeploymentFormProps) {
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState<Erc20FormData>({
    name: '',
    symbol: '',
    totalSupply: '',
    projectName: '',
    description: '',
    socialLinks: {
      twitter: '',
      website: '',
      telegram: '',
      discord: ''
    }
  })

  const totalSteps = 3

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  // Handle social links changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  // Handle file uploads
  const handleFileChange = (field: 'logoFile' | 'bannerFile', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file || undefined
    }))
  }

  // Validate current step
  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        // Token parameters validation
        if (!formData.name.trim()) {
          setError('Token name is required')
          return false
        }
        if (!formData.symbol.trim()) {
          setError('Token symbol is required')
          return false
        }
        if (!/^[A-Z0-9]+$/.test(formData.symbol)) {
          setError('Token symbol must contain only uppercase letters and numbers')
          return false
        }
        if (!formData.totalSupply.trim()) {
          setError('Total supply is required')
          return false
        }
        const supply = parseFloat(formData.totalSupply)
        if (isNaN(supply) || supply <= 0) {
          setError('Total supply must be a positive number')
          return false
        }
        return true
      
      case 2:
        // Project details validation
        if (!formData.projectName.trim()) {
          setError('Project name is required')
          return false
        }
        if (!formData.description.trim()) {
          setError('Project description is required')
          return false
        }
        return true
      
      case 3:
        // Final validation
        return validateStep(1) && validateStep(2)
      
      default:
        return true
    }
  }

  // Navigation functions
  const nextStep = () => {
    setError(null)
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setError(null)
    setStep(step - 1)
  }

  // Convert total supply to wei (assuming 18 decimals)
  const convertToWei = (amount: string): string => {
    try {
      const amountBN = ethers.utils.parseEther(amount)
      return amountBN.toString()
    } catch (error) {
      throw new Error('Invalid total supply amount')
    }
  }

  // Deploy contract
  const handleDeploy = async () => {
    setError(null)
    
    if (!validateStep(step)) return
    
    if (!address) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)

    try {
      // Get provider and signer
      if (!window.ethereum) {
        throw new Error('No wallet found')
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner(address)

      // Convert total supply to wei
      const totalSupplyWei = convertToWei(formData.totalSupply)

      // Prepare constructor arguments
      const constructorArgs = [
        formData.name,
        formData.symbol,
        totalSupplyWei
      ]

      // Create contract factory
      const contractFactory = new ethers.ContractFactory(
        template.abi,
        template.bytecode,
        signer
      )

      // Deploy contract
      console.log('Deploying ERC-20 contract with args:', constructorArgs)
      const contract = await contractFactory.deploy(...constructorArgs)
      
      // Wait for deployment
      await contract.deployed()
      
      const contractAddress = contract.address
      console.log('ERC-20 contract deployed at:', contractAddress)

      // Store contract data in Firebase
      const contractData = {
        templateId: template.id,
        contractAddress,
        chainId: 25, // Cronos mainnet
        ownerAddress: address,
        parameters: {
          name: formData.name,
          symbol: formData.symbol,
          totalSupply: totalSupplyWei
        },
        projectName: formData.projectName,
        description: formData.description,
        socialLinks: formData.socialLinks,
        status: 'pending',
        createdAt: new Date().toISOString(),
        transactionHash: contract.deployTransaction?.hash || '',
        tokenInfo: {
          name: formData.name,
          symbol: formData.symbol,
          totalSupply: formData.totalSupply,
          decimals: 18
        }
      }

      // Call API to store in Firebase
      const response = await fetch('/api/contracts/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
      })

      if (!response.ok) {
        throw new Error('Failed to store contract data')
      }

      // Upload images if provided
      if (formData.logoFile || formData.bannerFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('contractAddress', contractAddress)
        
        if (formData.logoFile) {
          formDataUpload.append('logo', formData.logoFile)
        }
        
        if (formData.bannerFile) {
          formDataUpload.append('banner', formData.bannerFile)
        }

        await fetch('/api/contracts/upload-images', {
          method: 'POST',
          body: formDataUpload
        })
      }

      onSuccess(contractAddress)
      
    } catch (err: any) {
      console.error('ERC-20 deployment error:', err)
      setError(err.message || 'Failed to deploy token contract')
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Token Configuration'
      case 2:
        return 'Project Details'
      case 3:
        return 'Review & Deploy'
      default:
        return 'Setup'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0a0f1f] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#0a0f1f] to-[#0d1425]">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Deploy ERC-20 Token</h3>
            <p className="text-gray-400 text-sm">
              Step {step} of {totalSteps}: {getStepTitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      i + 1 < step ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Token Configuration */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Configure Your Token</h4>
                <p className="text-gray-400 mb-6">
                  Set up the basic parameters for your ERC-20 token. These cannot be changed after deployment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., My Awesome Token"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">The full name of your token</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Symbol *
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => handleFieldChange('symbol', e.target.value.toUpperCase())}
                    placeholder="e.g., MAT"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">3-5 uppercase letters/numbers</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Supply *
                </label>
                <input
                  type="number"
                  value={formData.totalSupply}
                  onChange={(e) => handleFieldChange('totalSupply', e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Total number of tokens to create (will have 18 decimal places)
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h5 className="text-blue-400 font-medium mb-1">Fixed Supply Token</h5>
                    <p className="text-blue-300 text-sm">
                      This creates a token with a fixed supply. All tokens will be minted to your wallet on deployment, and no additional tokens can ever be created.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Project Information</h4>
                <p className="text-gray-400 mb-6">
                  Provide details about your project to help users understand your token.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => handleFieldChange('projectName', e.target.value)}
                  placeholder="e.g., My Token Project"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe your token project, its purpose, and utility..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    placeholder="https://yourproject.com"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="@yourproject"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.telegram}
                    onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                    placeholder="t.me/yourproject"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks.discord}
                    onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                    placeholder="discord.gg/yourproject"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Deploy */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Review Your Token</h4>
                <p className="text-gray-400 mb-6">
                  Please review all details before deploying. These settings cannot be changed after deployment.
                </p>
              </div>

              <GlassCard className="p-6">
                <h5 className="text-white font-semibold mb-4">Token Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <p className="text-white font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Symbol:</span>
                    <p className="text-white font-medium">{formData.symbol}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Total Supply:</span>
                    <p className="text-white font-medium">{formData.totalSupply} {formData.symbol}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Decimals:</span>
                    <p className="text-white font-medium">18</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h5 className="text-white font-semibold mb-4">Project Information</h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Project Name:</span>
                    <p className="text-white">{formData.projectName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Description:</span>
                    <p className="text-white">{formData.description}</p>
                  </div>
                </div>
              </GlassCard>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h5 className="text-yellow-400 font-medium mb-1">Important Notice</h5>
                    <p className="text-yellow-300 text-sm">
                      Once deployed, your token contract cannot be modified. Please ensure all details are correct before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-[#0a0f1f] to-[#0d1425]">
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleDeploy}
                  disabled={loading || !address}
                  className="bg-gradient-to-r from-[#0072ff] to-[#00c2ff] hover:from-[#0060dd] hover:to-[#00a8dd]"
                >
                  {loading ? 'Deploying Token...' : 'Deploy Token'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}