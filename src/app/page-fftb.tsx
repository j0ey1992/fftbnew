'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import FFTBLayout from '@/components/layout/FFTBLayout'

// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('Contract address copied to clipboard!')
}

export default function Home() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <FFTBLayout>
      {/* Hero Section */}
      <motion.div
        className="text-center mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Fortune Favors The Brave
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto">
          A community-driven token on Cronos focused on growing Cronos awareness and bridging Crypto.com users into the Cronos ecosystem
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/how-to-buy">
            <motion.button
              className="btn-glass px-8 py-4 rounded-full font-semibold text-white text-lg relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>How to Buy</span>
              <span className="btn-shine-effect"></span>
            </motion.button>
          </Link>
          <Link href="/chart">
            <motion.button
              className="px-8 py-4 rounded-full font-semibold text-white text-lg border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              View Chart
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Contract Addresses Section */}
      <motion.div
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Contract Addresses
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Cronos Contract */}
          <motion.div
            className="glass-panel-dark rounded-2xl p-6 border border-white/10"
            variants={fadeInUp}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-blue-400 mb-2">Cronos (CRC-20)</h3>
              <p className="text-white/60 text-sm">Main contract on Cronos chain</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-white/90 font-mono text-sm break-all">
                0x8eBB879557Db19D36E69b53B99f0ab938a703BEF
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard('0x8eBB879557Db19D36E69b53B99f0ab938a703BEF')}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium transition-all text-sm"
              >
                Copy Address
              </button>
              <a
                href="https://cronoscan.com/token/0x8eBB879557Db19D36E69b53B99f0ab938a703BEF"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium transition-all text-sm text-center"
              >
                View on Cronoscan
              </a>
            </div>
          </motion.div>

          {/* Cronos zkEVM Contract */}
          <motion.div
            className="glass-panel-dark rounded-2xl p-6 border border-white/10"
            variants={fadeInUp}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-purple-400 mb-2">Cronos zkEVM (ERC-20)</h3>
              <p className="text-white/60 text-sm">Contract on Cronos zkEVM chain</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-white/90 font-mono text-sm break-all">
                0x271fD982fA47deB505eF04E0930596cF56F219c9
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard('0x271fD982fA47deB505eF04E0930596cF56F219c9')}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 font-medium transition-all text-sm"
              >
                Copy Address
              </button>
              <a
                href="https://explorer.zkevm.cronos.org/address/0x271fD982fA47deB505eF04E0930596cF56F219c9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium transition-all text-sm text-center"
              >
                View on Explorer
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Links Section */}
      <motion.div
        className="mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Quick Links
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <Link href="/chart">
            <motion.div
              className="glass-panel-dark rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-white mb-2">Live Chart</h3>
              <p className="text-white/60 text-sm">View real-time price and trading data</p>
            </motion.div>
          </Link>

          <Link href="/listings">
            <motion.div
              className="glass-panel-dark rounded-xl p-6 border border-white/10 hover:border-green-400/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-bold text-white mb-2">Listings</h3>
              <p className="text-white/60 text-sm">Find FFTB on DEXs and trackers</p>
            </motion.div>
          </Link>

          <Link href="/bridge">
            <motion.div
              className="glass-panel-dark rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-3xl mb-3">🌉</div>
              <h3 className="font-bold text-white mb-2">Bridge</h3>
              <p className="text-white/60 text-sm">Bridge between Cronos and zkEVM</p>
            </motion.div>
          </Link>

          <Link href="/staking">
            <motion.div
              className="glass-panel-dark rounded-xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-white mb-2">Staking</h3>
              <p className="text-white/60 text-sm">Earn 6% APR by staking FFTB</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Key Features */}
      <motion.div
        className="mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Why FFTB?
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <motion.div
            className="glass-panel p-6 rounded-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-3">Community-Driven</h3>
            <p className="text-white/70">Built by the community, for the community. Join us in growing the Cronos ecosystem.</p>
          </motion.div>

          <motion.div
            className="glass-panel p-6 rounded-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-4xl mb-4">🌉</div>
            <h3 className="text-xl font-bold mb-3">Multi-Chain</h3>
            <p className="text-white/70">Available on both Cronos and Cronos zkEVM. Bridge seamlessly between chains.</p>
          </motion.div>

          <motion.div
            className="glass-panel p-6 rounded-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-4xl mb-4">💪</div>
            <h3 className="text-xl font-bold mb-3">Transparent</h3>
            <p className="text-white/70">Fully verified contracts. No hidden surprises. What you see is what you get.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Partner Section */}
      <motion.div
        className="mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="glass-panel-dark rounded-2xl p-8 border border-white/10 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Track Your FFTB with AssetWatch
            </span>
          </h2>
          <p className="text-white/70 mb-6">
            Monitor your FFTB holdings and track your Cronos assets with our partner AssetWatch
          </p>
          <a
            href="https://assetwatch.app/fftb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.button
              className="btn-glass px-8 py-3 rounded-full font-semibold text-white relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Visit AssetWatch</span>
              <span className="btn-shine-effect"></span>
            </motion.button>
          </a>
        </div>
      </motion.div>
    </FFTBLayout>
  )
}
