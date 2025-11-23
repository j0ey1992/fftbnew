export type ModuleType = 
  | 'quests'
  | 'nft-staking'
  | 'nft-minting'
  | 'token-staking'
  | 'coin-staking'
  | 'lp-staking'
  | 'vaults'
  | 'token-locker'
  | 'bridge'
  | 'swap'
  | 'liquidity-pools'
  | 'leaderboard'
  | 'roadmap'
  | 'team'
  | 'tokenomics'
  | 'hero-banner'
  | 'about'
  | 'partners'
  | 'community'
  | 'custom';

export type DAppStatus = 'draft' | 'published' | 'archived';

export interface DAppTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface ModuleConfig {
  id: string;
  type: ModuleType;
  title: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
  customContent?: string;
}

export interface DAppSettings {
  name: string;
  description: string;
  logo: string;
  banner: string;
  favicon?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    website?: string;
  };
  customDomain?: string;
  subdomain?: string;
  path?: string;
}

export interface DAppModule {
  id: string;
  type: ModuleType;
  title: string;
  description?: string;
  enabled: boolean;
  order: number;
  layout?: 'full' | 'container' | 'wide';
  customStyles?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    backgroundImage?: string;
  };
  config: {
    // Quest module config
    projectId?: string;
    showFeatured?: boolean;
    categories?: string[];
    maxQuests?: number;
    
    // Staking module configs
    contractAddress?: string;
    stakingContractId?: string;
    tokenAddress?: string;
    rewardTokenAddress?: string;
    
    // Vault configs
    vaultContractId?: string;
    vaultAddress?: string;
    
    // NFT staking config
    nftContractAddress?: string;
    nftStakingContractId?: string;
    
    // NFT minting config
    collectionAddress?: string;
    mintPrice?: string;
    maxSupply?: number;
    mintStartDate?: string;
    mintEndDate?: string;
    
    // Token locker config
    lockerContractAddress?: string;
    showCreateLock?: boolean;
    showUserLocks?: boolean;
    
    // Bridge config
    supportedChains?: string[];
    defaultFromChain?: string;
    defaultToChain?: string;
    
    // Swap config
    defaultInputToken?: string;
    defaultOutputToken?: string;
    slippageTolerance?: number;
    
    // Liquidity pools config
    showV2Pools?: boolean;
    showV3Pools?: boolean;
    featuredPools?: string[];
    
    // Leaderboard config
    leaderboardType?: 'xp' | 'referrals' | 'volume' | 'custom';
    timeframe?: 'all' | 'monthly' | 'weekly' | 'daily';
    
    // Hero banner config
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string;
    backgroundVideo?: string;
    height?: string;
    
    // Custom page config
    content?: string;
    components?: any[];
    
    // Common configs
    displayMode?: 'grid' | 'list' | 'carousel' | 'table';
    itemsPerPage?: number;
    showFilters?: boolean;
    showSearch?: boolean;
  };
}

export interface DApp {
  id: string;
  userId: string;
  settings: DAppSettings;
  theme: DAppTheme;
  modules: DAppModule[];
  status: DAppStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  analytics?: {
    views: number;
    uniqueVisitors: number;
    lastVisit?: Date;
  };
}