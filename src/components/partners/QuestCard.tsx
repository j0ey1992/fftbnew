import { useState } from 'react';
import { motion } from 'framer-motion';
import { Quest } from '@/types';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { Timestamp } from 'firebase/firestore';

// Helper function to format dates
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString();
};

// Helper to check if a timestamp is in the past
const isExpired = (timestamp: Timestamp | undefined): boolean => {
  if (!timestamp) return false;
  return timestamp.toDate() < new Date();
};

interface QuestCardProps {
  quest: Quest;
  onModerate?: (questId: string) => void;
  onEdit?: (questId: string) => void;
}

export default function QuestCard({ quest, onModerate, onEdit }: QuestCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate completion rate
  const completionRate = quest.participantsJoined > 0 && quest.completionsCount !== undefined
    ? Math.round((quest.completionsCount / quest.participantsJoined) * 100)
    : 0;
  
  // Format status badge class
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-300';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300';
      case 'expired':
        return 'bg-gray-500/20 text-gray-300';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  // Format difficulty badge class
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300';
      case 'intermediate':
        return 'bg-blue-500/20 text-blue-300';
      case 'advanced':
        return 'bg-purple-500/20 text-purple-300';
      case 'expert':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  // Handle copy quest link
  const handleCopyLink = () => {
    const questLink = `${window.location.origin}/quests/${quest.id}`;
    navigator.clipboard.writeText(questLink)
      .then(() => toast.success('Quest link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };
  
  // Handle quest edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(quest.id);
    }
  };
  
  // Handle moderation view
  const handleViewSubmissions = () => {
    if (onModerate) {
      onModerate(quest.id);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0a1e3d]/80 border border-blue-500/20 rounded-xl overflow-hidden shadow-md transition-all duration-300"
    >
      {/* Quest header */}
      <div className="p-4 relative">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-white mr-4">{quest.title}</h3>
            <div className="flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(quest.status)}`}>
                {quest.status}
              </span>
            </div>
          </div>
          
          <p className={`text-gray-300 mt-2 ${expanded ? '' : 'line-clamp-2'}`}>
            {quest.description}
          </p>
          
          {quest.description && quest.description.length > 120 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 text-sm mt-1 hover:text-blue-300 transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        
        {/* Quest details */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-400">Reward</p>
            <p className="text-white">
              {quest.reward} {quest.tokenSymbol || ''}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-400">Difficulty</p>
            <span className={`inline-block px-2 py-1 text-xs rounded ${getDifficultyColor(quest.difficulty)}`}>
              {quest.difficulty}
            </span>
          </div>
          
          <div>
            <p className="text-xs text-gray-400">Participants</p>
            <p className="text-white">{quest.participantsJoined || 0}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-400">Completions</p>
            <p className="text-white">{quest.completionsCount || 0} ({completionRate}%)</p>
          </div>
        </div>
        
        {/* Quest dates */}
        <div className="mt-4 pt-3 border-t border-gray-700/30 text-xs text-gray-400">
          <div className="flex justify-between">
            <div>
              <span>Created: </span>
              <span>{formatDate(quest.createdAt)}</span>
            </div>
            
            {quest.expiresAt && (
              <div>
                <span>Expires: </span>
                <span className={isExpired(quest.expiresAt) ? 'text-red-400' : ''}>
                  {formatDate(quest.expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Quest actions */}
        <div className="mt-4 pt-3 border-t border-gray-700/30 flex justify-between">
          <Link href={`/quests/${quest.id}`} target="_blank">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded hover:bg-blue-600/50 transition-colors"
            >
              View Quest
            </motion.button>
          </Link>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="p-1.5 text-gray-300 hover:text-white rounded transition-colors"
              aria-label="Copy link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h4a2 2 0 002-2M8 5a2 2 0 012-2h4a2 2 0 012 2" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="p-1.5 text-gray-300 hover:text-white rounded transition-colors"
              aria-label="Edit quest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewSubmissions}
              className="p-1.5 text-gray-300 hover:text-white rounded transition-colors"
              aria-label="View submissions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}