'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'

interface DeployContractCardProps {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
  accentColor?: string
  disabled?: boolean
  comingSoon?: boolean
}

export function DeployContractCard({
  title,
  description,
  icon,
  onClick,
  accentColor = '#3772FF',
  disabled = false,
  comingSoon = false
}: DeployContractCardProps) {
  // Convert hex color to rgba for gradient
  const getColorWithOpacity = (hex: string, opacity: number) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return rgba
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  const accentRgba10 = getColorWithOpacity(accentColor, 0.1);
  const accentRgba20 = getColorWithOpacity(accentColor, 0.2);
  const accentRgba30 = getColorWithOpacity(accentColor, 0.3);
  
  return (
    <GlassCard
      className="h-full"
      variant="dark"
      interactive={!disabled}
      onPress={disabled ? undefined : onClick}
      hover={!disabled}
      animate="fade"
    >
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
          ></div>
          <div 
            className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full opacity-5"
            style={{ border: `1px solid ${accentColor}` }}
          ></div>
        </div>
        
        {/* Icon and title */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div 
            className="p-3 rounded-xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${accentRgba20}, ${accentRgba10})`,
              boxShadow: `0 2px 10px ${accentRgba10}`
            }}
          >
            <div style={{ color: accentColor }}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
            
            {comingSoon && (
              <span className="mt-1 inline-block text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-300 mb-5 flex-grow leading-relaxed">
          {description}
        </p>
        
        {/* Action button */}
        <div className="mt-auto relative z-10">
          <Button
            variant={disabled ? "glass" : "primary"}
            size="sm"
            fullWidth
            onClick={disabled ? undefined : onClick}
            disabled={disabled || comingSoon}
            icon={
              !disabled && !comingSoon ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              ) : undefined
            }
            iconPosition="right"
          >
            {comingSoon ? 'Coming Soon' : 'Select'}
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
