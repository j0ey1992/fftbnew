'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/SafeImage';
import { FarmInfo, KRIS_TOKEN, WCRO_TOKEN, KRIS_V3_VAULT_ADDRESS } from '@/lib/contracts/kris-v3-vault';
import { useAuth } from '@/hooks/useAuth';
import { useKrisV3Vault } from '@/hooks/useKrisV3Vault';
import { useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { formatNumber } from '@/lib/utils';
import { getV3Farms, createV3Farm, updateV3Farm, deleteV3Farm, V3Farm, uploadV3FarmLogo, uploadV3FarmBanner } from '@/lib/firebase/v3-farms';
import { toast } from '@/components/ui/Toast';

export function V3FarmManagement() {
  const { user } = useAuth();
  const { address: walletAddress, isConnected } = useAppKitAccount();
  const { service, createFarm } = useKrisV3Vault();
  const [farms, setFarms] = useState<V3Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [vaultOwner, setVaultOwner] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<V3Farm | null>(null);
  const [uploadingImage, setUploadingImage] = useState<'logo' | 'banner' | null>(null);
  
  // File input refs
  const createLogoInputRef = useRef<HTMLInputElement>(null);
  const createBannerInputRef = useRef<HTMLInputElement>(null);

  // Form states for creating new farm
  const [formData, setFormData] = useState({
    token0: KRIS_TOKEN,
    token1: WCRO_TOKEN,
    fee: '10000', // 1%
    rewardToken: KRIS_TOKEN,
    rewardAmount: '',
    duration: '30', // days
    name: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    apr: '0%',
    tvl: '$0',
    featured: false,
    order: 0,
    socialLinks: {
      website: '',
      twitter: '',
      telegram: ''
    }
  });

  useEffect(() => {
    loadFarms();
    loadVaultOwner();
    if (walletAddress) {
      checkOwnership();
    }
  }, [walletAddress]);

  const loadFarms = async () => {
    setLoading(true);
    try {
      // Load from Firebase
      const firebaseFarms = await getV3Farms();
      setFarms(firebaseFarms);
    } catch (error) {
      console.error('Error loading farms:', error);
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const loadVaultOwner = async () => {
    try {
      const owner = await service.getOwner();
      setVaultOwner(owner);
    } catch (error) {
      console.error('Error loading vault owner:', error);
    }
  };

  const checkOwnership = async () => {
    if (!walletAddress) return;
    
    try {
      console.log('Checking ownership for address:', walletAddress);
      const owner = await service.isOwner(walletAddress);
      console.log('Is owner:', owner);
      setIsOwner(owner);
    } catch (error) {
      console.error('Error checking ownership:', error);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    console.log('handleImageUpload called', { file, type });
    if (!file) {
      console.log('No file provided');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingImage(type);
    try {
      // Generate a temporary ID for new farms
      const farmId = editingFarm?.id || `temp-${Date.now()}`;
      console.log('Uploading with farmId:', farmId);
      
      // Use the backend upload functions to avoid CORS issues
      const url = type === 'logo' 
        ? await uploadV3FarmLogo(file, farmId)
        : await uploadV3FarmBanner(file, farmId);
      
      console.log('Upload successful, URL:', url);
      
      if (editingFarm) {
        const updates = { [type === 'logo' ? 'logoUrl' : 'bannerUrl']: url };
        setEditingFarm({ ...editingFarm, ...updates });
      } else {
        setFormData({ ...formData, [type === 'logo' ? 'logoUrl' : 'bannerUrl']: url });
      }
      
      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleCreateFarm = async () => {
    if (!formData.rewardAmount || parseFloat(formData.rewardAmount) <= 0) {
      toast.error('Please enter a valid reward amount');
      return;
    }

    if (!formData.name || !formData.description) {
      toast.error('Please enter farm name and description');
      return;
    }

    setLoading(true);
    try {
      // First create on-chain farm if owner
      if (isOwner) {
        const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60;
        
        await createFarm(
          formData.token0,
          formData.token1,
          parseInt(formData.fee),
          formData.rewardToken,
          formData.rewardAmount,
          durationInSeconds
        );
      }

      // Then create in Firebase
      // Generate poolId based on token addresses and fee
      const poolId = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint24'],
        [formData.token0, formData.token1, parseInt(formData.fee)]
      );
      
      const farmData: Omit<V3Farm, 'id' | 'createdAt' | 'updatedAt'> = {
        poolId,
        name: formData.name,
        description: formData.description,
        token0: formData.token0,
        token1: formData.token1,
        fee: parseInt(formData.fee),
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        apr: formData.apr,
        tvl: formData.tvl,
        dailyRewards: (parseFloat(formData.rewardAmount) / parseInt(formData.duration)).toString(),
        rewardToken: formData.rewardToken,
        vaultAddress: KRIS_V3_VAULT_ADDRESS,
        isActive: true,
        featured: formData.featured,
        order: formData.order,
        socialLinks: formData.socialLinks
      };

      await createV3Farm(farmData);
      
      toast.success('Farm created successfully!');
      setShowCreateModal(false);
      resetForm();
      await loadFarms();
    } catch (error) {
      console.error('Error creating farm:', error);
      toast.error('Failed to create farm. Make sure you have approved the reward tokens.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFarm = async (farm: V3Farm) => {
    if (!editingFarm) return;

    setLoading(true);
    try {
      const updates: Partial<V3Farm> = {
        name: editingFarm.name,
        description: editingFarm.description,
        logoUrl: editingFarm.logoUrl,
        bannerUrl: editingFarm.bannerUrl,
        apr: editingFarm.apr,
        tvl: editingFarm.tvl,
        featured: editingFarm.featured,
        order: editingFarm.order,
        socialLinks: editingFarm.socialLinks
      };

      await updateV3Farm(farm.id, updates);
      toast.success('Farm updated successfully');
      setEditingFarm(null);
      await loadFarms();
    } catch (error) {
      console.error('Error updating farm:', error);
      toast.error('Failed to update farm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm('Are you sure you want to delete this farm from the UI? (This will not affect the on-chain farm)')) {
      return;
    }

    setLoading(true);
    try {
      await deleteV3Farm(farmId);
      toast.success('Farm removed from UI');
      await loadFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast.error('Failed to delete farm');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      token0: KRIS_TOKEN,
      token1: WCRO_TOKEN,
      fee: '10000',
      rewardToken: KRIS_TOKEN,
      rewardAmount: '',
      duration: '30',
      name: '',
      description: '',
      logoUrl: '',
      bannerUrl: '',
      apr: '0%',
      tvl: '$0',
      featured: false,
      order: 0,
      socialLinks: {
        website: '',
        twitter: '',
        telegram: ''
      }
    });
  };

  const getTokenSymbol = (address: string) => {
    const tokenSymbols: { [key: string]: string } = {
      [KRIS_TOKEN]: 'KRIS',
      [WCRO_TOKEN]: 'WCRO',
    };
    return tokenSymbols[address] || 'Unknown';
  };

  // Auto-generate name and description when pool selection changes
  useEffect(() => {
    const token0Symbol = getTokenSymbol(formData.token0);
    const token1Symbol = getTokenSymbol(formData.token1);
    const feePercent = parseInt(formData.fee) / 10000;
    
    if (!formData.name || formData.name === '' || formData.name.includes('Farm')) {
      setFormData(prev => ({
        ...prev,
        name: `${token0Symbol}/${token1Symbol} ${feePercent}% V3 Farm`,
        description: `Earn ${getTokenSymbol(formData.rewardToken)} rewards by staking your ${token0Symbol}/${token1Symbol} V3 LP positions`
      }));
    }
  }, [formData.token0, formData.token1, formData.fee, formData.rewardToken]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">V3 Farm Management</h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create New Farm</span>
        </Button>
      </div>

      {!walletAddress && (
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            Please connect your wallet to view ownership status
          </p>
        </div>
      )}

      {walletAddress && !isOwner && (
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-2">UI Management Mode</p>
          <p className="text-gray-300 text-xs">
            You can manage farm UI elements (banners, logos, descriptions) but cannot create on-chain farms.
          </p>
          <div className="mt-3 space-y-1">
            <p className="text-gray-300 text-xs">
              Vault: {KRIS_V3_VAULT_ADDRESS.slice(0, 6)}...{KRIS_V3_VAULT_ADDRESS.slice(-4)}
            </p>
            {vaultOwner && (
              <p className="text-gray-300 text-xs">
                Owner: {vaultOwner.slice(0, 6)}...{vaultOwner.slice(-4)}
              </p>
            )}
            <p className="text-gray-300 text-xs">
              Your wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-[#0a1e3d] rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">No farms configured</p>
          <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
            Add First Farm
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {farms.map((farm) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a1e3d] rounded-lg p-6"
            >
              {editingFarm?.id === farm.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Farm Name</label>
                      <Input
                        value={editingFarm.name}
                        onChange={(e) => setEditingFarm({ ...editingFarm, name: e.target.value })}
                        placeholder="Farm name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">APR</label>
                      <Input
                        value={editingFarm.apr}
                        onChange={(e) => setEditingFarm({ ...editingFarm, apr: e.target.value })}
                        placeholder="e.g. 150%"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Description</label>
                    <textarea
                      value={editingFarm.description}
                      onChange={(e) => setEditingFarm({ ...editingFarm, description: e.target.value })}
                      placeholder="Farm description"
                      className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Logo Image</label>
                      <div className="flex items-center space-x-2">
                        {editingFarm.logoUrl && (
                          <SafeImage
                            src={editingFarm.logoUrl}
                            alt="Logo"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            console.log('File input changed', e.target.files);
                            e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo');
                          }}
                          className="hidden"
                          id={`logo-upload-${editingFarm.id}`}
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          disabled={uploadingImage === 'logo'}
                          onClick={() => {
                            console.log('Upload logo button clicked');
                            document.getElementById(`logo-upload-${editingFarm.id}`)?.click();
                          }}
                        >
                          {uploadingImage === 'logo' ? 'Uploading...' : 'Upload Logo'}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">TVL</label>
                      <Input
                        value={editingFarm.tvl || ''}
                        onChange={(e) => setEditingFarm({ ...editingFarm, tvl: e.target.value })}
                        placeholder="e.g. $1.5M"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Banner Image</label>
                    <div className="space-y-2">
                      {editingFarm.bannerUrl && (
                        <SafeImage
                          src={editingFarm.bannerUrl}
                          alt="Banner"
                          width={400}
                          height={100}
                          className="rounded-lg w-full h-24 object-cover"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          console.log('Banner file input changed', e.target.files);
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner');
                        }}
                        className="hidden"
                        id={`banner-upload-${editingFarm.id}`}
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        disabled={uploadingImage === 'banner'}
                        onClick={() => {
                          console.log('Upload banner button clicked');
                          document.getElementById(`banner-upload-${editingFarm.id}`)?.click();
                        }}
                      >
                        {uploadingImage === 'banner' ? 'Uploading...' : 'Upload Banner'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Display Order</label>
                      <Input
                        type="number"
                        value={editingFarm.order || 0}
                        onChange={(e) => setEditingFarm({ ...editingFarm, order: parseInt(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingFarm.featured || false}
                          onChange={(e) => setEditingFarm({ ...editingFarm, featured: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-white">Featured Farm</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-white font-medium mb-3">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Website</label>
                        <Input
                          value={editingFarm.socialLinks?.website || ''}
                          onChange={(e) => setEditingFarm({
                            ...editingFarm,
                            socialLinks: { 
                              website: e.target.value,
                              twitter: editingFarm.socialLinks?.twitter || '',
                              telegram: editingFarm.socialLinks?.telegram || ''
                            }
                          })}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Twitter</label>
                        <Input
                          value={editingFarm.socialLinks?.twitter || ''}
                          onChange={(e) => setEditingFarm({
                            ...editingFarm,
                            socialLinks: { 
                              website: editingFarm.socialLinks?.website || '',
                              twitter: e.target.value,
                              telegram: editingFarm.socialLinks?.telegram || ''
                            }
                          })}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Telegram</label>
                        <Input
                          value={editingFarm.socialLinks?.telegram || ''}
                          onChange={(e) => setEditingFarm({
                            ...editingFarm,
                            socialLinks: { 
                              website: editingFarm.socialLinks?.website || '',
                              twitter: editingFarm.socialLinks?.twitter || '',
                              telegram: e.target.value
                            }
                          })}
                          placeholder="https://t.me/..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingFarm(null)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateFarm(farm)}
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {farm.logoUrl && (
                      <SafeImage
                        src={farm.logoUrl}
                        alt={farm.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {farm.name}
                        {farm.featured && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">
                            Featured
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{farm.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                          {getTokenSymbol(farm.token0)}/{getTokenSymbol(farm.token1)} {farm.fee / 10000}%
                        </span>
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                          APR: {farm.apr}
                        </span>
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                          TVL: {farm.tvl}
                        </span>
                        {farm.dailyRewards && (
                          <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                            Daily: {formatNumber(farm.dailyRewards)} {getTokenSymbol(farm.rewardToken)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {farm.isActive ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                        Ended
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingFarm({
                        ...farm,
                        socialLinks: farm.socialLinks || {
                          website: '',
                          twitter: '',
                          telegram: ''
                        }
                      })}
                      className="flex items-center space-x-1"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFarm(farm.id)}
                      className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Farm Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0a1e3d] rounded-xl p-6 max-w-2xl w-full my-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Create New V3 Farm</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Pool Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Pool</label>
                    <select
                      value={`${formData.token0}-${formData.token1}-${formData.fee}`}
                      onChange={(e) => {
                        const [token0, token1, fee] = e.target.value.split('-');
                        setFormData({ ...formData, token0, token1, fee });
                      }}
                      className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={`${KRIS_TOKEN}-${WCRO_TOKEN}-10000`}>KRIS/WCRO 1%</option>
                      <option value={`${KRIS_TOKEN}-${WCRO_TOKEN}-3000`}>KRIS/WCRO 0.3%</option>
                      <option value={`${KRIS_TOKEN}-${WCRO_TOKEN}-500`}>KRIS/WCRO 0.05%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Reward Token</label>
                    <select
                      value={formData.rewardToken}
                      onChange={(e) => setFormData({ ...formData, rewardToken: e.target.value })}
                      className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={KRIS_TOKEN}>KRIS</option>
                      <option value={WCRO_TOKEN}>WCRO</option>
                    </select>
                  </div>
                </div>

                {/* Rewards Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Total Reward Amount {isOwner && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="number"
                      value={formData.rewardAmount}
                      onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                      placeholder={isOwner ? "e.g. 10000" : "0 (display only)"}
                      className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                      disabled={!isOwner}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Duration (days) {isOwner && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder={isOwner ? "e.g. 30" : "30 (display only)"}
                      className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                      disabled={!isOwner}
                    />
                  </div>
                </div>

                {!isOwner && (
                  <div className="bg-yellow-500/10 rounded-lg p-3">
                    <p className="text-yellow-400 text-xs">
                      Note: Only the vault owner can create on-chain farms. You're creating a UI-only configuration.
                    </p>
                  </div>
                )}

                {/* UI Configuration */}
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-white font-medium mb-3">Farm Display Configuration</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Farm Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. KRIS/WCRO 1% V3 Farm"
                        className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Farm description..."
                        className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">APR Display</label>
                        <input
                          type="text"
                          value={formData.apr}
                          onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                          placeholder="e.g. 150%"
                          className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">TVL Display</label>
                        <input
                          type="text"
                          value={formData.tvl}
                          onChange={(e) => setFormData({ ...formData, tvl: e.target.value })}
                          placeholder="e.g. $1.5M"
                          className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Logo Image</label>
                        <div className="flex items-center space-x-2">
                          {formData.logoUrl && (
                            <SafeImage
                              src={formData.logoUrl}
                              alt="Logo"
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}
                          <input
                            ref={createLogoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              console.log('Create modal logo file input changed', e.target.files);
                              e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo');
                            }}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            disabled={uploadingImage === 'logo'}
                            onClick={() => {
                              console.log('Create modal upload logo button clicked');
                              createLogoInputRef.current?.click();
                            }}
                          >
                            {uploadingImage === 'logo' ? 'Uploading...' : 'Upload Logo'}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Display Order</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                          placeholder="0"
                          className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Banner Image</label>
                      <div className="space-y-2">
                        {formData.bannerUrl && (
                          <SafeImage
                            src={formData.bannerUrl}
                            alt="Banner"
                            width={400}
                            height={100}
                            className="rounded-lg w-full h-24 object-cover"
                          />
                        )}
                        <input
                          ref={createBannerInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            console.log('Create modal banner file input changed', e.target.files);
                            e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner');
                          }}
                          className="hidden"
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          disabled={uploadingImage === 'banner'}
                          onClick={() => {
                            console.log('Create modal upload banner button clicked');
                            createBannerInputRef.current?.click();
                          }}
                        >
                          {uploadingImage === 'banner' ? 'Uploading...' : 'Upload Banner'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="featured" className="text-white cursor-pointer">
                        Mark as Featured Farm
                      </label>
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-gray-700 pt-4">
                      <h5 className="text-white font-medium mb-3">Social Links (Optional)</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Website</label>
                          <input
                            type="url"
                            value={formData.socialLinks.website}
                            onChange={(e) => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, website: e.target.value }
                            })}
                            placeholder="https://..."
                            className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Twitter</label>
                          <input
                            type="url"
                            value={formData.socialLinks.twitter}
                            onChange={(e) => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                            })}
                            placeholder="https://twitter.com/..."
                            className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Telegram</label>
                          <input
                            type="url"
                            value={formData.socialLinks.telegram}
                            onChange={(e) => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, telegram: e.target.value }
                            })}
                            placeholder="https://t.me/..."
                            className="w-full bg-[#051627] border border-gray-700 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.rewardAmount && formData.duration && (
                  <div className="bg-blue-500/10 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      Daily Rewards: {formatNumber(
                        (parseFloat(formData.rewardAmount) / parseInt(formData.duration)).toString()
                      )} {getTokenSymbol(formData.rewardToken)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateFarm}
                  disabled={loading || (!isOwner && (!formData.name || !formData.description))}
                >
                  {loading ? 'Creating...' : isOwner ? 'Create Farm' : 'Save Configuration'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}