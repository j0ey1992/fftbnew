'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { FaCheckCircle, FaSpinner, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

interface RoadmapItem {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  date: string;
}

interface ProjectRoadmapProps {
  items: RoadmapItem[];
}

export function ProjectRoadmap({ items }: ProjectRoadmapProps) {
  if (!items || items.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <FaClock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Roadmap Available</h3>
        <p className="text-gray-400">
          The project roadmap will be updated soon.
        </p>
      </GlassCard>
    );
  }

  const getStatusIcon = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'planned':
        return <FaClock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Sort items by date and status
  const sortedItems = [...items].sort((a, b) => {
    // First sort by status priority
    const statusPriority = { 'in-progress': 0, 'planned': 1, 'completed': 2 };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by date
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Project Roadmap</h2>
        <p className="text-gray-400">
          Track our progress and see what's coming next
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
        
        {/* Roadmap items */}
        <div className="space-y-8">
          {sortedItems.map((item, index) => (
            <div key={index} className="relative flex gap-6">
              {/* Status icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-background border-2 border-white/10 flex items-center justify-center">
                  {getStatusIcon(item.status)}
                </div>
              </div>
              
              {/* Content */}
              <GlassCard className="flex-1 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">
                      {format(new Date(item.date), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400">{item.description}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}