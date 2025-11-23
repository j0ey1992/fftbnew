'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function ComingSoonOverlay() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none"
    >
      {/* Light background overlay to see site behind */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] pointer-events-auto" />
      
      {/* Coming Soon Container with Kris */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="relative pointer-events-auto max-w-md w-full mx-4"
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50" />
        </div>
        
        {/* Main content - glass panel style matching the theme */}
        <div className="relative glass-panel-dark p-6 md:p-8 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
              animation: 'slide 20s linear infinite'
            }} />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Kris Character */}
            <motion.div 
              className="relative w-32 h-32 mx-auto mb-4"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/krischar.png"
                alt="Kris"
                width={128}
                height={128}
                className="object-contain"
                unoptimized
              />
              
              {/* Wrench/Tool Animation */}
              <motion.div
                className="absolute -right-2 bottom-2 text-2xl"
                animate={{ 
                  rotate: [-20, 20, -20],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🔧
              </motion.div>
              
              {/* Sparkles around Kris */}
              <motion.div
                className="absolute -left-2 top-4 text-lg"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.2
                }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute -right-4 top-8 text-lg"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.8
                }}
              >
                ✨
              </motion.div>
            </motion.div>
            
            {/* COMING SOON Text */}
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-3 text-center"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-gradient">COMING SOON</span>
            </motion.h1>
            
            {/* Message */}
            <p className="text-center text-white/70 text-sm md:text-base mb-4">
              Kris is putting the finishing touches on something special
            </p>
            
            {/* Progress bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "85%" }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  ease: "easeOut"
                }}
              />
            </div>
            <p className="text-center text-white/50 text-xs mt-2">
              85% Complete
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}