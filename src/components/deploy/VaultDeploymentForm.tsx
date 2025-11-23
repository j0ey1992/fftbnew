'use client'

import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui'
import { ContractTemplate } from '@/types/contract-templates'

interface VaultDeploymentFormProps {
  template: ContractTemplate
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}

interface VaultFormData {
  tokenName: string
  tokenSymbol: string
  stakeToken: string
  rewardToken: string
  rewardPerSecond: string
  rewardStartTimestamp: string
  rewardEndTimestamp: string
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

export default function VaultDeploymentForm({
  template,
  onClose,
  onSuccess
}: VaultDeploymentFormProps) {
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState<VaultFormData>({
    tokenName: '',
    tokenSymbol: '',
    stakeToken: '',
    rewardToken: '',
    rewardPerSecond: '',
    rewardStartTimestamp: '',
    rewardEndTimestamp: '',
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

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.tokenName.trim()) {
          setError('Boost token name is required')
          return false
        }
        if (formData.tokenName.trim().length < 3) {
          setError('Boost token name must be at least 3 characters long')
          return false
        }
        if (formData.tokenName.trim().length > 50) {
          setError('Boost token name must be less than 50 characters')
          return false
        }
        if (!formData.tokenSymbol.trim()) {
          setError('Boost token symbol is required')
          return false
        }
        if (formData.tokenSymbol.trim().length < 3) {
          setError('Boost token symbol must be at least 3 characters long')
          return false
        }
        if (formData.tokenSymbol.trim().length > 10) {
          setError('Boost token symbol must be less than 10 characters')
          return false
        }
        if (!/^[A-Z0-9]+$/.test(formData.tokenSymbol)) {
          setError('Token symbol must contain only uppercase letters and numbers')
          return false
        }
        if (!formData.stakeToken.trim()) {
          setError('Stake token address is required')
          return false
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(formData.stakeToken)) {
          setError('Invalid stake token address format')
          return false
        }
        if (!formData.rewardToken.trim()) {
          setError('Reward token address is required')
          return false
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(formData.rewardToken)) {
          setError('Invalid reward token address format')
          return false
        }
        if (!formData.rewardPerSecond.trim()) {
          setError('Reward per second is required')
          return false
        }
        const rewardRate = parseFloat(formData.rewardPerSecond)
        if (isNaN(rewardRate) || rewardRate <= 0) {
          setError('Reward per second must be a positive number')
          return false
        }
        if (!formData.rewardStartTimestamp.trim()) {
          setError('Reward start timestamp is required')
          return false
        }
        const startTime = parseInt(formData.rewardStartTimestamp)
        if (isNaN(startTime) || startTime <= 0) {
          setError('Invalid reward start timestamp')
          return false
        }
        if (!formData.rewardEndTimestamp.trim()) {
          setError('Reward end timestamp is required')
          return false
        }
        const endTime = parseInt(formData.rewardEndTimestamp)
        if (isNaN(endTime) || endTime <= 0) {
          setError('Invalid reward end timestamp')
          return false
        }
        if (endTime <= startTime) {
          setError('Reward end time must be after start time')
          return false
        }
        
        // Check minimum duration (at least 5 minutes for testing, 1 hour recommended)
        const duration = endTime - startTime
        if (duration < 300) { // Less than 5 minutes
          setError(`Reward duration is too short (${Math.round(duration / 60)} minutes). Minimum 5 minutes required for stable operation.`)
          return false
        }
        
        return true
      
      case 2:
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
        return validateStep(1) && validateStep(2)
      
      default:
        return true
    }
  }

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

