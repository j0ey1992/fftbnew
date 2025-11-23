'use client';

import { User } from '@/types/user';
import {
  getUserProfileFunction,
  updateUserProfileFunction,
  addUserXPFunction,
  addCompletedQuestFunction,
  getTopUsersFunction,
  followUserFunction,
  unfollowUserFunction,
  shareQuestFunction,
  getUserFollowersFunction,
  getUserFollowingFunction,
  ensureUserProfileExists
} from './user-profile-functions';
import { normalizeAddress } from '@/utils/addressUtils';
import { profileDebug } from '@/utils/debugUtils';

/**
 * Get a user profile by address
 * @param address User's wallet address
 * @returns User profile or null if not found
 */
export async function getUserProfile(address: string): Promise<User | null> {
  if (!address) return null;
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await getUserProfileFunction(normalizedAddr);
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Ensure a user profile exists, creating it if it doesn't
 * @param address User's wallet address
 * @returns User profile
 */
export async function ensureProfile(address: string): Promise<User | null> {
  if (!address) return null;
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await ensureUserProfileExists(normalizedAddr);
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    throw error;
  }
}

/**
 * Create or update a user profile
 * @param address User's wallet address
 * @param userData User profile data to update
 * @returns Updated user profile
 */
export async function updateUserProfile(address: string, userData: Partial<User>): Promise<User> {
  if (!address) throw new Error('Address is required');
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await updateUserProfileFunction(normalizedAddr, userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Add XP to a user profile
 * @param address User's wallet address
 * @param xpAmount Amount of XP to add
 * @returns Updated user profile
 */
export async function addUserXP(address: string, xpAmount: number): Promise<User> {
  if (!address) throw new Error('Address is required');
  if (xpAmount <= 0) throw new Error('XP amount must be positive');
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await addUserXPFunction(normalizedAddr, xpAmount);
  } catch (error) {
    console.error('Error adding user XP:', error);
    throw error;
  }
}

/**
 * Add a completed quest to a user profile
 * @param address User's wallet address
 * @param questId ID of the completed quest
 * @param xpReward XP reward for completing the quest
 * @returns Updated user profile
 */
export async function addCompletedQuest(
  address: string, 
  questId: string, 
  xpReward: number = 0
): Promise<User> {
  if (!address) throw new Error('Address is required');
  if (!questId) throw new Error('Quest ID is required');
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await addCompletedQuestFunction(normalizedAddr, questId, xpReward);
  } catch (error) {
    console.error('Error adding completed quest:', error);
    throw error;
  }
}

/**
 * Get top users by XP (leaderboard)
 * @param limitCount Number of users to return
 * @returns Array of user profiles sorted by XP
 */
export async function getTopUsers(limitCount: number = 10): Promise<User[]> {
  try {
    return await getTopUsersFunction(limitCount);
  } catch (error) {
    console.error('Error getting top users:', error);
    throw error;
  }
}

/**
 * Follow a user
 * @param followerAddress Address of the user who is following
 * @param followeeAddress Address of the user to follow
 * @returns Updated user profile of the follower
 */
export async function followUser(
  followerAddress: string,
  followeeAddress: string
): Promise<User> {
  if (!followerAddress) throw new Error('Follower address is required');
  if (!followeeAddress) throw new Error('Followee address is required');
  if (followerAddress === followeeAddress) throw new Error('Cannot follow yourself');
  
  const normalizedFollowerAddr = normalizeAddress(followerAddress);
  const normalizedFolloweeAddr = normalizeAddress(followeeAddress);
  profileDebug.addressNormalization(followerAddress, normalizedFollowerAddr);
  profileDebug.addressNormalization(followeeAddress, normalizedFolloweeAddr);
  
  try {
    return await followUserFunction(normalizedFollowerAddr, normalizedFolloweeAddr);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 * @param followerAddress Address of the user who is unfollowing
 * @param followeeAddress Address of the user to unfollow
 * @returns Updated user profile of the follower
 */
export async function unfollowUser(
  followerAddress: string,
  followeeAddress: string
): Promise<User> {
  if (!followerAddress) throw new Error('Follower address is required');
  if (!followeeAddress) throw new Error('Followee address is required');
  
  const normalizedFollowerAddr = normalizeAddress(followerAddress);
  const normalizedFolloweeAddr = normalizeAddress(followeeAddress);
  profileDebug.addressNormalization(followerAddress, normalizedFollowerAddr);
  profileDebug.addressNormalization(followeeAddress, normalizedFolloweeAddr);
  
  try {
    return await unfollowUserFunction(normalizedFollowerAddr, normalizedFolloweeAddr);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Share a quest on social media
 * @param address User's wallet address
 * @param questId ID of the quest to share
 * @param platform Platform where the quest was shared
 * @param url URL of the share (if available)
 * @returns Updated user profile
 */
export async function shareQuest(
  address: string,
  questId: string,
  platform: 'twitter' | 'discord' | 'telegram' | 'other',
  url?: string
): Promise<User> {
  if (!address) throw new Error('Address is required');
  if (!questId) throw new Error('Quest ID is required');
  if (!platform) throw new Error('Platform is required');
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await shareQuestFunction(normalizedAddr, questId, platform, url);
  } catch (error) {
    console.error('Error sharing quest:', error);
    throw error;
  }
}

/**
 * Get followers of a user
 * @param address User's wallet address
 * @param limitCount Maximum number of followers to return
 * @returns Array of user profiles
 */
export async function getUserFollowers(
  address: string,
  limitCount: number = 10
): Promise<User[]> {
  if (!address) throw new Error('Address is required');
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await getUserFollowersFunction(normalizedAddr, limitCount);
  } catch (error) {
    console.error('Error getting user followers:', error);
    throw error;
  }
}

/**
 * Get users followed by a user
 * @param address User's wallet address
 * @param limitCount Maximum number of followed users to return
 * @returns Array of user profiles
 */
export async function getUserFollowing(
  address: string,
  limitCount: number = 10
): Promise<User[]> {
  if (!address) throw new Error('Address is required');
  
  const normalizedAddr = normalizeAddress(address);
  profileDebug.addressNormalization(address, normalizedAddr);
  
  try {
    return await getUserFollowingFunction(normalizedAddr, limitCount);
  } catch (error) {
    console.error('Error getting user following:', error);
    throw error;
  }
}
