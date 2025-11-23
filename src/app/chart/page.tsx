'use client'

import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'

export default function ChartPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0B0E11] text-white pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Ticker Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-white/5">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-bold text-white tracking-tight">FFTB/WCRO</h1>
                 <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold uppercase">Cronos</span>
               </div>
               <p className="text-slate-400 text-sm font-medium">Fortune Favours The Brave</p>
             </div>
             
             <div className="flex items-center gap-8 mt-6 md:mt-0 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                <div className="flex flex-col">
                   <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Pair</span>
                   <span className="text-sm font-mono font-medium text-white">WCRO</span>
                </div>
                 <div className="flex flex-col">
                   <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Chain</span>
                   <span className="text-sm font-mono font-medium text-white">CRC-20</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Liquidity</span>
                   <span className="text-sm font-mono font-medium text-green-400">Active</span>
                </div>
                 <div className="flex flex-col">
                   <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</span>
                   <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-sm font-mono font-medium text-white">Live</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Main Chart Area */}
            <div className="lg:col-span-9 flex flex-col gap-6">
               <div className="bg-[#111318] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative h-[600px] lg:h-[700px]">
                  {/* Chart Toolbar */}
                  <div className="absolute top-0 left-0 right-0 h-12 bg-[#1A1D24] border-b border-white/5 flex items-center px-4 justify-between z-10">
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">Price Chart</span>
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <div className="flex gap-2">
                           <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">1H</span>
                           <span className="text-xs text-blue-400 font-bold cursor-pointer">4H</span>
                           <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">1D</span>
                           <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">1W</span>
                        </div>
                     </div>
                     <a 
                       href="https://dexscreener.com/cronos/0xd677944Df705924AF369d2FCcf4A989f343DbCDf" 
                       target="_blank"
                       className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                     >
                        DexScreener <span className="text-[10px]">↗</span>
                     </a>
                  </div>
                  
                  {/* Iframe */}
                  <div className="absolute inset-0 pt-12 bg-[#111318]">
                     <iframe
                        src="https://dexscreener.com/cronos/0xd677944Df705924AF369d2FCcf4A989f343DbCDf?embed=1&theme=dark&trades=0&info=0"
                        className="w-full h-full"
                        style={{ border: '0' }}
                        allowFullScreen
                      />
                  </div>
               </div>
               
               {/* Contract Address Bar */}
               <div className="bg-[#111318] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <span className="text-sm text-slate-400 font-medium">CA:</span>
                  <div className="flex-1 flex items-center bg-black/30 rounded px-3 py-2 w-full md:w-auto border border-white/5 font-mono text-sm text-slate-200 select-all">
                    0xd677944Df705924AF369d2FCcf4A989f343DbCDf
                  </div>
                  <a href="https://explorer.cronos.org/token/0xd677944Df705924AF369d2FCcf4A989f343DbCDf" target="_blank" className="text-xs text-slate-500 hover:text-white transition-colors whitespace-nowrap">
                     View on Explorer
                  </a>
               </div>
            </div>

            {/* Sidebar / Order Panel */}
            <div className="lg:col-span-3 flex flex-col gap-6">
               {/* Primary Action Card */}
               <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 flex flex-col">
                  <div className="mb-6">
                     <h3 className="text-lg font-bold text-white mb-1">Trade FFTB</h3>
                     <p className="text-sm text-slate-400">Buy or Sell on WolfSwap</p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Market</span>
                        <span className="text-white font-medium">WolfSwap V2</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Slippage</span>
                        <span className="text-white font-medium">~1-2%</span>
                     </div>
                  </div>
                  
                  <a
                    href="https://wolfswap.app/swap?referral=494DQLB7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
                      Trade Now
                    </button>
                  </a>
               </div>

               {/* Quick Info */}
                <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 flex-1">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Market Data</h3>
                  <div className="space-y-4">
                     <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 mb-1">Primary Pair</div>
                        <div className="text-sm font-bold text-white">FFTB / WCRO</div>
                     </div>
                      <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 mb-1">Route</div>
                        <div className="text-sm font-bold text-white">Cronos Mainnet</div>
                     </div>
                     <div className="p-4 mt-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                        <div className="flex items-start gap-2">
                           <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                           <p className="text-xs text-yellow-500/80 leading-relaxed">
                              This is a decentralized asset. Always do your own research.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}
