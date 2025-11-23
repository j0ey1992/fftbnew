'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { FaHandshake } from 'react-icons/fa';

interface ProjectPartnersProps {
  projectId: string;
}

export function ProjectPartners({ projectId }: ProjectPartnersProps) {
  return (
    <GlassCard className="p-12 text-center">
      <FaHandshake className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Strategic Partners</h3>
      <p className="text-gray-400">
        Partnership information will be updated soon.
      </p>
    </GlassCard>
  );
}