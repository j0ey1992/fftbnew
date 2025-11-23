'use client'

import { GlassCard } from './GlassCard'

interface StakingStatsProps {
  totalStaked?: number
  totalRewards?: string
  apr?: string
  className?: string
}

export function StakingStats({
  totalStaked = 0,
  totalRewards = '0.00',
  apr = '0.00',
  className = '',
}: StakingStatsProps) {
  return (
    <div className={`roo-dashboard ${className}`}>
      <GlassCard className="roo-stat-card animate-fade-in-up">
        <div className="roo-stat-card__label">Total Staked</div>
        <div className="roo-stat-card__value">{totalStaked} NFTs</div>
      </GlassCard>
      
      <GlassCard className="roo-stat-card animate-fade-in-up delay-100">
        <div className="roo-stat-card__label">Total Rewards</div>
        <div className="roo-stat-card__value">{totalRewards} ROO</div>
        <div className="roo-stat-card__change roo-stat-card__change--positive">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
          +0.05 ROO today
        </div>
      </GlassCard>
      
      <GlassCard className="roo-stat-card animate-fade-in-up delay-200">
        <div className="roo-stat-card__label">Current APR</div>
        <div className="roo-stat-card__value">{apr}%</div>
      </GlassCard>
      
      <GlassCard className="roo-stat-card animate-fade-in-up delay-300">
        <div className="roo-stat-card__label">Next Rewards</div>
        <div className="roo-stat-card__value">12h 30m</div>
        <div className="mt-2">
          <div className="progress">
            <div className="progress-bar progress-striped" style={{ width: '65%' }}></div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
