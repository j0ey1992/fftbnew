import { Timestamp } from 'firebase/firestore';
import { Quest, QuestCategory, QuestDifficulty, QuestStatus, Requirement } from './quest';

export type CampaignType = 'campaign';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

/**
 * Platform fee configuration
 */
export interface PlatformFeeConfig {
  percentage: number; // 3-5% of quest reward
  minimumFee: number; // Minimum fee in KRIS tokens
  maximumFee: number; // Maximum fee in KRIS tokens
}

/**
 * Payment transaction details
 */
export interface PaymentTransaction {
  txHash: string;
  amount: string;
  tokenAddress: string;
  tokenSymbol: string;
  fromAddress: string;
  toAddress: string;
  blockNumber?: number;
  timestamp: string;
  gasUsed?: string;
  gasPrice?: string;
}

/**
 * User Campaign interface extending Quest
 */
export interface UserCampaign extends Omit<Quest, 'projectId' | 'createdBy' | 'creatorType'> {
  type: CampaignType;
  createdBy: string; // User wallet address who created the campaign
  creatorType: 'user';
  
  // Platform fee details
  platformFee: {
    amount: string; // Fee amount in KRIS tokens
    percentage: number; // Fee percentage (3-5%)
    currency: 'KRIS';
  };
  
  // Payment details
  payment: {
    status: PaymentStatus;
    txHash?: string;
    paidAt?: Timestamp;
    refundTxHash?: string;
    refundedAt?: Timestamp;
    transaction?: PaymentTransaction;
  };
  
  // Campaign specific settings
  campaignSettings: {
    autoApprove: boolean; // Whether submissions are auto-approved
    requiresManualReview: boolean; // Whether manual review is required
    maxSubmissions?: number; // Maximum number of submissions allowed
    submissionDeadline?: Timestamp; // Deadline for submissions
  };
  
  // Analytics
  analytics: {
    views: number;
    submissions: number;
    completions: number;
    engagementRate: number;
  };
}

/**
 * Campaign creation data interface
 */
export interface CreateCampaignData {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  reward: number;
  xpReward?: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  participantLimit: number | "unlimited";
  requirements: Requirement[];
  expiresAt?: Timestamp;
  verificationInstructions?: string;
  
  // Campaign specific
  campaignSettings: {
    autoApprove: boolean;
    requiresManualReview: boolean;
    maxSubmissions?: number;
    submissionDeadline?: Timestamp;
  };
}

/**
 * Platform fee calculation request
 */
export interface FeeCalculationRequest {
  rewardAmount: number;
  tokenSymbol: string;
  tokenAddress: string;
}

/**
 * Platform fee calculation response
 */
export interface FeeCalculationResponse {
  platformFee: {
    amount: string;
    percentage: number;
    currency: 'KRIS';
  };
  totalCost: string; // reward + platform fee
  breakdown: {
    questReward: string;
    platformFee: string;
    total: string;
  };
}

/**
 * Campaign payment request
 */
export interface CampaignPaymentRequest {
  campaignId: string;
  paymentTxHash: string;
  fromAddress: string;
}

/**
 * Campaign payment response
 */
export interface CampaignPaymentResponse {
  success: boolean;
  campaignId: string;
  paymentStatus: PaymentStatus;
  message: string;
  transaction?: PaymentTransaction;
}

/**
 * Campaign filters interface
 */
export interface CampaignFilters {
  category?: QuestCategory;
  difficulty?: QuestDifficulty;
  status?: QuestStatus;
  createdBy?: string;
  paymentStatus?: PaymentStatus;
  limit?: number;
}

/**
 * Campaign analytics interface
 */
export interface CampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalRewardsDistributed: string;
  totalPlatformFeesCollected: string;
  averageCompletionRate: number;
  campaignsByCategory: Record<QuestCategory, number>;
  campaignsByDifficulty: Record<QuestDifficulty, number>;
  recentActivity: {
    date: string;
    campaignId: string;
    campaignTitle: string;
    action: 'created' | 'paid' | 'completed' | 'expired';
  }[];
}

/**
 * User campaign dashboard data
 */
export interface UserCampaignDashboard {
  campaigns: UserCampaign[];
  analytics: {
    totalCreated: number;
    totalActive: number;
    totalCompleted: number;
    totalSpent: string;
    totalPlatformFees: string;
    averageCompletionRate: number;
  };
  recentActivity: {
    date: string;
    campaignId: string;
    campaignTitle: string;
    action: string;
    details?: any;
  }[];
}