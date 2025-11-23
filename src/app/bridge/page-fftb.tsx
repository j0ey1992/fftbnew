'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FFTBLayout from '@/components/layout/FFTBLayout'

export default function BridgePage() {
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'to-zkevm' | 'to-cronos'>('to-zkevm')

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

  const fromChain = direction === 'to-zkevm' ? 'Cronos' : 'Cronos zkEVM'
  const toChain = direction === 'to-zkevm' ? 'Cronos zkEVM' : 'Cronos'

  return (
    <FFTBLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Bridge FFTB
            </span>
          </h1>
          <p className="text-xl text-white/70">
            Move your FFTB tokens between Cronos and Cronos zkEVM
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto mb-8">
          <div className="glass-panel-dark rounded-2xl p-6 border border-yellow-500/20 bg-yellow-500/5">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Important Information</h3>
            <ul className="space-y-2 text-white/70 text-sm list-disc list-inside">
              <li>Bridging involves fees and confirmation times</li>
              <li>Always verify the destination address before confirming</li>
              <li>Start with a small test amount if this is your first time bridging</li>
              <li>Keep some native gas tokens (CRO/zkCRO) on both chains for transactions</li>
              <li>Bridge transactions are irreversible once confirmed</li>
            </ul>
          </div>
        </motion.div>

        {/* Bridge Interface */}
        <motion.div variants={fadeInUp} className="max-w-2xl mx-auto mb-12">
          <div className="glass-panel-dark rounded-2xl p-8 border border-white/10">
            {/* Direction Toggle */}
            <div className="flex items-center justify-center mb-8">
              <button
                onClick={() => setDirection(direction === 'to-zkevm' ? 'to-cronos' : 'to-zkevm')}
                className="btn-glass px-6 py-3 rounded-full font-semibold text-white relative overflow-hidden"
              >
                <span>Switch Direction ⇄</span>
                <span className="btn-shine-effect"></span>
              </button>
            </div>

            {/* From Section */}
            <div className="glass-panel p-6 rounded-xl border border-white/10 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm">From</span>
                <span className="text-white/80 text-sm font-semibold">{fromChain}</span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent border-none text-2xl md:text-3xl font-bold text-white focus:outline-none placeholder-white/30"
                />
                <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <span className="text-blue-400 font-semibold">FFTB</span>
                </div>
              </div>

              <div className="text-white/50 text-sm">
                Balance: -- FFTB
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-background-500 p-2 rounded-full">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* To Section */}
            <div className="glass-panel p-6 rounded-xl border border-white/10 mt-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm">To</span>
                <span className="text-white/80 text-sm font-semibold">{toChain}</span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 text-2xl md:text-3xl font-bold text-white">
                  {amount || '0.0'}
                </div>
                <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <span className="text-purple-400 font-semibold">FFTB</span>
                </div>
              </div>

              <div className="text-white/50 text-sm">
                You will receive
              </div>
            </div>

            {/* Bridge Details */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Bridge Fee</span>
                  <span className="text-white">~0.1-0.5% + gas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Estimated Time</span>
                  <span className="text-white">5-15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">You'll receive</span>
                  <span className="text-white font-semibold">~{(parseFloat(amount) * 0.995).toFixed(4)} FFTB</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              className="w-full btn-glass py-4 rounded-xl font-semibold text-white text-lg relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <span>{!amount || parseFloat(amount) <= 0 ? 'Enter Amount' : 'Connect Wallet to Bridge'}</span>
              <span className="btn-shine-effect"></span>
            </button>
          </div>
        </motion.div>

        {/* Bridge Options */}
        <motion.div variants={fadeInUp} className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Bridge Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel-dark p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">XY Finance</h3>
              <p className="text-white/70 text-sm mb-4">
                Cross-chain bridge aggregator with competitive rates
              </p>
              <a
                href="https://app.xy.finance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium transition-all text-sm"
              >
                Use XY Finance →
              </a>
            </div>

            <div className="glass-panel-dark p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">FFTB Bridge (Coming Soon)</h3>
              <p className="text-white/70 text-sm mb-4">
                Native FFTB bridge with lower fees and faster transfers
              </p>
              <div className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm">
                Coming in Q1 2026
              </div>
            </div>
          </div>
        </motion.div>

        {/* How Bridging Works */}
        <motion.div variants={fadeInUp} className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">How Bridging Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-white/10 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                1️⃣
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Initiate Transfer</h3>
              <p className="text-white/70 text-sm">
                Select source and destination chains, enter amount, and confirm the transaction
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/10 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                2️⃣
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wait for Confirmation</h3>
              <p className="text-white/70 text-sm">
                Bridge processes your transfer - typically takes 5-15 minutes depending on network congestion
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/10 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                3️⃣
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Receive Tokens</h3>
              <p className="text-white/70 text-sm">
                Your FFTB tokens arrive on the destination chain. Check your wallet to confirm
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fee Structure */}
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto mb-12">
          <div className="glass-panel-dark rounded-2xl p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold mb-4 text-white">Fee Structure</h3>
            <div className="space-y-4 text-white/70">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span>Bridge Fee</span>
                <span className="text-white font-semibold">0.1-0.5%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span>Network Gas (Source Chain)</span>
                <span className="text-white font-semibold">~$0.01-0.10</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span>Network Gas (Destination Chain)</span>
                <span className="text-white font-semibold">Included</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-white">Total Estimated Fee</span>
                <span className="text-white font-bold">0.1-0.6%</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 <span className="font-semibold">Tip:</span> Fees vary based on network congestion and bridge provider. Our native bridge (Q1 2026) will offer the lowest fees.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Bridging FAQ</h2>

          <div className="space-y-4">
            <div className="glass-panel-dark p-6 rounded-xl border border-white/10">
              <h4 className="font-bold text-white mb-2">Why do I need to bridge FFTB?</h4>
              <p className="text-white/70 text-sm">
                FFTB exists on both Cronos mainnet and Cronos zkEVM. Bridging allows you to move your tokens between these chains to access different features, DEXs, or opportunities on each network.
              </p>
            </div>

            <div className="glass-panel-dark p-6 rounded-xl border border-white/10">
              <h4 className="font-bold text-white mb-2">How long does bridging take?</h4>
              <p className="text-white/70 text-sm">
                Bridge transfers typically take 5-15 minutes, but can take longer during periods of high network congestion. Always wait for full confirmation on both chains.
              </p>
            </div>

            <div className="glass-panel-dark p-6 rounded-xl border border-white/10">
              <h4 className="font-bold text-white mb-2">What happens if my bridge transaction fails?</h4>
              <p className="text-white/70 text-sm">
                If a bridge transaction fails, your tokens will remain on the source chain. Contact the bridge provider's support if you need assistance. Always save your transaction hash.
              </p>
            </div>

            <div className="glass-panel-dark p-6 rounded-xl border border-white/10">
              <h4 className="font-bold text-white mb-2">Do I need gas tokens on both chains?</h4>
              <p className="text-white/70 text-sm">
                Yes, you'll need CRO on Cronos mainnet or zkCRO on Cronos zkEVM to pay for gas fees. Make sure you have some before bridging.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </FFTBLayout>
  )
}
