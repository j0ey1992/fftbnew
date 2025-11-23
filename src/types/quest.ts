import { Timestamp } from 'firebase/firestore';

export type QuestCategory = "social" | "content" | "web3" | "engagement" | "custom";
export type QuestDifficulty = "Easy" | "Medium" | "Hard";
export type QuestStatus = "active" | "inactive";
export type QuestType = "quest" | "campaign";
export type SubmissionStatus = "pending" | "verified" | "rejected";

// Enhanced quest types for specific quest patterns
export type EnhancedQuestType =
  // Social Quests
  | "followers_gain"
  | "twitter_like_retweet"
  | "twitter_comment"
  | "twitter_combined_actions"
  | "reddit_post_creation"
  | "reddit_comment"
  | "reddit_upvote"
  | "multi_platform_engagement"
  
  // Engagement Quests
  | "dexscreener_rocket"
  | "coinmarketcap_upvote"
  | "discord_join"
  | "x_group_join"
  | "telegram_join"
  
  // Web3/Financial Quests
  | "token_purchase"
  | "nft_purchase"
  | "liquidity_provision"
  | "contract_interaction"
  | "staking_action";

export type RequirementType =
  | "discord"
  | "reddit"
  | "twitter_like"
  | "twitter_retweet"
  | "twitter_comment"
  | "twitter_space"
  | "youtube"
  | "tiktok"
  | "telegram"
  | "follow"
  | "website"
  | "contract_interaction"
  | "token_swap"
  | "nft_purchase"
  | "image_proof"
  | "custom"
  // Enhanced requirement types
  | "followers_gain"
  | "twitter_combined_actions"
  | "reddit_post_creation"
  | "reddit_comment"
  | "reddit_upvote"
  | "dexscreener_rocket"
  | "coinmarketcap_upvote"
  | "discord_join"
  | "x_group_join"
  | "telegram_join"
  | "token_purchase"
  | "liquidity_provision"
  | "staking_action";

// Enhanced verification types
export type EnhancedVerificationType =
  | "image_ai_analysis"
  | "link_ai_verification"
  | "cronos_chain_verification"
  | "auto_complete"
  | "ai_auto_verification"
  | "manual_review_required";

export type VerificationType =
  | "standard"
  | "image_proof"
  | "link_proof"
  | "tx_hash"
  | "contract_call"
  | EnhancedVerificationType;

export interface Requirement {
  type: RequirementType;       // Requirement type
  description: string;         // Requirement description
  link?: string;               // Optional link for the requirement
  verificationType: VerificationType; // How to verify completion
  // Additional fields based on requirement type
  contractAddress?: string;    // For contract interactions
  functionName?: string;       // For contract interactions
  parameters?: any[];          // For contract interactions
  tokenAddress?: string;       // For token swaps
  minAmount?: string;          // For token swaps
  nftAddress?: string;         // For NFT purchases
  nftId?: string;              // For NFT purchases
  domain?: string;             // For link validation
  
  // Enhanced fields for new quest types
  followerTarget?: number;     // For followers_gain quests
  poolAddress?: string;        // For liquidity provision
  stakingContract?: string;    // For staking actions
  autoApprovalThreshold?: number; // Custom threshold for this requirement
  aiVerificationEnabled?: boolean; // Whether AI verification is enabled
  cronosChainRequired?: boolean;   // Whether Cronos chain verification is required
}
export interface UserQuestStatus {
  status: SubmissionStatus;
  submittedAt: Timestamp;
  completedAt?: Timestamp;
  proofLink?: string;
  moderationNote?: string;
  completionCount?: number;
  userId?: string;  // Firebase user ID for reference
}

// Add QuestSubmission type (alias for submission data)
export interface QuestSubmission {
  id: string;
  questId: string;
  walletAddress: string;
  status: SubmissionStatus;
  submittedAt: Timestamp;
  proofLink?: string;
  verificationData?: any;
  moderationNote?: string;
}

// Add QuestParticipation type
export interface QuestParticipation {
  questId: string;
  walletAddress: string;
  joinedAt: Timestamp;
  status: SubmissionStatus;
  completedAt?: Timestamp;
  rewardClaimed?: boolean;
}

