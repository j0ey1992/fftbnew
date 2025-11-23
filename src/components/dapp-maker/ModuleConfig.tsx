'use client';

import { DAppModule } from '@/types/dapp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { useState, useEffect } from 'react';

interface ModuleConfigProps {
  module: DAppModule;
  onUpdate: (updates: Partial<DAppModule>) => void;
}

export default function ModuleConfig({ module, onUpdate }: ModuleConfigProps) {
  const [stakingContracts, setStakingContracts] = useState<any[]>([]);
  const [vaultContracts, setVaultContracts] = useState<any[]>([]);
  const [nftContracts, setNftContracts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available contracts for selection
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      // Fetch staking contracts
      const stakingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staking/contracts`);
      if (stakingRes.ok) {
        const data = await stakingRes.json();
        setStakingContracts(data);
      }

      // Fetch vault contracts
      const vaultRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vault-contracts`);
      if (vaultRes.ok) {
        const data = await vaultRes.json();
        setVaultContracts(data);
      }

      // Fetch NFT contracts
      const nftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nft-staking`);
      if (nftRes.ok) {
        const data = await nftRes.json();
        setNftContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const updateConfig = (key: string, value: any) => {
    onUpdate({
      config: {
        ...module.config,
        [key]: value
      }
    });
  };

  const updateCustomStyle = (key: string, value: any) => {
    onUpdate({
      customStyles: {
        ...module.customStyles,
        [key]: value
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Common Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Module Title
        </label>
        <Input
          value={module.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter module title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <Input
          value={module.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Brief description (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Layout
        </label>
        <select
          value={module.layout || 'container'}
          onChange={(e) => onUpdate({ layout: e.target.value as any })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="full">Full Width</option>
          <option value="container">Container</option>
          <option value="wide">Wide Container</option>
        </select>
      </div>

      {/* Module-specific configuration */}
      {module.type === 'hero-banner' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Headline
            </label>
            <Input
              value={module.config.headline || ''}
              onChange={(e) => updateConfig('headline', e.target.value)}
              placeholder="Welcome to Our DeFi Platform"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subheadline
            </label>
            <Input
              value={module.config.subheadline || ''}
              onChange={(e) => updateConfig('subheadline', e.target.value)}
              placeholder="The future of decentralized finance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CTA Button Text
            </label>
            <Input
              value={module.config.ctaText || ''}
              onChange={(e) => updateConfig('ctaText', e.target.value)}
              placeholder="Get Started"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CTA Button Link
            </label>
            <Input
              value={module.config.ctaLink || ''}
              onChange={(e) => updateConfig('ctaLink', e.target.value)}
              placeholder="#quests"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner Height
            </label>
            <Input
              value={module.config.height || '500px'}
              onChange={(e) => updateConfig('height', e.target.value)}
              placeholder="500px"
            />
          </div>
        </>
      )}

      {module.type === 'quests' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project ID (optional)
            </label>
            <Input
              value={module.config.projectId || ''}
              onChange={(e) => updateConfig('projectId', e.target.value)}
              placeholder="Leave empty for all quests"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFeatured"
              checked={module.config.showFeatured || false}
              onChange={(e) => updateConfig('showFeatured', e.target.checked)}
              className="rounded text-purple-600"
            />
            <label htmlFor="showFeatured" className="text-sm text-gray-300">
              Show Featured Quests
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Quests to Display
            </label>
            <Input
              type="number"
              value={module.config.maxQuests || ''}
              onChange={(e) => updateConfig('maxQuests', parseInt(e.target.value) || undefined)}
              placeholder="12"
            />
          </div>
        </>
      )}

      {module.type === 'nft-staking' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            NFT Staking Contract
          </label>
          <select
            value={module.config.nftStakingContractId || ''}
            onChange={(e) => updateConfig('nftStakingContractId', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="">Select a contract</option>
            {nftContracts.map(contract => (
              <option key={contract.id} value={contract.id}>
                {contract.name} - {contract.contractAddress}
              </option>
            ))}
          </select>
        </div>
      )}

      {(module.type === 'token-staking' || module.type === 'coin-staking') && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Staking Contract
          </label>
          <select
            value={module.config.stakingContractId || ''}
            onChange={(e) => updateConfig('stakingContractId', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="">Select a contract</option>
            {stakingContracts.map(contract => (
              <option key={contract.id} value={contract.id}>
                {contract.name} - {contract.tokenSymbol}
              </option>
            ))}
          </select>
        </div>
      )}

      {module.type === 'vaults' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vault Contract
          </label>
          <select
            value={module.config.vaultContractId || ''}
            onChange={(e) => updateConfig('vaultContractId', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="">Select a vault</option>
            {vaultContracts.map(contract => (
              <option key={contract.id} value={contract.id}>
                {contract.name} - {contract.vaultAddress}
              </option>
            ))}
          </select>
        </div>
      )}

      {module.type === 'leaderboard' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Leaderboard Type
            </label>
            <select
              value={module.config.leaderboardType || 'xp'}
              onChange={(e) => updateConfig('leaderboardType', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="xp">XP Leaderboard</option>
              <option value="referrals">Referral Leaderboard</option>
              <option value="volume">Trading Volume</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timeframe
            </label>
            <select
              value={module.config.timeframe || 'all'}
              onChange={(e) => updateConfig('timeframe', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Time</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </>
      )}

      {module.type === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Custom Content (HTML)
          </label>
          <Textarea
            value={module.config.content || ''}
            onChange={(e) => updateConfig('content', e.target.value)}
            placeholder="Enter custom HTML content"
            rows={6}
          />
        </div>
      )}

      {/* Custom Styles */}
      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Custom Styles</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Background Color
            </label>
            <Input
              type="color"
              value={module.customStyles?.backgroundColor || '#000000'}
              onChange={(e) => updateCustomStyle('backgroundColor', e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Text Color
            </label>
            <Input
              type="color"
              value={module.customStyles?.textColor || '#FFFFFF'}
              onChange={(e) => updateCustomStyle('textColor', e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Padding
            </label>
            <Input
              value={module.customStyles?.padding || ''}
              onChange={(e) => updateCustomStyle('padding', e.target.value)}
              placeholder="e.g., 20px"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Border Radius
            </label>
            <Input
              value={module.customStyles?.borderRadius || ''}
              onChange={(e) => updateCustomStyle('borderRadius', e.target.value)}
              placeholder="e.g., 8px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}