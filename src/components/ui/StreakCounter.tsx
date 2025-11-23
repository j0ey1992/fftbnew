'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy, TrendingUp } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalActiveDays: number;
  comboMultiplier: number;
  milestones: number[];
}

interface StreakCounterProps {
  streakData: StreakData;
  onStreakUpdate?: (streak: number) => void;
  compact?: boolean;
}

export function StreakCounter({ streakData, onStreakUpdate, compact = false }: StreakCounterProps) {
  const [showMilestone, setShowMilestone] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  useEffect(() => {
    // Check for milestone achievements
    const milestone = streakData.milestones.find(m => m === streakData.currentStreak);
    if (milestone && milestone !== lastMilestone) {
      setShowMilestone(true);
      setLastMilestone(milestone);
      setTimeout(() => setShowMilestone(false), 3000);
    }
  }, [streakData.currentStreak, streakData.milestones, lastMilestone]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-yellow-400 to-orange-500'; // Gold
    if (streak >= 14) return 'from-purple-400 to-pink-500'; // Purple
    if (streak >= 7) return 'from-blue-400 to-cyan-500'; // Blue
    if (streak >= 3) return 'from-green-400 to-emerald-500'; // Green
    return 'from-gray-400 to-gray-500'; // Gray
  };

  const getFlameIntensity = (streak: number) => {
    if (streak >= 30) return 'animate-pulse';
    if (streak >= 14) return 'animate-bounce';
    return '';
  };

  if (compact) {
    return <CompactStreakDisplay streakData={streakData} />;
  }

  return (
    <>
      <div className="crypto-card-gradient rounded-xl p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="crypto-pattern" />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Daily Streak</h3>
            <motion.div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStreakColor(streakData.currentStreak)} flex items-center justify-center ${getFlameIntensity(streakData.currentStreak)}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Current Streak */}
          <div className="text-center mb-6">
            <motion.div
              className="text-5xl font-bold text-white mb-2"
              key={streakData.currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              {streakData.currentStreak}
            </motion.div>
            <p className="text-gray-400">Day Streak</p>
          </div>

          {/* Combo Multiplier */}
          {streakData.comboMultiplier > 1 && (
            <motion.div
              className="flex items-center justify-center gap-2 mb-4 text-yellow-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Zap className="w-5 h-5" />
              <span className="font-semibold">{streakData.comboMultiplier}x Combo Active!</span>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="crypto-card-locked rounded-lg p-3">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{streakData.longestStreak}</div>
              <div className="text-xs text-gray-400">Best Streak</div>
            </div>
            <div className="crypto-card-locked rounded-lg p-3">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{streakData.totalActiveDays}</div>
              <div className="text-xs text-gray-400">Total Days</div>
            </div>
            <div className="crypto-card-locked rounded-lg p-3">
              <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{streakData.comboMultiplier}x</div>
              <div className="text-xs text-gray-400">Multiplier</div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="mt-4">
            <MilestoneProgress 
              currentStreak={streakData.currentStreak} 
              milestones={streakData.milestones}
            />
          </div>
        </div>

        {/* Streak Fire Animation */}
        {streakData.currentStreak >= 7 && (
          <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none">
            <motion.div
              className="w-full h-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${getStreakColor(streakData.currentStreak)} blur-3xl`} />
            </motion.div>
          </div>
        )}
      </div>

      {/* Milestone Achievement Notification */}
      <AnimatePresence>
        {showMilestone && (
          <MilestoneNotification milestone={lastMilestone} />
        )}
      </AnimatePresence>
    </>
  );
}

function CompactStreakDisplay({ streakData }: { streakData: StreakData }) {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '🌟';
    return '💫';
  };

  return (
    <motion.div
      className="flex items-center gap-2 crypto-card-gradient rounded-full px-4 py-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="text-lg"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {getStreakEmoji(streakData.currentStreak)}
      </motion.span>
      <span className="font-bold text-white">{streakData.currentStreak}</span>
      <span className="text-xs text-gray-400">day streak</span>
      {streakData.comboMultiplier > 1 && (
        <span className="text-xs text-yellow-400 font-semibold">
          {streakData.comboMultiplier}x
        </span>
      )}
    </motion.div>
  );
}

function MilestoneProgress({ currentStreak, milestones }: { currentStreak: number; milestones: number[] }) {
  const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
  const previousMilestone = [...milestones].reverse().find(m => m <= currentStreak) || 0;
  const progress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Next Milestone</span>
        <span className="text-white font-semibold">{nextMilestone} days</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between">
        {milestones.slice(0, 5).map((milestone) => (
          <div
            key={milestone}
            className={`text-xs ${
              currentStreak >= milestone ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            {milestone}
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneNotification({ milestone }: { milestone: number }) {
  return (
    <motion.div
      className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
    >
      <div className="crypto-card-gradient p-6 rounded-xl text-center min-w-[300px]">
        <motion.div
          className="mb-4 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{ duration: 1 }}
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Milestone Achieved!</h3>
        <p className="text-lg text-gray-300">{milestone} Day Streak! 🎉</p>
        <motion.div
          className="mt-4 text-yellow-400 font-semibold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          Bonus Rewards Unlocked!
        </motion.div>
      </div>
    </motion.div>
  );
}