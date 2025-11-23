import { Timestamp } from 'firebase/firestore';
import { QuestCategory, QuestDifficulty, RequirementType, SubmissionStatus } from './quest';

export interface Submission {
  id: string;                  // Unique submission identifier
  questId: string;             // Associated quest ID
  walletAddress: string;       // User wallet address
  proofLink: string;           // Proof URL or transaction hash
  status: SubmissionStatus;    // Submission status
  submittedAt: Timestamp;      // Submission timestamp
  verifiedAt?: Timestamp;      // Verification timestamp
  moderatedAt?: Timestamp;     // Moderation timestamp
  moderatedBy?: string;        // Moderator address or "system"
  moderationNote?: string;     // Moderation notes
  questTitle: string;          // Quest title (denormalized)
  questCategory: QuestCategory; // Quest category (denormalized)
  questDifficulty: QuestDifficulty; // Quest difficulty (denormalized)
  questReward: number;         // Quest reward (denormalized)
  tokenAddress: string;        // Token address (denormalized)
  tokenSymbol: string;         // Token symbol (denormalized)
  tokenDecimals: number;       // Token decimals (denormalized)
  projectId: string;           // Project ID (denormalized)
  projectName: string;         // Project name (denormalized)
  requirementType: RequirementType; // Type of requirement completed
  verificationData?: any;      // Additional verification data
  escrowId?: string;           // Associated escrow record ID
  aiAnalysis?: {               // AI analysis for submissions
    confidence: number;
    verified: boolean;
    details: string;
    analysisType?: string;     // Type of analysis performed
    analysisTimestamp?: Timestamp; // When analysis was performed
  };
  moderationDecision?: {       // Automated moderation decision
    autoApprove: boolean;
    confidence: number;
    reason: string;
    decisionTimestamp?: Timestamp; // When decision was made
    decisionFactors?: string[]; // Factors that influenced the decision
  };
  autoModerated?: boolean;     // Whether auto-moderated
  autoVerified?: boolean;      // Whether auto-verified
  submissionFingerprint?: string; // Unique fingerprint to prevent duplicates
  processingErrors?: string[]; // Any errors during processing
  retryCount?: number;         // Number of retry attempts for processing
}

export interface SubmissionCreateParams {
  questId: string;
  walletAddress: string;
  proofLink: string;
  verificationResult?: any;
  proofType?: string;
  requirementType: RequirementType;
  questTitle: string;
  questCategory: QuestCategory;
  questDifficulty: QuestDifficulty;
  questReward: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  projectId: string;
  projectName: string;
}

export interface AutoApproveParams {
  submissionId: string;
  questId: string;
  walletAddress: string;
  reward: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals?: number;
  submissionFingerprint: string;
  requirementType?: string;
  projectId?: string;
}

/**
 * Parameters for reward distribution
 */
export interface RewardDistributionParams {
  submissionId: string;
  questId: string;
  walletAddress: string;
  amount: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals?: number;
  distributionMethod: 'auto-approval' | 'manual-approval' | 'batch-distribution';
  distributedBy?: string; // Address or 'system'
  transactionHash?: string; // If distributed on-chain
}
