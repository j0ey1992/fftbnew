'use client'

import React from 'react'
import { motion } from 'framer-motion'
import styles from '@/styles/components/Banner.module.css'

interface HeroBannerProps {
  title: string
  subtitle: string
  ctaText?: string
  onCtaClick?: () => void
  onDismiss?: () => void
  className?: string
}

export function HeroBanner({
  title,
  subtitle,
  ctaText = 'Get Started',
  onCtaClick,
  onDismiss,
  className = ''
}: HeroBannerProps) {
  return (
    <motion.div 
      className={`${styles.banner} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className={styles.dismissButton}
          aria-label="Dismiss banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {/* Floating particles */}
      <div className={`${styles.particle}`}></div>
      <div className={`${styles.particle}`}></div>
      <div className={`${styles.particle}`}></div>
      
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h2 
          className={`${styles.heroText} text-gradient`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {title}
        </motion.h2>
        
        <motion.p 
          className={styles.subtext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>
        
        {ctaText && (
          <motion.button 
            onClick={onCtaClick} 
            className="btn-glass px-6 py-3 rounded-full font-semibold text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{ctaText}</span>
            <span className="btn-shine-effect"></span>
          </motion.button>
        )}
      </motion.div>
      
      <motion.div 
        className={styles.accent}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      ></motion.div>
    </motion.div>
  )
}
