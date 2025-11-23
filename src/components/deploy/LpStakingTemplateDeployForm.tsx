'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { ContractTemplate } from '@/types/contract-templates'
import { addLpStakingContract, uploadTokenLogo } from '@/lib/firebase/lp-staking-contracts'
import Image from 'next/image'

interface LpStakingTemplateDeployFormProps {
  template: ContractTemplate
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}

const TREASURY_ADDRESS = '0xF1889004ab0125CE304d5c680860cFA6B3564690'

/**
 * LP Staking project submission form - collects project info and handles reward transfer
 */
export default function LpStakingTemplateDeployForm({
  template,
  onClose,
  onSuccess
}: LpStakingTemplateDeployFormProps) {
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [tokenSymbol, setTokenSymbol] = useState<string>('TOKEN')
  const [checkingBalance, setCheckingBalance] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lpTokenAddress: '',
    rewardTokenAddress: '',
    totalRewards: '',
    durationDays: '90',
    website: '',
    twitter: '',
    discord: '',
    telegram: '',
    logoFile: null as File | null,
    bannerFile: null as File | null,
    minStake: '1',
    apr: '25%'
  })

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  // Check token balance
  const checkTokenBalance = async () => {
    if (!address || !formData.rewardTokenAddress || !walletProvider) return
    
    setCheckingBalance(true)
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider, 25) // Cronos chain ID
      const signer = provider.getSigner(address)
      
      const tokenContract = new ethers.Contract(
        formData.rewardTokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)'
        ],
        provider
      )
      
      const [balance, decimals, symbol] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.decimals().catch(() => 18),
        tokenContract.symbol().catch(() => 'TOKEN')
      ])
      
      const balanceFormatted = ethers.utils.formatUnits(balance, decimals)
      setTokenBalance(balanceFormatted)
      setTokenSymbol(symbol)
    } catch (error) {
      console.error('Error checking balance:', error)
      setTokenBalance(null)
      setTokenSymbol('TOKEN')
    } finally {
      setCheckingBalance(false)
    }
  }

  // Check balance when we reach step 3 - CHECK REWARD TOKEN BALANCE, NOT LP TOKEN
  useEffect(() => {
    if (step === 3 && address && formData.rewardTokenAddress && walletProvider) {
      checkTokenBalance()
    }
  }, [step, address, formData.rewardTokenAddress, walletProvider])

  // Handle file uploads
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    setFormData(prev => ({ ...prev, logoFile: file }))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    setFormData(prev => ({ ...prev, bannerFile: file }))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setBannerPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Validate current step
  const validateStep = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.name && formData.description && formData.lpTokenAddress && formData.rewardTokenAddress && formData.totalRewards && formData.durationDays
      case 2:
        return true // Social links and branding are optional
      case 3:
        return validateStep(1) && validateStep(2)
      default:
        return false
    }
  }

  // Handle sending rewards to treasury
  const handleSendRewards = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!address) {
        throw new Error('Please connect your wallet')
      }

      if (!walletProvider) {
        throw new Error('Wallet not connected. Please connect your wallet and try again.')
      }

      // Get Web3 provider using Reown wallet provider
      const provider = new ethers.providers.Web3Provider(walletProvider, 25) // Cronos chain ID
      const signer = provider.getSigner(address)
      
      // Create ERC20 contract instance
      const tokenContract = new ethers.Contract(
        formData.rewardTokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)'
        ],
        signer
      )
      
      // Get token info for better error messages
      const [decimals, symbol, balance] = await Promise.all([
        tokenContract.decimals().catch(() => 18), // Default to 18 if call fails
        tokenContract.symbol().catch(() => 'TOKEN'),
        tokenContract.balanceOf(address)
      ])
      
      // Convert amount using actual token decimals
      const amountWei = ethers.utils.parseUnits(formData.totalRewards, decimals)
      
      // Check if user has sufficient balance
      if (balance.lt(amountWei)) {
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals)
        throw new Error(`Insufficient ${symbol} balance. You have ${balanceFormatted} ${symbol} but need ${formData.totalRewards} ${symbol}`)
      }
      
      // Estimate gas first to catch any other issues
      const gasEstimate = await tokenContract.estimateGas.transfer(TREASURY_ADDRESS, amountWei)
      
      // Send tokens to treasury with estimated gas
      const tx = await tokenContract.transfer(TREASURY_ADDRESS, amountWei, {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      })
      
      await tx.wait()
      
      console.log('Rewards sent to treasury:', tx.hash)
      
      // Save to Firebase
      await saveToFirebase()
      
    } catch (err: any) {
      console.error('Transfer error:', err)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to send rewards'
      
      if (err.message?.includes('insufficient')) {
        errorMessage = err.message
      } else if (err.message?.includes('User denied') || err.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user'
      } else if (err.message?.includes('ds-math-sub-underflow')) {
        errorMessage = 'Insufficient token balance. Please ensure you have enough tokens in your wallet.'
      } else if (err.message?.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please check your token balance and try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('unknown account') || err.message?.includes('UNSUPPORTED_OPERATION')) {
        errorMessage = 'Wallet connection issue. Please disconnect and reconnect your wallet, then try again.'
      } else if (err.message?.includes('getAddress')) {
        errorMessage = 'Unable to access wallet address. Please reconnect your wallet and try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Save project to Firebase via server API
  const saveToFirebase = async () => {
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        lpTokenAddress: formData.lpTokenAddress,
        rewardTokenAddress: formData.rewardTokenAddress,
        totalRewards: formData.totalRewards,
        durationDays: parseInt(formData.durationDays),
        apr: formData.apr,
        minStake: formData.minStake,
        chainId: 25, // Cronos
        socialLinks: {
          website: formData.website,
          twitter: formData.twitter,
          discord: formData.discord,
          telegram: formData.telegram
        },
        submittedBy: address,
        rewardsSent: true,
        treasuryAddress: TREASURY_ADDRESS,
        lockPeriods: [
          { period: '30 Days', days: 30, apr: '15%' },
          { period: '90 Days', days: 90, apr: '25%' },
          { period: '180 Days', days: 180, apr: '35%' }
        ],
        abi: []
      }
      
      // Submit to server API
      const response = await fetch('/api/lp-staking/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit project')
      }
      
      const result = await response.json()
      const contractId = result.id
      
      // Upload logo if provided (optional - don't fail if this doesn't work)
      if (formData.logoFile) {
        try {
          console.log('Attempting logo upload...')
          await uploadTokenLogo(formData.logoFile, contractId)
          console.log('Logo uploaded successfully')
        } catch (logoError) {
          console.warn('Logo upload failed, but continuing with submission:', logoError)
          // Don't fail the whole process for logo upload - it's optional
        }
      }
      
      // Success - submission completed successfully
      setLoading(false)
      // Show success modal
      setShowSuccessModal(true)
      
    } catch (err: any) {
      console.error('Submission error:', err)
      setError(err.message || 'Failed to submit project')
      setLoading(false)
    }
  }

  // Step Components
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h4 className="text-xl font-bold text-white mb-2">Tell us about your LP Staking Pool</h4>
        <p className="text-gray-400">We'll help you set up everything needed for your liquidity staking rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pool Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
            placeholder="e.g., USDC-CRO LP Staking"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reward Duration (days) *
          </label>
          <input
            type="number"
            name="durationDays"
            value={formData.durationDays}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
            placeholder="90"
            min="1"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all resize-none"
          placeholder="Describe your LP staking pool and what makes it special..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            LP Token Address *
          </label>
          <input
            type="text"
            name="lpTokenAddress"
            value={formData.lpTokenAddress}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all font-mono text-sm"
            placeholder="0x..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            <strong>This is what users will stake</strong> (the LP token pair, e.g., USDC-CRO LP, VVS-USDC LP)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reward Token Address *
          </label>
          <input
            type="text"
            name="rewardTokenAddress"
            value={formData.rewardTokenAddress}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all font-mono text-sm"
            placeholder="0x..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            <strong>This is what you'll give as rewards</strong> (e.g., USDC, VVS, your project token) - NOT the LP token address
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Total Rewards *
        </label>
        <input
          type="number"
          name="totalRewards"
          value={formData.totalRewards}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
          placeholder="10000"
          min="0"
          step="any"
          required
        />
        <p className="text-xs text-gray-400 mt-1">Total tokens to distribute over the entire duration</p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h4 className="text-xl font-bold text-white mb-2">Branding & Social Links</h4>
        <p className="text-gray-400">Make your pool stand out with custom branding and social links</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Logo
          </label>
          <div className="space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all"
            >
              {logoPreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Click to upload logo</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Banner
          </label>
          <div className="space-y-3">
            <div 
              onClick={() => bannerInputRef.current?.click()}
              className="w-full h-32 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all"
            >
              {bannerPreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Click to upload banner</p>
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
            placeholder="https://yourproject.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Twitter
          </label>
          <input
            type="text"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
            placeholder="@yourproject"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Discord
          </label>
          <input
            type="text"
            name="discord"
            value={formData.discord}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
            placeholder="https://discord.gg/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Telegram
          </label>
          <input
            type="text"
            name="telegram"
            value={formData.telegram}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all"
            placeholder="https://t.me/..."
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h4 className="text-xl font-bold text-white mb-2">Send Rewards & Complete Submission</h4>
        <p className="text-gray-400">
          Transfer your <strong>reward tokens</strong> (the tokens you'll give to stakers) to our treasury and submit for admin approval
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h6 className="text-blue-300 font-medium mb-2">📝 How LP Staking Works:</h6>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• <strong>LP Token:</strong> {formData.lpTokenAddress ? 'Users stake this token' : 'What users will stake'}</li>
          <li>• <strong>Reward Token:</strong> {formData.rewardTokenAddress ? 'You send this token as rewards' : 'What you give as rewards'}</li>
          <li>• <strong>You only send the reward token</strong> - users bring their own LP tokens to stake</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <h5 className="text-blue-300 font-medium mb-4">Treasury Transfer Required</h5>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Reward Token:</span>
            <span className="text-white font-mono text-sm">{formData.rewardTokenAddress}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Amount to Send:</span>
            <span className="text-white font-bold">{formData.totalRewards} {tokenSymbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Your Balance:</span>
            <span className={`font-bold ${
              checkingBalance ? 'text-gray-400' : 
              tokenBalance && parseFloat(tokenBalance) >= parseFloat(formData.totalRewards) ? 'text-green-400' : 'text-red-400'
            }`}>
              {checkingBalance ? 'Checking...' : tokenBalance ? `${parseFloat(tokenBalance).toFixed(4)} ${tokenSymbol}` : 'Unable to check'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Treasury Address:</span>
            <span className="text-white font-mono text-sm">{TREASURY_ADDRESS}</span>
          </div>
        </div>
        
        {tokenBalance && parseFloat(tokenBalance) < parseFloat(formData.totalRewards) && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">
              ⚠️ Insufficient balance! You need {formData.totalRewards} {tokenSymbol} but only have {parseFloat(tokenBalance).toFixed(4)} {tokenSymbol}.
            </p>
          </div>
        )}
        
        {tokenBalance && parseFloat(tokenBalance) >= parseFloat(formData.totalRewards) && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
            <p className="text-green-400 text-sm">
              ✅ Sufficient balance confirmed! Ready to transfer {formData.totalRewards} {tokenSymbol}.
            </p>
          </div>
        )}
        
        {!address && (
          <div className="mt-4 p-3 bg-orange-900/30 border border-orange-800 rounded-lg">
            <p className="text-orange-400 text-sm">
              ⚠️ Wallet not connected. Please connect your wallet to continue.
            </p>
          </div>
        )}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <h6 className="text-yellow-300 font-medium mb-2">Important Steps:</h6>
        <ol className="text-yellow-200 text-sm space-y-1 list-decimal list-inside">
          <li>Click "Send Rewards" to transfer tokens to our treasury</li>
          <li>Your project will be submitted for admin review</li>
          <li>Admin will deploy the LP staking contract</li>
          <li>Your pool will go live on the platform</li>
        </ol>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4">
        <h6 className="text-gray-300 font-medium mb-3">Project Summary:</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Pool Name:</span>
            <p className="text-white">{formData.name}</p>
          </div>
          <div>
            <span className="text-gray-400">Duration:</span>
            <p className="text-white">{formData.durationDays} days</p>
          </div>
          <div>
            <span className="text-gray-400">Total Rewards:</span>
            <p className="text-white">{formData.totalRewards} tokens</p>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <p className="text-yellow-400">Pending Treasury Transfer</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#0a0f1f] rounded-xl shadow-2xl max-w-md w-full border border-green-500/20 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Submission Successful!</h3>
            <p className="text-gray-300 mb-6">
              Your LP staking pool has been submitted for review. The admin will deploy your contract soon.
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
              <h4 className="text-sm font-medium text-gray-400 mb-2">What happens next?</h4>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Admin reviews your submission</li>
                <li>Contract gets deployed on Cronos</li>
                <li>Your LP staking pool goes live</li>
                <li>Users can start staking!</li>
              </ol>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
              <p className="text-blue-300 text-sm">
                💡 Your rewards have been sent to our treasury and will be loaded into the contract upon deployment.
              </p>
            </div>
            
            <Button
              onClick={() => {
                setShowSuccessModal(false)
                onSuccess('pending')
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {showSuccessModal && <SuccessModal />}
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-[#0a0f1f] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#0a0f1f] to-[#0d1425]">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Deploy LP Staking Pool</h3>
            <p className="text-gray-400 text-sm">
              Step {step} of 3: {step === 1 ? 'Project Information' : step === 2 ? 'Branding & Social' : 'Send Rewards'}
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
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    stepNum < step ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-[#0a0f1f] to-[#0d1425]">
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {step < 3 ? (
                <Button
                  onClick={() => {
                    if (validateStep(step)) {
                      setStep(step + 1)
                      setError(null)
                    }
                  }}
                  disabled={loading}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSendRewards}
                  disabled={loading || !validateStep(3) || !address}
                  className="bg-gradient-to-r from-[#0072ff] to-[#00c2ff] hover:from-[#0060dd] hover:to-[#00a8dd]"
                >
                  {loading ? 'Sending Rewards...' : !address ? 'Connect Wallet to Continue' : 'Send Rewards & Submit'}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}