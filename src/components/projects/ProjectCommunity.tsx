'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { 
  FaUsers, 
  FaTrophy, 
  FaCoins, 
  FaChartLine,
  FaTwitter,
  FaDiscord,
  FaTelegram
} from 'react-icons/fa';

interface ProjectCommunityProps {
  project: any;
  stats: {
    totalQuests: number;
    activeQuests: number;
    totalParticipants: number;
    totalRewardsDistributed: string;
    followers: number;
  };
}

export function ProjectCommunity({ project, stats }: ProjectCommunityProps) {
  const socialLinks = project.socialLinks || {};
  
  const communityStats = [
    {
      label: 'Community Members',
      value: stats.followers || 0,
      icon: FaUsers,
      color: 'text-blue-400'
    },
    {
      label: 'Active Participants',
      value: stats.totalParticipants || 0,
      icon: FaChartLine,
      color: 'text-green-400'
    },
    {
      label: 'Quests Completed',
      value: stats.totalQuests || 0,
      icon: FaTrophy,
      color: 'text-yellow-400'
    },
    {
      label: 'Rewards Distributed',
      value: `$${stats.totalRewardsDistributed || '0'}`,
      icon: FaCoins,
      color: 'text-purple-400'
    }
  ];

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: socialLinks.twitter,
      color: 'hover:bg-blue-500/20 hover:text-blue-400'
    },
    {
      name: 'Discord',
      icon: FaDiscord,
      url: socialLinks.discord,
      color: 'hover:bg-indigo-500/20 hover:text-indigo-400'
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: socialLinks.telegram,
      color: 'hover:bg-sky-500/20 hover:text-sky-400'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Community</h2>
        <p className="text-gray-400">
          Join our vibrant community and be part of the journey
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {communityStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-xs text-gray-500">
                  +{Math.floor(Math.random() * 20 + 5)}% this month
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Social Platforms */}
      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold mb-6">Join Our Community</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            
            if (!platform.url) {
              return (
                <div
                  key={platform.name}
                  className="flex flex-col items-center justify-center p-6 rounded-lg border border-white/5 bg-white/2 opacity-50"
                >
                  <Icon className="w-12 h-12 text-gray-600 mb-3" />
                  <span className="text-gray-500">{platform.name}</span>
                  <span className="text-xs text-gray-600 mt-1">Coming Soon</span>
                </div>
              );
            }
            
            return (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-6 rounded-lg border border-white/10 bg-white/5 transition-all ${platform.color}`}
              >
                <Icon className="w-12 h-12 mb-3" />
                <span className="font-medium">{platform.name}</span>
                <span className="text-xs text-gray-400 mt-1">Join Now</span>
              </a>
            );
          })}
        </div>
      </GlassCard>

      {/* Community Activities */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6">Recent Community Activities</h3>
        <GlassCard className="p-6">
          <div className="space-y-4">
            {/* Placeholder activities - would be fetched from API */}
            {[
              { user: '0x1234...5678', action: 'completed quest', quest: 'DeFi Master Challenge', time: '2 hours ago' },
              { user: '0xabcd...efgh', action: 'earned reward', amount: '100 ROO', time: '5 hours ago' },
              { user: '0x9876...5432', action: 'joined community', time: '1 day ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-400"> {activity.action}</span>
                      {activity.quest && <span className="text-blue-400"> "{activity.quest}"</span>}
                      {activity.amount && <span className="text-green-400"> {activity.amount}</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}