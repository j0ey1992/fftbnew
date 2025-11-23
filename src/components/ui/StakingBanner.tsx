'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'

interface StakingBannerProps {
  title?: string
  subtitle?: string
  buttons?: {
    label: string
    isActive: boolean
    onClick: () => void
  }[]
  className?: string
}

export function StakingBanner({
  title = "Stake and Earn",
  subtitle = "Forever free",
  buttons = [],
  className = "",
}: StakingBannerProps) {
  // Animation variants for the particle elements
  const particleVariants = {
    animate: {
      y: [0, -10, 0],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    }
  };

  // Animation variants for the badge
  const badgeVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    }
  };

  return (
    <div className={`staking-banner relative overflow-hidden rounded-2xl ${className}`}>
      {/* Background gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 z-0" />
      
      {/* Light particles */}
      <motion.div 
        className="absolute top-5 right-12 w-12 h-12 rounded-full bg-blue-400 opacity-10 blur-xl"
        variants={particleVariants}
        animate="animate"
        custom={0}
      />
      <motion.div 
        className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-indigo-400 opacity-10 blur-xl"
        variants={particleVariants}
        animate="animate"
        custom={1}
        style={{ animationDelay: "1s" }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-purple-400 opacity-10 blur-xl"
        variants={particleVariants}
        animate="animate"
        custom={2}
        style={{ animationDelay: "2s" }}
      />
      
      {/* Content container */}
      <div className="relative p-6 md:p-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            {/* Main title */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
              {title}
            </h1>
            
            {/* Subtitle */}
            <div className="flex items-center mb-5">
              <p className="text-blue-100 text-sm md:text-base opacity-90">
                {subtitle}
              </p>
              <motion.div 
                className="ml-3 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                variants={badgeVariants}
                animate="animate"
              >
                New
              </motion.div>
            </div>
          </div>
          
          {/* Token icon */}
          <div className="hidden md:block absolute top-6 right-8 bg-blue-600/30 p-3 rounded-full backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Filter buttons */}
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.isActive ? 'primary' : 'glass'}
                size="sm"
                onClick={button.onClick}
                className="rounded-full"
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-purple-500/10 z-1" />
      
      {/* Bottom curved line decoration */}
      <svg className="absolute bottom-0 left-0 right-0 w-full text-white/5" height="20" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,50 C400,10 800,90 1440,50 L1440,100 L0,100 Z" fill="currentColor" />
      </svg>
    </div>
  )
}
