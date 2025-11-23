import { QuestCategory, QuestDifficulty, RequirementType, EnhancedQuestType } from '@/types/quest';

/**
 * Default XP rewards based on quest difficulty
 */
export const DEFAULT_XP_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  Easy: 50,
  Medium: 100,
  Hard: 200
};

/**
 * XP multipliers for different quest categories
 */
export const XP_MULTIPLIER_BY_CATEGORY: Record<QuestCategory, number> = {
  social: 1.0,      // Base multiplier
  content: 1.2,     // Content creation is more effort
  web3: 1.5,        // Web3 interactions are more complex
  engagement: 0.8,  // Simple engagement actions
  custom: 1.0       // Default multiplier
};

/**
 * XP rewards for specific requirement types
 */
export const XP_BY_REQUIREMENT_TYPE: Partial<Record<RequirementType, number>> = {
  // Social Requirements
  twitter_like: 10,
  twitter_retweet: 15,
  twitter_comment: 20,
  twitter_space: 50,
  twitter_combined_actions: 30,
  
  // Platform Joins
  discord: 25,
  discord_join: 25,
  telegram: 25,
  telegram_join: 25,
  reddit: 30,
  reddit_post_creation: 50,
  reddit_comment: 25,
  reddit_upvote: 15,
  
  // Content Creation
  youtube: 40,
  tiktok: 40,
  
  // Web3 Actions
  contract_interaction: 75,
  token_swap: 100,
  token_purchase: 100,
  nft_purchase: 150,
  liquidity_provision: 200,
  staking_action: 150,
  
  // Other
  follow: 15,
  website: 20,
  image_proof: 30,
  followers_gain: 50,
  dexscreener_rocket: 20,
  coinmarketcap_upvote: 20,
  x_group_join: 25,
  custom: 25
};

/**
 * XP bonuses for enhanced quest types
 */
export const XP_BONUS_BY_ENHANCED_TYPE: Partial<Record<EnhancedQuestType, number>> = {
  // Complex multi-step quests get bonus XP
  twitter_combined_actions: 25,
  multi_platform_engagement: 50,
  liquidity_provision: 100,
  staking_action: 75,
  
  // Growth-based quests
  followers_gain: 30,
  
  // Financial commitment quests
  token_purchase: 50,
  nft_purchase: 75
};

/**
 * Calculate total XP reward for a quest
 */
export function calculateQuestXP(
  difficulty: QuestDifficulty,
  category: QuestCategory,
  requirementTypes: RequirementType[],
  enhancedType?: EnhancedQuestType,
  customXP?: number
): number {
  // If custom XP is provided, use it
  if (customXP && customXP > 0) {
    return customXP;
  }
  
  // Start with base XP from difficulty
  let totalXP = DEFAULT_XP_BY_DIFFICULTY[difficulty];
  
  // Apply category multiplier
  const categoryMultiplier = XP_MULTIPLIER_BY_CATEGORY[category] || 1.0;
  totalXP = Math.round(totalXP * categoryMultiplier);
  
  // Add XP for each requirement type
  const requirementXP = requirementTypes.reduce((sum, type) => {
    return sum + (XP_BY_REQUIREMENT_TYPE[type] || 20); // Default 20 XP for unknown types
  }, 0);
  
  // For quests with multiple requirements, apply a slight reduction (0.8x) to prevent XP inflation
  if (requirementTypes.length > 1) {
    totalXP += Math.round(requirementXP * 0.8);
  } else {
    totalXP += requirementXP;
  }
  
  // Add bonus for enhanced quest types
  if (enhancedType && XP_BONUS_BY_ENHANCED_TYPE[enhancedType]) {
    totalXP += XP_BONUS_BY_ENHANCED_TYPE[enhancedType]!;
  }
  
  // Ensure minimum XP
  return Math.max(totalXP, 10);
}

/**
 * Get recommended XP range for a quest configuration
 */
export function getRecommendedXPRange(
  difficulty: QuestDifficulty,
  category: QuestCategory,
  requirementTypes: RequirementType[]
): { min: number; max: number; recommended: number } {
  const recommended = calculateQuestXP(difficulty, category, requirementTypes);
  
  return {
    min: Math.round(recommended * 0.5),
    max: Math.round(recommended * 2),
    recommended
  };
}

/**
 * Validate if XP amount is reasonable for quest configuration
 */
export function isXPAmountReasonable(
  xpAmount: number,
  difficulty: QuestDifficulty,
  category: QuestCategory,
  requirementTypes: RequirementType[]
): { valid: boolean; reason?: string } {
  const range = getRecommendedXPRange(difficulty, category, requirementTypes);
  
  if (xpAmount < range.min) {
    return {
      valid: false,
      reason: `XP amount is too low. Minimum recommended: ${range.min}`
    };
  }
  
  if (xpAmount > range.max) {
    return {
      valid: false,
      reason: `XP amount is too high. Maximum recommended: ${range.max}`
    };
  }
  
  return { valid: true };
}

/**
 * Get XP reward tier (for display purposes)
 */
export function getXPTier(xpAmount: number): {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  label: string;
  color: string;
} {
  if (xpAmount < 50) {
    return { tier: 'bronze', label: 'Bronze', color: '#CD7F32' };
  } else if (xpAmount < 150) {
    return { tier: 'silver', label: 'Silver', color: '#C0C0C0' };
  } else if (xpAmount < 300) {
    return { tier: 'gold', label: 'Gold', color: '#FFD700' };
  } else {
    return { tier: 'platinum', label: 'Platinum', color: '#E5E4E2' };
  }
}