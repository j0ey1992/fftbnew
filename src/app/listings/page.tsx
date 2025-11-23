'use client'

import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'

export default function ListingsPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const Card = ({ href, title, subtitle, icon, action = "Trade", badge }: { href: string, title: string, subtitle: string, icon: React.ReactNode, action?: string, badge?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col bg-[#111318] border border-white/5 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="p-3 bg-[#1A1D24] rounded-xl group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
        <div className="flex gap-2">
          {badge && (
             <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
               {badge}
             </span>
          )}
        </div>
      </div>
      
      <div className="relative z-10 mt-auto">
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 text-xs mt-1 mb-4 font-medium">
          {subtitle}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-blue-500/20 transition-colors">
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
            {action}
          </span>
          <svg 
            className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  )

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0B0E11] text-white">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20"
        >
          {/* Header Section */}
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Markets
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              Access FFTB across the Cronos ecosystem. Trade, bridge, and track your assets with our trusted partners.
            </p>
          </motion.div>

          {/* DEXs Section */}
          <motion.div variants={fadeInUp} className="mb-24">
            <div className="flex items-center gap-4 mb-8 px-2">
              <h2 className="text-2xl font-bold text-white">Exchanges & DEXs</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <Card 
                href="https://wolfswap.app/swap?referral=494DQLB7"
                title="WolfSwap"
                subtitle="FFTB/WCRO • Best Rates"
                action="Swap Now"
                badge="Recommended"
                icon={
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <Card 
                href="https://crypto.com/eea/defi-wallet"
                title="Crypto.com DeFi"
                subtitle="Official Wallet & DEX"
                action="Connect Wallet"
                icon={
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
              />
              <Card 
                href="https://vvs.finance/swap?inputCurrency=CRO&outputCurrency=0xd677944Df705924AF369d2FCcf4A989f343DbCDf"
                title="VVS Finance"
                subtitle="Major Cronos Liquidity"
                icon={
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <Card 
                href="https://www.sushi.com/cronos/swap?token0=NATIVE&token1=0xd677944df705924af369d2fccf4a989f343dbcdf"
                title="Sushi Swap"
                subtitle="Multi-chain Protocol"
                icon={
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
              />
              <Card 
                href="https://app.ebisusbay.com/dex/swap?chain=cronosZkEVM&outputCurrency=0x271fd982fa47Deb505eF04e0930596cf56F219C9"
                title="Ebisu's Bay"
                subtitle="NFT Marketplace & DEX"
                badge="zkEVM"
                icon={
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
              <Card 
                href="https://obsidian.finance/?outputCurrency=0xd677944Df705924AF369d2FCcf4A989f343DbCDf"
                title="Obsidian"
                subtitle="Finance Protocol"
                icon={
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
              />
              <Card 
                href="https://swap.doonft.com/?output=0xd677944Df705924AF369d2FCcf4A989f343DbCDf"
                title="Doo Swap"
                subtitle="Community DEX"
                icon={
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <Card 
                href="https://www.puush.fun/swap?inputToken=0x0000000000000000000000000000000000000000&outputToken=0xd677944df705924af369d2fccf4a989f343dbcdf"
                title="Puush Dot Fun"
                subtitle="Meme Aggregator"
                icon={
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </motion.div>

          {/* Bridges */}
          <motion.div variants={fadeInUp} className="mb-24">
            <div className="flex items-center gap-4 mb-8 px-2">
              <h2 className="text-2xl font-bold text-white">Bridges</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Card 
                href="https://xy.finance/"
                title="XY Finance"
                subtitle="Cross-chain Aggregator"
                action="Bridge Assets"
                icon={
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              />
              <Card 
                href="https://allchainbridge.com/"
                title="AllChain Bridge"
                subtitle="Universal Bridge"
                action="Bridge Assets"
                icon={
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </motion.div>

          {/* Analytics Section */}
          <motion.div variants={fadeInUp} className="mb-24">
            <div className="flex items-center gap-4 mb-8 px-2">
              <h2 className="text-2xl font-bold text-white">Analytics & Explorers</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card 
                href="https://dexscreener.com/cronos/0xd677944Df705924AF369d2FCcf4A989f343DbCDf"
                title="DexScreener"
                subtitle="Real-time Charts"
                action="View Chart"
                icon={
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                }
              />
               <Card 
                href="https://www.geckoterminal.com/cro/pools/0x5aa62d8711ca4af5c3f809a3cbe8d7ed6a0bd9c2"
                title="GeckoTerminal"
                subtitle="Pool Analytics"
                action="View Data"
                icon={
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <Card 
                href="https://explorer.cronos.org/token/0xd677944Df705924AF369d2FCcf4A989f343DbCDf"
                title="Cronos Explorer"
                subtitle="Blockchain Data"
                action="Verify"
                icon={
                   <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                }
              />
               <Card 
                href="https://explorer.zkevm.cronos.org/address/0x271fD982fA47deB505eF04E0930596cF56F219c9"
                title="zkEVM Explorer"
                subtitle="L2 Blockchain Data"
                action="Verify"
                badge="zkEVM"
                icon={
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
            </div>
          </motion.div>

          {/* Contracts Section - Redesigned as "Asset Details" */}
          <motion.div
            variants={fadeInUp}
            className="mt-24 bg-[#111318] border border-white/5 rounded-3xl p-8 lg:p-12 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                 <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Token Verification</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <p className="text-sm text-slate-400 mb-2 font-medium uppercase tracking-wider">Cronos (CRC-20)</p>
                    <div className="flex items-center gap-3 p-4 bg-black/30 border border-white/10 rounded-xl font-mono text-slate-200 text-sm break-all hover:border-blue-500/50 transition-colors group">
                      <span>0xd677944Df705924AF369d2FCcf4A989f343DbCDf</span>
                       <svg className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                 </div>
                 
                 <div>
                    <p className="text-sm text-slate-400 mb-2 font-medium uppercase tracking-wider">Cronos zkEVM</p>
                    <div className="flex items-center gap-3 p-4 bg-black/30 border border-white/10 rounded-xl font-mono text-slate-200 text-sm break-all hover:border-blue-500/50 transition-colors group">
                      <span>0x271fD982fA47deB505eF04E0930596cF56F219c9</span>
                       <svg className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                 </div>
              </div>
              
              <div className="flex flex-col justify-center">
                 <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-6">
                    <p className="text-yellow-500/80 text-sm leading-relaxed">
                      <strong className="block mb-2 text-yellow-500">Safety Notice</strong>
                      Always verify contract addresses on official explorers. Do not rely solely on search results or third-party aggregators which may display outdated information.
                    </p>
                 </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </MainLayout>
  )
}
