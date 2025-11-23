'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { 
  FaTrophy, 
  FaRoad, 
  FaUsers, 
  FaCoins, 
  FaUserTie,
  FaHandshake 
} from 'react-icons/fa';

interface ProjectTabsProps {
  modules: {
    quests: boolean;
    roadmap: boolean;
    tokenomics: boolean;
    team: boolean;
    partners: boolean;
    community: boolean;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabConfig = {
  quests: {
    label: 'Quests',
    icon: FaTrophy,
    description: 'Complete quests and earn rewards'
  },
  roadmap: {
    label: 'Roadmap',
    icon: FaRoad,
    description: 'Project milestones and future plans'
  },
  community: {
    label: 'Community',
    icon: FaUsers,
    description: 'Join our growing community'
  },
  tokenomics: {
    label: 'Tokenomics',
    icon: FaCoins,
    description: 'Token distribution and economics'
  },
  team: {
    label: 'Team',
    icon: FaUserTie,
    description: 'Meet the people behind the project'
  },
  partners: {
    label: 'Partners',
    icon: FaHandshake,
    description: 'Our strategic partnerships'
  }
};

export function ProjectTabs({ modules, activeTab, onTabChange }: ProjectTabsProps) {
  // Filter tabs based on enabled modules
  const availableTabs = Object.entries(modules)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);

  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto py-4 scrollbar-hide">
          {availableTabs.map((tab) => {
            const config = tabConfig[tab as keyof typeof tabConfig];
            if (!config) return null;

            const Icon = config.icon;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap',
                  'hover:bg-white/5',
                  isActive ? [
                    'bg-gradient-to-r from-blue-500/20 to-purple-500/20',
                    'text-white border border-white/10'
                  ] : [
                    'text-gray-400 hover:text-white',
                    'border border-transparent'
                  ]
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{config.label}</span>
                {isActive && (
                  <span className="hidden md:inline text-xs text-gray-400">
                    • Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}