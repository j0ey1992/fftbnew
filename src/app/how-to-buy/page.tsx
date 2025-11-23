'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

// Copy to clipboard function
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text)
  alert(`${label} copied to clipboard!`)
}

export default function HowToBuyPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: 1,
      title: 'Set Up Your Wallet',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <p className="text-white/80 text-lg">Choose and install a compatible wallet:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white mb-3 text-lg">Crypto.com Onchain Wallet</h4>
              <p className="text-white/60 text-sm mb-4">Official wallet with native Cronos support</p>
              <a
                href="https://crypto.com/defi-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all text-sm hover:bg-white/5"
              >
                Download Wallet →
              </a>
            </div>

            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white mb-3 text-lg">MetaMask</h4>
              <p className="text-white/60 text-sm mb-4">Popular wallet with Cronos support</p>
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all text-sm hover:bg-white/5"
              >
                Download Wallet →
              </a>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h4 className="font-bold text-blue-400 mb-3">Add Cronos Network to MetaMask</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Network Name:</span>
                <span className="text-white font-mono">Cronos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Chain ID:</span>
                <span className="text-white font-mono">25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">RPC URL:</span>
                <span className="text-white font-mono text-xs">https://evm.cronos.org</span>
              </div>
            </div>
            <a
              href="https://docs.cronos.org/for-users/metamask"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              View full setup guide →
            </a>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: 'Fund Your Wallet with CRO',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <p className="text-white/80 text-lg">Get CRO tokens to pay for gas and trade:</p>

          <div className="space-y-4">
            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white mb-3">Option 1: Buy on Crypto.com Exchange</h4>
              <ol className="space-y-2 text-white/60 text-sm list-decimal list-inside mb-4">
                <li>Purchase CRO on Crypto.com Exchange</li>
                <li>Withdraw to your Cronos wallet address</li>
                <li>Select "Cronos" as the withdrawal network</li>
                <li>Confirm and wait for the transfer</li>
              </ol>
              <a
                href="https://crypto.com/app/q8yd7pn44j"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all text-sm hover:bg-white/5"
              >
                Sign up for Crypto.com →
              </a>
            </div>

            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
              <h4 className="font-bold text-white mb-3">Option 2: Bridge from Other Chains</h4>
              <p className="text-white/60 text-sm mb-3">Use official Cronos Bridge or third-party bridges:</p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href="https://cronos.org/bridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all text-sm hover:bg-white/5"
                >
                  Cronos Bridge
                </a>
                <a
                  href="https://zkevm.cronos.org/bridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all text-sm hover:bg-white/5"
                >
                  zkEVM Bridge →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <p className="text-yellow-400 font-semibold mb-2">💡 Pro Tip</p>
            <p className="text-white/70 text-sm">
              Keep some CRO in your wallet for gas fees. Transaction fees on Cronos are very low (usually less than $0.01)
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h4 className="font-bold text-blue-400 mb-3">For zkEVM Users</h4>
            <p className="text-white/70 text-sm mb-3">
              If you want to use Cronos zkEVM, you'll need to bridge CRO to zkCRO:
            </p>
            <a
              href="https://docs-zkevm.cronos.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-400 hover:text-blue-300 text-sm"
            >
              View zkEVM bridging guide →
            </a>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: 'Buy FFTB on a DEX',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <p className="text-white/80 text-lg">Trade your CRO for FFTB tokens:</p>

          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
            <h4 className="font-bold text-red-400 mb-3">IMPORTANT: Always Use Contract Address</h4>
            <p className="text-white/60 text-sm mb-4">
              Do NOT search by name. Always paste the contract address directly to avoid scams.
            </p>

            <div className="space-y-3">
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-white/60 text-xs mb-2">Cronos Contract:</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-white/90 font-mono text-sm break-all">
                    0xd677944Df705924AF369d2FCcf4A989f343DbCDf
                  </code>
                  <button
                    onClick={() => copyToClipboard('0xd677944Df705924AF369d2FCcf4A989f343DbCDf', 'Cronos contract address')}
                    className="px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-semibold whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-white/60 text-xs mb-2">Cronos zkEVM Contract:</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-white/90 font-mono text-sm break-all">
                    0x271fD982fA47deB505eF04E0930596cF56F219c9
                  </code>
                  <button
                    onClick={() => copyToClipboard('0x271fD982fA47deB505eF04E0930596cF56F219c9', 'zkEVM contract address')}
                    className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-semibold whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">Trading Steps:</h4>

            <div className="border border-white/10 p-5 rounded-xl hover:border-white/20 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h5 className="font-semibold text-white mb-1">Open WolfSwap</h5>
                  <p className="text-white/60 text-sm">Go to WolfSwap DEX to trade FFTB</p>
                </div>
              </div>
              <a
                href="https://wolfswap.app/swap?referral=494DQLB7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all text-sm hover:bg-white/5"
              >
                Open WolfSwap →
              </a>
            </div>

            <div className="border border-white/10 p-5 rounded-xl hover:border-white/20 transition-colors">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h5 className="font-semibold text-white mb-2">Paste Contract Address</h5>
                  <p className="text-white/60 text-sm mb-3">In the token selector, paste the FFTB contract address</p>
                  <p className="text-yellow-400 text-sm">Start with 1-2% slippage, only increase if the transaction fails</p>
                </div>
              </div>
            </div>

            <div className="border border-white/10 p-5 rounded-xl hover:border-white/20 transition-colors">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h5 className="font-semibold text-white mb-1">Confirm & Swap</h5>
                  <p className="text-white/60 text-sm">Review the details and confirm the transaction in your wallet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <p className="text-green-400 font-semibold mb-2">🎉 Success!</p>
            <p className="text-white/70 text-sm">
              Once the transaction confirms, you'll see FFTB tokens in your wallet. Welcome to the FFTB community!
            </p>
          </div>
        </div>
      )
    },
    {
      number: 4,
      title: 'Bridge Between Chains (Optional)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <p className="text-white/80 text-lg">Move FFTB between Cronos and Cronos zkEVM:</p>

          <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
            <h4 className="font-bold text-white mb-4">Using FFTB Bridge</h4>
            <p className="text-white/60 text-sm mb-4">
              If you want to move your FFTB tokens between Cronos mainnet and zkEVM, you can use the bridge functionality:
            </p>
            <Link href="/bridge">
              <button className="px-6 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all hover:bg-white/5">
                Go to Bridge →
              </button>
            </Link>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <h4 className="font-bold text-yellow-400 mb-3">⚠️ Important Bridge Information</h4>
            <ul className="space-y-2 text-white/70 text-sm list-disc list-inside">
              <li>Bridging involves fees and confirmation times</li>
              <li>Always double-check the destination address</li>
              <li>Start with a small test amount first</li>
              <li>Keep some native gas tokens (CRO/zkCRO) on both chains</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <MainLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            How to Buy FFTB
          </h1>
          <p className="text-xl text-white/60">
            Follow these simple steps to get your FFTB tokens
          </p>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto">
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => setActiveStep(index)}
                  className={`flex flex-col items-center min-w-[80px] transition-all ${
                    activeStep === index
                      ? 'scale-110'
                      : activeStep > index
                      ? 'opacity-60'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                      activeStep === index
                        ? 'bg-blue-500/20 border-2 border-blue-400 scale-110'
                        : activeStep > index
                        ? 'bg-green-500/20 border-2 border-green-400'
                        : 'bg-white/5 border-2 border-white/20'
                    }`}
                  >
                    {activeStep > index ? '✓' : step.icon}
                  </div>
                  <span className={`text-xs font-medium text-center ${activeStep === index ? 'text-white' : 'text-white/50'}`}>
                    Step {step.number}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 md:w-16 mx-2 ${activeStep > index ? 'bg-green-400' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="border border-white/10 rounded-2xl p-8 bg-black/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-white">{steps[activeStep].icon}</div>
                <div>
                  <div className="text-sm text-white/50 mb-1">Step {steps[activeStep].number} of {steps.length}</div>
                  <h2 className="text-2xl font-bold text-white">{steps[activeStep].title}</h2>
                </div>
              </div>

              <div>{steps[activeStep].content}</div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="px-6 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  ← Previous
                </button>

                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                    className="px-6 py-2 rounded-lg bg-white text-black font-semibold transition-all hover:bg-white/90"
                  >
                    Next →
                  </button>
                ) : (
                  <Link href="/">
                    <button className="px-6 py-2 rounded-lg bg-white text-black font-semibold transition-all hover:bg-white/90">
                      Done ✓
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/chart">
            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all text-center cursor-pointer bg-black/20">
              <div className="mb-3 flex justify-center">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">View Chart</h3>
            </div>
          </Link>

          <Link href="/listings">
            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all text-center cursor-pointer bg-black/20">
              <div className="mb-3 flex justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="font-bold text-white">View Listings</h3>
            </div>
          </Link>

          <Link href="/bridge">
            <div className="border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all text-center cursor-pointer bg-black/20">
              <div className="mb-3 flex justify-center">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Use Bridge</h3>
            </div>
          </Link>
        </div>
      </motion.div>
    </MainLayout>
  )
}