export interface Quest {
  id: string;                  // Unique quest identifier
  title: string;               // Quest title
  description: string;         // Quest description
  projectId?: string;          // Associated partner/project ID (optional for campaigns)
  category: QuestCategory;     // Quest category (social, content, web3, etc.)
  difficulty: QuestDifficulty; // Difficulty level (Easy, Medium, Hard)
  reward: number;              // Token reward amount
  xpReward?: number;           // XP reward amount
  tokenAddress: string;        // Token contract address
  tokenSymbol: string;         // Token symbol (e.g., "KRIS")
  tokenDecimals: number;       // Token decimals (typically 18)
  participantLimit: number | "unlimited"; // Max participants allowed
  participantsJoined: number;  // Current participant count
  status: QuestStatus;         // Quest status (active, inactive)
  type?: QuestType;            // Quest type (quest, campaign) - optional for backward compatibility
  requirements: Requirement[]; // Array of quest requirements
  userStatuses?: {             // Map of user statuses by wallet address (deprecated - backend only)
    [walletAddress: string]: UserQuestStatus
  };
  userStatus?: UserQuestStatus; // Current user's quest status (populated by backend)
  createdAt: Timestamp;        // Creation timestamp
  updatedAt: Timestamp;        // Last update timestamp
  expiresAt?: Timestamp;       // Expiration timestamp
  projectName?: string;        // Project name (denormalized)
  projectLogo?: string;        // Project logo URL (denormalized)
  projectBanner?: string;      // Project banner URL (denormalized)
  completionsCount?: number;   // Total number of completions
  
  // Partner and escrow integration
  escrowEnabled?: boolean;     // Whether quest uses escrow for rewards
  verificationInstructions?: string; // Instructions for completing verification
  
  // Auto-approval configuration
  disableAutoApproval?: boolean;  // Disable auto-approval for this quest
  autoApprovalThreshold?: number; // Custom threshold for auto-approval (0-1)
  autoApprovalRules?: {           // Custom rules for auto-approval
    minUserReputation?: number;   // Minimum user reputation required
    minPreviousCompletions?: number; // Minimum previous completions required
    allowedSubmissionTypes?: string[]; // Submission types that can be auto-approved
  };
  
  // Enhanced quest fields
  enhancedQuestType?: EnhancedQuestType; // Specific quest type for enhanced functionality
  aiVerificationEnabled?: boolean;       // Whether AI verification is enabled for this quest
  cronosChainRequired?: boolean;         // Whether Cronos chain verification is required
  estimatedCompletionTime?: number;      // Estimated completion time in minutes
  templateId?: string;                   // ID of the template used to create this quest
  
  // Additional fields for enhanced quest detail
  creatorType?: 'admin' | 'partner' | 'project'; // Type of quest creator
  endDate?: Timestamp;                   // Quest end date (in addition to expiresAt)
  stats?: {                              // Quest statistics
    totalParticipants: number;
    completedCount: number;
    completionRate: number;
    averageCompletionTime?: number;
  };
  steps?: Array<{                        // Quest steps (for multi-step quests)
    id: string;
    title: string;
    description: string;
    order: number;
    required: boolean;
    completed?: boolean;
  }>;
  tags?: string[];                       // Quest tags for categorization
  featured?: boolean;                    // Whether quest is featured
  rewardDistribution?: {                 // Reward distribution settings
    method: 'immediate' | 'batch' | 'manual';
    batchSize?: number;
    distributionTime?: string;
  };
  
  // Frontend-specific fields (populated by hooks)
  isCompleted?: boolean;                 // Whether current user has completed this quest
  isPending?: boolean;                   // Whether current user has a pending submission
  submission?: any;                      // Current user's submission data
}

export interface QuestFilters {
  category?: QuestCategory;
  difficulty?: QuestDifficulty;
  projectId?: string;
  status?: QuestStatus;
}

export interface VerificationResult {
  verified: boolean;
  confidence?: number;
  requiresManualReview?: boolean;
  reason?: string;
  details?: any;
  aiAnalysis?: {
    confidence: number;
    verified: boolean;
    details: string;
  };
  moderationDecision?: {
    autoApprove: boolean;
    confidence: number;
    reason: string;
  };
}

