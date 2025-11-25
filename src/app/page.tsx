'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '@/components/layout/MainLayout'

// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('Copied!')
}

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center mb-20 overflow-hidden rounded-2xl">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%)',
              width: '177.77777778vh',
              height: '56.25vw',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
            }}
            src="/Website background video 1080p.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium backdrop-blur-sm">
              Community-Driven • Cronos Native
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight drop-shadow-2xl">
            FFTB
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light drop-shadow-lg">
            FORTUNE FAVOURS THE BRAVE
          </p>
          <p className="text-lg text-white/70 max-w-2xl mx-auto drop-shadow-lg">
            Our mission: Increasing the awareness of the Cronos Chain in the cryptospace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 flex flex-wrap justify-center gap-4"
        >
          <Link href="/how-to-buy">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all shadow-xl">
              Get Started
            </button>
          </Link>
          <Link href="/chart">
            <button className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm shadow-xl">
              View Chart
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Contract Addresses Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Contract Addresses</h2>
          <p className="text-white/50">Verified on-chain</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {/* Cronos Contract */}
          <div className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">Cronos</h3>
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs">
                    CRC-20
                  </span>
                </div>
                <p className="font-mono text-sm text-white/60 break-all">
                  0xd677944Df705924AF369d2FCcf4A989f343DbCDf
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://wolfswap.app/swap?referral=494DQLB7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all text-sm font-semibold"
                >
                  Buy
                </a>
                <button
                  onClick={() => copyToClipboard('0xd677944Df705924AF369d2FCcf4A989f343DbCDf')}
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm"
                >
                  Copy
                </button>
                <a
                  href="https://explorer.cronos.org/token/0xd677944Df705924AF369d2FCcf4A989f343DbCDf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm"
                >
                  Explorer →
                </a>
              </div>
            </div>
          </div>

          {/* Cronos zkEVM Contract */}
          <div className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">Cronos zkEVM</h3>
                  <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs">
                    ERC-20
                  </span>
                </div>
                <p className="font-mono text-sm text-white/60 break-all">
                  0x271fD982fA47deB505eF04E0930596cF56F219c9
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard('0x271fD982fA47deB505eF04E0930596cF56F219c9')}
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm"
                >
                  Copy
                </button>
                <a
                  href="https://explorer.zkevm.cronos.org/address/0x271fD982fA47deB505eF04E0930596cF56F219c9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm"
                >
                  Explorer →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <Link href="/chart">
            <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-8 hover:from-blue-500/20 hover:to-blue-600/10 transition-all duration-300 text-center group overflow-hidden border border-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/10 group-hover:to-blue-600/5 transition-all duration-300"></div>
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <svg className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-white">Chart</h3>
                <p className="text-xs text-white/50 mt-1">Live price</p>
              </div>
            </div>
          </Link>

          <Link href="/listings">
            <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-8 hover:from-purple-500/20 hover:to-purple-600/10 transition-all duration-300 text-center group overflow-hidden border border-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/0 group-hover:from-purple-400/10 group-hover:to-purple-600/5 transition-all duration-300"></div>
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <svg className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-white">Listings</h3>
                <p className="text-xs text-white/50 mt-1">Where to find</p>
              </div>
            </div>
          </Link>

          <a href="https://fftb-frontend.vercel.app/" target="_blank" rel="noopener noreferrer">
            <div className="relative bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl p-8 hover:from-cyan-500/20 hover:to-cyan-600/10 transition-all duration-300 text-center group overflow-hidden border border-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-cyan-600/0 group-hover:from-cyan-400/10 group-hover:to-cyan-600/5 transition-all duration-300"></div>
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <svg className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-white">Bridge</h3>
                <p className="text-xs text-white/50 mt-1">Cross-chain</p>
              </div>
            </div>
          </a>

          <a href="https://wolfswap.app/stake" target="_blank" rel="noopener noreferrer">
            <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-8 hover:from-green-500/20 hover:to-green-600/10 transition-all duration-300 text-center group overflow-hidden border border-green-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/10 group-hover:to-green-600/5 transition-all duration-300"></div>
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-white">Staking</h3>
                <p className="text-xs text-white/50 mt-1">Earn 6% APR</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-sm text-white/50 mb-2">COMMUNITY</h3>
              <p className="text-3xl font-bold">Driven</p>
            </div>
            <div>
              <h3 className="text-sm text-white/50 mb-2">MULTI-CHAIN</h3>
              <p className="text-3xl font-bold">Native</p>
            </div>
            <div>
              <h3 className="text-sm text-white/50 mb-2">CONTRACTS</h3>
              <p className="text-3xl font-bold">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About FFTB</h2>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            FFTB is focused on growing Cronos awareness and bridging Crypto.com users into the Cronos ecosystem.
            Built by the community, for the community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:fftb.space@gmail.com" className="text-white/60 hover:text-white transition-colors">
              Contact
            </a>
            <span className="text-white/20">•</span>
            <Link href="/roadmap" className="text-white/60 hover:text-white transition-colors">
              Roadmap
            </Link>
            <span className="text-white/20">•</span>
            <a href="https://assetwatch.app/fftb" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
              AssetWatch Partner
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
