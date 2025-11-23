import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'light' | 'dark' | 'accent' | 'primary'
  elevation?: 'flat' | 'raised' | 'floating'
  noPadding?: boolean
  hover?: boolean
  animate?: 'fade' | 'scale' | 'slide' | 'none'
  borderGlow?: boolean
  interactive?: boolean
  onPress?: () => void
}

export function GlassCard({
  children,
  className = '',
  variant = 'dark',
  elevation = 'raised',
  noPadding = false,
  hover = true,
  animate = 'none',
  borderGlow = false,
  interactive = false,
  onPress
}: GlassCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  // Handle touch interactions for mobile
  const handleTouchStart = () => interactive && setIsPressed(true);
  const handleTouchEnd = () => {
    if (interactive) {
      setIsPressed(false);
      onPress && onPress();
    }
  };
  
  // Build the Tailwind classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'light':
        return 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] shadow-sm shadow-[rgba(0,0,0,0.1)] backdrop-blur-[20px] backdrop-saturate-[150%]';
      case 'primary':
        return 'bg-gradient-to-br from-[rgba(0,114,255,0.15)] to-[rgba(0,86,204,0.1)] border border-[rgba(0,114,255,0.2)] shadow-lg shadow-[rgba(0,114,255,0.1)] backdrop-blur-[20px] backdrop-saturate-[150%]';
      case 'accent':
        return 'bg-gradient-to-br from-[rgba(0,255,204,0.15)] to-[rgba(0,194,255,0.1)] border border-[rgba(0,255,204,0.2)] shadow-lg shadow-[rgba(0,255,204,0.1)] backdrop-blur-[20px] backdrop-saturate-[150%]';
      default: // dark
        return 'bg-gradient-to-br from-[rgba(10,15,35,0.9)] to-[rgba(15,20,40,0.8)] border border-[rgba(255,255,255,0.06)] shadow-md shadow-[rgba(0,0,0,0.2)] backdrop-blur-[20px] backdrop-saturate-[150%]';
    }
  };
  
  const getElevationClasses = () => {
    switch (elevation) {
      case 'flat':
        return 'shadow-sm';
      case 'floating':
        return 'translate-y-[-4px] shadow-xl shadow-[rgba(0,0,0,0.3)]';
      default: // raised
        return 'shadow-lg shadow-[rgba(0,0,0,0.2)]';
    }
  };
  
  const getInteractiveClasses = () => {
    const classes = [];
    
    if (interactive) {
      classes.push('select-none touch-manipulation cursor-pointer will-change-transform transition-transform duration-200 ease-out');
      if (isPressed) classes.push('scale-97 transition-transform duration-100 ease-in-out');
    } else if (hover) {
      classes.push('hover:-translate-y-[5px] hover:shadow-xl hover:shadow-[rgba(0,0,0,0.2)] transition-all duration-300');
    }
    
    return classes.join(' ');
  };
  
  const getBorderGlowClasses = () => {
    return borderGlow ? 'relative rounded-2xl overflow-hidden before:content-[""] before:absolute before:-inset-[1px] before:rounded-inherit before:bg-gradient-to-br before:from-[#0072ff] before:via-[#00c2ff] before:to-[#00ffcc] before:opacity-50 before:blur-[4px] before:transition-all before:duration-300 before:-z-10 hover:before:opacity-70 hover:before:blur-[8px]' : '';
  };
  
  const baseClasses = [
    'relative rounded-2xl overflow-hidden backdrop-filter transition-all duration-300',
    getVariantClasses(),
    getElevationClasses(),
    getInteractiveClasses(),
    getBorderGlowClasses(),
    noPadding ? '' : 'p-6',
    className
  ].filter(Boolean).join(' ');
  
  // Animation variants
  const animationVariants = {
    hidden: {
      opacity: animate === 'fade' || animate === 'scale' ? 0 : 1,
      scale: animate === 'scale' ? 0.9 : 1,
      y: animate === 'slide' ? 20 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };
  
  return (
    <motion.div 
      className={baseClasses}
      initial={animate !== 'none' ? "hidden" : false}
      animate="visible"
      variants={animationVariants}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => interactive && setIsPressed(true)}
      onMouseUp={() => interactive && setIsPressed(false)}
      onMouseLeave={() => interactive && isPressed && setIsPressed(false)}
      onClick={() => interactive && onPress && onPress()}
      whileHover={interactive ? { scale: 1.02, transition: { duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.98, transition: { duration: 0.1 } } : undefined}
    >
      {children}
    </motion.div>
  )
}
