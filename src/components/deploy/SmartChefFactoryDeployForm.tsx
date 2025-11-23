'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/Textarea'
import { ContractTemplate } from '@/types/contract-templates'
import Image from 'next/image'
import { uploadImage } from '@/lib/storage/simple-upload'
import { getAuth } from 'firebase/auth'

// Smart Chef Factory contract address and ABI
const SMART_CHEF_FACTORY_ADDRESS = '0x8B82daCA3bDED4FCD6C916a8c3F1618Ba896E06b'
const SMART_CHEF_FACTORY_ABI = [
  {
    "inputs": [
      {"internalType": "contract IERC20Metadata", "name": "_stakedToken", "type": "address"},
      {"internalType": "contract IERC20Metadata", "name": "_rewardToken", "type": "address"},
      {"internalType": "uint256", "name": "_rewardPerBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "_startBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "_bonusEndBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "_poolLimitPerUser", "type": "uint256"},
      {"internalType": "uint256", "name": "_numberBlocksForUserLimit", "type": "uint256"},
      {"internalType": "uint256", "name": "_minStakingPeriod", "type": "uint256"},
      {"internalType": "bool", "name": "_useInitialLockPeriod", "type": "bool"},
      {"internalType": "address", "name": "_admin", "type": "address"},
      {"internalType": "address", "name": "_manager", "type": "address"}
    ],
    "name": "deployPool",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deploymentFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "smartChef", "type": "address"}
    ],
    "name": "NewSmartChefContract",
    "type": "event"
  }
]

interface SmartChefFactoryDeployFormProps {
  template: ContractTemplate
  onClose: () => void
  onSuccess: (contractAddress: string) => void
}

/**
 * Smart Chef Factory deployment form for token staking
 * Deploys directly using the factory contract on-chain
 */
