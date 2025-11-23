'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'
import { SafeImage } from './SafeImage'
import { getOptimizedIpfsUrl } from '@/lib/utils/ipfs-image-optimizer'

interface NftCardProps {
  id: string
  name: string
  image: string
  expireDate?: number
  selected?: boolean
  onClick?: () => void
  actionLabel?: string
  onAction?: () => void
  rewards?: string
  staked?: boolean
  borderGlow?: boolean
  collection?: string
  rarity?: string
}

export function NftCard({
  id,
  name,
  image,
  expireDate,
  selected = false,
  onClick,
  actionLabel = 'Stake',
  onAction,
  rewards,
  staked = false,
  borderGlow = false,
  collection,
  rarity
}: NftCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  // Format time remaining if expire date is provided
  const getTimeRemaining = () => {
    if (!expireDate) return null
    
    const now = Date.now()
    const timeLeft = expireDate - now
    
    if (timeLeft <= 0) {
      return 'Expired'
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${days}d ${hours}h ${minutes}m`
  }

  const timeRemaining = getTimeRemaining()
  
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAction) {
      setIsLoading(true)
      // In a real implementation, this would be an async call
      setTimeout(() => {
        onAction()
        setIsLoading(false)
      }, 1000)
    }
  }
  
  // Animation variants
  const cardVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  }
  
  return (
    <motion.div
      className="h-full"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onClick={onClick}
    >
      <div 
        className={`bg-gray-800/60 rounded-xl overflow-hidden border h-full ${
          selected 
            ? 'border-primary shadow-lg shadow-primary/20' 
            : borderGlow 
              ? 'border-accent shadow-lg shadow-accent/20' 
              : 'border-gray-700/50'
        } hover:border-primary/50 transition-colors`}
      >
        {/* Use aspect-square on mobile, aspect-[4/5] on sm+ */}
        <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-10"></div>
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            {image ? (
              <SafeImage
                src={getOptimizedIpfsUrl.thumbnail(image)}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
                fallbackSrc="/placeholder-nft.png"
              />
            ) : (
              // Fallback for when no image is provided
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium mb-1">No Image</span>
                  <span className="text-xs text-gray-500">{name}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
            {staked && (
              <span className="badge badge-primary shadow-lg bg-gradient-to-r from-primary to-primary-dark text-xs px-2 py-0.5 rounded-full text-white">
                Staked
              </span>
            )}
            {rarity && (
              <span className="badge bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md border-gray-700 shadow-lg text-xs px-2 py-0.5 rounded-full text-white">
                {rarity}
              </span>
            )}
          </div>
          
          {/* Selection indicator */}
          {selected && (
            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg z-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          )}
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="text-white font-medium text-sm sm:text-base truncate">{name}</h3>
          
          {collection && (
            <div className="text-xs text-gray-400 truncate mt-0.5 sm:mt-1">{collection}</div>
          )}
          
          {/* NFT Details */}
          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
            {timeRemaining && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Time left:</span>
                <span className="text-white font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {timeRemaining}
                </span>
              </div>
            )}
            
            {rewards && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Rewards:</span>
                <span className="text-green-400 font-medium">
                  {rewards}
                </span>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          {onAction && (
            <div className="mt-3 sm:mt-4">
              <Button
                variant="gradient"
                size="sm"
                fullWidth
                rounded="lg"
                isLoading={isLoading}
                onClick={handleAction}
                className="shadow-lg font-medium text-xs sm:text-sm py-1.5 sm:py-2"
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Touch indicator that fades in on hover to show the card can be selected */}
      {isHovering && onClick && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-black bg-opacity-30 text-white text-xs p-2 rounded-lg">
            Tap to select
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
