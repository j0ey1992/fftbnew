'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from './button'

interface SocialLink {
  name: string
  url: string
  icon: React.ReactNode
}

interface NftCollectionBannerProps {
  name: string
  description: string
  profileImage: string
  coverImage?: string
  stats?: {
    label: string
    value: string
  }[]
  socialLinks?: SocialLink[]
  className?: string
}

export function NftCollectionBanner({
  name,
  description,
  profileImage,
  coverImage,
  stats = [],
  socialLinks = [],
  className = "",
}: NftCollectionBannerProps) {
  // Animation variants for the banner elements
  const profileVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const statsVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const defaultCoverImage = 'https://picsum.photos/id/1035/1200/300'; // Default background if none provided

  return (
    <div className={`nft-collection-banner relative overflow-hidden rounded-2xl ${className}`}>
      {/* Background cover image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={coverImage || defaultCoverImage}
          alt={`${name} cover`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
      </div>
      
      {/* Content container */}
      <div className="relative p-6 z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile image */}
          <motion.div 
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg"
            variants={profileVariants}
            initial="initial"
            animate="animate"
          >
            <Image
              src={profileImage}
              alt={`${name} profile`}
              fill
              className="object-cover"
            />
            {/* Highlight ring effect */}
            <div className="absolute inset-0 ring-2 ring-white/20 rounded-full"></div>
          </motion.div>
          
          {/* Collection details */}
          <motion.div 
            className="flex-1 text-center md:text-left"
            variants={contentVariants}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">{name}</h1>
            
            <p className="text-gray-300 text-sm md:text-base mb-4 max-w-2xl">
              {description}
            </p>
            
            {/* Social links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800/50 hover:bg-gray-700/50 p-2 rounded-full transition-colors border border-gray-700/30"
                >
                  {link.icon}
                </a>
              ))}
              
              {/* If no social links are provided, show some placeholder icons */}
              {socialLinks.length === 0 && (
                <>
                  <a href="#" className="bg-gray-800/50 hover:bg-gray-700/50 p-2 rounded-full transition-colors border border-gray-700/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-800/50 hover:bg-gray-700/50 p-2 rounded-full transition-colors border border-gray-700/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-800/50 hover:bg-gray-700/50 p-2 rounded-full transition-colors border border-gray-700/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-800/50 hover:bg-gray-700/50 p-2 rounded-full transition-colors border border-gray-700/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Collection stats */}
        {stats.length > 0 && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 bg-gray-900/40 rounded-xl p-4 backdrop-blur-md border border-white/10"
            variants={statsVariants}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                <div className="text-white font-bold">{stat.value}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
