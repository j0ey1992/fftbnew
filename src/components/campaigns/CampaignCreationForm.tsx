'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreateCampaignData, 
  FeeCalculationRequest,
  CampaignPaymentRequest 
} from '@/types/campaign';
import { QuestCategory, QuestDifficulty, Requirement, RequirementType, VerificationType } from '@/types/quest';
import { useCampaignManagement } from '@/hooks/useCampaigns';
import { useAppKitAccount } from '@reown/appkit/react';

interface CampaignCreationFormProps {
  onSuccess?: (campaignId: string) => void;
  onCancel?: () => void;
}

const CATEGORIES: { value: QuestCategory; label: string }[] = [
  { value: 'social', label: 'Social Media' },
  { value: 'content', label: 'Content Creation' },
  { value: 'web3', label: 'Web3 & DeFi' },
  { value: 'custom', label: 'Custom' }
];

const DIFFICULTIES: { value: QuestDifficulty; label: string; description: string }[] = [
  { value: 'Easy', label: 'Easy', description: 'Simple tasks, 5-15 minutes' },
  { value: 'Medium', label: 'Medium', description: 'Moderate tasks, 15-30 minutes' },
  { value: 'Hard', label: 'Hard', description: 'Complex tasks, 30+ minutes' }
];

const REQUIREMENT_TYPES: { value: RequirementType; label: string }[] = [
  { value: 'twitter_like', label: 'Twitter Like' },
  { value: 'twitter_retweet', label: 'Twitter Retweet' },
  { value: 'twitter_comment', label: 'Twitter Comment' },
  { value: 'discord', label: 'Discord Join' },
  { value: 'telegram', label: 'Telegram Join' },
  { value: 'follow', label: 'Follow Account' },
  { value: 'website', label: 'Visit Website' },
  { value: 'image_proof', label: 'Image Proof' },
  { value: 'custom', label: 'Custom Task' }
];

const VERIFICATION_TYPES: { value: VerificationType; label: string }[] = [
  { value: 'link_proof', label: 'Link Proof' },
  { value: 'image_proof', label: 'Image Proof' },
  { value: 'standard', label: 'Standard Verification' }
];

