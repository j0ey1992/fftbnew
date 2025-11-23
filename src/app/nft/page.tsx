'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'

export default function NftPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Main Drop Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#1a1a2e] rounded-3xl overflow-hidden">
            {/* Hero Image */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
              <Image
                src="/missioncro.avif"
                alt="Pioneers of 212"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 -mt-20 relative z-10">
              {/* Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#00d4aa]/20 text-[#00d4aa] text-xs font-semibold rounded-full uppercase tracking-wide">
                  Genesis Drop
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                  3,000 NFTs
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Pioneers of 212
              </h1>
              <p className="text-white/60 mb-6">by Mission CRO</p>

              {/* CTA Button */}
              <a
                href="https://crypto.com/nft/drops-event/3cf2f9a7d0c5a032ba15bd3076eb20f8?tab=shop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0052ff] hover:bg-[#0040cc] text-white font-semibold rounded-xl transition-all"
              >
                View on Crypto.com NFT
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* About the Drop */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#1a1a2e] rounded-2xl p-6 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About the Drop
              </h2>
              <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                <p>
                  We are thrilled to introduce the "Pioneers of 212" collection, marking a defining moment for the Cronos community. This exclusive release of 3,000 unique NFTs celebrates the visionaries and trailblazers who have supported the growth of the Cronos ecosystem from the beginning.
                </p>
                <p>
                  This Genesis NFT collection is more than just digital art—it's a tribute to the pioneers who saw the limitless potential of Cronos and helped build the foundation for what's to come. By minting your Pioneers of 212 NFT, you're not only securing a piece of history but also unlocking a range of exclusive benefits, including giveaways, premium perks, and much more.
                </p>
                <p className="text-white/90 font-medium">
                  Mint your NFT today and claim your place as a true pioneer of the Cronos ecosystem. The future is ours to shape—are you ready to join the journey?
                </p>
              </div>
            </div>
          </motion.div>

          {/* Utility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[#1a1a2e] rounded-2xl p-6 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Utility
              </h2>
              <p className="text-white/50 text-xs mb-4">Holder benefits included:</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#0052ff]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0052ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Airdrops</p>
                    <p className="text-white/50 text-xs">Exclusive token rewards</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">AssetWatch</p>
                    <p className="text-white/50 text-xs">Premium features</p>
                  </div>
                </div>
              </div>

              <a
                href="https://crypto.com/nft/drops-event/3cf2f9a7d0c5a032ba15bd3076eb20f8?tab=shop"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-[#0052ff] hover:text-[#3377ff] text-xs font-medium transition-colors"
              >
                View Terms & Conditions →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Creator Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-[#1a1a2e] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About the Creator
            </h2>

            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0052ff] to-[#00d4aa] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#1a1a2e] flex items-center justify-center">
                    <span className="text-xl font-bold text-white">MC</span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">Mission CRO</p>
                  <a
                    href="https://crypto.com/nft/profile/missioncro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0052ff] hover:text-[#3377ff] text-sm transition-colors"
                  >
                    @missioncro
                  </a>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  The Pioneers of 212 collection marks a milestone for the Cronos Community as the GENESIS EDITION from Mission CRO! Claim your place as a true OG of the Cronos ecosystem with meaningful benefits for holders.
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  This collection is a celebration of those who had the vision and courage to believe in the limitless potential of the Cronos ecosystem, embodying the spirit of exploration and community.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-white/30 text-xs leading-relaxed px-2">
            Crypto.com is responsible for the minting, custody, and operation of the platform to allow the buying and selling of NFTs. Crypto.com accepts no responsibility in respect of the operation of the giveaway nor the quality and/or distribution of prizes or items attached which shall be the sole responsibility of the Contributor. The Terms and Conditions of the giveaway shall be a binding agreement between you and the Contributor only, and you accept that Crypto.com shall incur no liability in relation to the terms attached.
          </p>
        </motion.div>
      </div>
    </MainLayout>
  );
}
