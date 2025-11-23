'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BottomNavigation } from '@/components/ui/BottomNavigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeIcon } from '@/components/icons'

// Hamburger Menu Button Component
function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button 
      className="flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors duration-200 focus:outline-none"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="relative w-6 h-5">
        <motion.span 
          className="absolute top-0 left-0 w-6 h-0.5 bg-white rounded-full"
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 9 : 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span 
          className="absolute top-2 left-0 w-6 h-0.5 bg-white rounded-full"
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span 
          className="absolute top-4 left-0 w-6 h-0.5 bg-white rounded-full"
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -9 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </button>
  )
}

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  disablePadding?: boolean; // Added prop to disable padding
}

export default function MainLayout({ children, className, disablePadding = false }: MainLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [isMobile, setIsMobile] = useState(true);
  // Initialize sidebar as open by default on desktop
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const pathname = usePathname();
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsMobile(!isDesktop);
      
      // Don't automatically open sidebar on desktop anymore
      // This allows the hamburger menu to control it
      if (!isDesktop) {
        setSideNavOpen(false);
      }
    }
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setSideNavOpen(prev => !prev);
  };
  
  // Update active tab based on current path
  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('Home')
    } else if (pathname === '/chart' || pathname.startsWith('/chart')) {
      setActiveTab('Chart')
    } else if (pathname === '/listings' || pathname.startsWith('/listings')) {
      setActiveTab('Listings')
    } else if (pathname === '/nft' || pathname.startsWith('/nft')) {
      setActiveTab('NFT')
    } else if (pathname === '/assetwatch' || pathname.startsWith('/assetwatch')) {
      setActiveTab('AssetWatch')
    } else if (pathname === '/how-to-buy' || pathname.startsWith('/how-to-buy')) {
      setActiveTab('How to Buy')
    } else if (pathname === '/roadmap' || pathname.startsWith('/roadmap')) {
      setActiveTab('Roadmap')
    }
  }, [pathname])
  
  // Animation variants for the layout elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  const tabs = [
    {
      name: 'Home',
      href: '/',
      icon: <HomeIcon className="h-5 w-5" />,
      external: false
    },
    {
      name: 'Chart',
      href: '/chart',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      external: false
    },
    {
      name: 'Listings',
      href: '/listings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      external: false
    },
    {
      name: 'NFT',
      href: '/nft',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      external: false
    },
    {
      name: 'Bridge',
      href: 'https://fftb-frontend.vercel.app/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
        </svg>
      ),
      external: true
    },
    {
      name: 'AssetWatch',
      href: '/assetwatch',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      external: false
    },
    {
      name: 'How to Buy',
      href: '/how-to-buy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      external: false
    },
    {
      name: 'Roadmap',
      href: '/roadmap',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      external: false
    }
  ]

  // Mobile tabs - reduced set for better mobile experience
  const mobileTabs = [
    {
      name: 'Home',
      href: '/',
      icon: <HomeIcon className="h-5 w-5" />,
      external: false
    },
    {
      name: 'Chart',
      href: '/chart',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      external: false
    },
    {
      name: 'NFT',
      href: '/nft',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      external: false
    },
    {
      name: 'Bridge',
      href: 'https://fftb-frontend.vercel.app/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
        </svg>
      ),
      external: true
    },
    {
      name: 'Listings',
      href: '/listings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      external: false
    }
  ]

  // Side navigation animation variants
  const sideNavVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    closed: { 
      x: "-100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const sideNavItemVariants = {
    open: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: { 
      x: -20, 
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };
  
  return (
    <motion.div
      className="min-h-screen overflow-y-auto text-white relative bg-gradient-to-b from-background-500 to-background-600"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Ambient background effects */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Radial gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_top,_rgba(31,113,254,0.15),_transparent_70%)]"></div>
        
        {/* Radial gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_bottom,_rgba(57,224,255,0.1),_transparent_70%)]"></div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
      </div>

      {/* Desktop Side Navigation - Only visible on desktop */}
      <AnimatePresence>
        {!isMobile && sideNavOpen && (
          <motion.nav 
            className="fixed top-0 left-0 h-full w-64 z-50 hidden md:block"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sideNavVariants}
          >
            <div className="h-full flex flex-col bg-[rgba(10,15,31,0.85)] backdrop-blur-xl border-r border-white/5 shadow-2xl">
              {/* Logo section */}
              <div className="p-6 flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="h-12 w-12">
                    <Image
                      src="/fftb.png"
                      alt="FFTB"
                      width={128}
                      height={128}
                      quality={100}
                      priority
                      className="object-contain"
                    />
                  </div>
                  <span className="ml-3 text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">FFTB</span>
                </Link>
              </div>
              
              {/* Navigation links */}
              <div className="flex-1 px-3 py-6">
                <div className="space-y-1">
                  {tabs.map((tab) => (
                    <motion.div key={tab.name} variants={sideNavItemVariants}>
                      {tab.external ? (
                        <a
                          href={tab.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <span className="mr-3 transition-colors duration-200 text-white/60 group-hover:text-white/80">
                            {tab.icon}
                          </span>
                          <span className="font-medium">{tab.name}</span>
                          <svg className="w-3 h-3 ml-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <Link
                          href={tab.href}
                          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                            activeTab === tab.name
                              ? 'bg-primary-500/20 text-white'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                          onClick={() => setActiveTab(tab.name)}
                        >
                          <span className={`mr-3 transition-colors duration-200 ${
                            activeTab === tab.name ? 'text-primary-400' : 'text-white/60 group-hover:text-white/80'
                          }`}>
                            {tab.icon}
                          </span>
                          <span className="font-medium">{tab.name}</span>

                          {/* Active indicator */}
                          {activeTab === tab.name && (
                            <span className="ml-auto w-1.5 h-5 rounded-full bg-gradient-to-b from-primary-400 to-primary-600"></span>
                          )}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Bottom section */}
              <div className="p-4 border-t border-white/5">
                {/* Wallet button hidden */}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* App Header - Mobile and desktop */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          !isMobile && sideNavOpen ? 'md:pl-64' : ''
        }`}
        style={{
          willChange: 'auto',
          transform: 'translateZ(0)'
        }}
      >
        <div 
          className={`relative ${
            scrolled 
              ? 'bg-[rgba(10,15,31,0.85)] shadow-[0_8px_32px_rgba(0,0,0,0.2)]' 
              : 'bg-[rgba(10,15,31,0.65)]'
          } backdrop-blur-xl border-b border-white/5 transition-all duration-500 pt-4`}
        >
          {/* Glass highlight effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          
          {/* Mobile header content */}
          <div className="md:hidden flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center">
              <Link href="/" className="flex items-center touch-target">
                <div className="h-10 w-10 sm:h-12 sm:w-12">
                  <Image
                    src="/fftb.png"
                    alt="FFTB"
                    width={128}
                    height={128}
                    quality={100}
                    priority
                    className="object-contain"
                  />
                </div>
                <span className="ml-2 text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">FFTB</span>
              </Link>
            </div>
            {/* Wallet button hidden */}
          </div>
          
          {/* Tab Navigation - Header Menu (Mobile only) */}
          <div className="md:hidden" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex border-b border-white/5 px-2 justify-between">
              {mobileTabs.map((tab, index) => (
                tab.external ? (
                  <a
                    key={tab.name}
                    href={tab.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 border-b-2 text-white/70 border-transparent hover:text-white/90"
                    style={{
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </a>
                ) : (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`relative flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 border-b-2 ${
                      activeTab === tab.name
                        ? 'text-white border-primary'
                        : 'text-white/70 border-transparent hover:text-white/90'
                    }`}
                    style={{
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onClick={() => setActiveTab(tab.name)}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                )
              ))}
            </div>
          </div>
          
          {/* Desktop header content */}
          {!isMobile && (
            <div className="hidden md:flex justify-between items-center px-6 py-4">
              {/* Hamburger menu button */}
              <div className="flex items-center">
                <HamburgerButton isOpen={sideNavOpen} onClick={toggleSidebar} />
                {!sideNavOpen && (
                  <Link href="/" className="flex items-center ml-3">
                    <div className="h-10 w-10">
                      <Image
                        src="/fftb.png"
                        alt="FFTB"
                        width={128}
                        height={128}
                        quality={100}
                        priority
                        className="object-contain"
                      />
                    </div>
                    <span className="ml-2 text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">FFTB</span>
                  </Link>
                )}
              </div>
              
              {/* Right side actions - wallet hidden */}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${!isMobile && sideNavOpen ? 'md:pl-64' : ''}`}>
        {/* Add proper padding for mobile header with increased spacing */}
        <div className="pt-36 md:pt-24 pb-20 md:pb-8">
          {/* Conditionally apply the page-container class (which includes padding) */}
          <div className={`${!disablePadding ? 'page-container' : ''} ${className || ''} ${isMobile ? 'px-3' : ''}`}>
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className={`${!isMobile && sideNavOpen ? 'md:pl-64' : ''} border-t border-white/10 py-8 mt-12`}>
          <div className="page-container">
            {/* Social Media Links */}
            <div className="flex justify-center gap-6 mb-6">
              <a
                href="https://x.com/MissionCRO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/7GR7aUZm3X"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a
                href="https://medium.com/@FFTB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
              <a
                href="https://t.me/FFTB_Cronos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.672 13.98l-2.885-.907c-.628-.192-.64-.628.135-.93l11.268-4.341c.524-.192.983.13.814.918z"/>
                </svg>
              </a>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                Made by Kris token
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
      
      {/* iOS Home Indicator - Mobile only */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-5 flex justify-center items-center pb-[env(safe-area-inset-bottom,0.5rem)]">
        <div className="w-9 h-[5px] bg-white/30 rounded-[4px]"></div>
      </div>
    </motion.div>
  )
}
