'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addLpStakingContract, uploadTokenLogo, LpStakingContract } from '@/lib/firebase/lp-staking-contracts';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import Image from 'next/image';

interface LpStakingDeploymentFormProps {
  contractAddress: string;
  chainId: number;
  onComplete?: () => void;
}

/**
 * Form component for configuring a newly deployed LP staking contract
 */
export default function LpStakingDeploymentForm({
  contractAddress,
  chainId,
  onComplete,
}: LpStakingDeploymentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Omit<LpStakingContract, 'id' | 'createdAt' | 'updatedAt'>>>({
    name: '',
    description: '',
    contractAddress: contractAddress,
    lpTokenAddress: '',
    rewardTokenAddress: '',
    apr: '',
    minStake: '1',
    enabled: true, // Enabled by default for user-deployed contracts
    chainId: chainId,
    lockPeriods: [
      { period: '1 Day', days: 1, apr: '1.5%' },
      { period: '7 Days', days: 7, apr: '2.1%' },
      { period: '30 Days', days: 30, apr: '3.2%' },
      { period: '90 Days', days: 90, apr: '4.2%' }
    ],
    abi: [],
    logoUrl: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      website: '',
      whereToBuy: '',
      discord: '',
      telegram: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lockPeriods, setLockPeriods] = useState<{ period: string; days: number; apr: string }[]>([
    { period: '1 Day', days: 1, apr: '1.5%' },
    { period: '7 Days', days: 7, apr: '2.1%' },
    { period: '30 Days', days: 30, apr: '3.2%' },
    { period: '90 Days', days: 90, apr: '4.2%' }
  ]);

  const steps = [
    { id: 1, title: 'Project Info', description: 'Tell us about your staking pool' },
    { id: 2, title: 'Token Setup', description: 'Which tokens will you use?' },
    { id: 3, title: 'Rewards & Lock Times', description: 'How long to lock and what rewards?' },
    { id: 4, title: 'Logo & Social Media', description: 'Make it look great!' },
  ];

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('social.')) {
      const socialType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialType]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError(null);
  };

  // Handle logo file change
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Logo must be an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle lock period changes
  const handleLockPeriodChange = (index: number, field: keyof typeof lockPeriods[0], value: string | number) => {
    const updatedPeriods = [...lockPeriods];
    updatedPeriods[index] = { ...updatedPeriods[index], [field]: value };
    setLockPeriods(updatedPeriods);
    setFormData(prev => ({ ...prev, lockPeriods: updatedPeriods }));
  };

  // Add new lock period
  const addLockPeriod = () => {
    const newPeriod = { period: '', days: 1, apr: '1%' };
    const updatedPeriods = [...lockPeriods, newPeriod];
    setLockPeriods(updatedPeriods);
    setFormData(prev => ({ ...prev, lockPeriods: updatedPeriods }));
  };

  // Remove lock period
  const removeLockPeriod = (index: number) => {
    if (lockPeriods.length <= 1) return;
    const updatedPeriods = lockPeriods.filter((_, i) => i !== index);
    setLockPeriods(updatedPeriods);
    setFormData(prev => ({ ...prev, lockPeriods: updatedPeriods }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.description);
      case 2:
        return !!(formData.lpTokenAddress && formData.rewardTokenAddress && formData.apr);
      case 3:
        return lockPeriods.length > 0 && lockPeriods.every(p => p.period && p.days && p.apr);
      case 4:
        return true; // Branding is optional
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      setError('Please fill in all the required fields (marked with *) before continuing');
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Validate all required fields
      if (!formData.name || !formData.description || !formData.lpTokenAddress || 
          !formData.rewardTokenAddress || !formData.apr) {
        throw new Error('Please fill in all the required fields (marked with *)');
      }

      // Address validation
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(formData.lpTokenAddress || '')) {
        throw new Error('The LP token address doesn\'t look right. Make sure it starts with 0x and has 42 characters total.');
      }
      if (!addressRegex.test(formData.rewardTokenAddress || '')) {
        throw new Error('The reward token address doesn\'t look right. Make sure it starts with 0x and has 42 characters total.');
      }

      // Create the contract
      const result = await addLpStakingContract(formData as any);
      const contractId = result.id;

      // Upload logo if provided
      const logoFile = fileInputRef.current?.files?.[0];
      if (logoFile) {
        try {
          setUploadingLogo(true);
          const logoUrl = await uploadTokenLogo(logoFile, contractId);
          // The logo URL is automatically updated in the contract
        } catch (logoError) {
          console.error('Error uploading logo:', logoError);
          // Don't fail the whole operation for logo upload
        } finally {
          setUploadingLogo(false);
        }
      }

      // Success - redirect to LP staking page
      if (onComplete) {
        onComplete();
      } else {
        router.push(`/lp-staking/${contractId}`);
      }
    } catch (err: any) {
      console.error('Error creating LP staking contract:', err);
      setError(err.message || 'Failed to create LP staking contract');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What's your pool called? *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                placeholder="e.g., USDC-ETH Staking Pool"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Give your staking pool a catchy name that people will remember
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tell people about your pool *
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                placeholder="Stake your LP tokens and earn amazing rewards! Perfect for long-term holders..."
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Explain why someone should stake in your pool
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Which LP tokens can people stake? *
              </label>
              <input
                type="text"
                name="lpTokenAddress"
                value={formData.lpTokenAddress || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                placeholder="0x1234... (paste the LP token address here)"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                This is the LP token people will deposit to earn rewards
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What token will you give as rewards? *
              </label>
              <input
                type="text"
                name="rewardTokenAddress"
                value={formData.rewardTokenAddress || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                placeholder="0x5678... (paste the reward token address here)"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                This is what stakers will earn (could be your project token!)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What's your base reward rate? *
              </label>
              <input
                type="text"
                name="apr"
                value={formData.apr || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                placeholder="e.g., 25% (how much yearly rewards)"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Higher rates = more attractive to stakers!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum amount to stake (optional)
              </label>
              <input
                type="text"
                name="minStake"
                value={formData.minStake || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                placeholder="1 (minimum LP tokens needed)"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave as 1 if you want anyone to be able to stake any amount
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-medium text-white">Time Lock Options</h4>
                <p className="text-sm text-gray-400">Longer locks = better rewards!</p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={addLockPeriod}
                type="button"
              >
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {lockPeriods.map((period, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">What to call this option</label>
                      <input
                        type="text"
                        value={period.period}
                        onChange={(e) => handleLockPeriodChange(index, 'period', e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="e.g., Quick Lock"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">How many days locked</label>
                      <input
                        type="number"
                        value={period.days}
                        onChange={(e) => handleLockPeriodChange(index, 'days', parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        min="1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Reward rate for this lock</label>
                      <input
                        type="text"
                        value={period.apr}
                        onChange={(e) => handleLockPeriodChange(index, 'apr', e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="e.g., 3.2%"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => removeLockPeriod(index)}
                        disabled={lockPeriods.length <= 1}
                        type="button"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Longer lock periods usually have higher reward rates to incentivize commitment. This helps stabilize your token price!
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload your logo (optional but recommended!)
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                    <Image
                      src={logoPreview}
                      alt="Your logo"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">A nice logo makes your pool look professional!</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your website (optional)
                </label>
                <input
                  type="url"
                  name="social.website"
                  value={formData.socialLinks?.website || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  placeholder="https://yourproject.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter/X handle (optional)
                </label>
                <input
                  type="text"
                  name="social.twitter"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  placeholder="@yourproject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discord server (optional)
                </label>
                <input
                  type="text"
                  name="social.discord"
                  value={formData.socialLinks?.discord || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  placeholder="discord.gg/yourserver"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telegram group (optional)
                </label>
                <input
                  type="text"
                  name="social.telegram"
                  value={formData.socialLinks?.telegram || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  placeholder="t.me/yourgroup"
                />
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-300 text-sm">
                🌟 <strong>Almost done!</strong> Adding social links helps build trust with your stakers. They can follow your project updates!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GlassCard elevation="raised">
      <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
        <h3 className="text-xl font-bold">Set Up Your Staking Pool</h3>
        <p className="text-gray-400 text-sm mt-1">
          Let's make your LP staking pool ready for users! This will only take a few minutes.
        </p>
      </div>
      
      <div className="p-6">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h4 className="text-lg font-medium text-white">
              {steps[currentStep - 1]?.title}
            </h4>
            <p className="text-gray-400 text-sm">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={loading || uploadingLogo}
                disabled={!validateStep(currentStep)}
              >
                {loading || uploadingLogo ? 'Setting up your pool...' : 'Launch My Staking Pool! 🚀'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}