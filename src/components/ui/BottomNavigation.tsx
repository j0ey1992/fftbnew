'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, StarsIcon, WalletIcon, NftIcon, QuestsIcon, UserIcon, ChartIcon } from '@/components/icons'
import { useAuth } from '@/components/providers/auth'
import { motion } from 'framer-motion'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

export function BottomNavigation() {
  const pathname = usePathname()
  const { userRoles } = useAuth()
  const isAdmin = userRoles.isAdmin
  
  // FFTB navigation items
  const navigationItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: <HomeIcon className="h-6 w-6" />,
      active: pathname === '/'
    },
    {
      path: '/chart',
      label: 'Chart',
      icon: <ChartIcon className="h-6 w-6" />,
      active: pathname === '/chart'
    },
    {
      path: '/listings',
      label: 'Listings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      active: pathname === '/listings'
    },
    {
      path: '/how-to-buy',
      label: 'Buy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      active: pathname === '/how-to-buy'
    },
    {
      path: '/roadmap',
      label: 'Roadmap',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      active: pathname === '/roadmap'
    }
  ]

  // Additional items that can be accessed from profile or other sections
  // but not shown in the main bottom navigation
  const hiddenItems = [
    {
      path: '/leaderboard',
      label: 'Leaderboard',
      icon: <ChartIcon className="h-6 w-6" />,
      active: pathname === '/leaderboard'
    },
    {
      path: '/deploy',
      label: 'Deploy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
        </svg>
      ),
      active: pathname === '/deploy'
    }
  ]

  // Use only the main navigation items
  const allNavigationItems = [...navigationItems]
  
  // Only add admin link if user is admin and we're on an admin page
  // This prevents it from taking up space in the bottom nav unless needed
  if (isAdmin && pathname.startsWith('/admin')) {
    allNavigationItems.push({
      path: '/admin',
      label: 'Admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
        </svg>
      ),
      active: pathname.startsWith('/admin')
    })
  }

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="fixed bottom-0 left-0 w-full z-50 h-[70px] bg-[rgba(0,7,17,0.95)] backdrop-blur-[30px] backdrop-saturate-[150%] border-t border-[rgba(255,255,255,0.06)] flex justify-around items-center pb-[env(safe-area-inset-bottom,0)]"
      style={{
        willChange: 'auto',
        transform: 'translateZ(0)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Glass highlight effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      
      {/* Navigation items */}
      <div className="flex w-full h-full justify-around items-center">
        {allNavigationItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            className="flex-1 h-full"
          >
            <div className={`flex flex-col items-center justify-center h-full relative py-2 text-[0.7rem] transition-all duration-300 ${
              item.active 
                ? 'text-[#0072ff]' 
                : 'text-white/40 hover:text-white/70'
            }`}>
              {/* Active indicator */}
              {item.active && (
                <>
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-[#0072ff] to-transparent"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,114,255,0.15)_0%,transparent_70%)]"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </>
              )}
              
              {/* Icon with subtle animation */}
              <motion.div 
                className="mb-1 h-6"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              
              {/* Label */}
              <span className="text-[0.65rem] font-medium tracking-wide">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.nav>
  )
}
