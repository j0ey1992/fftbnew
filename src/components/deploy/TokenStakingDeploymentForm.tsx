'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import Image from 'next/image';
import { uploadImage } from '@/lib/storage/simple-upload';
import { tokenStakingTemplate } from '@/data/templates/token-staking';
import { deploySmartChefPool, SMARTCHEF_FACTORY_ADDRESS } from '@/lib/contracts/smartchef-factory';

interface TokenStakingDeploymentFormProps {
  onComplete?: () => void;
}

/**
 * Form component for deploying a new token staking contract
 * Similar flow to NFT staking: Deploy -> Submit to Admin -> Admin Approves -> Shows on UI
 */
export default function TokenStakingDeploymentForm({ onComplete }: TokenStakingDeploymentFormProps) {
  const router = useRouter();
  const { walletProvider } = useAppKitProvider('eip155');
  const { address, isConnected } = useAppKitAccount();
  
  // Deployment state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  
  // Contract parameters
  const [contractParams, setContractParams] = useState({
    // Smart contract parameters
    stakedToken: '',
    rewardToken: '',
    rewardPerBlock: '',
    startBlock: '',
    endBlock: '',
    poolLimitPerUser: '0', // 0 means no limit
    numberBlocksForUserLimit: '0',
    minStakingPeriod: '0', // In seconds
    useInitialLockPeriod: false,
    
    // UI information
    name: '',
    description: '',
    apr: '',
    minStake: '0',
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
    }
  });
  
  // File upload refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Calculate reward per block from APR
  useEffect(() => {
    if (contractParams.apr && contractParams.stakedToken) {
      // This is a simplified calculation - in production you'd want to:
      // 1. Get the total supply of the staked token
      // 2. Calculate based on expected TVL
      // 3. Account for block time on the specific chain
      // For now, we'll use a placeholder calculation
      const apr = parseFloat(contractParams.apr);
      const blocksPerYear = 365 * 24 * 60 * 60 / 6; // Assuming 6 second blocks
      const rewardPerBlock = (apr / 100) / blocksPerYear;
      
      setContractParams(prev => ({
        ...prev,
        rewardPerBlock: rewardPerBlock.toFixed(18)
      }));
    }
  }, [contractParams.apr, contractParams.stakedToken]);
  
  // Convert lock period days to seconds
  useEffect(() => {
    const days = parseInt(contractParams.lockPeriodDays) || 0;
    const seconds = days * 24 * 60 * 60;
    setContractParams(prev => ({
      ...prev,
      minStakingPeriod: seconds.toString()
    }));
  }, [contractParams.lockPeriodDays]);
  
  // Get current block number
  useEffect(() => {
    const getCurrentBlock = async () => {
      if (walletProvider) {
        try {
          const provider = new ethers.providers.Web3Provider(walletProvider);
          const currentBlock = await provider.getBlockNumber();
          
          // Set start block to current block + 100 (give time for deployment)
          setContractParams(prev => ({
            ...prev,
            startBlock: (currentBlock + 100).toString(),
            // End block is 30 days from now (assuming 6 second blocks)
            endBlock: (currentBlock + 100 + (30 * 24 * 60 * 60 / 6)).toString()
          }));
        } catch (err) {
          console.error('Error getting current block:', err);
        }
      }
    };
    
    if (isConnected) {
      getCurrentBlock();
    }
  }, [walletProvider, isConnected]);
  
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    try {
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingBanner(true);
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        if (type === 'logo') {
          setLogoPreview(preview);
        } else {
          setBannerPreview(preview);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload to Firebase Storage
      const uploadResult = await uploadImage(file, `token-staking/${type}s`);
      const imageUrl = uploadResult.url;
      
      setContractParams(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'bannerUrl']: imageUrl
      }));
      
      setError(null);
    } catch (err: any) {
      console.error(`Error uploading ${type}:`, err);
      setError(`Failed to upload ${type}: ${err.message}`);
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };
  
  const validateStep1 = () => {
    if (!contractParams.name.trim()) {
      setError('Project name is required');
      return false;
    }
    if (!contractParams.description.trim()) {
      setError('Project description is required');
      return false;
    }
    if (!contractParams.logoUrl) {
      setError('Project logo is required');
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
    
    if (!isValidAddress(contractParams.stakedToken)) {
      setError('Invalid staked token address');
      return false;
    }
    if (!isValidAddress(contractParams.rewardToken)) {
      setError('Invalid reward token address');
      return false;
    }
    if (!contractParams.apr || parseFloat(contractParams.apr) <= 0) {
      setError('APR must be greater than 0');
      return false;
    }
    if (parseInt(contractParams.lockPeriodDays) < 0) {
      setError('Lock period cannot be negative');
      return false;
    }
    return true;
  };
  
  const handleDeploy = async () => {
    if (!address || !walletProvider) {
      setError('Please connect your wallet');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      
      // Deploy using factory contract
      const poolAddress = await deploySmartChefPool(provider, {
        stakedToken: contractParams.stakedToken,
        rewardToken: contractParams.rewardToken,
        rewardPerBlock: contractParams.rewardPerBlock,
        startBlock: parseInt(contractParams.startBlock),
        bonusEndBlock: parseInt(contractParams.endBlock),
        poolLimitPerUser: contractParams.poolLimitPerUser === '0' 
          ? '0' 
          : ethers.utils.parseEther(contractParams.poolLimitPerUser).toString(),
        numberBlocksForUserLimit: parseInt(contractParams.numberBlocksForUserLimit),
        minStakingPeriod: parseInt(contractParams.minStakingPeriod),
        useInitialLockPeriod: contractParams.useInitialLockPeriod,
        admin: address,
        manager: address
      });
      
      setDeployedAddress(poolAddress);
      
      // Submit to backend for approval
      await submitContractForApproval(poolAddress);
      
      setCurrentStep(4); // Success step
    } catch (err: any) {
      console.error('Deployment error:', err);
      setError(`Failed to deploy: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const submitForReview = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Submit to backend for admin deployment and approval
      await submitContractForApproval('');
      
      setCurrentStep(4); // Success step
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(`Failed to submit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const submitContractForApproval = async (contractAddress: string) => {
    try {
      const response = await fetch('/api/staking/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contractParams.name,
          description: contractParams.description,
          contractAddress: contractAddress, // Empty for admin deployment
          tokenAddress: contractParams.stakedToken,
          rewardTokenAddress: contractParams.rewardToken,
          apr: contractParams.apr,
          minStake: contractParams.minStake,
          lockPeriods: [{
            period: `${contractParams.lockPeriodDays} days`,
            days: parseInt(contractParams.lockPeriodDays),
            apr: contractParams.apr
          }],
          chainId: 25, // Cronos chain ID
          abi: tokenStakingTemplate.abi,
          logoUrl: contractParams.logoUrl,
          bannerUrl: contractParams.bannerUrl,
          socialLinks: contractParams.socialLinks,
          status: 'pending_deployment',
          enabled: false,
          submittedBy: address,
          // Include deployment parameters for admin to use
          deploymentParams: {
            stakedToken: contractParams.stakedToken,
            rewardToken: contractParams.rewardToken,
            rewardPerBlock: contractParams.rewardPerBlock,
            startBlock: contractParams.startBlock,
            endBlock: contractParams.endBlock,
            poolLimitPerUser: contractParams.poolLimitPerUser === '0' ? '0' : ethers.utils.parseEther(contractParams.poolLimitPerUser).toString(),
            numberBlocksForUserLimit: contractParams.numberBlocksForUserLimit,
            minStakingPeriod: contractParams.minStakingPeriod,
            useInitialLockPeriod: contractParams.useInitialLockPeriod,
            admin: address,
            manager: address
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit contract for approval');
      }
      
      const result = await response.json();
      console.log('Contract submitted for approval:', result);
    } catch (err: any) {
      console.error('Error submitting contract:', err);
      throw err;
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Project Details</h3>
              <p className="text-gray-400 text-sm">Provide basic information about your staking project</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <Input
                  value={contractParams.name}
                  onChange={(e) => setContractParams(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Token Staking"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <Textarea
                  value={contractParams.description}
                  onChange={(e) => setContractParams(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your staking project..."
                  rows={4}
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
                  Social Links (Optional)
                </label>
                <div className="space-y-2">
                  <Input
                    value={contractParams.socialLinks.website}
                    onChange={(e) => setContractParams(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    placeholder="Website URL"
                  />
                  <Input
                    value={contractParams.socialLinks.twitter}
                    onChange={(e) => setContractParams(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    placeholder="Twitter URL"
                  />
                  <Input
                    value={contractParams.socialLinks.telegram}
                    onChange={(e) => setContractParams(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, telegram: e.target.value }
                    }))}
                    placeholder="Telegram URL"
                  />
                  <Input
                    value={contractParams.socialLinks.discord}
                    onChange={(e) => setContractParams(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, discord: e.target.value }
                    }))}
                    placeholder="Discord URL"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  if (validateStep1()) {
                    setCurrentStep(2);
                    setError(null);
                  }
                }}
              >
                Next: Contract Settings
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Contract Settings</h3>
              <p className="text-gray-400 text-sm">Configure your staking contract parameters</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Staked Token Address *
                </label>
                <Input
                  value={contractParams.stakedToken}
                  onChange={(e) => setContractParams(prev => ({ ...prev, stakedToken: e.target.value }))}
                  placeholder="0x..."
                  className="w-full font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">The token users will stake</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reward Token Address *
                </label>
                <Input
                  value={contractParams.rewardToken}
                  onChange={(e) => setContractParams(prev => ({ ...prev, rewardToken: e.target.value }))}
                  placeholder="0x..."
                  className="w-full font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">The token given as rewards</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  APR (%) *
                </label>
                <Input
                  type="number"
                  value={contractParams.apr}
                  onChange={(e) => setContractParams(prev => ({ ...prev, apr: e.target.value }))}
                  placeholder="e.g., 50"
                  className="w-full"
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
                  value={contractParams.lockPeriodDays}
                  onChange={(e) => setContractParams(prev => ({ ...prev, lockPeriodDays: e.target.value }))}
                  placeholder="e.g., 30"
                  className="w-full"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">0 means no lock period</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Stake Amount
                </label>
                <Input
                  type="number"
                  value={contractParams.minStake}
                  onChange={(e) => setContractParams(prev => ({ ...prev, minStake: e.target.value }))}
                  placeholder="e.g., 100"
                  className="w-full"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum tokens required to stake (0 = no minimum)</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useInitialLock"
                  checked={contractParams.useInitialLockPeriod}
                  onChange={(e) => setContractParams(prev => ({ ...prev, useInitialLockPeriod: e.target.checked }))}
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
                    setCurrentStep(3);
                    setError(null);
                  }
                }}
              >
                Next: Review & Deploy
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Review & Deploy</h3>
              <p className="text-gray-400 text-sm">Review your settings before deploying</p>
            </div>
            
            <div className="space-y-4">
              <GlassCard>
                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-white">Project Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{contractParams.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">APR:</span>
                      <span className="text-white">{contractParams.apr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lock Period:</span>
                      <span className="text-white">{contractParams.lockPeriodDays} days</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard>
                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-white">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Staked Token:</span>
                      <span className="text-white font-mono text-xs">
                        {contractParams.stakedToken.slice(0, 6)}...{contractParams.stakedToken.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reward Token:</span>
                      <span className="text-white font-mono text-xs">
                        {contractParams.rewardToken.slice(0, 6)}...{contractParams.rewardToken.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min Stake:</span>
                      <span className="text-white">{contractParams.minStake || '0'} tokens</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm mb-2">
                  <strong>Deployment Options:</strong>
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <strong>Deploy Yourself:</strong> Pay gas fees and deploy instantly</li>
                  <li>• <strong>Admin Deploy:</strong> Submit for free admin deployment</li>
                </ul>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  <strong>Note:</strong> Both options require admin approval before appearing on the platform.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                disabled={loading}
              >
                Back
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={submitForReview}
                  disabled={loading || !isConnected}
                >
                  {loading ? 'Submitting...' : 'Submit for Admin Deploy'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeploy}
                  disabled={loading || !isConnected}
                >
                  {loading ? 'Deploying...' : 'Deploy & Submit'}
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Submission Successful!</h3>
              <p className="text-gray-400">
                {deployedAddress 
                  ? 'Your token staking pool has been deployed and submitted for admin approval.'
                  : 'Your token staking pool has been submitted for admin deployment and approval.'}
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">What happens next:</p>
              <ol className="text-left text-sm text-gray-300 space-y-1">
                <li>1. Admin reviews your submission</li>
                {!deployedAddress && <li>2. Admin deploys the staking contract</li>}
                <li>{deployedAddress ? '2' : '3'}. Your pool appears on the staking page</li>
              </ol>
              {deployedAddress && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400">Contract Address:</p>
                  <p className="text-xs text-gray-300 font-mono break-all">{deployedAddress}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                You will be notified once your staking pool is live on the platform.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/stake')}
                >
                  View Staking Page
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setCurrentStep(1);
                    setDeployedAddress(null);
                    setContractParams({
                      stakedToken: '',
                      rewardToken: '',
                      rewardPerBlock: '',
                      startBlock: '',
                      endBlock: '',
                      poolLimitPerUser: '0',
                      numberBlocksForUserLimit: '0',
                      minStakingPeriod: '0',
                      useInitialLockPeriod: false,
                      name: '',
                      description: '',
                      apr: '',
                      minStake: '0',
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
                      }
                    });
                    setLogoPreview(null);
                    setBannerPreview(null);
                  }}
                >
                  Deploy Another
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <GlassCard>
        {/* Progress Bar */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step === 4 && currentStep === 4 ? '✓' : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Project Info</span>
            <span>Contract Settings</span>
            <span>Review</span>
            <span>Success</span>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {!isConnected && currentStep !== 4 && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">Please connect your wallet to continue</p>
            </div>
          )}
          
          {renderStep()}
        </div>
      </GlassCard>
    </div>
  );
}