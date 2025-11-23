'use client'

import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'

export default function RoadmapPage() {
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
        staggerChildren: 0.1
      }
    }
  }

  const roadmapPhases = [
    {
      quarter: 'Q4 2025',
      title: 'Foundation & Consolidation',
      status: 'in-progress',
      color: 'from-blue-500 to-cyan-500',
      tasks: [
        { text: 'Consolidate contracts: pin verified Cronos + zkEVM addresses site-wide', completed: true },
        { text: 'Replace "How to Buy" with clean stepper + copy buttons', completed: true },
        { text: 'Launch listings hub (Dexscreener, MemesOnCronos, explorers)', completed: true },
        { text: 'Update staking to 6% APR across UI + docs', completed: false },
        { text: 'Add AssetWatch partner card + outbound CTA', completed: true }
      ]
    },
    {
      quarter: 'Q1 2026',
      title: 'Enhanced Infrastructure',
      status: 'planned',
      color: 'from-purple-500 to-pink-500',
      tasks: [
        { text: 'Release internal liquidity bridge MVP (spread-based; no new zkEVM contract)', completed: false },
        { text: 'Add on-site price widget (embedded Dexscreener/GeckoTerminal with pair switcher)', completed: false },
        { text: 'Ship analytics lite (holders, LP depth, pairs) pulled from Cronoscan/Dexscreener APIs', completed: false }
      ]
    },
    {
      quarter: 'Q2 2026',
      title: 'Growth & Expansion',
      status: 'future',
      color: 'from-green-500 to-emerald-500',
      tasks: [
        { text: 'CEX-style UX swap page (one-click route select: VVS/Ebisu)', completed: false },
        { text: 'Community growth: Cronos Chain quests + cross-chain incentives (measurable KPIs)', completed: false },
        { text: 'Partnership announcements and ecosystem expansion', completed: false }
      ]
    }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      'in-progress': { text: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      'planned': { text: 'Planned', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      'future': { text: 'Future', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    }
    const badge = badges[status as keyof typeof badges]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0B0E11] text-white">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20"
        >
          {/* Header */}
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Our Roadmap
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              Our journey to build the premier community token on Cronos, driven by innovation and community.
            </p>
          </motion.div>

          {/* Roadmap Timeline */}
          <div className="max-w-4xl mx-auto space-y-12 relative">
            {roadmapPhases.map((phase, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative flex items-start md:items-center group"
              >
                {/* Vertical Line */}
                {index < roadmapPhases.length - 1 && (
                  <div className="absolute left-4 md:left-[calc(50%-1px)] w-0.5 h-full bg-white/10 group-hover:bg-blue-500/50 transition-colors duration-300 z-0" />
                )}

                {/* Dot Indicator */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-[#0B0E11] border-2 border-white/20 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500 transition-colors duration-300">
                   <div className={`w-3 h-3 rounded-full ${
                      phase.status === 'in-progress' ? 'bg-blue-500' :
                      phase.status === 'planned' ? 'bg-purple-500' :
                      'bg-green-500'
                   } group-hover:scale-125 transition-transform duration-300`} />
                </div>

                {/* Content Card */}
                <div className="flex-1 ml-6 md:ml-12 p-6 bg-[#111318] border border-white/5 rounded-2xl shadow-xl transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]">
                   <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3">
                         <h2 className="text-xl font-bold text-white">{phase.quarter}</h2>
                         {getStatusBadge(phase.status)}
                      </div>
                      <p className="text-slate-400 text-sm font-medium">{phase.title}</p>
                   </div>

                   <ul className="space-y-3">
                      {phase.tasks.map((task, taskIndex) => (
                         <li key={taskIndex} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5 ${
                               task.completed
                                 ? 'bg-green-500/20 text-green-400'
                                 : 'border border-white/20 text-slate-500'
                            }`}>
                               {task.completed && (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                               )}
                            </div>
                            <p className={`text-base leading-relaxed ${task.completed ? 'text-slate-300 line-through' : 'text-slate-200'}`}>
                               {task.text}
                            </p>
                         </li>
                      ))}
                   </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Vision Section */}
          <motion.div
            variants={fadeInUp}
            className="mt-24 bg-[#111318] border border-white/5 rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-30 blur-3xl pointer-events-none" />
             
             <div className="relative z-10 text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                   Our Vision
                </h2>
                <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                   FFTB aims to be the bridge that brings Crypto.com users into the Cronos ecosystem. We're building sustainable infrastructure, fostering community growth, and creating real utility for token holders.
                </p>
             </div>

             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/20 border border-white/5 p-6 rounded-xl hover:border-blue-500/30 transition-colors group">
                   <div className="mb-4 flex justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto items-center">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                   </div>
                   <h3 className="font-bold text-white mb-2 text-center text-lg">Community First</h3>
                   <p className="text-slate-400 text-sm text-center">
                      Every decision prioritizes the community and long-term sustainability.
                   </p>
                </div>

                <div className="bg-black/20 border border-white/5 p-6 rounded-xl hover:border-purple-500/30 transition-colors group">
                   <div className="mb-4 flex justify-center w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 mx-auto items-center">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                     </svg>
                   </div>
                   <h3 className="font-bold text-white mb-2 text-center text-lg">Building Utility</h3>
                   <p className="text-slate-400 text-sm text-center">
                      Real features and tools that provide value to Cronos users.
                   </p>
                </div>

                <div className="bg-black/20 border border-white/5 p-6 rounded-xl hover:border-cyan-500/30 transition-colors group">
                   <div className="mb-4 flex justify-center w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto items-center">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                     </svg>
                   </div>
                   <h3 className="font-bold text-white mb-2 text-center text-lg">Transparent</h3>
                   <p className="text-slate-400 text-sm text-center">
                      Open communication and clear roadmap for the community.
                   </p>
                </div>
             </div>
          </motion.div>

          {/* Community CTA */}
          <motion.div
            variants={fadeInUp}
            className="mt-24 text-center"
          >
             <div className="bg-[#111318] border border-white/5 rounded-3xl p-8 max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-30 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                   <h3 className="text-3xl font-bold mb-4 text-white">Join Our Mission</h3>
                   <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                      Fortune Favors The Brave. Be part of building the future of Cronos. Connect with us and contribute!
                   </p>
                   <div className="flex flex-wrap justify-center gap-4">
                      <a
                         href="https://wolfswap.app/swap"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
                      >
                         Buy FFTB
                      </a>
                      <a
                         href="mailto:fftb.space@gmail.com"
                         className="px-8 py-4 bg-[#1A1D24] text-white font-bold rounded-xl hover:bg-[#252932] transition-colors border border-white/5"
                      >
                         Contact Us
                      </a>
                   </div>
                </div>
             </div>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  )
}
