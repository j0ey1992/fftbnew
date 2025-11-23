'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

// Wallet Icon
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  )
}

// Custom Reown button component
function CustomReownButton() {
  const { open } = useAppKit()
  const { status, isConnected, address } = useAppKitAccount()
  const isConnecting = status === 'connecting' || status === 'reconnecting'

  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <button
      className="relative flex items-center justify-center px-4 py-2 min-w-[120px] h-9 rounded-lg font-medium text-xs text-white overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#1199fa] via-[#0e8fe8] to-[#0b85d8] hover:from-[#0d7ac9] hover:via-[#0a80d2] hover:to-[#0970b8] shadow-[0_2px_10px_rgba(17,153,250,0.25)] hover:shadow-[0_4px_16px_rgba(17,153,250,0.35)] group backdrop-blur-sm"
      onClick={() => open()}
      disabled={isConnecting}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>

      <div className="flex items-center justify-center gap-2">
        <WalletIcon className="h-4 w-4" />
        <span className="font-semibold uppercase tracking-wide text-xs">
          {isConnecting ? 'Connecting...' : isConnected ? formatAddress(address) : 'Connect Wallet'}
        </span>
      </div>

      <span className="absolute inset-0 rounded-lg border border-white/10"></span>
    </button>
  )
}

// Hamburger Menu Button
function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className="flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors duration-200 focus:outline-none lg:hidden"
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

interface FFTBLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function FFTBLayout({ children, className }: FFTBLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Navigation links
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Chart', href: '/chart' },
    { name: 'Listings', href: '/listings' },
    { name: 'Bridge', href: '/bridge' },
    { name: 'Staking', href: '/staking' },
    { name: 'How to Buy', href: '/how-to-buy' },
    { name: 'Roadmap', href: '/roadmap' }
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen overflow-y-auto text-white relative bg-gradient-to-b from-background-500 to-background-600">
      {/* Ambient background effects */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_top,_rgba(31,113,254,0.15),_transparent_70%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_bottom,_rgba(57,224,255,0.1),_transparent_70%)]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(10,15,31,0.85)] shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
            : 'bg-[rgba(10,15,31,0.65)]'
        } backdrop-blur-xl border-b border-white/5`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10">
                <Image
                  src="/fftb-logo.svg"
                  alt="FFTB"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                FFTB
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive(link.href)
                      ? 'bg-primary-500/20 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right side - Wallet button */}
            <div className="flex items-center space-x-4">
              <CustomReownButton />
              <HamburgerButton isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-white/5 bg-[rgba(10,15,31,0.95)] backdrop-blur-xl"
            >
              <nav className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive(link.href)
                        ? 'bg-primary-500/20 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className || ''}`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[rgba(10,15,31,0.5)] backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-white/80 font-semibold mb-1">Fortune Favors The Brave</p>
              <p className="text-white/50 text-sm">Community-driven token on Cronos</p>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-2">
              <p className="text-white/50 text-sm">Contact: fftb.space@gmail.com</p>
              <div className="flex space-x-4">
                <a href="https://fftb.space" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/80 transition-colors text-sm">
                  Website
                </a>
                <a href="https://cronoscan.com/token/0x8eBB879557Db19D36E69b53B99f0ab938a703BEF" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/80 transition-colors text-sm">
                  Cronoscan
                </a>
                <a href="https://dexscreener.com/cronos/0x40d2483fda3a736b292801366d80cd7ca186ac9b" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/80 transition-colors text-sm">
                  DexScreener
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
