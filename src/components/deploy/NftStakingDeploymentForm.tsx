'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  NewNftStakingContract,
  NftCollection,
  uploadNftStakingContractLogo,
  uploadNftCollectionLogo,
} from '@/lib/firebase/nft-staking-contracts';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import Image from 'next/image';
import { addUserDeployedNftStakingContract } from '@/lib/firebase/nft-staking-contracts';

interface NftStakingDeploymentFormProps {
  contractAddress: string;
  chainId: number;
  onComplete?: () => void;
}

/**
 * Form component for configuring a newly deployed NFT staking contract
 */
export default function NftStakingDeploymentForm({
  contractAddress,
  chainId,
  onComplete,
}: NftStakingDeploymentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<NewNftStakingContract>>({
    name: '',
    description: '',
    contractAddress: contractAddress,
    rewardTokenAddress: '',
    enabled: false, // Disabled by default, requires admin approval
    chainId: chainId,
    collections: [],
    abi: [],
    logoUrl: '',
    bannerUrl: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      website: '',
      whereToBuy: '',
      discord: '',
      telegram: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [abiError, setAbiError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [newCollection, setNewCollection] = useState<Partial<NftCollection>>({
    id: '',
    name: '',
    address: '',
    ratio: 1,
    description: '',
    image: '',
    totalStaked: 0,
  });
  const [editingCollectionIndex, setEditingCollectionIndex] = useState<number | null>(null);
  const [collectionLogoPreview, setCollectionLogoPreview] = useState<string | null>(null);
  const collectionFileInputRef = useRef<HTMLInputElement>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  // Load NFT Staking ABI from the contracts folder
  const loadNftStakingAbi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the ABI from the contracts folder
      const response = await fetch('/contracts/staking/Nftstakingv1.json');
      if (!response.ok) {
        throw new Error(`Failed to load ABI: ${response.statusText}`);
      }
      
      const abiData = await response.json();
      
      // Update form data with the loaded ABI
      setFormData(prev => ({
        ...prev,
        abi: abiData
      }));
      
      setAbiError(null);
    } catch (err: any) {
      console.error('Error loading NFT staking ABI:', err);
      setError(`Failed to load ABI: ${err.message}`);
      setAbiError('Could not load ABI. Please try again or paste it manually.');
    } finally {
      setLoading(false);
    }
  };

  // Load ABI on component mount
  useEffect(() => {
    loadNftStakingAbi();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if ((e.target as HTMLInputElement).type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'chainId') {
      setFormData(prev => ({
        ...prev,
        chainId: isNaN(parseInt(value, 10)) ? chainId : parseInt(value, 10),
      }));
    } else if (name === 'abi') {
      try {
        const abi = JSON.parse(value);
        setFormData(prev => ({
          ...prev,
          abi,
        }));
        setAbiError(null);
      } catch {
        setAbiError('Invalid JSON format for ABI');
      }
    } else if (name.startsWith('social.')) {
      const socialType = name.split('.')[1] as keyof typeof formData.socialLinks;
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialType]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === 'contractAddress' || name === 'rewardTokenAddress') {
      setAddressError(null);
    }
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
    reader.onload = ev => {
      if (ev.target?.result) {
        setLogoPreview(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // We'll upload the logo after the contract is created
  };

  // Handle banner file change
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Banner must be an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Banner file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setBannerPreview(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // We'll upload the banner after the contract is created
  };

  // Handle collection logo change
  const handleCollectionLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onload = ev => {
      if (ev.target?.result) {
        setCollectionLogoPreview(ev.target.result as string);
        setNewCollection(prev => ({
          ...prev,
          image: ev.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle collection input changes
  const handleCollectionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'ratio') {
      const ratio = parseFloat(value);
      setNewCollection(prev => ({
        ...prev,
        ratio: isNaN(ratio) ? 1 : ratio,
      }));
    } else {
      setNewCollection(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Add or update collection
  const handleAddCollection = () => {
    if (!newCollection.name || !newCollection.address) {
      setError('Collection name and address are required');
      return;
    }

    if (!newCollection.id) {
      newCollection.id = `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    if (editingCollectionIndex !== null) {
      const updated = [...collections];
      updated[editingCollectionIndex] = newCollection as NftCollection;
      setCollections(updated);
      setFormData(prev => ({
        ...prev,
        collections: updated,
      }));
    } else {
      const updated = [...collections, newCollection as NftCollection];
      setCollections(updated);
      setFormData(prev => ({
        ...prev,
        collections: updated,
      }));
    }

    setNewCollection({
      id: '',
      name: '',
      address: '',
      ratio: 1,
      description: '',
      image: '',
      totalStaked: 0,
    });
    setEditingCollectionIndex(null);
    setCollectionLogoPreview(null);
  };

  const handleEditCollection = (idx: number) => {
    setNewCollection(collections[idx]);
    setEditingCollectionIndex(idx);
    setCollectionLogoPreview(collections[idx].image);
  };

  const handleRemoveCollection = (idx: number) => {
    const updated = collections.filter((_, i) => i !== idx);
    setCollections(updated);
    setFormData(prev => ({ ...prev, collections: updated }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const required = ['name', 'description', 'contractAddress', 'rewardTokenAddress'];

    const missing = required.filter((field: any) => !formData[field as keyof NewNftStakingContract]);
    if (missing.length) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(formData.contractAddress || '')) {
      setAddressError('Invalid contract address format');
      return false;
    }
    if (!addressRegex.test(formData.rewardTokenAddress || '')) {
      setAddressError('Invalid reward token address format');
      return false;
    }

    if (!formData.abi || !Array.isArray(formData.abi) || formData.abi.length === 0) {
      setAbiError('ABI is required and must be a valid JSON array');
      return false;
    }

    if (!formData.collections || formData.collections.length === 0) {
      setError('At least one collection is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAddressError(null);
    setAbiError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Add the contract to the NFT staking contracts collection
      const contractId = await addUserDeployedNftStakingContract(formData as NewNftStakingContract);
      setContractId(contractId);
      
      // Upload logo if provided
      const logoFile = fileInputRef.current?.files?.[0];
      const bannerFile = bannerFileInputRef.current?.files?.[0];
      
      if ((logoFile || bannerFile) && contractId) {
        try {
          setUploadingLogo(true);
          
          // Prepare form data for image upload
          const uploadFormData = new FormData();
          uploadFormData.append('contractAddress', formData.contractAddress as string);
          
          if (logoFile) {
            uploadFormData.append('logo', logoFile);
          }
          
          if (bannerFile) {
            uploadFormData.append('banner', bannerFile);
          }
          
          // Upload images using the unified endpoint
          await fetch('/api/contracts/upload-images', {
            method: 'POST',
            body: uploadFormData
          });
        } catch (err) {
          console.error('Error uploading images:', err);
          // Continue with success even if image upload fails
        } finally {
          setUploadingLogo(false);
        }
      }
      
      // Upload collection logos if needed
      for (const collection of collections) {
        if (collection.image && collection.image.startsWith('data:image')) {
          // This is a new image that needs to be uploaded
          // We'd need to convert the data URL to a file and upload it
          // This is a simplified version - in a real app, you'd need to handle this properly
          console.log(`Would upload logo for collection ${collection.id}`);
        }
      }
      
      setSuccess(true);
      
      // Redirect or call onComplete after a delay
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.push('/nft-staking');
        }
      }, 3000);
    } catch (err: any) {
      console.error('Error saving contract:', err);
      setError(err.message || 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard elevation="raised" className="mt-6">
      <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
        <h3 className="text-xl font-bold">Configure Your NFT Staking Contract</h3>
        <p className="text-sm text-gray-400 mt-1">
          Add details to make your contract visible on the platform
        </p>
      </div>
      
      <div className="p-6">
        {success ? (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-800 rounded-lg">
            <h4 className="text-lg font-semibold text-green-400 mb-2">
              🎉 Contract Configured Successfully!
            </h4>
            <p className="text-gray-300 mb-4">
              Your NFT staking contract has been submitted for approval. Once approved by an admin, it will be visible on the platform.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/nft-staking')}
            >
              Go to NFT Staking
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* MAIN FIELDS */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Roo NFT Staking"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Stake your Roo NFTs and earn rewards"
                    rows={3}
                    required
                  />
                </div>

                {/* Contract Address - Read-only since it's provided */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Contract Address *</label>
                  <input
                    type="text"
                    name="contractAddress"
                    value={formData.contractAddress || ''}
                    readOnly
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent opacity-70"
                  />
                  <p className="mt-1 text-xs text-gray-400">This is the address of your deployed contract</p>
                </div>

                {/* Reward Token Address */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Reward Token Address *</label>
                  <input
                    type="text"
                    name="rewardTokenAddress"
                    value={formData.rewardTokenAddress || ''}
                    onChange={handleChange}
                    className={`w-full bg-gray-800/50 border ${addressError ? 'border-red-700' : 'border-gray-700'} rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0x..."
                    required
                  />
                  {addressError && <p className="mt-1 text-red-400 text-xs">{addressError}</p>}
                </div>

                {/* Info about reward configuration */}
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 space-y-2">
                  <p className="text-blue-300 text-sm flex items-start">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Important:</strong> After deployment, you'll need to configure the staking rewards through the admin panel:
                      <br />• Set the staking duration (e.g., 7 days, 30 days)
                      <br />• Deposit reward tokens to be distributed
                      <br />• The reward rate will be calculated automatically
                    </span>
                  </p>
                </div>

                {/* Chain ID - Read-only since it's provided */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Chain ID *</label>
                  <input
                    type="number"
                    name="chainId"
                    value={formData.chainId || chainId}
                    readOnly
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent opacity-70"
                  />
                  <p className="mt-1 text-gray-400 text-xs">25 for Cronos Mainnet</p>
                </div>

                {/* Collections Section */}
                <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium">NFT Collections *</label>
                      <p className="text-gray-400 text-xs mt-1">Add NFT collections that can be staked in this contract</p>
                    </div>
                  </div>

                  {/* Existing Collections List */}
                  {collections.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-2">Added Collections</h4>
                      <div className="space-y-2">
                        {collections.map((c, i) => (
                          <div key={c.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <div className="flex items-center">
                              {c.image && (
                                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
                                  <Image src={c.image} alt={c.name} fill style={{ objectFit: 'cover' }} />
                                </div>
                              )}
                              <div>
                                <div className="text-white font-medium">{c.name}</div>
                                <div className="text-gray-400 text-xs">
                                  {c.address.substring(0, 6)}...{c.address.substring(c.address.length - 4)}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditCollection(i)}
                                className="text-blue-400 hover:text-blue-300 p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCollection(i)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add / Edit Collection Form */}
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700 mt-4">
                    <h4 className="text-gray-300 text-sm font-medium mb-3">
                      {editingCollectionIndex !== null ? 'Edit Collection' : 'Add New Collection'}
                    </h4>

                    <div className="space-y-3">
                      {/* Collection Name */}
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">Collection Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={newCollection.name || ''}
                          onChange={handleCollectionChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="e.g., Roo Monkeys"
                        />
                      </div>

                      {/* Collection Address */}
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">Collection Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={newCollection.address || ''}
                          onChange={handleCollectionChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="0x..."
                        />
                      </div>

                      {/* Reward Ratio */}
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">Reward Ratio</label>
                        <input
                          type="number"
                          name="ratio"
                          value={newCollection.ratio || 1}
                          onChange={handleCollectionChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="1"
                          step="0.1"
                          min="0"
                        />
                      </div>

                      {/* Collection Description */}
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">Description</label>
                        <input
                          type="text"
                          name="description"
                          value={newCollection.description || ''}
                          onChange={handleCollectionChange}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="A collection of monkey-themed NFTs"
                        />
                      </div>

                      {/* Collection Logo */}
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">Collection Logo</label>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 relative w-12 h-12 bg-gray-800 rounded-full overflow-hidden border border-gray-700 flex items-center justify-center">
                            {collectionLogoPreview ? (
                              <Image src={collectionLogoPreview} alt="Collection logo preview" fill style={{ objectFit: 'cover' }} className="rounded-full" />
                            ) : (
                              <span className="text-gray-500 text-xs">No logo</span>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              ref={collectionFileInputRef}
                              onChange={handleCollectionLogoChange}
                              accept="image/*"
                              className="hidden"
                              id="collection-logo-upload"
                            />
                            <label htmlFor="collection-logo-upload" className="inline-block px-3 py-1 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-md cursor-pointer transition-colors text-xs">
                              {collectionLogoPreview ? 'Change Logo' : 'Upload Logo'}
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={handleAddCollection}
                          className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-md text-sm"
                        >
                          {editingCollectionIndex !== null ? 'Update Collection' : 'Add Collection'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ABI - Hidden since it's loaded automatically */}
                <div className="hidden">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-300 text-sm font-medium">Contract ABI *</label>
                  </div>
                  <textarea
                    name="abi"
                    value={JSON.stringify(formData.abi, null, 2) || ''}
                    onChange={handleChange}
                    className={`w-full bg-gray-800/50 border ${abiError ? 'border-red-700' : 'border-gray-700'} rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap`}
                    rows={6}
                    placeholder="Paste the contract ABI JSON here"
                  />
                  {abiError && <p className="mt-1 text-red-400 text-xs">{abiError}</p>}
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Project Logo</label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative w-16 h-16 bg-gray-800 rounded-full overflow-hidden border border-gray-700 flex items-center justify-center">
                      {logoPreview ? (
                        <Image src={logoPreview} alt="Logo preview" fill style={{ objectFit: 'cover' }} className="rounded-full" />
                      ) : (
                        <span className="text-gray-500 text-xs">No logo</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="inline-block px-3 py-1 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-md cursor-pointer transition-colors text-xs">
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Recommended: 512x512px PNG or JPG</p>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Project Banner</label>
                  <div className="space-y-3">
                    <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                      {bannerPreview ? (
                        <Image src={bannerPreview} alt="Banner preview" fill style={{ objectFit: 'cover' }} className="rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-500 text-xs">No banner</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={bannerFileInputRef}
                        onChange={handleBannerChange}
                        accept="image/*"
                        className="hidden"
                        id="banner-upload"
                      />
                      <label htmlFor="banner-upload" className="inline-block px-3 py-1 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-md cursor-pointer transition-colors text-xs">
                        {bannerPreview ? 'Change Banner' : 'Upload Banner'}
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Recommended: 1200x400px PNG or JPG (will be displayed on the NFT staking page)</p>
                </div>

                {/* Social Links */}
                <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-gray-300 text-sm font-medium mb-3">Social Links (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Website</label>
                      <input
                        type="text"
                        name="social.website"
                        value={formData.socialLinks?.website || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Twitter</label>
                      <input
                        type="text"
                        name="social.twitter"
                        value={formData.socialLinks?.twitter || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://twitter.com/example"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Discord</label>
                      <input
                        type="text"
                        name="social.discord"
                        value={formData.socialLinks?.discord || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://discord.gg/example"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Telegram</label>
                      <input
                        type="text"
                        name="social.telegram"
                        value={formData.socialLinks?.telegram || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://t.me/example"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1">Where to Buy</label>
                      <input
                        type="text"
                        name="social.whereToBuy"
                        value={formData.socialLinks?.whereToBuy || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://exchange.example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save and Submit for Approval'}
                  </Button>
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    Your contract will be reviewed by an admin before being made public
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </GlassCard>
  );
}
