'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award, Medal } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'zap' | 'target' | 'award' | 'medal';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementSystemProps {
  achievements: Achievement[];
  onAchievementUnlock?: (achievement: Achievement) => void;
}

const IconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  medal: Medal,
};

const RarityColors = {
  common: { bg: 'from-gray-600 to-gray-800', glow: 'rgba(156, 163, 175, 0.5)' },
  rare: { bg: 'from-blue-500 to-blue-700', glow: 'rgba(59, 130, 246, 0.5)' },
  epic: { bg: 'from-purple-500 to-purple-700', glow: 'rgba(168, 85, 247, 0.5)' },
  legendary: { bg: 'from-yellow-500 to-orange-600', glow: 'rgba(245, 158, 11, 0.8)' },
};

export function AchievementSystem({ achievements, onAchievementUnlock }: AchievementSystemProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showingAchievement, setShowingAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Check for newly unlocked achievements
    achievements.forEach((achievement) => {
      if (achievement.unlockedAt && !unlockedAchievements.includes(achievement.id)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setShowingAchievement(achievement);
        onAchievementUnlock?.(achievement);
        
        // Hide after 5 seconds
        setTimeout(() => {
          setShowingAchievement(null);
        }, 5000);
      }
    });
  }, [achievements, unlockedAchievements, onAchievementUnlock]);

  return (
    <>
      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {showingAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 right-4 z-50"
          >
            <AchievementUnlockNotification achievement={showingAchievement} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = IconMap[achievement.icon];
  const rarityColor = RarityColors[achievement.rarity];
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.progress || 0;
  const maxProgress = achievement.maxProgress || 100;
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
        isUnlocked ? 'crypto-card-gradient' : 'crypto-card-locked'
      }`}
      style={{
        boxShadow: isUnlocked ? `0 0 30px ${rarityColor.glow}` : 'none',
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="crypto-pattern" />
      </div>

      {/* Trophy Icon */}
      <div className={`relative mb-3 mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
        isUnlocked ? `bg-gradient-to-br ${rarityColor.bg}` : 'bg-gray-700'
      }`}>
        <Icon 
          className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} 
          strokeWidth={1.5}
        />
        {isUnlocked && achievement.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 20px rgba(245, 158, 11, 0.8)',
                '0 0 40px rgba(245, 158, 11, 0.4)',
                '0 0 20px rgba(245, 158, 11, 0.8)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Achievement Info */}
      <h3 className={`font-semibold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
        {achievement.title}
      </h3>
      <p className={`text-xs ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
        {achievement.description}
      </p>

      {/* Progress Bar */}
      {!isUnlocked && achievement.maxProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Locked Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function AchievementUnlockNotification({ achievement }: { achievement: Achievement }) {
  const Icon = IconMap[achievement.icon];
  const rarityColor = RarityColors[achievement.rarity];

  return (
    <motion.div
      className="crypto-card-gradient p-6 rounded-xl min-w-[300px] relative overflow-hidden"
      style={{
        boxShadow: `0 0 50px ${rarityColor.glow}`,
      }}
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, ${rarityColor.glow} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 50%, ${rarityColor.glow} 0%, transparent 50%)`,
            `radial-gradient(circle at 20% 50%, ${rarityColor.glow} 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${rarityColor.bg} flex items-center justify-center`}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 1 }}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
          </motion.div>
          
          <div>
            <p className="text-sm text-gray-300 mb-1">Achievement Unlocked!</p>
            <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
            <p className="text-sm text-gray-300">{achievement.description}</p>
          </div>
        </div>

        {/* Rarity Badge */}
        <motion.div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${rarityColor.bg} text-white`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {achievement.rarity.toUpperCase()}
        </motion.div>
      </div>

      {/* Particle Effects for Legendary */}
      {achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              initial={{
                x: 150,
                y: 30,
                opacity: 1,
              }}
              animate={{
                x: Math.random() * 300 - 150,
                y: Math.random() * 100 - 50,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}