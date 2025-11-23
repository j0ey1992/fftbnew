'use client';

import dynamic from 'next/dynamic';
import { DAppModule, DAppTheme } from '@/types/dapp';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import Web3 components to avoid SSR issues
const QuestDiscovery = dynamic(() => import('@/components/quests/QuestDiscovery'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const NftStakingPage = dynamic(() => import('@/components/nft-staking/NftStakingPage'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const StakingContractsList = dynamic(() => import('@/components/staking/StakingContractsList'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const VaultStakingInterface = dynamic(() => import('@/components/vault-staking/VaultStakingInterface'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const TokenLocker = dynamic(() => import('@/components/TokenLocker'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const BridgeForm = dynamic(() => import('@/components/bridge/BridgeForm'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const VVSFinanceModal = dynamic(() => import('@/components/ui/VVSFinanceModal'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const LeaderboardClient = dynamic(() => import('@/app/leaderboard/LeaderboardClient'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

interface Web3ModuleRendererProps {
  module: DAppModule;
  theme: DAppTheme;
  isPreview?: boolean;
}

export default function Web3ModuleRenderer({ module, theme, isPreview = false }: Web3ModuleRendererProps) {
  const renderModule = () => {
    switch (module.type) {
      case 'quests':
        return (
          <div className="quest-module">
            <QuestDiscovery 
              projectId={module.config.projectId}
              showFeatured={module.config.showFeatured}
              categories={module.config.categories}
              maxQuests={module.config.maxQuests}
            />
          </div>
        );

      case 'nft-staking':
        if (module.config.nftStakingContractId) {
          return (
            <div className="nft-staking-module">
              <NftStakingPage contractId={module.config.nftStakingContractId} />
            </div>
          );
        }
        return <div className="p-8 text-center text-gray-400">Please configure NFT staking contract</div>;

      case 'token-staking':
      case 'coin-staking':
        return (
          <div className="staking-module">
            <StakingContractsList 
              filterByAddress={module.config.contractAddress}
              displayMode={module.config.displayMode as any}
            />
          </div>
        );

      case 'vaults':
        if (module.config.vaultContractId) {
          return (
            <div className="vault-module">
              <VaultStakingInterface vaultId={module.config.vaultContractId} />
            </div>
          );
        }
        return <div className="p-8 text-center text-gray-400">Please configure vault contract</div>;

      case 'token-locker':
        return (
          <div className="token-locker-module">
            <TokenLocker 
              contractAddress={module.config.lockerContractAddress}
              showCreateLock={module.config.showCreateLock}
              showUserLocks={module.config.showUserLocks}
            />
          </div>
        );

      case 'bridge':
        return (
          <div className="bridge-module max-w-2xl mx-auto">
            <BridgeForm 
              supportedChains={module.config.supportedChains}
              defaultFromChain={module.config.defaultFromChain}
              defaultToChain={module.config.defaultToChain}
            />
          </div>
        );

      case 'swap':
        return (
          <div className="swap-module max-w-2xl mx-auto">
            <VVSFinanceModal 
              defaultInputToken={module.config.defaultInputToken}
              defaultOutputToken={module.config.defaultOutputToken}
              slippageTolerance={module.config.slippageTolerance}
            />
          </div>
        );

      case 'leaderboard':
        return (
          <div className="leaderboard-module">
            <LeaderboardClient 
              type={module.config.leaderboardType}
              timeframe={module.config.timeframe}
            />
          </div>
        );

      case 'hero-banner':
        return (
          <div 
            className="hero-banner-module relative overflow-hidden"
            style={{ 
              height: module.config.height || '500px',
              backgroundImage: module.config.backgroundImage ? `url(${module.config.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {module.config.backgroundVideo && (
              <video 
                autoPlay 
                muted 
                loop 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={module.config.backgroundVideo} type="video/mp4" />
              </video>
            )}
            <div className="relative z-10 h-full flex items-center justify-center text-center px-8">
              <div>
                {module.config.headline && (
                  <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: theme.textColor }}>
                    {module.config.headline}
                  </h1>
                )}
                {module.config.subheadline && (
                  <p className="text-xl md:text-2xl mb-8 opacity-90" style={{ color: theme.textColor }}>
                    {module.config.subheadline}
                  </p>
                )}
                {module.config.ctaText && (
                  <a 
                    href={module.config.ctaLink || '#'}
                    className="inline-block px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105"
                    style={{ 
                      backgroundColor: theme.primaryColor,
                      color: theme.textColor 
                    }}
                  >
                    {module.config.ctaText}
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="roadmap-module p-8">
            <h2 className="text-3xl font-bold mb-8" style={{ color: theme.textColor }}>
              {module.title || 'Roadmap'}
            </h2>
            {/* Add your roadmap component here */}
            <div className="text-gray-400">Roadmap module - Configure in settings</div>
          </div>
        );

      case 'team':
        return (
          <div className="team-module p-8">
            <h2 className="text-3xl font-bold mb-8" style={{ color: theme.textColor }}>
              {module.title || 'Our Team'}
            </h2>
            {/* Add your team component here */}
            <div className="text-gray-400">Team module - Configure in settings</div>
          </div>
        );

      case 'tokenomics':
        return (
          <div className="tokenomics-module p-8">
            <h2 className="text-3xl font-bold mb-8" style={{ color: theme.textColor }}>
              {module.title || 'Tokenomics'}
            </h2>
            {/* Add your tokenomics component here */}
            <div className="text-gray-400">Tokenomics module - Configure in settings</div>
          </div>
        );

      case 'custom':
        return (
          <div 
            className="custom-module"
            dangerouslySetInnerHTML={{ __html: module.config.content || '' }}
          />
        );

      default:
        return (
          <div className="p-8 text-center text-gray-400">
            Module type "{module.type}" not implemented yet
          </div>
        );
    }
  };

  const layoutClasses = {
    full: 'w-full',
    container: 'container mx-auto px-4',
    wide: 'max-w-7xl mx-auto px-4'
  };

  return (
    <div 
      className={`module-wrapper ${layoutClasses[module.layout || 'container']} ${isPreview ? 'pointer-events-none' : ''}`}
      style={{
        backgroundColor: module.customStyles?.backgroundColor,
        color: module.customStyles?.textColor,
        padding: module.customStyles?.padding,
        margin: module.customStyles?.margin,
        borderRadius: module.customStyles?.borderRadius,
        backgroundImage: module.customStyles?.backgroundImage ? `url(${module.customStyles.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {module.description && (
        <p className="text-gray-400 mb-4">{module.description}</p>
      )}
      {renderModule()}
    </div>
  );
}