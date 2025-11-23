'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import {
  UserCampaign,
  CreateCampaignData,
  FeeCalculationRequest
} from '@/types/campaign';
import { QuestCategory, QuestDifficulty, Requirement, RequirementType, VerificationType } from '@/types/quest';
import { useCampaignManagement } from '@/hooks/useCampaigns';
import { useAppKitAccount } from '@reown/appkit/react';

interface CampaignEditFormProps {
  campaign: UserCampaign;
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

export default function CampaignEditForm({ campaign, onSuccess, onCancel }: CampaignEditFormProps) {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const {
    updateCampaignAsync,
    isUpdating,
    updateError,
    calculateFee,
    feeData,
    isCalculating,
    feeError
  } = useCampaignManagement();

  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignData>({
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
    difficulty: campaign.difficulty,
    reward: campaign.reward,
    xpReward: campaign.xpReward || 0,
    tokenAddress: campaign.tokenAddress,
    tokenSymbol: campaign.tokenSymbol,
    tokenDecimals: campaign.tokenDecimals,
    participantLimit: campaign.participantLimit,
    requirements: [...campaign.requirements],
    verificationInstructions: campaign.verificationInstructions || '',
    campaignSettings: {
      autoApprove: campaign.campaignSettings.autoApprove,
      requiresManualReview: campaign.campaignSettings.requiresManualReview,
      maxSubmissions: campaign.campaignSettings.maxSubmissions,
      submissionDeadline: campaign.campaignSettings.submissionDeadline
    }
  });

  const [newRequirement, setNewRequirement] = useState<Requirement>({
    type: 'custom',
    description: '',
    verificationType: 'standard'
  });

  // Check if user is authorized to edit
  const isAuthorized = address?.toLowerCase() === campaign.createdBy.toLowerCase();

  // Track changes
  useEffect(() => {
    const hasFormChanges = 
      formData.title !== campaign.title ||
      formData.description !== campaign.description ||
      formData.category !== campaign.category ||
      formData.difficulty !== campaign.difficulty ||
      formData.reward !== campaign.reward ||
      formData.xpReward !== (campaign.xpReward || 0) ||
      formData.participantLimit !== campaign.participantLimit ||
      JSON.stringify(formData.requirements) !== JSON.stringify(campaign.requirements) ||
      formData.verificationInstructions !== (campaign.verificationInstructions || '') ||
      formData.campaignSettings.autoApprove !== campaign.campaignSettings.autoApprove ||
      formData.campaignSettings.requiresManualReview !== campaign.campaignSettings.requiresManualReview;
    
    setHasChanges(hasFormChanges);
  }, [formData, campaign]);

  // Calculate fee when reward changes
  useEffect(() => {
    if (formData.reward !== campaign.reward && formData.reward > 0) {
      const feeRequest: FeeCalculationRequest = {
        rewardAmount: formData.reward,
        tokenSymbol: formData.tokenSymbol,
        tokenAddress: formData.tokenAddress
      };
      calculateFee(feeRequest);
    }
  }, [formData.reward, formData.tokenSymbol, formData.tokenAddress, campaign.reward, calculateFee]);

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
    if (!isAuthorized) return 'You are not authorized to edit this campaign';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!hasChanges) {
      alert('No changes detected');
      return;
    }

    try {
      await updateCampaignAsync({
        campaignId: campaign.id,
        updateData: {
          ...campaign,
          ...formData,
          updatedAt: Timestamp.now()
        }
      });
      
      if (onSuccess) {
        onSuccess(campaign.id);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">
            You are not authorized to edit this campaign. Only the campaign creator can make changes.
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
        <p className="text-gray-600 mt-2">
          Make changes to your campaign. Note: Some changes may require additional fees.
        </p>
      </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Instructions (Optional)
              </label>
              <textarea
                value={formData.verificationInstructions || ''}
                onChange={(e) => handleInputChange('verificationInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional instructions for participants on how to complete and verify their submissions"
              />
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
                {formData.reward !== campaign.reward && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Changing the reward amount may require additional payment
                  </p>
                )}
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
          
          {/* Current Requirements */}
          {formData.requirements.length > 0 && (
            <div className="mb-6">
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
          
          {/* Add New Requirement */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Requirement</h3>
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

        {/* Fee Information */}
        {formData.reward !== campaign.reward && feeData && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Additional Fee Required</h2>
            <p className="text-amber-700 mb-4">
              Since you've changed the reward amount, additional platform fees may apply.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>New Total Cost:</span>
                <span className="font-medium">{feeData.breakdown.total} KRIS</span>
              </div>
              <div className="flex justify-between">
                <span>Original Cost:</span>
                <span className="font-medium">{campaign.reward + parseFloat(campaign.platformFee.amount)} KRIS</span>
              </div>
            </div>
          </div>
        )}

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
            onClick={handleSubmit}
            disabled={isUpdating || !hasChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Saving Changes...' : hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
        </div>

        {/* Error Display */}
        {updateError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{updateError.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}