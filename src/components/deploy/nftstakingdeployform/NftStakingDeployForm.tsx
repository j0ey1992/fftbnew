'use client'

import { useState, useEffect } from 'react'
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { getAppKit } from '@/lib/reown/init'
import { Button } from '@/components/ui/button'
import { DeploymentFormProps, DeploymentData } from './types'
import ErrorAlert from './components/ErrorAlert'
import ProgressBar from './components/ProgressBar'
import CollectionSetupStep from './steps/CollectionSetupStep'
import ProjectDetailsStep from './steps/ProjectDetailsStep'
import ReviewDeployStep from './steps/ReviewDeployStep'

/**
 * Main NFT Staking Deploy Form component with modular step-based design
 * Follows Crypto.com inspired UI patterns with clean, modern styling
 */
export default function NftStakingDeployForm({
  template,
  onClose,
  onSuccess
}: DeploymentFormProps) {
  const { address } = useAppKitAccount()
  const appKit = useAppKit()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  
  const [deploymentData, setDeploymentData] = useState<DeploymentData>({
    parameters: {},
    projectName: '',
    description: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      website: '',
      whereToBuy: '',
      discord: '',
      telegram: ''
    },
    collections: []
  })

  const totalSteps = 3

  // Auto-populate contract parameters when collections change
  useEffect(() => {
    if (template.id === 'nft-staking-v1' && deploymentData.collections.length > 0) {
      setDeploymentData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          collections: deploymentData.collections.map(col => col.address),
          ratios: deploymentData.collections.map(col => col.ratio)
        }
      }))
    }
  }, [deploymentData.collections, template.id])

  // Handle deployment data updates
  const handleUpdateData = (data: Partial<DeploymentData>) => {
    setDeploymentData(prev => ({ ...prev, ...data }))
  }

  // Handle parameter changes
  const handleParameterChange = (paramId: string, value: any) => {
    setDeploymentData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramId]: value
      }
    }))
  }

  // Validate current step
  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        // Validate NFT collections and basic contract parameters
        if (template.id === 'nft-staking-v1') {
          if (deploymentData.collections.length === 0) {
            setError('At least one NFT collection is required')
            return false
          }
          for (const col of deploymentData.collections) {
            if (!col.name.trim() || !col.address.trim()) {
              setError('All collections must have a name and address')
              return false
            }
          }
        }
        
        // Validate non-array contract parameters
        for (const param of template.parameters) {
          if (param.required && param.type !== 'array' && !deploymentData.parameters[param.id]) {
            setError(`${param.name} is required`)
            return false
          }
        }
        return true
      
      case 2:
        // Validate project details
        if (!deploymentData.projectName.trim()) {
          setError('Project name is required')
          return false
        }
        if (!deploymentData.description.trim()) {
          setError('Project description is required')
          return false
        }
        return true
      
      case 3:
        // Final validation before deployment
        return validateStep(1) && validateStep(2)
      
      default:
        return true
    }
  }

  // Go to next step
  const nextStep = () => {
    setError(null)
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  // Go to previous step
  const prevStep = () => {
    setError(null)
    setStep(step - 1)
  }

  // Deploy contract and store in Firebase
  const handleDeploy = async () => {
    setError(null)
    
    if (!validateStep(step)) return
    
    if (!address) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)

    try {
      // Get provider and signer from Reown AppKit
      const appKitInstance = getAppKit()
      if (!appKitInstance) {
        throw new Error('AppKit not initialized')
      }

      console.log('AppKit instance available:', !!appKitInstance)
      console.log('AppKit getProvider method available:', typeof appKitInstance.getProvider)

      // Ensure wallet is connected before getting provider
      if (!address) {
        throw new Error('Please connect your wallet first')
      }

      const walletProvider = await appKitInstance.getProvider?.('eip155')
      console.log('Wallet provider received:', !!walletProvider)
      
      if (!walletProvider) {
        throw new Error('No wallet provider available. Please ensure your wallet is connected.')
      }

      const provider = new ethers.providers.Web3Provider(walletProvider as any)
      const signer = provider.getSigner()
      
      // Verify the signer can get the address
      const signerAddress = await signer.getAddress()
      console.log('Signer address:', signerAddress)
      
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Wallet address mismatch. Please reconnect your wallet.')
      }

      // Check network
      const network = await provider.getNetwork()
      console.log('Current network:', network)
      
      // Verify we're on Cronos (chainId 25)
      if (network.chainId !== 25) {
        throw new Error(`Please switch to Cronos network. Current network: ${network.name} (${network.chainId})`)
      }

      // Check balance for gas
      const balance = await provider.getBalance(signerAddress)
      console.log('Wallet balance:', ethers.utils.formatEther(balance), 'CRO')
      
      if (balance.isZero()) {
        throw new Error('Insufficient CRO balance for gas fees')
      }

      // Prepare constructor arguments
      const constructorArgs = template.parameters.map((param: any) => {
        const value = deploymentData.parameters[param.id]
        
        if (param.type === 'array') {
          // Handle array parameters
          if (param.id === 'collections') {
            return deploymentData.collections.map(col => col.address)
          } else if (param.id === 'ratios') {
            return deploymentData.collections.map(col => col.ratio)
          }
          return Array.isArray(value) ? value : []
        }
        
        return value
      })

      // Create contract factory
      const contractFactory = new ethers.ContractFactory(
        template.abi,
        template.bytecode,
        signer
      )

      // Estimate gas for deployment
      try {
        console.log('Estimating gas for deployment...')
        const estimatedGas = await contractFactory.signer.estimateGas(
          contractFactory.getDeployTransaction(...constructorArgs)
        )
        console.log('Estimated gas:', estimatedGas.toString())
        
        // Check if we have enough balance for gas
        const gasPrice = await provider.getGasPrice()
        const estimatedCost = estimatedGas.mul(gasPrice)
        console.log('Estimated deployment cost:', ethers.utils.formatEther(estimatedCost), 'CRO')
        
        if (balance.lt(estimatedCost)) {
          throw new Error(`Insufficient balance for gas. Need: ${ethers.utils.formatEther(estimatedCost)} CRO, Have: ${ethers.utils.formatEther(balance)} CRO`)
        }
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError)
        throw new Error(`Gas estimation failed: ${gasError?.message || gasError}`)
      }

      // Deploy contract (ethers v5 syntax)
      console.log('Deploying contract with args:', constructorArgs)
      
      let contract
      let deploymentTx
      
      try {
        // Add a small delay to ensure wallet is ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Attempting contract deployment...')
        
        // Try alternative deployment method that might work better with WalletConnect
        try {
          // Method 1: Standard deployment
          contract = await contractFactory.deploy(...constructorArgs)
          console.log('Contract deployment transaction sent:', contract.deployTransaction?.hash)
          
          // Verify the transaction was actually sent
          if (!contract.deployTransaction) {
            throw new Error('No deployment transaction was created')
          }
          
          deploymentTx = contract.deployTransaction
        } catch (standardError: any) {
          console.log('Standard deployment failed, trying alternative method:', standardError)
          
          // Method 2: Manual transaction creation (sometimes works better with WalletConnect)
          const deployTx = contractFactory.getDeployTransaction(...constructorArgs)
          console.log('Sending deployment transaction manually...')
          
          deploymentTx = await signer.sendTransaction(deployTx)
          console.log('Manual deployment transaction sent:', deploymentTx.hash)
          
          // Create contract instance from address (we'll get it after mining)
          const receipt = await deploymentTx.wait()
          contract = new ethers.Contract(receipt.contractAddress, template.abi, signer)
          contract.deployTransaction = deploymentTx
        }
      } catch (deployError: any) {
        console.error('Contract deployment failed:', deployError)
        console.error('Error details:', {
          message: deployError?.message,
          code: deployError?.code,
          reason: deployError?.reason,
          data: deployError?.data,
          stack: deployError?.stack
        })
        
        // Check if it's actually a user rejection or a different error
        if (deployError?.message?.includes('User rejected') ||
            deployError?.message?.includes('User Reject') ||
            deployError?.code === 4001 ||
            deployError?.code === 500) {
          
          // For WalletConnect "User Reject" errors, provide more helpful message
          if (deployError?.code === 500 && deployError?.message === 'User Reject') {
            throw new Error('Transaction failed to process. This might be due to a WalletConnect communication issue. Please try again or check your wallet connection.')
          } else {
            throw new Error('Transaction was rejected by user')
          }
        } else if (deployError?.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas fees')
        } else if (deployError?.message?.includes('gas')) {
          throw new Error(`Gas estimation failed: ${deployError?.message}`)
        } else {
          throw new Error(`Deployment failed: ${deployError?.message || deployError}`)
        }
      }
      
      // Wait for the contract to be mined (ethers v5 syntax)
      console.log('Waiting for contract to be mined...')
      try {
        await contract.deployed()
        console.log('Contract successfully deployed and mined')
      } catch (miningError: any) {
        console.error('Contract mining failed:', miningError)
        throw new Error(`Contract deployment failed during mining: ${miningError?.message || miningError}`)
      }
      
      const contractAddress = contract.address
      console.log('Contract deployed at:', contractAddress)

      // Store contract and project details in Firebase with 'pending' status
      const contractData = {
        templateId: template.id,
        contractAddress,
        chainId: 25, // Cronos mainnet
        ownerAddress: address,
        parameters: deploymentData.parameters,
        projectName: deploymentData.projectName,
        description: deploymentData.description,
        socialLinks: deploymentData.socialLinks,
        collections: deploymentData.collections,
        status: 'pending', // Admin needs to approve
        createdAt: new Date().toISOString(),
        transactionHash: contract.deployTransaction?.hash || ''
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
      if (deploymentData.logoFile || deploymentData.bannerFile) {
        const formData = new FormData()
        formData.append('contractAddress', contractAddress)
        
        if (deploymentData.logoFile) {
          formData.append('logo', deploymentData.logoFile)
        }
        
        if (deploymentData.bannerFile) {
          formData.append('banner', deploymentData.bannerFile)
        }

        await fetch('/api/contracts/upload-images', {
          method: 'POST',
          body: formData
        })
      }

      onSuccess(contractAddress)
      
    } catch (err: any) {
      console.error('Deployment error:', err)
      setError(err.message || 'Failed to deploy contract')
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return template.id === 'nft-staking-v1' ? 'NFT Collections & Contract Setup' : 'Contract Setup'
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
            <h3 className="text-2xl font-bold text-white mb-1">Deploy {template.name}</h3>
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
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
        </div>

        {/* Body */}
        <div className="p-6">
          <ErrorAlert error={error} onDismiss={() => setError(null)} />

          {/* Step Content */}
          {step === 1 && (
            <CollectionSetupStep
              template={template}
              deploymentData={deploymentData}
              onUpdateData={handleUpdateData}
              onParameterChange={handleParameterChange}
            />
          )}

          {step === 2 && (
            <ProjectDetailsStep
              deploymentData={deploymentData}
              onUpdateData={handleUpdateData}
            />
          )}

          {step === 3 && (
            <ReviewDeployStep
              template={template}
              deploymentData={deploymentData}
            />
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
                  {loading ? 'Deploying...' : 'Deploy Contract'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
