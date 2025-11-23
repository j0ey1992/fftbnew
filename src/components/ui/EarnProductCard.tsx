'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/components/Card.module.css'

interface EarnProductCardProps {
  id: string
  name: string
  image: string
  apr: string
  description: string
  accent?: string
}

export function EarnProductCard({
  id,
  name,
  image,
  apr,
  description,
  accent = '#3772FF'
}: EarnProductCardProps) {
  return (
    <Link 
      href={`/earn/${id}`} 
      className="flex-shrink-0 min-w-[260px] w-[260px]"
    >
      <div 
        className="relative h-36 w-full rounded-xl overflow-hidden bg-gradient-to-br from-[#0c1e33] to-[#051326] transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-lg"
        style={{ borderLeft: `4px solid ${accent}` }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-bl-full bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute right-5 bottom-10 w-16 h-16 rounded-full border border-white/10"></div>
        </div>
        
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src={image}
            alt={name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#051326]/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative flex flex-col justify-between h-full p-4 z-10">
          <div>
            {/* Title and badge */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <div className="px-2.5 py-0.5 rounded-full bg-[#061C3D] border border-[#0A2B58] text-xs text-white/80 font-medium">
                Up to {apr}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-white/70 line-clamp-2">{description}</p>
          </div>
          
          {/* Bottom area */}
          <div className="flex justify-between items-center mt-2">
            <div className="w-10 h-10 rounded-full bg-[#051326] p-1 flex items-center justify-center">
              <Image
                src={image}
                alt={name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            
            {/* Learn more button */}
            <div className="text-sm font-medium" style={{ color: accent }}>
              Learn More
              <svg className="ml-1 w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
