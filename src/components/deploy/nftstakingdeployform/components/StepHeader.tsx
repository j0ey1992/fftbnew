'use client'

interface StepHeaderProps {
  stepNumber: number
  title: string
  description?: string
}

/**
 * Step header component with numbered badge and title
 */
export default function StepHeader({ stepNumber, title, description }: StepHeaderProps) {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-[#0072ff] to-[#00c2ff] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-bold">{stepNumber}</span>
      </div>
      <div>
        <h4 className="text-xl font-semibold text-white">{title}</h4>
        {description && (
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
