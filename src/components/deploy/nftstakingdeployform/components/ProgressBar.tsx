'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

/**
 * Progress bar component with Crypto.com inspired gradient design
 */
export default function ProgressBar({ currentStep, totalSteps, className = '' }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className={`w-full bg-gray-800 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-[#0072ff] to-[#00c2ff] h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  )
}
