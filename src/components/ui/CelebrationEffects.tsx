'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationEffectsProps {
  trigger: boolean;
  type?: 'confetti' | 'fireworks' | 'coins' | 'stars';
  duration?: number;
  onComplete?: () => void;
}

export function CelebrationEffects({ 
  trigger, 
  type = 'confetti', 
  duration = 3000,
  onComplete 
}: CelebrationEffectsProps) {
  useEffect(() => {
    if (!trigger) return;

    switch (type) {
      case 'confetti':
        launchConfetti();
        break;
      case 'fireworks':
        launchFireworks();
        break;
      case 'coins':
        launchCoins();
        break;
      case 'stars':
        launchStars();
        break;
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, type, duration, onComplete]);

  return null;
}

function launchConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#9370DB']
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

function launchFireworks() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: {
        x: randomInRange(0.1, 0.3),
        y: Math.random() - 0.2
      },
      colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#32CD32']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: {
        x: randomInRange(0.7, 0.9),
        y: Math.random() - 0.2
      },
      colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#32CD32']
    });
  }, 250);
}

function launchCoins() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 1.5,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['circle'],
    colors: ['#FFD700', '#FFA500', '#FFD700', '#FFA500']
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 1.2,
      origin: { x: Math.random(), y: Math.random() * 0.5 }
    });

    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      origin: { x: Math.random(), y: Math.random() * 0.5 }
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

function launchStars() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    colors: ['#FFD700', '#FFF', '#FFD700', '#FFF']
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star']
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle']
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  xpGained?: number;
  rewardAmount?: number;
  rewardToken?: string;
}

export function SuccessAnimation({ 
  show, 
  message = "Quest Completed!", 
  xpGained,
  rewardAmount,
  rewardToken = "USDC"
}: SuccessAnimationProps) {
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    if (show) {
      setShowEffects(true);
      const timer = setTimeout(() => setShowEffects(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {showEffects && (
        <>
          <CelebrationEffects trigger={showEffects} type="confetti" />
          
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="crypto-success-card p-8 rounded-2xl text-center max-w-md mx-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {/* Success Icon */}
              <motion.div
                className="mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 1 }}
              >
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              {/* Success Message */}
              <motion.h2
                className="text-3xl font-bold text-white mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.h2>

              {/* Rewards */}
              <motion.div
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {xpGained && (
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-yellow-400">+{xpGained} XP</span>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      ⭐
                    </motion.span>
                  </div>
                )}
                
                {rewardAmount && (
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-green-400">+{rewardAmount} {rewardToken}</span>
                    <motion.span
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      💰
                    </motion.span>
                  </div>
                )}
              </motion.div>

              {/* Animated Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{
                      x: "50%",
                      y: "50%",
                      opacity: 0,
                    }}
                    animate={{
                      x: `${50 + Math.cos(i * 60 * Math.PI / 180) * 100}%`,
                      y: `${50 + Math.sin(i * 60 * Math.PI / 180) * 100}%`,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CoinRainProps {
  active: boolean;
  amount?: number;
}

export function CoinRain({ active, amount = 50 }: CoinRainProps) {
  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(amount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -50,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 50,
                rotate: 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: Math.random() * 2 + 3,
                delay: Math.random() * 2,
                ease: "linear",
              }}
              style={{
                left: `${Math.random() * 100}%`,
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">
                $
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}