export default function CampaignCreationForm({ onSuccess, onCancel }: CampaignCreationFormProps) {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const {
    createCampaignAsync,
    isCreating,
    createError,
    processPaymentAsync,
    isProcessing,
    paymentError,
    calculateFee,
    feeData,
    isCalculating,
    feeError
  } = useCampaignManagement();

  const [step, setStep] = useState<'form' | 'review' | 'payment' | 'success'>('form');
  const [campaignId, setCampaignId] = useState<string>('');
  const [formData, setFormData] = useState<CreateCampaignData>({
    title: '',
    description: '',
    category: 'custom',
    difficulty: 'Easy',
    reward: 0,
    xpReward: 0,
    tokenAddress: '0x1234567890123456789012345678901234567890', // Default KRIS token
    tokenSymbol: 'KRIS',
    tokenDecimals: 18,
    participantLimit: 'unlimited',
    requirements: [],
    campaignSettings: {
      autoApprove: false,
      requiresManualReview: true
    }
  });

  const [newRequirement, setNewRequirement] = useState<Requirement>({
    type: 'custom',
    description: '',
    verificationType: 'standard'
  });

  // Calculate fee when reward changes
  useEffect(() => {
    if (formData.reward > 0) {
      const feeRequest: FeeCalculationRequest = {
        rewardAmount: formData.reward,
        tokenSymbol: formData.tokenSymbol,
        tokenAddress: formData.tokenAddress
      };
      calculateFee(feeRequest);
    }
  }, [formData.reward, formData.tokenSymbol, formData.tokenAddress, calculateFee]);

  const handleInputChange = (field: keyof CreateCampaignData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequirementChange = (field: keyof Requirement, value: any) => {
    setNewRequirement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.description.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, { ...newRequirement }]
      }));
      setNewRequirement({
        type: 'custom',
        description: '',
        verificationType: 'standard'
      });
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.reward <= 0) return 'Reward must be greater than 0';
    if (formData.requirements.length === 0) return 'At least one requirement is needed';
    if (!address) return 'Please connect your wallet';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const result = await createCampaignAsync(formData);
      setCampaignId(result.id);
      setStep('payment');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handlePayment = async (txHash: string) => {
    if (!campaignId || !address) return;

    try {
      const paymentRequest: Omit<CampaignPaymentRequest, 'campaignId'> = {
        paymentTxHash: txHash,
        fromAddress: address
      };

      await processPaymentAsync({ campaignId, paymentRequest });
      setStep('success');
      
      if (onSuccess) {
        onSuccess(campaignId);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-600 mt-2">
          Create a one-off quest by paying platform fees in KRIS tokens
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Try Enhanced Quests</h3>
              <p className="text-sm text-blue-700 mt-1">
                Create advanced quests with AI verification, blockchain integration, and 16 specialized quest types.
              </p>
            </div>
            <button
              onClick={() => router.push('/quests/create')}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Create Enhanced Quest
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Form', 'Review', 'Payment', 'Success'].map((stepName, index) => {
            const stepNumber = index + 1;
            const isActive = 
              (step === 'form' && stepNumber === 1) ||
              (step === 'review' && stepNumber === 2) ||
              (step === 'payment' && stepNumber === 3) ||
              (step === 'success' && stepNumber === 4);
            const isCompleted = 
              (step === 'review' && stepNumber === 1) ||
              (step === 'payment' && stepNumber <= 2) ||
              (step === 'success' && stepNumber <= 3);

            return (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                  {stepName}
                </span>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === 'form' && (
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter campaign title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your campaign and what participants need to do"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff.value} value={diff.value}>
                        {diff.label} - {diff.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reward Configuration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Amount (KRIS) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.reward}
                    onChange={(e) => handleInputChange('reward', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    XP Reward (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward || 0}
                    onChange={(e) => handleInputChange('xpReward', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Limit
                </label>
                <select
                  value={formData.participantLimit}
                  onChange={(e) => handleInputChange('participantLimit',
                    e.target.value === 'unlimited' ? 'unlimited' : parseInt(e.target.value)
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unlimited">Unlimited</option>
                  <option value={10}>10 participants</option>
                  <option value={25}>25 participants</option>
                  <option value={50}>50 participants</option>
                  <option value={100}>100 participants</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirements Setup */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements Setup</h2>
            
            {/* Add New Requirement */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirement Type
                  </label>
                  <select
                    value={newRequirement.type}
                    onChange={(e) => handleRequirementChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {REQUIREMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Type
                  </label>
                  <select
                    value={newRequirement.verificationType}
                    onChange={(e) => handleRequirementChange('verificationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {VERIFICATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirement Description
                </label>
                <textarea
                  value={newRequirement.description}
                  onChange={(e) => handleRequirementChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what participants need to do"
                />
              </div>
              
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Requirement
              </button>
            </div>
            
            {/* Current Requirements */}
            {formData.requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Requirements</h3>
                <div className="space-y-3">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-blue-600">
                            {REQUIREMENT_TYPES.find(t => t.value === req.type)?.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({VERIFICATION_TYPES.find(t => t.value === req.verificationType)?.label})
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{req.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-3 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Campaign Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={formData.campaignSettings.autoApprove}
                  onChange={(e) => handleInputChange('campaignSettings', {
                    ...formData.campaignSettings,
                    autoApprove: e.target.checked,
                    requiresManualReview: !e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoApprove" className="ml-2 block text-sm text-gray-900">
                  Auto-approve submissions (faster processing, less control)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="manualReview"
                  checked={formData.campaignSettings.requiresManualReview}
                  onChange={(e) => handleInputChange('campaignSettings', {
                    ...formData.campaignSettings,
                    requiresManualReview: e.target.checked,
                    autoApprove: !e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="manualReview" className="ml-2 block text-sm text-gray-900">
                  Require manual review (more control, slower processing)
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={() => setStep('review')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Review & Continue
            </button>
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Campaign Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <p className="text-gray-600">{formData.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Category</h3>
                  <p className="text-gray-600">
                    {CATEGORIES.find(c => c.value === formData.category)?.label}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Description</h3>
                <p className="text-gray-600">{formData.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Difficulty</h3>
                  <p className="text-gray-600">{formData.difficulty}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Reward</h3>
                  <p className="text-gray-600">{formData.reward} KRIS</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Participants</h3>
                  <p className="text-gray-600">
                    {formData.participantLimit === 'unlimited' ? 'Unlimited' : formData.participantLimit}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Requirements ({formData.requirements.length})</h3>
                <div className="mt-2 space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-blue-600">
                        {REQUIREMENT_TYPES.find(t => t.value === req.type)?.label}:
                      </span>
                      <span className="text-sm text-gray-700 ml-2">{req.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fee Calculation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Fee Calculation</h2>
            
            {isCalculating ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Calculating fees...</p>
              </div>
            ) : feeError ? (
              <div className="text-red-600 p-4 bg-red-50 rounded-md">
                Error calculating fees: {feeError.message}
              </div>
            ) : feeData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quest Reward:</span>
                  <span className="font-medium">{feeData.breakdown.questReward} KRIS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee ({feeData.platformFee.percentage}%):</span>
                  <span className="font-medium">{feeData.breakdown.platformFee} KRIS</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost:</span>
                    <span>{feeData.breakdown.total} KRIS</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Fee calculation will appear here...</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Edit
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating || !feeData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Step */}
      {step === 'payment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Required</h2>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Campaign Created Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your campaign has been created but requires payment to become active.
                Please complete the payment to publish your campaign.
              </p>
              
              {feeData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-left space-y-2">
                    <div className="flex justify-between">
                      <span>Total Amount Due:</span>
                      <span className="font-semibold">{feeData.breakdown.total} KRIS</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Quest Reward:</span>
                        <span>{feeData.breakdown.questReward} KRIS</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>{feeData.breakdown.platformFee} KRIS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please send the exact amount to complete your campaign setup.
                  Once payment is confirmed, your campaign will be published and visible to participants.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      // This would typically open a wallet transaction
                      // For now, we'll simulate with a mock transaction hash
                      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
                      handlePayment(mockTxHash);
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Payment...' : 'Pay with Wallet'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Back to Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Campaign Published Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your campaign "{formData.title}" is now live and visible to participants.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Campaign ID</h3>
                  <p className="text-sm text-gray-600 font-mono">{campaignId}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => router.push(`/campaigns/${campaignId}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View Campaign
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push('/campaigns?tab=my-campaigns')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View My Campaigns
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(createError || paymentError) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">
                {createError?.message || paymentError?.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}