
/**
 * API configuration settings
 */

// Base URL for the backend API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API version
export const API_VERSION = 'v1';

// Default request timeout in milliseconds
export const DEFAULT_TIMEOUT = 30000;

// SSE endpoint
export const SSE_ENDPOINT = `${API_BASE_URL}/api/events`;

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints - Updated for new simplified authentication flow
  AUTH: {
    CONNECT_WALLET: '/api/auth/connect-wallet',
    VERIFY: '/api/auth/verify',
    UPGRADE_TO_PROJECT: '/api/auth/upgrade-to-project',
    SET_ADMIN: '/api/auth/set-admin',
  },
  
  // Quest endpoints
  QUESTS: {
    BASE: '/api/quests',
    BY_ID: (id: string) => `/api/quests/${id}`,
    ACTIVE: '/api/quests/active',
    FEATURED: '/api/quests/featured',
    BY_CATEGORY: (category: string) => `/api/quests/category/${category}`,
    BY_DIFFICULTY: (difficulty: string) => `/api/quests/difficulty/${difficulty}`,
    SUBMIT: (id: string) => `/api/quests/${id}/submit`,
  },
  
  // Submission endpoints
  SUBMISSIONS: {
    ALL: '/api/quests/submissions/all',
    USER: '/api/quests/submissions/user',
    BY_ID: (id: string) => `/api/quests/submissions/${id}`,
    REVIEW: (id: string) => `/api/quests/submissions/${id}/review`,
  },
  
  // User endpoints
  USERS: {
    PROFILE: (address: string) => `/api/users/${address}`,
    UPDATE_PROFILE: '/api/users',
    TOP: '/api/users/top',
  },
  
  // Logging endpoints
  LOGS: {
    ALL: '/api/quests/logs',
    BY_USER: (userId: string) => `/api/quests/logs/user/${userId}`,
    BY_QUEST: (questId: string) => `/api/quests/logs/quest/${questId}`,
    CREATE: '/api/quests/logs',
  },
  
  // NFT staking endpoints
  NFT_STAKING: {
    BASE: '/api/nft-staking',
    ENABLED: '/api/nft-staking/enabled',
    BY_ID: (id: string) => `/api/nft-staking/${id}`,
    TOGGLE: (id: string) => `/api/nft-staking/${id}/toggle`,
  },
  
  // Staking endpoints
  STAKING: {
    BASE: '/api/staking',
    ENABLED: '/api/staking/enabled',
    BY_ID: (id: string) => `/api/staking/${id}`,
  },
  
  // LP staking endpoints
  LP_STAKING: {
    BASE: '/api/lp-staking',
    ENABLED: '/api/lp-staking/enabled',
    BY_ID: (id: string) => `/api/lp-staking/${id}`,
  },
  
  // Vault endpoints
  VAULTS: {
    BASE: '/api/vaults',
    ENABLED: '/api/vaults/enabled',
    BY_ID: (id: string) => `/api/vaults/${id}`,
    TOGGLE: (id: string) => `/api/vaults/${id}/toggle`,
  },
  
  // Quest rewards endpoints
  REWARDS: {
    ESCROW: '/api/quests/rewards/escrow',
    ESCROW_BY_ID: (id: string) => `/api/quests/rewards/escrow/${id}`,
    ESCROW_VERIFY: (id: string) => `/api/quests/rewards/escrow/${id}/verify`,
    CLAIM: '/api/quests/rewards/claim',
    HISTORY: '/api/quests/rewards/history',
  },
  
  // Partner endpoints
  PARTNERS: {
    APPLY: '/api/partners/apply',
    STATUS: '/api/partners/status',
    SUBSCRIBE: '/api/partners/subscribe',
    PRICING: '/api/partners/pricing',
    PROJECTS: '/api/partners/projects',
    PROJECT_BY_ID: (id: string) => `/api/partners/projects/${id}`,
    PROJECT_QUESTS: (id: string) => `/api/partners/projects/${id}/quests`,
    PROJECT_SUBMISSIONS: (id: string) => `/api/partners/projects/${id}/submissions`,
    REVIEW_SUBMISSION: (id: string) => `/api/partners/projects/submissions/${id}/review`,
    ESCROW: '/api/partners/projects/escrow',
    REVIEW_ESCROW: (id: string) => `/api/partners/projects/escrow/${id}/review`,
    ANALYTICS: (id: string) => `/api/partners/projects/${id}/analytics`,
    PUBLIC_PROJECT: (id: string) => `/api/partners/projects/public/projects/${id}`,
    PUBLIC_PROJECT_QUESTS: (id: string) => `/api/partners/projects/public/projects/${id}/quests`,
  },
  
  // Campaign endpoints
  CAMPAIGNS: {
    BASE: '/api/campaigns',
    BY_ID: (id: string) => `/api/campaigns/${id}`,
    USER_CAMPAIGNS: (address: string) => `/api/campaigns/user/${address}`,
    MY_CAMPAIGNS: '/api/campaigns/my-campaigns', // New endpoint for authenticated user's campaigns
    CALCULATE_FEE: '/api/campaigns/calculate-fee',
    PAYMENT: (id: string) => `/api/campaigns/${id}/payment`,
  },
  
  // SSE endpoints
  SSE: {
    QUESTS: '/api/events/quests',
    SUBMISSIONS: '/api/events/submissions',
    USER_ACTIVITY: (userId: string) => `/api/events/users/${userId}`,
  },
};