export default function SmartChefFactoryDeployForm({
  template,
  onClose,
  onSuccess
}: SmartChefFactoryDeployFormProps) {
  const { walletProvider } = useAppKitProvider('eip155')
  const { address, isConnected } = useAppKitAccount()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deploymentFee, setDeploymentFee] = useState<string>('0')
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [calculatedAPR, setCalculatedAPR] = useState<string>('0')
  
  // File upload refs and state
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  
  // Form parameters
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    
    // Social links
    socialLinks: {
      website: '',
      twitter: '',
      telegram: '',
      discord: '',
      whereToBuy: ''
    },
    
    // Contract parameters
    stakedToken: '',
    rewardToken: '',
    rewardPerBlock: '',
    startBlock: '',
    bonusEndBlock: '',
    poolLimitPerUser: '0', // 0 means no limit (will be converted to MaxUint256)
    numberBlocksForUserLimit: '0',
    minStakingPeriod: '0', // in seconds
    useInitialLockPeriod: false,
    admin: address || '',
    manager: address || '',
    
    // UI helpers - NEW APPROACH
    totalRewardTokens: '', // Total tokens to distribute
    expectedTVL: '', // Expected total value locked for APR calculation
    durationDays: '30',
    lockPeriodDays: '0'
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
  
  // Get deployment fee and current block
  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!walletProvider || !isConnected) return
      
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider)
        const factoryContract = new ethers.Contract(
          SMART_CHEF_FACTORY_ADDRESS,
          SMART_CHEF_FACTORY_ABI,
          provider
        )
        
        // Get deployment fee
        const fee = await factoryContract.deploymentFee()
        setDeploymentFee(ethers.utils.formatEther(fee))
        
        // Get current block
        const block = await provider.getBlockNumber()
        setCurrentBlock(block)
        
        // Set default start and end blocks
        const blocksPerDay = 24 * 60 * 60 / 6 // 6 second blocks on Cronos
        const startBlock = block + 100 // Start in ~10 minutes
        const endBlock = startBlock + (parseInt(formData.durationDays) * blocksPerDay)
        
        setFormData(prev => ({
          ...prev,
          startBlock: startBlock.toString(),
          bonusEndBlock: endBlock.toString()
        }))
      } catch (err) {
        console.error('Error fetching contract info:', err)
      }
    }
    
    fetchContractInfo()
  }, [walletProvider, isConnected, formData.durationDays])
  
  // Calculate reward per block from total rewards and duration
  useEffect(() => {
    if (formData.totalRewardTokens && formData.startBlock && formData.bonusEndBlock) {
      try {
        const totalRewards = parseFloat(formData.totalRewardTokens)
        const totalBlocks = parseInt(formData.bonusEndBlock) - parseInt(formData.startBlock)
        
        if (totalBlocks > 0 && totalRewards > 0) {
          const rewardPerBlock = totalRewards / totalBlocks
          
          // Convert to wei (assuming 18 decimals)
          const rewardPerBlockWei = ethers.utils.parseEther(rewardPerBlock.toFixed(18))
          
          setFormData(prev => ({
            ...prev,
            rewardPerBlock: rewardPerBlockWei.toString()
          }))
        }
      } catch (err) {
        console.error('Error calculating reward per block:', err)
      }
    }
  }, [formData.totalRewardTokens, formData.startBlock, formData.bonusEndBlock])
  
  // Calculate APR based on expected TVL
  useEffect(() => {
    if (formData.totalRewardTokens && formData.expectedTVL && formData.durationDays) {
      try {
        const totalRewards = parseFloat(formData.totalRewardTokens)
        const expectedTVL = parseFloat(formData.expectedTVL)
        const days = parseFloat(formData.durationDays)
        
        if (totalRewards > 0 && expectedTVL > 0 && days > 0) {
          // Calculate annualized return
          const returnRate = totalRewards / expectedTVL
          const annualizedReturn = (returnRate * 365 / days) * 100
          
          setCalculatedAPR(annualizedReturn.toFixed(2))
        } else {
          setCalculatedAPR('0')
        }
      } catch (err) {
        console.error('Error calculating APR:', err)
        setCalculatedAPR('0')
      }
    } else {
      setCalculatedAPR('0')
    }
  }, [formData.totalRewardTokens, formData.expectedTVL, formData.durationDays])
  
  // Convert lock period days to seconds
  useEffect(() => {
    const days = parseInt(formData.lockPeriodDays) || 0
    const seconds = days * 24 * 60 * 60
    setFormData(prev => ({
      ...prev,
      minStakingPeriod: seconds.toString()
    }))
  }, [formData.lockPeriodDays])
  
  // Update end block when duration changes
  useEffect(() => {
    if (formData.startBlock && formData.durationDays) {
      const blocksPerDay = 24 * 60 * 60 / 6
      const endBlock = parseInt(formData.startBlock) + (parseInt(formData.durationDays) * blocksPerDay)
      setFormData(prev => ({
        ...prev,
        bonusEndBlock: endBlock.toString()
      }))
    }
  }, [formData.startBlock, formData.durationDays])
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
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
      setError('Pool name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.logoUrl) {
      setError('Logo is required')
      return false
    }
    if (!formData.totalRewardTokens || parseFloat(formData.totalRewardTokens) <= 0) {
      setError('Total reward tokens must be greater than 0')
      return false
    }
    if (!formData.expectedTVL || parseFloat(formData.expectedTVL) <= 0) {
      setError('Expected TVL must be greater than 0')
      return false
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      setError('Duration must be greater than 0')
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
  
  const deployContract = async () => {
    if (!validateStep1() || !validateStep2()) return
    if (!address || !walletProvider) {
      setError('Please connect your wallet')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider)
      const signer = provider.getSigner()
      
      // Create factory contract instance
      const factoryContract = new ethers.Contract(
        SMART_CHEF_FACTORY_ADDRESS,
        SMART_CHEF_FACTORY_ABI,
        signer
      )
      
      // Get deployment fee
      const fee = await factoryContract.deploymentFee()
      
      // Deploy the pool through the factory
      // Parse poolLimitPerUser - if 0, use MaxUint256 to effectively disable limit
      const poolLimit = formData.poolLimitPerUser === '0' 
        ? ethers.constants.MaxUint256 
        : ethers.utils.parseEther(formData.poolLimitPerUser)
      
      const tx = await factoryContract.deployPool(
        formData.stakedToken,
        formData.rewardToken,
        formData.rewardPerBlock,
        formData.startBlock,
        formData.bonusEndBlock,
        poolLimit,
        formData.numberBlocksForUserLimit,
        formData.minStakingPeriod,
        formData.useInitialLockPeriod,
        formData.admin,
        formData.manager,
        { value: fee }
      )
      
      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      // Find the NewSmartChefContract event to get the deployed address
      const event = receipt.events?.find((e: any) => e.event === 'NewSmartChefContract')
      const deployedAddress = event?.args?.smartChef
      
      if (!deployedAddress) {
        throw new Error('Failed to get deployed contract address')
      }
      
      // Save pool info to backend
      await savePoolInfo(deployedAddress, receipt.transactionHash)
      
      // Success!
      onSuccess(deployedAddress)
      
    } catch (err: any) {
      console.error('Deployment error:', err)
      
      let errorMessage = 'Failed to deploy contract'
      if (err.message?.includes('insufficient funds')) {
        errorMessage = `Insufficient CRO balance. You need ${deploymentFee} CRO for the deployment fee.`
      } else if (err.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled'
      } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Unable to estimate gas. Please check your input parameters.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  const savePoolInfo = async (contractAddress: string, txHash: string) => {
    try {
      // First, get auth token if available
      let authToken = null;
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (error) {
        console.log('Could not get auth token, proceeding without it');
      }
      
      // Get CSRF token from cookie
      const getCsrfToken = () => {
        if (typeof document === 'undefined') return null;
        const name = 'csrf-token=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let cookie of cookieArray) {
          cookie = cookie.trim();
          if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
          }
        }
        return null;
      };
      
      let csrfToken = getCsrfToken();
      
      // If no CSRF token, fetch it first
      if (!csrfToken) {
        try {
          const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/csrf-token`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (csrfResponse.ok) {
            await csrfResponse.json();
            csrfToken = getCsrfToken();
          }
        } catch (error) {
          console.error('Error fetching CSRF token:', error);
        }
      }
      
      // Submit to the public submission endpoint
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staking/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        credentials: 'include', // Important: include cookies for CSRF
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          contractAddress,
          tokenAddress: formData.stakedToken,
          rewardTokenAddress: formData.rewardToken,
          apr: calculatedAPR,
          totalRewardTokens: formData.totalRewardTokens,
          expectedTVL: formData.expectedTVL,
          minStake: formData.poolLimitPerUser,
          lockPeriods: [{
            period: formData.lockPeriodDays === '0' ? 'Flexible' : `${formData.lockPeriodDays} days`,
            days: parseInt(formData.lockPeriodDays),
            apr: formData.apr
          }],
          chainId: 25, // Cronos
          abi: template.abi,
          logoUrl: formData.logoUrl,
          bannerUrl: formData.bannerUrl,
          socialLinks: formData.socialLinks,
          deploymentTxHash: txHash,
          deployedBy: address,
          deploymentMethod: 'smart-chef-factory',
          factoryAddress: SMART_CHEF_FACTORY_ADDRESS,
          enabled: true,
          type: 'token-staking',
          // SmartChef specific fields
          poolLimitPerUser: formData.poolLimitPerUser === '0' ? ethers.constants.MaxUint256.toString() : ethers.utils.parseEther(formData.poolLimitPerUser).toString(),
          numberBlocksForUserLimit: formData.numberBlocksForUserLimit,
          minStakingPeriod: formData.minStakingPeriod,
          useInitialLockPeriod: formData.useInitialLockPeriod,
          startBlock: formData.startBlock,
          bonusEndBlock: formData.bonusEndBlock,
          // Additional deployment params for reference
          deploymentParams: {
            stakedToken: formData.stakedToken,
            rewardToken: formData.rewardToken,
            rewardPerBlock: formData.rewardPerBlock,
            startBlock: formData.startBlock,
            bonusEndBlock: formData.bonusEndBlock,
            poolLimitPerUser: formData.poolLimitPerUser,
            numberBlocksForUserLimit: formData.numberBlocksForUserLimit,
            minStakingPeriod: formData.minStakingPeriod,
            useInitialLockPeriod: formData.useInitialLockPeriod,
            admin: formData.admin,
            manager: formData.manager
          }
        })
      })
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Failed to save pool info to backend:', backendResponse.status, errorText);
        
        // Log more details for debugging
        if (backendResponse.status === 403) {
          console.error('403 Forbidden - Possible causes:');
          console.error('1. CSRF token missing or invalid');
          console.error('2. Authentication required');
          console.error('3. Insufficient permissions');
          console.error('CSRF token present:', !!csrfToken);
          console.error('Auth token present:', !!authToken);
        }
      } else {
        console.log('Pool info saved successfully to backend');
      }
    } catch (err) {
      console.error('Error saving pool info:', err)
      // Don't throw - deployment was successful even if saving failed
    }
  }
  
  const renderStep1 = () => (
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
          Total Reward Tokens to Distribute *
        </label>
        <Input
          type="number"
          value={formData.totalRewardTokens}
          onChange={(e) => handleInputChange('totalRewardTokens', e.target.value)}
          placeholder="e.g., 10000"
          min="0"
          step="any"
        />
        <p className="text-xs text-gray-500 mt-1">
          Total amount of reward tokens you will deposit for distribution
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Expected TVL (Total Value Locked) *
          </label>
          <Input
            type="number"
            value={formData.expectedTVL}
            onChange={(e) => handleInputChange('expectedTVL', e.target.value)}
            placeholder="e.g., 50000"
            min="0"
            step="any"
          />
          <p className="text-xs text-gray-500 mt-1">
            Expected amount of tokens to be staked
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duration (Days) *
          </label>
          <Input
            type="number"
            value={formData.durationDays}
            onChange={(e) => handleInputChange('durationDays', e.target.value)}
            placeholder="e.g., 30"
            min="1"
          />
        </div>
      </div>
      
      {calculatedAPR !== '0' && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Estimated APR:</strong> {calculatedAPR}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Based on {formData.expectedTVL} tokens staked with {formData.totalRewardTokens} rewards over {formData.durationDays} days
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ Actual APR will vary based on real TVL. If more tokens are staked, APR decreases. If fewer are staked, APR increases.
          </p>
        </div>
      )}
      
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
  )
  
  const renderStep2 = () => (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Pool Limit Per User
          </label>
          <Input
            type="number"
            value={formData.poolLimitPerUser}
            onChange={(e) => handleInputChange('poolLimitPerUser', e.target.value)}
            placeholder="0"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">0 means no limit (unlimited staking per user)</p>
        </div>
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
      
      {currentBlock > 0 && (
        <GlassCard className="bg-gray-800/30">
          <div className="p-3 text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Current Block:</span>
              <span>{currentBlock}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Start Block:</span>
              <span>{formData.startBlock}</span>
            </div>
            <div className="flex justify-between">
              <span>End Block:</span>
              <span>{formData.bonusEndBlock}</span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
  
  const renderStep3 = () => (
    <div className="space-y-4">
      <GlassCard>
        <div className="p-4">
          <h3 className="font-semibold text-white mb-3">Review Your Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Pool Name:</span>
              <span className="text-white">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Reward Tokens:</span>
              <span className="text-white">{formData.totalRewardTokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expected TVL:</span>
              <span className="text-white">{formData.expectedTVL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated APR:</span>
              <span className="text-white">{calculatedAPR}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white">{formData.durationDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lock Period:</span>
              <span className="text-white">{formData.lockPeriodDays} days</span>
            </div>
          </div>
        </div>
      </GlassCard>
      
      <GlassCard>
        <div className="p-4">
          <h3 className="font-semibold text-white mb-3">Token Configuration</h3>
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
      
      <GlassCard>
        <div className="p-4">
          <h3 className="font-semibold text-white mb-3">Deployment Fee</h3>
          <p className="text-gray-300 text-sm mb-2">
            This pool will be deployed using the Smart Chef Factory.
          </p>
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-gray-300">Factory Deployment Fee:</span>
            <span className="text-white font-bold">{deploymentFee} CRO</span>
          </div>
        </div>
      </GlassCard>
      
      <GlassCard className="bg-orange-500/10 border border-orange-500/30">
        <div className="p-4">
          <h3 className="font-semibold text-orange-400 mb-2">⚠️ Critical Next Steps After Deployment</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-orange-300">
            <li>
              <strong>Deposit exactly {formData.totalRewardTokens} reward tokens</strong> to the deployed contract address
            </li>
            <li>
              The pool will not function until reward tokens are deposited
            </li>
            <li>
              Users will see the pool but won't be able to earn rewards without the token deposit
            </li>
          </ol>
          <div className="mt-3 p-3 bg-orange-900/20 rounded">
            <p className="text-xs text-gray-300">
              <strong>Calculation:</strong> {formData.totalRewardTokens} tokens ÷ {
                formData.bonusEndBlock && formData.startBlock 
                  ? (parseInt(formData.bonusEndBlock) - parseInt(formData.startBlock)).toLocaleString()
                  : '...'
              } blocks = {
                formData.rewardPerBlock 
                  ? (parseFloat(ethers.utils.formatEther(formData.rewardPerBlock))).toFixed(6)
                  : '...'
              } tokens per block
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f1f] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Deploy Token Staking Pool</h2>
              <p className="text-gray-400 text-sm mt-1">
                Step {currentStep} of 3: {currentStep === 1 ? 'Pool Information' : currentStep === 2 ? 'Token Configuration' : 'Review & Deploy'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
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
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {!isConnected && currentStep === 3 && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">Please connect your wallet to deploy</p>
            </div>
          )}
          
          {/* Step content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCurrentStep(currentStep - 1)
                    setError(null)
                  }}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (currentStep === 1 && validateStep1()) {
                        setCurrentStep(2)
                        setError(null)
                      } else if (currentStep === 2 && validateStep2()) {
                        setCurrentStep(3)
                        setError(null)
                      }
                    }}
                  >
                    Next
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={deployContract}
                    disabled={loading || !isConnected}
                    className="min-w-[150px]"
                  >
                    {loading ? 'Deploying...' : `Deploy (${deploymentFee} CRO)`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}