  const convertToWei = (amount: string): string => {
    try {
      console.log('🔍 [DEBUG] Converting to wei:', { amount, type: typeof amount })
      
      // Validate input
      if (!amount || amount.trim() === '') {
        throw new Error('Amount cannot be empty')
      }
      
      const numericAmount = parseFloat(amount)
      console.log('🔍 [DEBUG] Parsed numeric amount:', numericAmount)
      
      // Check for extremely large values that could cause overflow
      if (numericAmount > 1e18) {
        console.warn('⚠️ [WARNING] Very large reward per second value detected:', numericAmount)
      }
      
      const amountBN = ethers.utils.parseEther(amount)
      console.log('🔍 [DEBUG] Converted to wei:', {
        original: amount,
        wei: amountBN.toString(),
        weiLength: amountBN.toString().length,
        isOverflow: amountBN.gt(ethers.constants.MaxUint256.div(2)) // Check if approaching overflow
      })
      
      // Check if the wei value is too large for uint64
      const uint64Max = ethers.BigNumber.from('18446744073709551615') // 2^64 - 1
      if (amountBN.gt(uint64Max)) {
        console.error('❌ [ERROR] Wei value exceeds uint64 maximum:', {
          weiValue: amountBN.toString(),
          uint64Max: uint64Max.toString()
        })
        throw new Error(`Reward per second value too large. Wei value ${amountBN.toString()} exceeds uint64 maximum.`)
      }
      
      return amountBN.toString()
    } catch (error) {
      console.error('❌ [ERROR] convertToWei failed:', error)
      throw new Error('Invalid reward per second amount: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeploy = async () => {
    setError(null)
    
    if (!validateStep(step)) return
    
    if (!address) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)

    try {
      if (!window.ethereum) {
        throw new Error('No wallet found')
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner(address)

      console.log('🔍 [DEBUG] Starting vault deployment process...')
      console.log('🔍 [DEBUG] Form data:', {
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        stakeToken: formData.stakeToken,
        rewardToken: formData.rewardToken,
        rewardPerSecond: formData.rewardPerSecond,
        rewardStartTimestamp: formData.rewardStartTimestamp,
        rewardEndTimestamp: formData.rewardEndTimestamp
      })

      // DIAGNOSTIC: Validate token contracts before deployment
      console.log('🔍 [DEBUG] Validating token contracts...')
      
      const erc20Abi = [
        'function decimals() view returns (uint8)',
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function totalSupply() view returns (uint256)'
      ]

      // Enhanced contract existence check
      const checkContractExists = async (address: string, tokenType: string) => {
        try {
          const code = await provider.getCode(address)
          if (code === '0x') {
            throw new Error(`No contract deployed at ${address}. This address does not contain a valid ${tokenType} token contract.`)
          }
          console.log(`✅ Contract exists at ${address}`)
        } catch (error: any) {
          console.error(`❌ Contract check failed for ${tokenType}:`, error.message)
          throw new Error(`Failed to verify ${tokenType} token contract at ${address}. ${error.message}`)
        }
      }

      // Check stake token
      try {
        console.log('🔍 [DEBUG] Checking stake token contract existence...')
        await checkContractExists(formData.stakeToken, 'stake')
        
        const stakeTokenContract = new ethers.Contract(formData.stakeToken, erc20Abi, provider)
        const stakeTokenDecimals = await stakeTokenContract.decimals()
        const stakeTokenName = await stakeTokenContract.name()
        const stakeTokenSymbol = await stakeTokenContract.symbol()
        console.log('✅ [SUCCESS] Stake token validation:', {
          address: formData.stakeToken,
          name: stakeTokenName,
          symbol: stakeTokenSymbol,
          decimals: stakeTokenDecimals
        })
      } catch (error: any) {
        console.error('❌ [ERROR] Stake token validation failed:', error)
        
        // Provide helpful suggestions for common tokens
        const suggestions = `

Valid token addresses on Cronos:
• USDC: 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59
• USDT: 0x66e428c3f67a68878562e79A0234c1F83c208770
• WCRO: 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23
• VVS: 0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03`

        throw new Error(`Invalid stake token address: ${formData.stakeToken}. ${error.message}${suggestions}`)
      }

      // Check reward token
      try {
        console.log('🔍 [DEBUG] Checking reward token contract existence...')
        await checkContractExists(formData.rewardToken, 'reward')
        
        const rewardTokenContract = new ethers.Contract(formData.rewardToken, erc20Abi, provider)
        const rewardTokenDecimals = await rewardTokenContract.decimals()
        const rewardTokenName = await rewardTokenContract.name()
        const rewardTokenSymbol = await rewardTokenContract.symbol()
        console.log('✅ [SUCCESS] Reward token validation:', {
          address: formData.rewardToken,
          name: rewardTokenName,
          symbol: rewardTokenSymbol,
          decimals: rewardTokenDecimals
        })

        // Check if decimals is within valid range (constructor checks decimals < 36)
        if (rewardTokenDecimals >= 36) {
          throw new Error(`Reward token decimals (${rewardTokenDecimals}) must be less than 36. Please use a different reward token.`)
        }
      } catch (error: any) {
        console.error('❌ [ERROR] Reward token validation failed:', error)
        
        // Provide helpful suggestions for common tokens
        const suggestions = `

Valid token addresses on Cronos:
• USDC: 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59
• USDT: 0x66e428c3f67a68878562e79A0234c1F83c208770
• WCRO: 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23
• VVS: 0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03`

        if (error.message && error.message.includes('decimals')) {
          throw new Error(`Invalid reward token address: ${formData.rewardToken}. Token contract does not implement decimals() function or decimals >= 36.${suggestions}`)
        }
        throw new Error(`Invalid reward token address: ${formData.rewardToken}. ${error.message}${suggestions}`)
      }

      const rewardPerSecondWei = convertToWei(formData.rewardPerSecond)

      const constructorArgs = [
        formData.tokenName,
        formData.tokenSymbol,
        formData.stakeToken,
        formData.rewardToken,
        rewardPerSecondWei,
        formData.rewardStartTimestamp,
        formData.rewardEndTimestamp
      ]

      console.log('🔍 [DEBUG] Constructor arguments prepared:', {
        args: constructorArgs,
        types: constructorArgs.map(arg => typeof arg),
        lengths: constructorArgs.map(arg => typeof arg === 'string' ? arg.length : 'N/A')
      })

      // DIAGNOSTIC: Validate constructor arguments
      console.log('🔍 [DEBUG] Detailed constructor argument validation:')
      console.log('  - tokenName:', formData.tokenName, '(length:', formData.tokenName.length, ')')
      console.log('  - tokenSymbol:', formData.tokenSymbol, '(length:', formData.tokenSymbol.length, ')')
      console.log('  - stakeToken:', formData.stakeToken, '(valid address:', /^0x[a-fA-F0-9]{40}$/.test(formData.stakeToken), ')')
      console.log('  - rewardToken:', formData.rewardToken, '(valid address:', /^0x[a-fA-F0-9]{40}$/.test(formData.rewardToken), ')')
      console.log('  - rewardPerSecondWei:', rewardPerSecondWei, '(type:', typeof rewardPerSecondWei, ')')
      console.log('  - rewardStartTimestamp:', formData.rewardStartTimestamp, '(type:', typeof formData.rewardStartTimestamp, ', value:', parseInt(formData.rewardStartTimestamp), ')')
      console.log('  - rewardEndTimestamp:', formData.rewardEndTimestamp, '(type:', typeof formData.rewardEndTimestamp, ', value:', parseInt(formData.rewardEndTimestamp), ')')
      
      // Check timestamp logic
      const startTime = parseInt(formData.rewardStartTimestamp)
      const endTime = parseInt(formData.rewardEndTimestamp)
      const currentTime = Math.floor(Date.now() / 1000)
      console.log('🔍 [DEBUG] Timestamp validation:')
      console.log('  - Current time:', currentTime, '(', new Date(currentTime * 1000).toISOString(), ')')
      console.log('  - Start time:', startTime, '(', new Date(startTime * 1000).toISOString(), ')')
      console.log('  - End time:', endTime, '(', new Date(endTime * 1000).toISOString(), ')')
      console.log('  - Start >= End (invalid):', startTime >= endTime)
      console.log('  - Same token addresses:', formData.stakeToken === formData.rewardToken)
      
      if (startTime >= endTime) {
        throw new Error(`Invalid timestamps: Start time (${startTime}) must be before end time (${endTime})`)
      }

      const contractFactory = new ethers.ContractFactory(
        template.abi,
        template.bytecode,
        signer
      )

      console.log('🔍 [DEBUG] Contract factory created, bytecode length:', template.bytecode.length)

      // Use a safe, predetermined gas limit for vault deployments to avoid uint64 overflow
      // Vault contracts typically need around 3-4 million gas, so we'll use 5 million as a safe limit
      const safeGasLimit = ethers.BigNumber.from('5000000') // 5 million gas
      console.log('🔍 [DEBUG] Using predetermined safe gas limit:', safeGasLimit.toString())

      // Verify the gas limit is within uint64 bounds
      const uint64Max = ethers.BigNumber.from('18446744073709551615')
      if (safeGasLimit.gt(uint64Max)) {
        throw new Error('Safe gas limit exceeds uint64 maximum')
      }

      console.log('🔍 [DEBUG] Deploying Vault contract with args and gas limit:', {
        args: constructorArgs,
        gasLimit: safeGasLimit.toString()
      })
      
      const contract = await contractFactory.deploy(...constructorArgs, {
        gasLimit: safeGasLimit
      })
      
      await contract.deployed()
      
      const contractAddress = contract.address
      console.log('Vault contract deployed at:', contractAddress)

      // Create vault contract data for admin approval
      const vaultData = {
        name: formData.projectName,
        description: formData.description,
        contractAddress,
        tokenAddress: formData.stakeToken,
        rewardTokenAddress: formData.rewardToken,
        apr: '0', // Will be calculated based on reward parameters
        minDeposit: '1', // Default minimum deposit
        enabled: false, // Starts disabled, requires admin approval
        chainId: 25,
        contractType: 'standard' as const,
        depositPeriods: [
          {
            period: 'Flexible',
            days: 0,
            apr: '0'
          }
        ],
        abi: template.abi,
        logoUrl: '',
        socialLinks: {
          twitter: formData.socialLinks.twitter,
          website: formData.socialLinks.website,
          telegram: formData.socialLinks.telegram,
          discord: formData.socialLinks.discord
        },
        // Store deployment parameters for reference
        deploymentParams: {
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          stakeToken: formData.stakeToken,
          rewardToken: formData.rewardToken,
          rewardPerSecond: formData.rewardPerSecond,
          rewardStartTimestamp: formData.rewardStartTimestamp,
          rewardEndTimestamp: formData.rewardEndTimestamp,
          transactionHash: contract.deployTransaction?.hash || ''
        }
      }

      // Store in vault contracts collection for admin approval
      const response = await fetch('/api/vault-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vaultData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit vault for approval')
      }

      onSuccess(contractAddress)
      
    } catch (err: any) {
      console.error('❌ [ERROR] Vault deployment error:', err)
      
      // Enhanced error logging for gas overflow debugging
      console.error('❌ [ERROR] Error details:', {
        message: err.message,
        code: err.code,
        data: err.data,
        reason: err.reason,
        transaction: err.transaction,
        receipt: err.receipt,
        stack: err.stack
      })
      
      // Check for specific gas overflow patterns
      if (err.message && err.message.includes('gas uint64 overflow')) {
        console.error('❌ [ERROR] Confirmed gas uint64 overflow detected!')
        setError('Gas calculation overflow detected. This is likely due to a very large reward per second value. Please try a smaller value.')
      } else if (err.message && err.message.includes('gas')) {
        console.error('❌ [ERROR] Gas-related error detected:', err.message)
        setError('Gas estimation failed: ' + err.message)
      } else if (err.code === -32603 && err.data && err.data.message && err.data.message.includes('gas uint64 overflow')) {
        console.error('❌ [ERROR] RPC gas uint64 overflow detected!')
        setError('Gas calculation overflow detected in RPC call. Please try a smaller reward per second value.')
      } else {
        setError(err.message || 'Failed to deploy vault contract')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Vault Configuration'
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
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#0a0f1f] to-[#0d1425]">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Deploy Token Vault</h3>
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

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Configure Your Vault</h4>
                <p className="text-gray-400 mb-6">
                  Set up the parameters for your token staking vault. These cannot be changed after deployment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Boost Token Name *
                  </label>
                  <input
                    type="text"
                    value={formData.tokenName}
                    onChange={(e) => handleFieldChange('tokenName', e.target.value)}
                    placeholder="e.g., Boost Token"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Name for the boost token users receive</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Boost Token Symbol *
                  </label>
                  <input
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={(e) => handleFieldChange('tokenSymbol', e.target.value.toUpperCase())}
                    placeholder="e.g., BOOST"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">3-5 uppercase letters/numbers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stake Token Address *
                  </label>
                  <input
                    type="text"
                    value={formData.stakeToken}
                    onChange={(e) => handleFieldChange('stakeToken', e.target.value)}
                    placeholder="e.g., 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59 (USDC)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Token that users will stake. Must be a valid ERC20 contract on Cronos.</p>
                  <div className="text-xs text-blue-400 mt-1">
                    <details className="cursor-pointer">
                      <summary>Show valid token addresses</summary>
                      <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                        <p>• USDC: 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59</p>
                        <p>• USDT: 0x66e428c3f67a68878562e79A0234c1F83c208770</p>
                        <p>• WCRO: 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23</p>
                        <p>• VVS: 0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03</p>
                      </div>
                    </details>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reward Token Address *
                  </label>
                  <input
                    type="text"
                    value={formData.rewardToken}
                    onChange={(e) => handleFieldChange('rewardToken', e.target.value)}
                    placeholder="e.g., 0x66e428c3f67a68878562e79A0234c1F83c208770 (USDT)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Token used for rewards. Must have decimals &lt; 36.</p>
                  <div className="text-xs text-blue-400 mt-1">
                    <details className="cursor-pointer">
                      <summary>Show valid token addresses</summary>
                      <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                        <p>• USDC: 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59</p>
                        <p>• USDT: 0x66e428c3f67a68878562e79A0234c1F83c208770</p>
                        <p>• WCRO: 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23</p>
                        <p>• VVS: 0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03</p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reward Per Second *
                </label>
                <input
                  type="number"
                  step="0.000000000000000001"
                  value={formData.rewardPerSecond}
                  onChange={(e) => handleFieldChange('rewardPerSecond', e.target.value)}
                  placeholder="e.g., 0.1"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Amount of reward tokens distributed per second (will be converted to wei)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reward Start Timestamp *
                  </label>
                  <input
                    type="number"
                    value={formData.rewardStartTimestamp}
                    onChange={(e) => handleFieldChange('rewardStartTimestamp', e.target.value)}
                    placeholder={Math.floor(Date.now() / 1000).toString()}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Unix timestamp when rewards start (current: {Math.floor(Date.now() / 1000)})</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('rewardStartTimestamp', Math.floor(Date.now() / 1000).toString())}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20"
                    >
                      Use current time
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('rewardStartTimestamp', (Math.floor(Date.now() / 1000) + 300).toString())}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20"
                    >
                      +5 minutes
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reward End Timestamp *
                  </label>
                  <input
                    type="number"
                    value={formData.rewardEndTimestamp}
                    onChange={(e) => handleFieldChange('rewardEndTimestamp', e.target.value)}
                    placeholder={(Math.floor(Date.now() / 1000) + 86400 * 30).toString()}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Unix timestamp when rewards end (minimum 5 minutes after start)</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const startTime = parseInt(formData.rewardStartTimestamp) || Math.floor(Date.now() / 1000)
                        handleFieldChange('rewardEndTimestamp', (startTime + 3600).toString()) // +1 hour
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20"
                    >
                      +1 hour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const startTime = parseInt(formData.rewardStartTimestamp) || Math.floor(Date.now() / 1000)
                        handleFieldChange('rewardEndTimestamp', (startTime + 86400).toString()) // +1 day
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20"
                    >
                      +1 day
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const startTime = parseInt(formData.rewardStartTimestamp) || Math.floor(Date.now() / 1000)
                        handleFieldChange('rewardEndTimestamp', (startTime + 86400 * 7).toString()) // +1 week
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20"
                    >
                      +1 week
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h5 className="text-blue-400 font-medium mb-1">Token Vault</h5>
                    <p className="text-blue-300 text-sm">
                      This creates a staking vault where users can stake tokens and earn rewards. Users receive boost tokens representing their staked position with multipliers based on lock periods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Project Information</h4>
                <p className="text-gray-400 mb-6">
                  Provide details about your vault project to help users understand your staking system.
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
                  placeholder="e.g., My Staking Vault"
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
                  placeholder="Describe your staking vault, its purpose, rewards, and benefits..."
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

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Review Your Vault</h4>
                <p className="text-gray-400 mb-6">
                  Please review all details before deploying. These settings cannot be changed after deployment.
                </p>
              </div>

              <GlassCard className="p-6">
                <h5 className="text-white font-semibold mb-4">Vault Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">Boost Token Name:</span>
                    <p className="text-white font-medium">{formData.tokenName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Boost Token Symbol:</span>
                    <p className="text-white font-medium">{formData.tokenSymbol}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Stake Token:</span>
                    <p className="text-white font-medium text-xs break-all">{formData.stakeToken}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Reward Token:</span>
                    <p className="text-white font-medium text-xs break-all">{formData.rewardToken}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Reward Per Second:</span>
                    <p className="text-white font-medium">{formData.rewardPerSecond}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Reward Period:</span>
                    <p className="text-white font-medium">
                      {new Date(parseInt(formData.rewardStartTimestamp) * 1000).toLocaleDateString()} - {new Date(parseInt(formData.rewardEndTimestamp) * 1000).toLocaleDateString()}
                    </p>
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
                    <h5 className="text-yellow-400 font-medium mb-1">Admin Approval Required</h5>
                    <p className="text-yellow-300 text-sm">
                      After deployment, your vault will be submitted for admin review and approval before appearing in the public vault listings. You will be able to manage your vault once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
                  {loading ? 'Deploying Vault...' : 'Deploy Vault'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}