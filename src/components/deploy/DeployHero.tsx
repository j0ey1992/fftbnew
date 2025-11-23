'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import '@/styles/components/DeployPage.css';

interface DeployHeroProps {
  onStartDeployment: () => void;
}

export const DeployHero = ({ onStartDeployment }: DeployHeroProps) => {
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
      className="relative w-full overflow-hidden mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Compact hero section with glassmorphism */}
      <div className="crypto-card relative p-4 md:p-6">
        {/* Subtle background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600/50 via-blue-400/50 to-purple-500/50"></div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title section */}
            <motion.div variants={itemVariants} className="md:max-w-md">
              <div className="flex items-center mb-1">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  <span className="gradient-text">Deploy Your Blockchain Contract</span>
                </h1>
              </div>
              
              <p className="text-gray-300 text-sm md:text-base">
                Seamlessly create and launch contracts with Crypto.com's secure infrastructure.
              </p>
              
              <motion.div 
                variants={itemVariants}
                className="mt-4"
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={onStartDeployment}
                  className="shadow-[0_0_16px_rgba(59,130,246,.6)] hover:scale-105"
                >
                  Start Deployment
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Logo */}
            <motion.div variants={itemVariants} className="w-full md:w-auto flex justify-center">
              <Image 
                src="/kris-logo.svg" 
                alt="Crypto.com" 
                width={160} 
                height={52} 
                priority 
                className="opacity-90"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
