'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, Star } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  swipeThreshold?: number;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  swipeThreshold = 100,
  className = '',
}: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 1, 1, 1, 0.5]
  );
  
  const leftIndicatorOpacity = useTransform(
    x,
    [-100, 0],
    [1, 0]
  );
  
  const rightIndicatorOpacity = useTransform(
    x,
    [0, 100],
    [0, 1]
  );
  
  const upIndicatorOpacity = useTransform(
    y,
    [-100, 0],
    [1, 0]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > swipeThreshold) {
      setExitX(offset.x > 0 ? 500 : -500);
      if (offset.x > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (offset.y < -swipeThreshold && Math.abs(velocity.y) > 100) {
      setExitY(-500);
      onSwipeUp?.();
    } else {
      // Spring back
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      animate={{ x: exitX, y: exitY }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {children}
      
      {/* Swipe Indicators */}
      <motion.div
        className="absolute -left-12 top-1/2 -translate-y-1/2"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
          <X className="w-6 h-6 text-white" />
        </div>
      </motion.div>
      
      <motion.div
        className="absolute -right-12 top-1/2 -translate-y-1/2"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
      </motion.div>
      
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-12"
        style={{ opacity: upIndicatorOpacity }}
      >
        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
          <Star className="w-6 h-6 text-white" />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SwipeableStackProps {
  cards: React.ReactNode[];
  onCardSwiped?: (index: number, direction: 'left' | 'right' | 'up') => void;
  onStackEmpty?: () => void;
}

export function SwipeableStack({ cards, onCardSwiped, onStackEmpty }: SwipeableStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState<number[]>([]);

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    onCardSwiped?.(currentIndex, direction);
    setSwipedCards([...swipedCards, currentIndex]);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onStackEmpty?.();
    }
  };

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      {cards.map((card, index) => {
        if (swipedCards.includes(index)) return null;
        
        const isTop = index === currentIndex;
        const offset = index - currentIndex;
        
        return (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ scale: 1 - offset * 0.05, y: offset * 10 }}
            animate={{ 
              scale: 1 - offset * 0.05, 
              y: offset * 10,
              opacity: offset < 3 ? 1 : 0
            }}
            style={{ zIndex: cards.length - index }}
          >
            {isTop ? (
              <SwipeableCard
                onSwipeLeft={() => handleSwipe('left')}
                onSwipeRight={() => handleSwipe('right')}
                onSwipeUp={() => handleSwipe('up')}
                className="h-full"
              >
                {card}
              </SwipeableCard>
            ) : (
              <div className="h-full pointer-events-none">
                {card}
              </div>
            )}
          </motion.div>
        );
      })}
      
      {swipedCards.length === cards.length && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <p className="text-xl text-gray-400 mb-4">No more cards!</p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSwipedCards([]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold"
            >
              Restart
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, threshold], [0, 1]);
  const pullOpacity = useTransform(pullProgress, [0, 0.5, 1], [0, 1, 1]);

  const handleDragEnd = async () => {
    if (y.get() >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ 
          y,
          opacity: pullOpacity
        }}
      >
        <motion.div
          className="mt-4"
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: threshold * 1.5 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ y: isRefreshing ? threshold : 0 }}
        animate={{ y: isRefreshing ? threshold : 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  snapPoints = [0.5, 0.9] 
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0);
  const sheetY = useMotionValue(window.innerHeight);
  
  const backgroundOpacity = useTransform(
    sheetY,
    [window.innerHeight, 0],
    [0, 0.5]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { velocity, offset } = info;
    
    if (velocity.y > 500) {
      onClose();
    } else {
      // Find nearest snap point
      const snapHeights = snapPoints.map(point => window.innerHeight * (1 - point));
      const currentY = sheetY.get();
      const nearest = snapHeights.reduce((prev, curr) => 
        Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
      );
      const snapIndex = snapHeights.indexOf(nearest);
      setCurrentSnap(snapIndex);
      sheetY.set(nearest);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Background Overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: backgroundOpacity }}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl min-h-[200px]"
        style={{ y: sheetY }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        initial={{ y: window.innerHeight }}
        animate={{ y: isOpen ? window.innerHeight * (1 - snapPoints[currentSnap]) : window.innerHeight }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="px-4 pb-8">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}