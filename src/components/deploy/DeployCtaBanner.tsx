'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import styles from '@/styles/components/Banner.module.css';
import '@/styles/components/DeployPage.css';

interface DeployCtaBannerProps {
  onStartDeployment: () => void;
}

export const DeployCtaBanner = ({ onStartDeployment }: DeployCtaBannerProps) => {
  return (
    <div className="crypto-card relative p-4 md:p-6">
      {/* Subtle background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600/50 via-blue-400/50 to-purple-500/50"></div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
            Ready to launch on‑chain?
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base mb-2">
            Deploy contracts in minutes on any supported EVM network – no deep Solidity knowledge required.
          </p>
        </div>
        
        <div className="md:flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={onStartDeployment}
            className="shadow-[0_0_16px_rgba(59,130,246,.6)] hover:scale-105 w-full md:w-auto"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};
