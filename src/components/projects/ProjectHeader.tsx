'use client';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  FaTwitter, 
  FaDiscord, 
  FaTelegram, 
  FaGithub, 
  FaMedium, 
  FaGlobe,
  FaCheckCircle,
  FaUserPlus,
  FaEdit
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectHeaderProps {
  project: any;
  isFollowing: boolean;
  onFollow: () => void;
  isAdmin?: boolean;
}

export function ProjectHeader({ project, isFollowing, onFollow, isAdmin }: ProjectHeaderProps) {
  const profile = project.profile || {};
  const socialLinks = project.socialLinks || {};
  
  // Get display values from either V2 structure or legacy structure
  const name = profile.name || project.name || 'Unnamed Project';
  const description = profile.description || project.description || '';
  const logo = profile.logo || project.logo || '/default-logo.png';
  const banner = profile.banner || project.banner || '/default-banner.jpg';
  
  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={banner}
          alt={`${name} banner`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>
      
      {/* Project Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm p-1">
                  <Image
                    src={logo}
                    alt={`${name} logo`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {project.verified && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                      {name}
                      {project.verified && (
                        <span className="text-sm font-normal text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-400 mb-4 max-w-2xl">{description}</p>
                    
                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                      {socialLinks.website && (
                        <a
                          href={socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaGlobe className="w-5 h-5" />
                        </a>
                      )}
                      {socialLinks.twitter && (
                        <a
                          href={socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {socialLinks.discord && (
                        <a
                          href={socialLinks.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaDiscord className="w-5 h-5" />
                        </a>
                      )}
                      {socialLinks.telegram && (
                        <a
                          href={socialLinks.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaTelegram className="w-5 h-5" />
                        </a>
                      )}
                      {socialLinks.github && (
                        <a
                          href={socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaGithub className="w-5 h-5" />
                        </a>
                      )}
                      {socialLinks.medium && (
                        <a
                          href={socialLinks.medium}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FaMedium className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <Button
                      variant={isFollowing ? 'secondary' : 'primary'}
                      size="md"
                      onClick={onFollow}
                      className="min-w-[120px]"
                    >
                      <FaUserPlus className="w-4 h-4 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    
                    {isAdmin && (
                      <Link href={`/projects/${project.slug}/edit`}>
                        <Button variant="secondary" size="md">
                          <FaEdit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                {project.stats && (
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-gray-400">Quests:</span>{' '}
                      <span className="font-semibold">{project.stats.activeQuests || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Participants:</span>{' '}
                      <span className="font-semibold">{project.stats.totalParticipants || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Followers:</span>{' '}
                      <span className="font-semibold">{project.stats.followers || 0}</span>
                    </div>
                    {project.stats.totalRewardsDistributed && project.stats.totalRewardsDistributed !== '0' && (
                      <div>
                        <span className="text-gray-400">Rewards:</span>{' '}
                        <span className="font-semibold">${project.stats.totalRewardsDistributed}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}