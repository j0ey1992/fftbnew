'use client'

import { motion } from 'framer-motion'
import { SafeImage } from './SafeImage'
import { useState } from 'react'

interface MobileStakingCardProps {
  title: string
  apr: string
  tvl: string
  stakedAmount?: string
  rewardToken: string
  stakingToken: string
  imageUrl?: string
  type: 'live' | 'ended'
  onStakeClick: () => void
  onDetailsClick: () => void
}

export function MobileStakingCard({
  title,
  apr,
  tvl,
  stakedAmount,
  rewardToken,
  stakingToken,
  imageUrl,
  type,
  onStakeClick,
  onDetailsClick
}: MobileStakingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.div
      className="bg-[#0a1e3d] rounded-2xl border border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Card Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Token Image */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
            <SafeImage
              src={imageUrl || '/Roo.png'}
              alt={title}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              fallbackSrc="/Roo.png"
            />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Stake {stakingToken}</span>
              <span className="text-xs text-gray-600">→</span>
              <span className="text-xs text-gray-400">Earn {rewardToken}</span>
            </div>
          </div>
          
          {/* APR Badge */}
          <div className="text-right flex-shrink-0">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              type === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {apr}
            </div>
          </div>
        </div>
        
        {/* Quick Stats - Always Visible */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-[#041836] rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">TVL</p>
            <p className="text-sm font-medium text-white">{tvl}</p>
          </div>
          {stakedAmount && (
            <div className="bg-[#041836] rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Your Stake</p>
              <p className="text-sm font-medium text-white">{stakedAmount}</p>
            </div>
          )}
        </div>
        
        {/* Expand Indicator */}
        <motion.div 
          className="flex justify-center mt-2"
          animate={{ rotate: isExpanded ? 180 : 0 }}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-700/50"
          >
            <div className="p-4 space-y-3">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStakeClick()
                  }}
                  className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
                >
                  Stake
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDetailsClick()
                  }}
                  className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                >
                  Details
                </button>
              </div>
              
              {/* Additional Info */}
              <div className="text-xs text-gray-400 text-center">
                {type === 'live' ? 'Pool is active' : 'Pool has ended'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Fix AnimatePresence import
import { AnimatePresence } from 'framer-motion'