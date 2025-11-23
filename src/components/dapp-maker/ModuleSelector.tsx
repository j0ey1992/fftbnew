'use client';

import { ModuleType } from '@/types/dapp';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  TargetIcon, 
  LayersIcon, 
  CpuIcon, 
  DollarSignIcon,
  DropletIcon,
  MapIcon,
  UsersIcon,
  PieChartIcon,
  FileIcon,
  HomeIcon,
  StarsIcon,
  NftIcon,
  VaultIcon,
  LockIcon,
  BridgeIcon,
  SwapIcon,
  TrophyIcon,
  InfoIcon,
  HandshakeIcon,
  GroupIcon,
  CoinIcon,
  ImageIcon,
  PoolIcon,
  RoadmapIcon,
  TeamIcon,
  CodeIcon,
  BannerIcon,
  LeaderboardIcon,
  PartnersIcon,
  CommunityIcon
} from '@/components/icons';

interface ModuleSelectorProps {
  onModuleAdd: (moduleType: ModuleType) => void;
}

const modules = [
  {
    type: 'hero-banner' as ModuleType,
    name: 'Hero Banner',
    description: 'Eye-catching hero section',
    icon: BannerIcon,
    color: 'from-purple-600 to-pink-600'
  },
  {
    type: 'quests' as ModuleType,
    name: 'Quests',
    description: 'Add quest campaigns and rewards',
    icon: TargetIcon,
    color: 'from-purple-600 to-pink-600'
  },
  {
    type: 'nft-staking' as ModuleType,
    name: 'NFT Staking',
    description: 'Enable NFT staking rewards',
    icon: NftIcon,
    color: 'from-blue-600 to-cyan-600'
  },
  {
    type: 'nft-minting' as ModuleType,
    name: 'NFT Minting',
    description: 'Create NFT minting page',
    icon: ImageIcon,
    color: 'from-green-600 to-emerald-600'
  },
  {
    type: 'token-staking' as ModuleType,
    name: 'Token Staking',
    description: 'Add token staking pools',
    icon: DollarSignIcon,
    color: 'from-yellow-600 to-orange-600'
  },
  {
    type: 'coin-staking' as ModuleType,
    name: 'Coin Staking',
    description: 'Single token staking',
    icon: CoinIcon,
    color: 'from-orange-500 to-red-500'
  },
  {
    type: 'lp-staking' as ModuleType,
    name: 'LP Staking',
    description: 'Add liquidity pool staking',
    icon: DropletIcon,
    color: 'from-indigo-600 to-purple-600'
  },
  {
    type: 'vaults' as ModuleType,
    name: 'Vaults',
    description: 'Yield generating vaults',
    icon: VaultIcon,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    type: 'token-locker' as ModuleType,
    name: 'Token Locker',
    description: 'Lock tokens with vesting',
    icon: LockIcon,
    color: 'from-gray-600 to-gray-700'
  },
  {
    type: 'bridge' as ModuleType,
    name: 'Bridge',
    description: 'Cross-chain token bridge',
    icon: BridgeIcon,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    type: 'swap' as ModuleType,
    name: 'Token Swap',
    description: 'DEX token swapping',
    icon: SwapIcon,
    color: 'from-pink-500 to-purple-500'
  },
  {
    type: 'liquidity-pools' as ModuleType,
    name: 'Liquidity Pools',
    description: 'Manage liquidity positions',
    icon: PoolIcon,
    color: 'from-blue-600 to-indigo-600'
  },
  {
    type: 'leaderboard' as ModuleType,
    name: 'Leaderboard',
    description: 'Display user rankings',
    icon: LeaderboardIcon,
    color: 'from-yellow-500 to-amber-500'
  },
  {
    type: 'roadmap' as ModuleType,
    name: 'Roadmap',
    description: 'Show project roadmap',
    icon: RoadmapIcon,
    color: 'from-red-600 to-pink-600'
  },
  {
    type: 'team' as ModuleType,
    name: 'Team',
    description: 'Display team members',
    icon: TeamIcon,
    color: 'from-teal-600 to-cyan-600'
  },
  {
    type: 'tokenomics' as ModuleType,
    name: 'Tokenomics',
    description: 'Show token distribution',
    icon: PieChartIcon,
    color: 'from-purple-600 to-indigo-600'
  },
  {
    type: 'about' as ModuleType,
    name: 'About',
    description: 'Project information',
    icon: InfoIcon,
    color: 'from-slate-500 to-slate-600'
  },
  {
    type: 'partners' as ModuleType,
    name: 'Partners',
    description: 'Showcase partnerships',
    icon: PartnersIcon,
    color: 'from-violet-500 to-purple-500'
  },
  {
    type: 'community' as ModuleType,
    name: 'Community',
    description: 'Community links & stats',
    icon: CommunityIcon,
    color: 'from-green-500 to-teal-500'
  },
  {
    type: 'custom' as ModuleType,
    name: 'Custom Page',
    description: 'Create custom content',
    icon: CodeIcon,
    color: 'from-gray-600 to-gray-700'
  }
];

export default function ModuleSelector({ onModuleAdd }: ModuleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold mb-2">Available Modules</h3>
        <p className="text-gray-400 text-sm mb-4">
          Drag modules to add them to your dApp
        </p>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const Icon = module.icon;
          
          return (
            <div
              key={module.type}
              onClick={() => onModuleAdd(module.type)}
              className="cursor-pointer transform transition-all hover:scale-105"
            >
              <GlassCard className="p-4 hover:border-purple-500/50">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${module.color}`}>
                    <Icon className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{module.name}</h4>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}