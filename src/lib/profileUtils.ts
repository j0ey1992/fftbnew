'use client';

import { User } from '@/types/user';
import { NextRequest } from 'next/server';

/**
 * Profile field requirements for different device types
 */
export const PROFILE_REQUIREMENTS = {
  desktop: {
    required: ['displayName', 'bio'],
    optional: ['profilePicture']
  },
  mobile: {
    required: ['displayName'],
    optional: ['bio', 'profilePicture']
  }
};

/**
 * Check if a user profile is complete based on device type
 * @param user User profile to check
 * @param deviceType Device type ('mobile' or 'desktop')
 * @returns Object containing completion status and missing fields
 */
export function checkProfileCompletion(
  user: User | null,
  deviceType: 'mobile' | 'desktop' = 'desktop'
): { 
  isComplete: boolean; 
  missingFields: string[];
  percentComplete: number;
} {
  if (!user) {
    return { 
      isComplete: false, 
      missingFields: [...PROFILE_REQUIREMENTS[deviceType].required], 
      percentComplete: 0 
    };
  }

  const requirements = PROFILE_REQUIREMENTS[deviceType];
  const missingFields: string[] = [];

  // Check required fields
  for (const field of requirements.required) {
    if (!user[field as keyof User]) {
      missingFields.push(field);
    }
  }

  // Calculate completion percentage
  const totalFields = requirements.required.length;
  const completedFields = totalFields - missingFields.length;
  const percentComplete = totalFields > 0 
    ? Math.round((completedFields / totalFields) * 100) 
    : 100;

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    percentComplete
  };
}

/**
 * Format token balance with proper decimal handling
 * @param balance Raw token balance
 * @param decimals Token decimals (default: 18)
 * @param maxDecimals Maximum decimals to display (default: 4)
 * @param includeSymbol Whether to include token symbol (default: false)
 * @param symbol Token symbol
 * @returns Formatted token balance string
 */
export function formatTokenBalance(
  balance: number | string,
  decimals: number = 18,
  maxDecimals: number = 4,
  includeSymbol: boolean = false,
  symbol?: string
): string {
  if (balance === undefined || balance === null) {
    return includeSymbol && symbol ? `0 ${symbol}` : '0';
  }

  // Convert to number if string
  const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  // Apply decimals
  const adjustedBalance = numBalance / Math.pow(10, decimals);
  
  // Format with appropriate number of decimal places
  // Use toLocaleString for proper thousand separators
  const formattedBalance = adjustedBalance.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
  });
  
  // Add symbol if requested
  return includeSymbol && symbol ? `${formattedBalance} ${symbol}` : formattedBalance;
}

/**
 * Get user's token balance with proper formatting
 * @param user User profile
 * @param tokenAddress Token address
 * @param maxDecimals Maximum decimals to display (default: 4)
 * @param includeSymbol Whether to include token symbol (default: true)
 * @returns Formatted token balance string
 */
export function getUserTokenBalance(
  user: User | null,
  tokenAddress: string,
  maxDecimals: number = 4,
  includeSymbol: boolean = true
): string {
  if (!user || !tokenAddress) {
    return includeSymbol ? '0 -' : '0';
  }

  const normalizedAddress = tokenAddress.toLowerCase();
  const balance = user.tokenBalances[normalizedAddress];
  const decimals = user.tokenDecimals[normalizedAddress] || 18;
  const symbol = user.tokenSymbols[normalizedAddress] || '';

  return formatTokenBalance(balance, decimals, maxDecimals, includeSymbol, symbol);
}

/**
 * Check if user can submit a quest based on profile completion
 * @param user User profile
 * @param deviceType Device type ('mobile' or 'desktop')
 * @returns Object containing submission eligibility and reason if not eligible
 */
export function canSubmitQuest(
  user: User | null,
  deviceType: 'mobile' | 'desktop' = 'desktop'
): { 
  canSubmit: boolean; 
  reason?: string;
  missingFields?: string[];
} {
  if (!user) {
    return { 
      canSubmit: false, 
      reason: 'User profile not found' 
    };
  }

  const { isComplete, missingFields } = checkProfileCompletion(user, deviceType);

  if (!isComplete) {
    const fieldLabels = {
      displayName: 'Display Name',
      bio: 'Bio',
      profilePicture: 'Profile Picture'
    };

    const formattedFields = missingFields.map(
      field => fieldLabels[field as keyof typeof fieldLabels] || field
    );

    return {
      canSubmit: false,
      reason: `Please complete your profile before submitting. Missing: ${formattedFields.join(', ')}`,
      missingFields
    };
  }
  
  return { canSubmit: true };
}

/**
 * Update profile completion status based on device type
 * @param user User profile
 * @param deviceType Device type ('mobile' or 'desktop')
 * @returns Updated user data with completion status
 */
export function updateProfileCompletionStatus(
  user: User,
  deviceType: 'mobile' | 'desktop' = 'desktop'
): Partial<User> {
  const { isComplete } = checkProfileCompletion(user, deviceType);
  
  const updates: Partial<User> = {
    deviceType
  };
  
  if (deviceType === 'mobile') {
    updates.mobileProfileComplete = isComplete;
    updates.lastMobileAccess = user.lastMobileAccess || new Date() as any;
  } else {
    updates.profileComplete = isComplete;
    updates.lastDesktopAccess = user.lastDesktopAccess || new Date() as any;
  }
  
  return updates;
}

/**
 * Detect device type from user agent string
 * @param userAgent User agent string
 * @returns Device type ('mobile' or 'desktop')
 */
export function detectDeviceType(userAgent: string): 'mobile' | 'desktop' {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

/**
 * Detect device type from Next.js request
 * @param req Next.js request object
 * @returns Device type ('mobile' or 'desktop')
 */
export function detectDeviceTypeFromRequest(req: NextRequest): 'mobile' | 'desktop' {
  const userAgent = req.headers.get('user-agent') || '';
  return detectDeviceType(userAgent);
}