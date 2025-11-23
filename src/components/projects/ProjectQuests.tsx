'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import QuestCard from '@/components/quests/QuestCard';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FaPlus, FaFilter, FaTrophy } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface ProjectQuestsProps {
  projectId: string;
  quests?: any[];
  isAdmin?: boolean;
}

export function ProjectQuests({ projectId, quests: initialQuests = [], isAdmin }: ProjectQuestsProps) {
  const router = useRouter();
  const [quests, setQuests] = useState(initialQuests);
  const [loading, setLoading] = useState(!initialQuests.length);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'newest' | 'rewards' | 'participants'>('newest');

  useEffect(() => {
    if (!initialQuests.length) {
      fetchQuests();
    }
  }, [projectId]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/quests', {
        params: {
          projectId,
          status: filter === 'all' ? undefined : filter,
          orderBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'rewards' ? 'totalRewardPool' : 'participantCount',
          orderDirection: 'desc'
        }
      });
      setQuests(response.data.quests || []);
    } catch (error) {
      console.error('Error fetching project quests:', error);
      toast.error('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort quests
  const filteredQuests = quests.filter(quest => {
    if (filter === 'all') return true;
    return quest.status === filter;
  });

  const sortedQuests = [...filteredQuests].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rewards':
        return (parseFloat(b.totalRewardPool) || 0) - (parseFloat(a.totalRewardPool) || 0);
      case 'participants':
        return (b.stats?.participants || 0) - (a.stats?.participants || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Project Quests</h2>
          <p className="text-gray-400">
            {sortedQuests.length} {sortedQuests.length === 1 ? 'quest' : 'quests'} available
          </p>
        </div>
        
        {isAdmin && (
          <Link href={`/partner-dashboard/${projectId}/create-quest`}>
            <Button variant="primary" size="md">
              <FaPlus className="w-4 h-4 mr-2" />
              Create Quest
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filter === f
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="rewards">Highest Rewards</option>
              <option value="participants">Most Popular</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Quest Grid */}
      {sortedQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onView={() => router.push(`/quests/${quest.id}`)}
              onSubmit={() => router.push(`/quests/${quest.id}`)}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <FaTrophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Quests Available</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all' 
              ? 'This project hasn\'t created any quests yet.'
              : `No ${filter} quests found.`}
          </p>
          {isAdmin && (
            <Link href={`/partner-dashboard/${projectId}/create-quest`}>
              <Button variant="primary" size="md">
                Create Your First Quest
              </Button>
            </Link>
          )}
        </GlassCard>
      )}
    </div>
  );
}