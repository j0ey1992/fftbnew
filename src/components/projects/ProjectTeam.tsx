'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { FaUserTie } from 'react-icons/fa';

interface ProjectTeamProps {
  projectId: string;
}

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  return (
    <GlassCard className="p-12 text-center">
      <FaUserTie className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Team Information</h3>
      <p className="text-gray-400">
        Team details will be updated soon.
      </p>
    </GlassCard>
  );
}