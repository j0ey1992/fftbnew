'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'

export default function AssetWatchPage() {
  const productUrl = 'https://assetwatch.io/products/assetwatch-fftb-track-your-stocks-cryptos-etfs-much-more/?ref=FFTB'

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#1a1a2e] rounded-3xl overflow-hidden">
            {/* Product Image */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
              <Image
                src="https://assetwatch.io/cdn/shop/files/fftbbtc.jpg?v=1721094157&width=823"
                alt="AssetWatch FFTB Edition"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 -mt-16 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#00d4aa]/20 text-[#00d4aa] text-xs font-semibold rounded-full uppercase tracking-wide">
                  Official Partner
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                  FFTB Edition
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                AssetWatch x FFTB
              </h1>
              <p className="text-white/60 mb-6 max-w-2xl">
                Track your stocks, cryptos, ETFs & much more with the ultimate hardware asset tracker.
                Real-time prices displayed on a premium device, laser-engraved with FFTB branding.
              </p>

              <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0052ff] hover:bg-[#0040cc] text-white font-semibold rounded-xl transition-all text-lg"
              >
                Order Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 hover:border-[#0052ff]/30 transition-colors">
            <div className="w-12 h-12 bg-[#0052ff]/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0052ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Data</h3>
            <p className="text-white/60 text-sm">
              Live price updates for FFTB, BTC, ETH, and thousands of other assets. Always stay informed.
            </p>
          </div>

          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 hover:border-[#00d4aa]/30 transition-colors">
            <div className="w-12 h-12 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Premium Quality</h3>
            <p className="text-white/60 text-sm">
              High-quality display with laser-engraved "Fortune Favours The Brave" signature edition.
            </p>
          </div>

          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Custom Wallpapers</h3>
            <p className="text-white/60 text-sm">
              Exclusive FFTB and Cronos ecosystem wallpapers pre-loaded on your device.
            </p>
          </div>
        </motion.div>

        {/* What You Can Track */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              What You Can Track
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Cryptocurrencies', desc: 'BTC, ETH, CRO, FFTB & more' },
                { name: 'Stocks', desc: 'AAPL, TSLA, NVDA & more' },
                { name: 'ETFs', desc: 'SPY, QQQ, VOO & more' },
                { name: 'Commodities', desc: 'Gold, Silver, Oil & more' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white font-semibold mb-1">{item.name}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Setup Steps */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simple Setup
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Power On', desc: 'Connect to power via USB-C' },
                { step: '02', title: 'Connect WiFi', desc: 'Join AssetWatch network' },
                { step: '03', title: 'Configure', desc: 'Visit assetwatch.local' },
                { step: '04', title: 'Track', desc: 'Select FFTB and enjoy' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto bg-[#0052ff]/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-[#0052ff] font-bold font-mono">{item.step}</span>
                  </div>
                  <p className="text-white font-semibold mb-1">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-[#0052ff]/20 to-[#00d4aa]/20 rounded-2xl p-8 text-center border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Track Your Assets?
            </h2>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Get your exclusive FFTB Edition AssetWatch and never miss a price movement again.
            </p>
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              Order Your AssetWatch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}