/**
 * Configuration for auto-approval rules
 */
export interface AutoApprovalConfig {
  enabled: boolean;
  threshold: number; // 0-1, higher means stricter
  allowedSubmissionTypes: RequirementType[];
  minUserReputation: number;
  minPreviousCompletions: number;
}

// Enhanced AI Analysis interfaces
export interface EnhancedAIAnalysis {
  verified: boolean;
  confidence: number;
  analysisType: 'image' | 'text' | 'link' | 'transaction';
  details: string;
  fraudRiskScore: number; // 0-1, higher = more suspicious
  contentQualityScore: number; // 0-1, higher = better quality
  platformSpecificData?: {
    twitterMetrics?: TwitterAnalysis;
    redditMetrics?: RedditAnalysis;
    discordMetrics?: DiscordAnalysis;
  };
  cronosChainData?: CronosVerificationResult;
  processingTime: number; // milliseconds
  modelVersion: string;
}

export interface TwitterAnalysis {
  postExists: boolean;
  engagementDetected: boolean;
  accountAge: number; // days
  followerCount: number;
  engagementRate: number;
  suspiciousActivity: boolean;
}

export interface RedditAnalysis {
  postExists: boolean;
  subredditRelevant: boolean;
  commentQuality: number; // 0-1
  accountKarma: number;
  accountAge: number; // days
  contentOriginal: boolean;
}

export interface DiscordAnalysis {
  serverJoined: boolean;
  membershipConfirmed: boolean;
  accountAge: number; // days
  previousServerCount: number;
}

// Cronos Chain Verification interfaces
export interface CronosVerificationResult {
  transactionHash: string;
  blockNumber: number;
  verified: boolean;
  tokenTransfer?: {
    from: string;
    to: string;
    amount: string;
    tokenAddress: string;
    tokenSymbol: string;
    usdValue?: number;
  };
  nftTransfer?: {
    from: string;
    to: string;
    tokenId: string;
    contractAddress: string;
    collectionName?: string;
  };
  contractInteraction?: {
    contractAddress: string;
    functionCalled: string;
    success: boolean;
    inputData: string;
  };
  liquidityProvision?: {
    poolAddress: string;
    token0: string;
    token1: string;
    amount0: string;
    amount1: string;
    lpTokensReceived: string;
  };
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  confirmations: number;
}

// Quest Template System interfaces
export interface QuestTemplate {
  id: string;
  name: string;
  category: QuestCategory;
  questType: EnhancedQuestType;
  defaultRequirements: Requirement[];
  suggestedVerificationMethods: EnhancedVerificationType[];
  estimatedCompletionTime: number; // minutes
  difficultyRecommendation: QuestDifficulty;
  rewardRange: {
    min: number;
    max: number;
    suggested: number;
  };
  aiVerificationCompatible: boolean;
  cronosChainRequired: boolean;
  wizardSteps: WizardStep[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  inputType: 'text' | 'number' | 'select' | 'multiselect' | 'url' | 'address';
  options?: string[];
  validation: ValidationRule[];
  aiSuggestions?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Enhanced Quest Filters
export interface EnhancedQuestFilters extends QuestFilters {
  enhancedQuestType?: EnhancedQuestType;
  verificationType?: EnhancedVerificationType;
  aiVerificationCompatible?: boolean;
  cronosChainRequired?: boolean;
  estimatedCompletionTime?: {
    min?: number;
    max?: number;
  };
}

// Enhanced Verification Result
export interface EnhancedVerificationResult extends VerificationResult {
  enhancedAiAnalysis?: EnhancedAIAnalysis;
  cronosVerification?: CronosVerificationResult;
  fraudDetection?: {
    riskScore: number;
    reasons: string[];
    recommendation: 'approve' | 'review' | 'reject';
  };
}

// Wizard Session Management
export interface WizardSession {
  id: string;
  userId: string;
  templateId?: string;
  currentStep: number;
  questData: Partial<Quest>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
}

// Quest Performance Metrics
export interface QuestMetrics {
  questId: string;
  completionRate: number;
  averageCompletionTime: number; // minutes
  verificationAccuracy: number;
  fraudDetectionRate: number;
  userSatisfactionScore: number;
  rewardEffectiveness: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
