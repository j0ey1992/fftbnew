'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

export function AnimatedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'url(#gradient)',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showPercentage = true,
  animated = true,
  label,
  icon,
}: AnimatedProgressRingProps) {
  const progressValue = useMotionValue(0);
  const displayProgress = useTransform(progressValue, (value) => Math.round(value));
  const [currentProgress, setCurrentProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const controls = animate(progressValue, progress, {
        duration: 1.5,
        ease: "easeOut",
      });
      return controls.stop;
    } else {
      progressValue.set(progress);
    }
  }, [progress, progressValue, animated]);

  useEffect(() => {
    const unsubscribe = displayProgress.on("change", (value) => {
      setCurrentProgress(value);
    });
    return unsubscribe;
  }, [displayProgress]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && <div className="mb-1">{icon}</div>}
        {showPercentage && (
          <motion.span className="text-2xl font-bold text-white">
            {currentProgress}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

interface AnimatedStatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  icon?: React.ReactNode;
  color?: string;
}

export function AnimatedStatCounter({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  icon,
  color = 'from-blue-500 to-purple-500',
}: AnimatedStatCounterProps) {
  const countRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return (
    <motion.div
      className="crypto-card-gradient rounded-xl p-6 text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icon && (
        <motion.div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {icon}
        </motion.div>
      )}
      
      <motion.div
        className="text-3xl font-bold text-white mb-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10 }}
      >
        <span ref={countRef}>
          {prefix}{displayValue.toFixed(decimals)}{suffix}
        </span>
      </motion.div>
      
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

interface CircularProgressBarProps {
  values: {
    value: number;
    color: string;
    label: string;
  }[];
  size?: number;
  strokeWidth?: number;
}

export function CircularProgressBar({
  values,
  size = 200,
  strokeWidth = 20,
}: CircularProgressBarProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let accumulatedOffset = 0;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Segments */}
        {values.map((item, index) => {
          const segmentLength = (item.value / 100) * circumference;
          const offset = circumference - accumulatedOffset;
          accumulatedOffset += segmentLength;
          
          return (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {values.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300">{item.label}</span>
              <span className="text-white font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DataVisualizationCardProps {
  title: string;
  data: {
    label: string;
    value: number;
    max: number;
    color: string;
  }[];
}

export function DataVisualizationCard({ title, data }: DataVisualizationCardProps) {
  return (
    <div className="crypto-card-gradient rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{item.label}</span>
              <span className="text-white font-semibold">
                {item.value}/{item.max}
              </span>
            </div>
            
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.max) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}