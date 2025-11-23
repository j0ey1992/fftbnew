'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HoverGlowProps {
  children: ReactNode
  className?: string
  scale?: number
  brightness?: number
  borderGlow?: boolean
  onClick?: () => void
}

export const HoverGlow = ({
  children,
  className = '',
  scale = 1.02,
  brightness = 1.04,
  borderGlow = false,
  onClick,
}: HoverGlowProps) => {
  return (
    <motion.div
      className={`relative ${borderGlow ? 'group' : ''} ${className}`}
      whileHover={{
        scale,
        filter: `brightness(${brightness})`,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onClick={onClick}
    >
      {borderGlow && (
        <motion.div
          className="absolute -inset-0.5 rounded-inherit bg-gradient-to-br from-blue-500/30 to-purple-500/30 opacity-0 blur-sm -z-10 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}
      {children}
    </motion.div>
  )
}
