'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, CompletedQuest } from '@/types/user'
import { Quest } from '@/types/quest'
import { useAppKitAccount } from '@reown/appkit/react'
import { MobileBottomSheet } from '@/components/ui/MobileBottomSheet'
import { formatNumber } from '@/lib/utils'

interface CompletedQuestWithData extends CompletedQuest {
  questData?: Quest
}

interface MobileProfileViewProps {
  user: User
  completedQuests: CompletedQuestWithData[]
  updateProfile?: (data: any) => Promise<any>
  isFollowing?: (address: string) => boolean
  follow?: (address: string) => Promise<void>
  unfollow?: (address: string) => Promise<void>
  followers?: User[]
  following?: User[]
}

export function MobileProfileView({
  user,
  completedQuests,
  updateProfile,
  isFollowing,
  follow,
  unfollow,
  followers = [],
  following = []
}: MobileProfileViewProps) {
  const { address } = useAppKitAccount()
  const [activeTab, setActiveTab] = useState<'stats' | 'quests' | 'social'>('stats')
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editFormData, setEditFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [followLoading, setFollowLoading] = useState(false)

  // Calculate stats
  const stats = {
    totalQuests: completedQuests.length,
    totalXP: user.xp || 0,
    level: user.level || 1,
    socialQuests: completedQuests.filter(q => q.questData?.category === 'social').length,
    contentQuests: completedQuests.filter(q => q.questData?.category === 'content').length,
    web3Quests: completedQuests.filter(q => q.questData?.category === 'web3').length,
  }

  // Calculate level progress
  const currentLevel = user.level || 1
  const currentXP = user.xp || 0
  const xpForCurrentLevel = (currentLevel - 1) * 100
  const xpForNextLevel = currentLevel * 100
  const xpProgress = currentXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progress = Math.min(100, Math.floor((xpProgress / xpNeeded) * 100))

  const handleFollowToggle = async () => {
    if (!follow || !unfollow || !isFollowing || followLoading) return
    
    setFollowLoading(true)
    try {
      if (isFollowing(user.address)) {
        await unfollow(user.address)
      } else {
        await follow(user.address)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!updateProfile) return
    
    setUpdateLoading(true)
    setUpdateError(null)
    
    try {
      await updateProfile(editFormData)
      setShowEditSheet(false)
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#041836] pb-20">
      {/* Profile Header */}
      <div className="bg-[#0a1e3d] border-b border-gray-700/50">
        <div className="px-4 py-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.displayName || 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">
                {user.displayName || `${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}`}
              </h1>
              <p className="text-sm text-gray-400">
                {user.bio || 'No bio provided'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {user.address === address?.toLowerCase() ? (
              <button
                onClick={() => setShowEditSheet(true)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing && isFollowing(user.address)
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${followLoading ? 'opacity-50' : ''}`}
              >
                {followLoading ? 'Loading...' : isFollowing && isFollowing(user.address) ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-white font-medium">Level {currentLevel}</span>
              <span className="text-gray-400">{xpProgress}/{xpNeeded} XP</span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <div className="bg-[#0a1e3d] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.totalQuests}</p>
          <p className="text-xs text-gray-400">Quests</p>
        </div>
        <div className="bg-[#0a1e3d] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{formatNumber(stats.totalXP)}</p>
          <p className="text-xs text-gray-400">Total XP</p>
        </div>
        <div className="bg-[#0a1e3d] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{followers.length}</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-[#0a1e3d] rounded-xl p-1 flex">
          {(['stats', 'quests', 'social'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Quest Categories */}
              <div className="bg-[#0a1e3d] rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Quest Categories</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Social</span>
                    <span className="text-blue-400 font-medium">{stats.socialQuests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Content</span>
                    <span className="text-purple-400 font-medium">{stats.contentQuests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Web3</span>
                    <span className="text-green-400 font-medium">{stats.web3Quests}</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-[#0a1e3d] rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`border-2 rounded-lg p-3 ${stats.totalQuests > 0 ? 'border-green-500' : 'border-gray-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      stats.totalQuests > 0 ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs text-white font-medium">First Quest</p>
                  </div>
                  <div className={`border-2 rounded-lg p-3 ${stats.totalQuests >= 10 ? 'border-green-500' : 'border-gray-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      stats.totalQuests >= 10 ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-white font-medium">Quest Master</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {completedQuests.length > 0 ? (
                completedQuests.map((quest) => (
                  <Link key={quest.questId} href={`/quests/${quest.questId}`}>
                    <div className="bg-[#0a1e3d] rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium flex-1">{quest.questData?.title || 'Unknown Quest'}</h4>
                        <span className="text-green-400 text-sm font-medium">+{quest.xpReward} XP</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{quest.questData?.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Completed {quest.completedAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-[#0a1e3d] rounded-xl p-8 text-center">
                  <p className="text-gray-400 mb-4">No completed quests yet</p>
                  <Link href="/quests">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                      Explore Quests
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Followers */}
              <div className="bg-[#0a1e3d] rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Followers ({followers.length})</h3>
                {followers.length > 0 ? (
                  <div className="space-y-2">
                    {followers.slice(0, 5).map((follower) => (
                      <Link key={follower.id} href={`/profile?address=${follower.address}`}>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                            {follower.profilePicture ? (
                              <Image
                                src={follower.profilePicture}
                                alt={follower.displayName || 'User'}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{follower.displayName || 'Anonymous'}</p>
                            <p className="text-xs text-gray-400">Level {follower.level}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No followers yet</p>
                )}
              </div>

              {/* Following */}
              <div className="bg-[#0a1e3d] rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Following ({following.length})</h3>
                {following.length > 0 ? (
                  <div className="space-y-2">
                    {following.slice(0, 5).map((user) => (
                      <Link key={user.id} href={`/profile?address=${user.address}`}>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                            {user.profilePicture ? (
                              <Image
                                src={user.profilePicture}
                                alt={user.displayName || 'User'}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{user.displayName || 'Anonymous'}</p>
                            <p className="text-xs text-gray-400">Level {user.level}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Not following anyone yet</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        title="Edit Profile"
        height="auto"
      >
        <div className="px-4 pb-6 space-y-4">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {editFormData.profilePicture ? (
                <Image
                  src={editFormData.profilePicture}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xs mt-1">Upload</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setEditFormData(prev => ({
                        ...prev,
                        profilePicture: reader.result as string
                      }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
            <input
              type="text"
              value={editFormData.displayName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 bg-[#041836] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
            <textarea
              value={editFormData.bio}
              onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 py-2 bg-[#041836] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Tell us about yourself"
            />
          </div>

          {updateError && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-sm text-red-400">{updateError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleProfileUpdate}
              disabled={updateLoading}
              className={`flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors ${
                updateLoading ? 'opacity-50' : ''
              }`}
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setShowEditSheet(false)}
              disabled={updateLoading}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  )
}