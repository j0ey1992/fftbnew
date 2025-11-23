'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from './button'
import styles from '@/styles/components/Card.module.css'

interface CoinStakingCardProps {
  id: string
  name: string
  image: string
  apr: string
  description?: string
  balance?: string
  stakedAmount?: string
  earnedRewards?: string
  onClick?: () => void
  className?: string
}

import { useRouter } from 'next/navigation'

export function CoinStakingCard({
  id,
  name,
  image,
  apr,
  description,
  balance,
  stakedAmount,
  earnedRewards,
  onClick,
  className = '',
}: CoinStakingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  
  const toggleExpand = () => {
    setExpanded(!expanded)
  }
  
  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else if (expanded) {
      // If card is already expanded, navigate to staking page
      router.push(`/stake/${id}`)
    } else {
      // Otherwise just expand the card
      setExpanded(true)
    }
  }
  
  return (
    <div 
      className={`${styles.stakingCard} ${className} ${expanded ? 'border-blue-500/30' : ''}`}
      onClick={handleCardClick}
    >
      {/* Card Header - Always visible */}
      <div className={styles.stakingCardContent}>
        <div className={styles.coinIcon}>
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            className="object-cover rounded-full"
          />
        </div>
        
        <div className={styles.coinInfo}>
          <h3 className={styles.coinName}>{name}</h3>
          <p className={styles.coinDescription}>
            {description || `Stake ${name} and earn rewards`}
          </p>
        </div>
        
        <div className={styles.aprContainer}>
          <div className={styles.aprValue}>{apr}</div>
          <div className={styles.aprLabel}>APR</div>
        </div>
      </div>
      
      {/* Expandable Section */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-800/40 animate-fade-in">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {balance && (
              <div className="p-3 rounded-lg bg-black/20">
                <div className="text-xs text-gray-400 mb-1 font-medium">Available Balance</div>
                <div className="text-sm font-medium text-white flex items-center">
                  <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded mr-1.5">{name}</span>
                  {balance}
                </div>
              </div>
            )}
            
            {stakedAmount && (
              <div className="p-3 rounded-lg bg-black/20">
                <div className="text-xs text-gray-400 mb-1 font-medium">Staked Amount</div>
                <div className="text-sm font-medium text-white flex items-center">
                  <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded mr-1.5">{name}</span>
                  {stakedAmount}
                </div>
              </div>
            )}
            
            {earnedRewards && (
              <div className="p-3 rounded-lg bg-black/20">
                <div className="text-xs text-gray-400 mb-1 font-medium">Earned Rewards</div>
                <div className="text-sm font-medium text-green-500 flex items-center">
                  <span className="text-xs bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded mr-1.5">{name}</span>
                  {earnedRewards}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="primary" 
              size="sm" 
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/stake/${id}`);
              }}
            >
              Stake
            </Button>
            
            {stakedAmount && parseFloat(stakedAmount) > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                onClick={(e) => e.stopPropagation()}
              >
                Unstake
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
