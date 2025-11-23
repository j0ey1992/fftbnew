'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface NavItem {
  path: string
  label: string
  icon: JSX.Element
  badge?: number
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()

  if (!isMobile) return null

  const navItems: NavItem[] = [
    {
      path: '/stake',
      label: 'Stake',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/swap',
      label: 'Swap',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      path: '/earn',
      label: 'Earn',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/quests',
      label: 'Quests',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  const isActive = (path: string) => {
    if (path === '/earn') {
      return pathname === '/earn' || 
             pathname.startsWith('/vaults') || 
             pathname.startsWith('/lp-staking') || 
             pathname.startsWith('/nft-staking') ||
             pathname.startsWith('/token-locker')
    }
    return pathname === path || pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#0a1e3d] border-t border-gray-700/50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="relative flex flex-col items-center gap-1 py-2 px-3 flex-1"
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute inset-0 bg-purple-600/20"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
                
                <div className={`relative transition-colors ${
                  active ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                
                <span className={`text-xs font-medium transition-colors ${
                  active ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-[#0a1e3d]" />
    </div>
  )
}