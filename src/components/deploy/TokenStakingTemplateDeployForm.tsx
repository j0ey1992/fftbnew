'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/Textarea'
import Image from 'next/image'
import { uploadImage } from '@/lib/storage/simple-upload'
import { ContractTemplate } from '@/types/contract-templates'

interface TokenStakingTemplateDeployFormProps {
  template: ContractTemplate
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}

/**
 * Simplified token staking deployment form that uses the template system
 * Users just need to fill out parameters - no logo/banner upload needed here
 */
export default function TokenStakingTemplateDeployForm({
  template,
  onClose,
  onSuccess
}: TokenStakingTemplateDeployFormProps) {
  const router = useRouter()
  const { walletProvider } = useAppKitProvider('eip155')
  const { address, isConnected } = useAppKitAccount()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
  // File upload refs
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  
  // Form parameters
  const [formData, setFormData] = useState<Record<string, any>>({
    // Project info (for submission)
    name: '',
    description: '',
    apr: '',
    lockPeriodDays: '0',
    logoUrl: '',
    bannerUrl: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      website: '',
      whereToBuy: '',
      discord: '',
      telegram: ''
    },
    
    // Contract parameters
    stakedToken: '',
    rewardToken: '',
    rewardPerBlock: '',
    startBlock: '',
    endBlock: '',
    poolLimitPerUser: '0',
    numberBlocksForUserLimit: '0',
    minStakingPeriod: '0',
    useInitialLockPeriod: false,
    admin: address || '',
    manager: address || ''
  })
  
  // Update admin/manager when wallet connects
  useEffect(() => {
    if (address) {
      setFormData(prev => ({
        ...prev,
        admin: address,
        manager: address
      }))
    }
  }, [address])
  
  // Get current block number
  useEffect(() => {
    const getCurrentBlock = async () => {
      if (walletProvider && isConnected) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider)
          const currentBlock = await provider.getBlockNumber()
          
          setFormData(prev => ({
            ...prev,
            startBlock: (currentBlock + 100).toString(),
            endBlock: (currentBlock + 100 + (30 * 24 * 60 * 60 / 6)).toString()
          }))
        } catch (err) {
          console.error('Error getting current block:', err)
        }
      }
    }
    
    getCurrentBlock()
  }, [walletProvider, isConnected])
  
  // Calculate reward per block from APR
  useEffect(() => {
    if (formData.apr && formData.stakedToken) {
      const apr = parseFloat(formData.apr)
      const blocksPerYear = 365 * 24 * 60 * 60 / 6 // 6 second blocks
      const rewardPerBlock = (apr / 100) / blocksPerYear
      
      setFormData(prev => ({
        ...prev,
        rewardPerBlock: rewardPerBlock.toFixed(18)
      }))
    }
  }, [formData.apr, formData.stakedToken])
  
  // Convert lock period days to seconds
  useEffect(() => {
    const days = parseInt(formData.lockPeriodDays) || 0
    const seconds = days * 24 * 60 * 60
    setFormData(prev => ({
      ...prev,
      minStakingPeriod: seconds.toString()
    }))
  }, [formData.lockPeriodDays])
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }
    
    try {
      if (type === 'logo') {
        setUploadingLogo(true)
      } else {
        setUploadingBanner(true)
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const preview = reader.result as string
        if (type === 'logo') {
          setLogoPreview(preview)
        } else {
          setBannerPreview(preview)
        }
      }
      reader.readAsDataURL(file)
      
      // Upload to Firebase Storage
      const uploadResult = await uploadImage(file, `token-staking/${type}s`)
      const imageUrl = uploadResult.url
      
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'bannerUrl']: imageUrl
      }))
      
      setError(null)
    } catch (err: any) {
      console.error(`Error uploading ${type}:`, err)
      setError(`Failed to upload ${type}: ${err.message}`)
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false)
      } else {
        setUploadingBanner(false)
      }
    }
  }
  
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Project name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.logoUrl) {
      setError('Project logo is required')
      return false
    }
    if (!formData.apr || parseFloat(formData.apr) <= 0) {
      setError('APR must be greater than 0')
      return false
    }
    return true
  }
  
  const validateStep2 = () => {
    const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr)
    
    if (!isValidAddress(formData.stakedToken)) {
      setError('Invalid staked token address')
      return false
    }
    if (!isValidAddress(formData.rewardToken)) {
      setError('Invalid reward token address')
      return false
    }
    return true
  }
  
  const submitForApproval = async () => {
    if (!address) {
      setError('Please connect your wallet')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Submit to backend API for admin review
      const response = await fetch('/api/staking/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          contractAddress: '', // Will be deployed by admin
          tokenAddress: formData.stakedToken,
          rewardTokenAddress: formData.rewardToken,
          apr: formData.apr,
          minStake: '0',
          lockPeriods: [{
            period: `${formData.lockPeriodDays} days`,
            days: parseInt(formData.lockPeriodDays),
            apr: formData.apr
          }],
          chainId: 25,
          abi: template.abi,
          logoUrl: formData.logoUrl,
          bannerUrl: formData.bannerUrl,
          socialLinks: formData.socialLinks,
          status: 'pending_deployment',
          enabled: false,
          submittedBy: address,
          deploymentParams: {
            stakedToken: formData.stakedToken,
            rewardToken: formData.rewardToken,
            rewardPerBlock: formData.rewardPerBlock,
            startBlock: formData.startBlock,
            endBlock: formData.endBlock,
            poolLimitPerUser: formData.poolLimitPerUser,
            numberBlocksForUserLimit: formData.numberBlocksForUserLimit,
            minStakingPeriod: formData.minStakingPeriod,
            useInitialLockPeriod: formData.useInitialLockPeriod,
            admin: formData.admin,
            manager: formData.manager
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit for approval')
      }
      
      // Notify parent of success
      onSuccess('pending')
      
    } catch (err: any) {
      console.error('Submission error:', err)
      setError(`Failed to submit: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Project Information</h3>
              <p className="text-gray-400 text-sm">Basic details about your staking pool</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pool Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., USDC Staking Pool"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your staking pool"
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Logo *
                </label>
                <div className="flex items-center space-x-4">
                  {logoPreview && (
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                  )}
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Banner Image (Optional)
                </label>
                <div className="space-y-2">
                  {bannerPreview && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={bannerPreview}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'banner')}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  APR (%) *
                </label>
                <Input
                  type="number"
                  value={formData.apr}
                  onChange={(e) => handleInputChange('apr', e.target.value)}
                  placeholder="e.g., 15"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lock Period (Days)
                </label>
                <Input
                  type="number"
                  value={formData.lockPeriodDays}
                  onChange={(e) => handleInputChange('lockPeriodDays', e.target.value)}
                  placeholder="e.g., 30"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">0 means no lock period</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Social Links (Optional)
                </label>
                <div className="space-y-2">
                  <Input
                    value={formData.socialLinks.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    placeholder="Website URL"
                  />
                  <Input
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    placeholder="Twitter URL"
                  />
                  <Input
                    value={formData.socialLinks.telegram}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, telegram: e.target.value }
                    }))}
                    placeholder="Telegram URL"
                  />
                  <Input
                    value={formData.socialLinks.discord}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, discord: e.target.value }
                    }))}
                    placeholder="Discord URL"
                  />
                  <Input
                    value={formData.socialLinks.whereToBuy}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, whereToBuy: e.target.value }
                    }))}
                    placeholder="Where to Buy URL (e.g., VVS, PancakeSwap)"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  if (validateStep1()) {
                    setCurrentStep(2)
                    setError(null)
                  }
                }}
              >
                Next: Token Configuration
              </Button>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Token Configuration</h3>
              <p className="text-gray-400 text-sm">Configure the tokens for your staking pool</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Staked Token Address *
                </label>
                <Input
                  value={formData.stakedToken}
                  onChange={(e) => handleInputChange('stakedToken', e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">The token users will stake</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reward Token Address *
                </label>
                <Input
                  value={formData.rewardToken}
                  onChange={(e) => handleInputChange('rewardToken', e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">The token given as rewards</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useInitialLock"
                  checked={formData.useInitialLockPeriod}
                  onChange={(e) => handleInputChange('useInitialLockPeriod', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="useInitialLock" className="text-sm text-gray-300">
                  Use initial lock period (prevents immediate withdrawals)
                </label>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (validateStep2()) {
                    setCurrentStep(3)
                    setError(null)
                  }
                }}
              >
                Next: Review
              </Button>
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Review & Submit</h3>
              <p className="text-gray-400 text-sm">Review your configuration before submission</p>
            </div>
            
            <GlassCard>
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-white">Pool Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">APR:</span>
                    <span className="text-white">{formData.apr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lock Period:</span>
                    <span className="text-white">{formData.lockPeriodDays} days</span>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard>
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-white">Token Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Staked Token:</span>
                    <span className="text-white font-mono text-xs">
                      {formData.stakedToken.slice(0, 6)}...{formData.stakedToken.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reward Token:</span>
                    <span className="text-white font-mono text-xs">
                      {formData.rewardToken.slice(0, 6)}...{formData.rewardToken.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> Your token staking pool will be submitted for admin review. 
                The admin will deploy the contract and it will appear on the platform once approved.
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={submitForApproval}
                disabled={loading || !isConnected}
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f1f] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Deploy Token Staking</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator with labels */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  currentStep >= step ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Project Info</span>
              <span>Token Config</span>
              <span>Review</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {!isConnected && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">Please connect your wallet to continue</p>
            </div>
          )}
          
          {renderStep()}
        </div>
      </div>
    </div>
  )
}