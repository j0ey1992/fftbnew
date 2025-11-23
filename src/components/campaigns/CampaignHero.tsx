'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

interface CampaignHeroProps {
  totalCampaigns: number;
  totalRewards: number;
  totalParticipants: number;
  tokenSymbol?: string;
}

export const CampaignHero = ({ 
  totalCampaigns, 
  totalRewards, 
  totalParticipants,
  tokenSymbol = 'KRIS'
}: CampaignHeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      ref={heroRef}
      className="relative w-full overflow-hidden mb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced hero section with crypto.com-style glassmorphism */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1429]/90 to-[#0e1429]/80 backdrop-blur-md"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8b5cf6]/5 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#a855f7]/5 rounded-full blur-[100px]"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-3"></div>
        
        {/* Top accent line - campaign style */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#8b5cf6]/30 via-[#a855f7]/40 to-[#8b5cf6]/30"></div>
        
        <div className="relative p-8 md:p-10 z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Title section - refined typography */}
              <motion.div variants={itemVariants} className="md:max-w-md">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#8b5cf6] to-[#a855f7] rounded-full mr-3"></div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] bg-clip-text text-transparent">
                      User Campaigns
                    </span>
                  </h1>
                </div>
                
                <p className="text-gray-400 md:text-lg font-light">
                  Create and participate in community-driven quests
                </p>
              </motion.div>
              
              {/* Stats cards - enhanced with glass effect */}
              <motion.div variants={itemVariants} className="w-full md:w-auto">
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  {/* Total Campaigns */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {totalCampaigns.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 font-medium">
                      Campaigns
                    </div>
                  </div>
                  
                  {/* Total Rewards */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {totalRewards.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 font-medium">
                      {tokenSymbol} Rewards
                    </div>
                  </div>
                  
                  {/* Total Participants */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {totalParticipants.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 font-medium">
                      Participants
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};