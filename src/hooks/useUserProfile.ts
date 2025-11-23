'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';
import {
  getUserProfile,
  updateUserProfile,
  addUserXP,
  addCompletedQuest,
  getTopUsers,
  followUser,
  unfollowUser,
  shareQuest,
  getUserFollowers,
  getUserFollowing
} from '@/lib/firebase/user-profile';
import { ensureUserProfileExists } from '@/lib/firebase/user-profile-functions';
import { useAppKitAccount } from '@reown/appkit/react';
import { normalizeAddress } from '@/utils/addressUtils';
import { profileDebug } from '@/utils/debugUtils';
import { updateProfileCompletionStatus, checkProfileCompletion } from '@/lib/profileUtils';

export default function useUserProfile() {
  const { address, isConnected, status } = useAppKitAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileCreationAttempted, setProfileCreationAttempted] = useState<boolean>(false);
  
  // Load user profile when wallet is connected
  useEffect(() => {
    if (!isConnected || !address) {
      setUser(null);
      setLoading(false);
      setProfileCreationAttempted(false);
      return;
    }
    
    // Check if we've already attempted profile creation for this address in this session
    const hasAttemptedProfileCreation = sessionStorage.getItem(`hook_profile_creation_attempted_${address}`);
    
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to get the existing profile
        const normalizedAddr = normalizeAddress(address);
        profileDebug.addressNormalization(address, normalizedAddr);
        
        // Try to get the profile
        const profile = await getUserProfile(normalizedAddr);
        
        if (profile) {
          setUser(profile);
          profileDebug.fetchSuccess(normalizedAddr);
          // Clear any profile creation flags if we successfully loaded a profile
          sessionStorage.removeItem(`hook_profile_creation_attempted_${address}`);
        } else {
          profileDebug.fetchNotFound(normalizedAddr);
          
          // If profile doesn't exist and we haven't tried to create one yet, create it
          if (!profileCreationAttempted && !hasAttemptedProfileCreation) {
            setProfileCreationAttempted(true);
            // Store in session storage to prevent infinite attempts across hook re-renders
            sessionStorage.setItem(`hook_profile_creation_attempted_${address}`, 'true');
            
            // Create a new profile
            profileDebug.createAttempt(normalizedAddr);
            const newProfile = await ensureUserProfileExists(normalizedAddr);
            
            if (newProfile) {
              setUser(newProfile);
              profileDebug.createSuccess(normalizedAddr);
            } else {
              profileDebug.createError(normalizedAddr, "Failed to create profile");
              setError('Failed to create user profile');
            }
          } else {
            // We've already tried to create a profile but it still doesn't exist
            setError('Profile not found and creation failed');
          }
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        profileDebug.fetchError(address, err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [isConnected, address, profileCreationAttempted]);
  
  // Update user profile
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    console.log("[DEBUG] useUserProfile.updateProfile - Called with data:", userData);
    console.log("[DEBUG] useUserProfile.updateProfile - Current user state:", user);
    console.log("[DEBUG] useUserProfile.updateProfile - Connection status:", { isConnected, address });
    
    if (!isConnected || !address) {
      console.log("[DEBUG] useUserProfile.updateProfile - Error: Wallet not connected");
      setError('Wallet not connected');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine device type from user data or use current value
      const deviceType = userData.deviceType || user?.deviceType || 'desktop';
      console.log("[DEBUG] useUserProfile.updateProfile - Using device type:", deviceType);
      
      // Create a copy of the user data to update
      const updatedData = { ...userData };
      
      // If we have the current user, update profile completion status
      if (user) {
        // Merge current user with updates to check completion
        const mergedUser = { ...user, ...updatedData } as User;
        
        // Update profile completion status based on device type
        const completionUpdates = updateProfileCompletionStatus(mergedUser, deviceType);
        console.log("[DEBUG] useUserProfile.updateProfile - Completion updates:", completionUpdates);
        
        // Merge completion updates with user data
        Object.assign(updatedData, completionUpdates);
      }
      
      console.log("[DEBUG] useUserProfile.updateProfile - Final update data:", updatedData);
      const updatedProfile = await updateUserProfile(address, updatedData);
      console.log("[DEBUG] useUserProfile.updateProfile - Update successful:", updatedProfile);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating user profile:', err);
      console.log("[DEBUG] useUserProfile.updateProfile - Error details:", err);
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, user]);
  
  // Add XP to user profile
  const addXP = useCallback(async (xpAmount: number) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }
    
    if (xpAmount <= 0) {
      setError('XP amount must be positive');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await addUserXP(address, xpAmount);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error adding XP to user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to add XP to user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);
  
  // Add completed quest to user profile
  const completeQuest = useCallback(async (questId: string, xpReward: number = 0) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }
    
    if (!questId) {
      setError('Quest ID is required');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await addCompletedQuest(address, questId, xpReward);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error adding completed quest to user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to add completed quest to user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);
  
  // Get top users (leaderboard)
  const getLeaderboard = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const topUsers = await getTopUsers(limit);
      return topUsers;
    } catch (err) {
      console.error('Error getting leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to get leaderboard');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Check if user has completed a quest
  const hasCompletedQuest = useCallback((questId: string) => {
    if (!user || !user.completedQuests || user.completedQuests.length === 0) {
      return false;
    }
    
    return user.completedQuests.some(quest => quest.questId === questId);
  }, [user]);
  
  // Get user level progress
  const getLevelProgress = useCallback(() => {
    if (!user) {
      return { level: 1, xp: 0, nextLevelXP: 100, progress: 0 };
    }
    
    const currentLevel = user.level || 1;
    const currentXP = user.xp || 0;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progress = Math.min(100, Math.floor((xpProgress / xpNeeded) * 100));
    
    return {
      level: currentLevel,
      xp: currentXP,
      nextLevelXP: xpForNextLevel,
      progress
    };
  }, [user]);
  
  // Follow a user
  const follow = useCallback(async (followeeAddress: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }
    
    if (!followeeAddress) {
      setError('Followee address is required');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await followUser(address, followeeAddress);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error following user:', err);
      setError(err instanceof Error ? err.message : 'Failed to follow user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);
  
  // Unfollow a user
  const unfollow = useCallback(async (followeeAddress: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }
    
    if (!followeeAddress) {
      setError('Followee address is required');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await unfollowUser(address, followeeAddress);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to unfollow user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);
  
  // Share a quest
  const share = useCallback(async (
    questId: string,
    platform: 'twitter' | 'discord' | 'telegram' | 'other',
    url?: string
  ) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }
    
    if (!questId) {
      setError('Quest ID is required');
      return null;
    }
    
    if (!platform) {
      setError('Platform is required');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await shareQuest(address, questId, platform, url);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error sharing quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to share quest');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);
  
  // Get followers
  const getFollowers = useCallback(async (userAddress?: string, limit: number = 10) => {
    const targetAddress = userAddress || address;
    
    if (!targetAddress) {
      setError('Address is required');
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const followers = await getUserFollowers(targetAddress, limit);
      return followers;
    } catch (err) {
      console.error('Error getting followers:', err);
      setError(err instanceof Error ? err.message : 'Failed to get followers');
      return [];
    } finally {
      setLoading(false);
    }
  }, [address]);
  
  // Get following
  const getFollowing = useCallback(async (userAddress?: string, limit: number = 10) => {
    const targetAddress = userAddress || address;
    
    if (!targetAddress) {
      setError('Address is required');
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const following = await getUserFollowing(targetAddress, limit);
      return following;
    } catch (err) {
      console.error('Error getting following:', err);
      setError(err instanceof Error ? err.message : 'Failed to get following');
      return [];
    } finally {
      setLoading(false);
    }
  }, [address]);
  
  // Check if user is following another user
  const isFollowing = useCallback((followeeAddress: string) => {
    if (!user || !user.following || user.following.length === 0) {
      return false;
    }
    
    return user.following.includes(followeeAddress.toLowerCase());
  }, [user]);
  
  // Get profile completion status
  const getProfileCompletionStatus = useCallback((deviceType?: 'mobile' | 'desktop') => {
    const currentDeviceType = deviceType || user?.deviceType || 'desktop';
    return checkProfileCompletion(user, currentDeviceType);
  }, [user]);
  
  // Update device type
  const updateDeviceType = useCallback(async (deviceType: 'mobile' | 'desktop') => {
    if (!user) return null;
    
    // Only update if device type has changed
    if (user.deviceType !== deviceType) {
      return await updateProfile({ deviceType });
    }
    
    return user;
  }, [user, updateProfile]);

  return {
    user,
    loading,
    error,
    updateProfile,
    addXP,
    completeQuest,
    getLeaderboard,
    hasCompletedQuest,
    getLevelProgress,
    follow,
    unfollow,
    share,
    getFollowers,
    getFollowing,
    isFollowing,
    getProfileCompletionStatus,
    updateDeviceType
  };
}
