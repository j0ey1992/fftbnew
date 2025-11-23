'use client';

import { DAppModule, DAppTheme } from '@/types/dapp';
import dynamic from 'next/dynamic';
import { GlassCard } from '@/components/ui/GlassCard';

// Dynamically import components to avoid SSR issues
const QuestDiscovery = dynamic(() => import('@/components/quests/QuestDiscovery'), { ssr: false });
const NftStakingPage = dynamic(() => import('@/components/nft-staking/NftStakingPage'), { ssr: false });
const StakingContractsList = dynamic(() => import('@/components/staking/StakingContractsList'), { ssr: false });
const LpStakingProductCard = dynamic(() => import('@/components/ui/LpStakingProductCard'), { ssr: false });

interface DAppModuleRendererProps {
  module: DAppModule;
  theme: DAppTheme;
  preview?: boolean;
}

export default function DAppModuleRenderer({ module, theme, preview = false }: DAppModuleRendererProps) {
  const renderModule = () => {
    switch (module.type) {
      case 'quests':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            {preview ? (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">Quest Discovery Module</p>
                <p className="text-sm text-gray-500">
                  {module.config.projectId && `Filtered by project: ${module.config.projectId}`}
                  {module.config.categories && ` | Categories: ${module.config.categories.join(', ')}`}
                </p>
              </div>
            ) : (
              <QuestDiscovery 
                projectId={module.config.projectId}
                categories={module.config.categories}
              />
            )}
          </div>
        );

      case 'nft-staking':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            {preview ? (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">NFT Staking Module</p>
                <p className="text-sm text-gray-500">
                  {module.config.contractAddress || module.config.stakingContractId || 'No contract configured'}
                </p>
              </div>
            ) : module.config.contractAddress || module.config.stakingContractId ? (
              <NftStakingPage contractId={module.config.stakingContractId || module.config.contractAddress} />
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                <p className="text-gray-400">NFT staking contract not configured</p>
              </div>
            )}
          </div>
        );

      case 'token-staking':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            {preview ? (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">Token Staking Module</p>
                <p className="text-sm text-gray-500">
                  {module.config.contractAddress || module.config.stakingContractId || 'No contract configured'}
                </p>
              </div>
            ) : module.config.contractAddress || module.config.stakingContractId ? (
              <StakingContractsList 
                contractId={module.config.stakingContractId || module.config.contractAddress}
              />
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                <p className="text-gray-400">Token staking contract not configured</p>
              </div>
            )}
          </div>
        );

      case 'lp-staking':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            {preview ? (
              <div className="bg-gray-800/50 rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">LP Staking Module</p>
                <p className="text-sm text-gray-500">
                  {module.config.contractAddress || module.config.stakingContractId || 'No contract configured'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LpStakingProductCard />
              </div>
            )}
          </div>
        );

      case 'nft-minting':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            <GlassCard className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">NFT Collection</h3>
                <p className="text-gray-400 mb-6">
                  {module.config.collectionAddress || 'Collection not configured'}
                </p>
                {module.config.mintPrice && (
                  <p className="text-lg mb-2">Price: {module.config.mintPrice} ETH</p>
                )}
                {module.config.maxSupply && (
                  <p className="text-lg mb-6">Max Supply: {module.config.maxSupply}</p>
                )}
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: theme.primaryColor,
                    color: theme.backgroundColor
                  }}
                  disabled={preview}
                >
                  {preview ? 'Mint (Preview)' : 'Mint NFT'}
                </button>
              </div>
            </GlassCard>
          </div>
        );

      case 'roadmap':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            <GlassCard className="p-8">
              {module.config.content ? (
                <div className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: module.config.content }}
                />
              ) : (
                <p className="text-gray-400 text-center">Roadmap content not configured</p>
              )}
            </GlassCard>
          </div>
        );

      case 'team':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            <GlassCard className="p-8">
              {module.config.content ? (
                <div className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: module.config.content }}
                />
              ) : (
                <p className="text-gray-400 text-center">Team information not configured</p>
              )}
            </GlassCard>
          </div>
        );

      case 'tokenomics':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            <GlassCard className="p-8">
              {module.config.content ? (
                <div className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: module.config.content }}
                />
              ) : (
                <p className="text-gray-400 text-center">Tokenomics information not configured</p>
              )}
            </GlassCard>
          </div>
        );

      case 'custom':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            <GlassCard className="p-8">
              {module.config.content ? (
                <div className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: module.config.content }}
                />
              ) : (
                <p className="text-gray-400 text-center">Custom content not configured</p>
              )}
            </GlassCard>
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">{module.title}</h2>
            <GlassCard className="p-8">
              <p className="text-gray-400 text-center">Module type not supported: {module.type}</p>
            </GlassCard>
          </div>
        );
    }
  };

  return renderModule();
}