'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import MainLayout from '@/components/layout/MainLayout'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { FaqSection } from '@/components/ui/FaqSection'
import { QuickActions } from '@/components/ui/QuickActions'
import { CoinStakingCard } from '@/components/ui/CoinStakingCard'
import { SafeImage } from '@/components/ui/SafeImage'
import { getEnabledStakingContracts, getEnabledNftStakingContracts } from '@/lib/api-service'
import { getEnabledLpStakingContracts } from '@/lib/firebase/lp-staking-contracts'
import { getEnabledV3Farms } from '@/lib/firebase/v3-farms'
import { StakingContractData, NftStakingContractData } from '@/lib/firebase/functions-service'
import { useNftStakingRewardRates } from '@/hooks/useNftStakingRewardRate'
import styles from '@/styles/components/Card.module.css'
import bannerStyles from '@/styles/components/Banner.module.css'


// Kris Story Component
function KrisStorySection() {
  const [currentStory, setCurrentStory] = useState(0);
  
  // Auto-advance story every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % 4); // 4 story chapters
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);

  const storyChapters = [
    {
      id: 'beginning',
      chapter: 'Chapter 1: The Top Buyer',
      title: 'December 21, 2021: Peak Degen Mode',
      content: 'Kris joined crypto at the exact top. Literally December 21, 2021. Spent hours hyperfixating on VVS glitter mines, watching numbers go up and down. Joined Croking. Bought derivative ape monkeys that... yeah. Classic buy high, sell low energy. This is the way.',
      image: '/uploads/pictures/ChatGPT Image Jun 22, 2025, 09_54_12 AM.png',
      color: 'from-red-500/20 to-pink-600/10',
      highlight: 'text-red-400',
      stats: { label: 'Portfolio', value: '-95%' }
    },
    {
      id: 'kangaroo',
      chapter: 'Chapter 2: The Kangaroo Incident',
      title: 'When DAOs Go Wrong',
      content: 'In true degen fashion, Kris created a Kangaroo-inspired DAO. Why kangaroos? Nobody knows. It failed spectacularly. But while others would quit, Kris was already plotting. Sometimes you need to hop backwards before you can leap forward.',
      image: '/uploads/pictures/ChatGPT Image Jun 22, 2025, 09_54_12 AM.png',
      color: 'from-orange-500/20 to-yellow-600/10',
      highlight: 'text-orange-400',
      stats: { label: 'DAO Members', value: '12 🦘' }
    },
    {
      id: 'evolution',
      chapter: 'Chapter 3: The Comeback',
      title: '2025: Return of the Builder',
      content: 'After years in the trenches, Kris came back different. Smarter. Still quirky AF but channeled into building actual useful stuff. Started crushing it with trading tools, DApp development, and yes - a sniper bot that actually works. Hyperfocus became a superpower.',
      image: '/uploads/pictures/ChatGPT Image Jun 22, 2025, 09_54_12 AM.png',
      color: 'from-purple-500/20 to-blue-600/10',
      highlight: 'text-purple-400',
      stats: { label: 'Win Rate', value: '69%' }
    },
    {
      id: 'legend',
      chapter: 'Chapter 4: The Degen Redemption',
      title: 'From Top Buyer to Top Builder',
      content: 'Today, Kris is killing it. The same brain that bought the exact top now builds the tools others use to find bottoms. The failed kangaroo DAO walker became the infrastructure builder Cronos needed. Proof that in crypto, your biggest L can become your greatest teacher.',
      image: '/uploads/pictures/ChatGPT Image Jun 22, 2025, 09_54_12 AM.png',
      color: 'from-green-500/20 to-teal-600/10',
      highlight: 'text-green-400',
      stats: { label: 'Redemption Arc', value: '100%' }
    }
  ];

  const currentChapter = storyChapters[currentStory];

  return (
    <div className="relative">
      {/* Title */}
      <motion.h2 
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-gradient">The Legend of Kris</span>
      </motion.h2>

      {/* Story Container */}
      <div className="relative glass-panel-dark rounded-lg md:rounded-2xl overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentChapter.color} transition-all duration-1000`} />
        
        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
            {/* Story Content */}
            <div className="flex-1 order-2 md:order-1 self-center pb-4 md:pb-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  {/* Chapter Label */}
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`text-xs sm:text-sm font-medium ${currentChapter.highlight} uppercase tracking-wider`}>
                      {currentChapter.chapter}
                    </span>
                    <div className="flex-1 h-[1px] bg-white/10" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    {currentChapter.title}
                  </h3>

                  {/* Content */}
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    {currentChapter.content}
                  </p>

                  {/* Stat Badge */}
                  <div className="inline-flex items-center gap-2 md:gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2">
                    <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide">
                      {currentChapter.stats.label}
                    </span>
                    <span className={`text-sm sm:text-lg font-bold ${currentChapter.highlight}`}>
                      {currentChapter.stats.value}
                    </span>
                  </div>

                  {/* CTAs - Moved inside content */}
                  <div className="flex flex-wrap gap-2 md:gap-3 pt-3 md:pt-4">
                    <Link href="/trading-bot">
                      <button className="btn-glass px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-medium md:font-semibold text-white text-xs sm:text-sm relative overflow-hidden">
                        <span>Access the Bot</span>
                        <span className="btn-shine-effect"></span>
                      </button>
                    </Link>
                    
                    <Link href="/deploy">
                      <button className="px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-medium text-white/70 text-xs sm:text-sm border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                        Build with Kris
                      </button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Kris Character */}
            <div className="relative flex-shrink-0 order-1 md:order-2 h-full flex items-center md:items-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.8, rotate: 10, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="relative w-[150px] sm:w-[180px] md:w-[250px]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentChapter.color} rounded-full blur-2xl md:blur-3xl scale-125 md:scale-150`} />
                  <div className="relative">
                    <Image
                      src={currentChapter.image}
                      alt="Kris"
                      width={250}
                      height={400}
                      className="relative z-10 w-full h-auto object-contain"
                      style={{ maxHeight: '250px', minHeight: '150px' }}
                      unoptimized
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-1.5 md:gap-2 mt-3 md:mt-4">
            {storyChapters.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStory(index)}
                className={`transition-all duration-300 ${
                  currentStory === index
                    ? `w-6 md:w-8 h-1.5 md:h-2 ${storyChapters[index].highlight} bg-current rounded-full`
                    : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-white/30 hover:bg-white/50 rounded-full'
                }`}
                aria-label={`Go to chapter ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ data
const faqItems = [
  {
    question: 'wen staking?',
    answer: 'ser, you lock up your bags and the protocol prints you free money. literally just park your tokens and watch the numbers go up. it\'s like yield farming but for smooth brains 🧠'
  },
  {
    question: 'how much APR we talking? 👀',
    answer: 'depends on which degen pool you ape into. some pools hit different - could be 20% could be 200%. higher APR = higher risk of getting rugged, but that\'s the game anon. always DYOR or cry later 💀'
  },
  {
    question: 'can i pull out whenever or am i locked in like my ex\'s DMs?',
    answer: 'some pools let you rage quit instantly (flexible staking), others make you diamond hand for X days. locked = bigger gains usually. but if you need to panic sell at 3am, flexible is your friend 🏃‍♂️'
  },
  {
    question: 'how do i get my tokens back?',
    answer: 'hit that unstake button and pray to the blockchain gods. might have to wait a bit for your tokens to unlock (cooldown period). patience young padawan, or you\'ll get rekt by withdrawal fees 📉'
  },
  {
    question: 'is this a rug? asking for a friend',
    answer: 'anon we\'ve been building since 2021 and haven\'t rugged yet (bullish?). kris literally built half the cronos ecosystem. but hey, this is crypto - anything can happen. that\'s why we made everything open source 🤝'
  },
  {
    question: 'what makes KRIS different from other ponzis?',
    answer: 'first of all, how dare you. second, we actually have a working product (sniper bot go brrr). 40% of bot fees = staking rewards, 40% = buyback/burn. it\'s like a ponzi but with extra steps and actual utility 🎯'
  },
  {
    question: 'wen moon? wen lambo?',
    answer: 'ser this is a wendy\'s. but fr, stake your KRIS, use the bot, collect tendies. lambo dealership accepts crypto now so... probably tomorrow? not financial advice, i eat crayons 🖍️'
  },
  {
    question: 'why should i trust you degens?',
    answer: 'you shouldn\'t. verify everything on-chain. but consider: we turned meme coin failure into chad trading bot success. we\'re either genius or completely unhinged. probably both. welcome to the asylum fren 🏥'
  }
];

export default function Home() {
  const [stakingContracts, setStakingContracts] = useState<StakingContractData[]>([]);
  const [nftStakingContracts, setNftStakingContracts] = useState<NftStakingContractData[]>([]);
  const [lpStakingContracts, setLpStakingContracts] = useState<any[]>([]);
  const [v3Farms, setV3Farms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nftLoading, setNftLoading] = useState(true);
  const [lpLoading, setLpLoading] = useState(true);
  const [v3Loading, setV3Loading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nftError, setNftError] = useState<string | null>(null);
  const [lpError, setLpError] = useState<string | null>(null);
  const [v3Error, setV3Error] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Fetch reward rates for NFT staking contracts
  const nftRewardRates = useNftStakingRewardRates(nftStakingContracts);

  // Rotate banners every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 4); // Cycle through 4 banners
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch staking contracts and NFT staking contracts from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regular staking contracts
        setLoading(true);
        console.log('Fetching staking contracts from API service in page.tsx');
        const contracts = await getEnabledStakingContracts();
        console.log('Successfully fetched staking contracts:', contracts.length);
        setStakingContracts(contracts);
      } catch (err: any) {
        console.error('Error fetching staking contracts:', err);
        setError('Failed to load staking contracts');
      } finally {
        setLoading(false);
      }
      
      try {
        // Fetch NFT staking contracts
        setNftLoading(true);
        console.log('Fetching NFT staking contracts from API service in page.tsx');
        const nftContracts = await getEnabledNftStakingContracts();
        console.log('Successfully fetched NFT staking contracts:', nftContracts.length);
        setNftStakingContracts(nftContracts);
      } catch (err: any) {
        console.error('Error fetching NFT staking contracts:', err);
        setNftError('Failed to load NFT staking contracts');
      } finally {
        setNftLoading(false);
      }
      
      try {
        // Fetch LP staking contracts
        setLpLoading(true);
        console.log('Fetching LP staking contracts from API service in page.tsx');
        const lpContracts = await getEnabledLpStakingContracts();
        console.log('Successfully fetched LP staking contracts:', lpContracts.length);
        setLpStakingContracts(lpContracts);
      } catch (err: any) {
        console.error('Error fetching LP staking contracts:', err);
        setLpError('Failed to load LP staking contracts');
      } finally {
        setLpLoading(false);
      }
      
      try {
        // Fetch V3 farms
        setV3Loading(true);
        console.log('Fetching V3 farms from API service in page.tsx');
        const v3FarmContracts = await getEnabledV3Farms();
        console.log('Successfully fetched V3 farms:', v3FarmContracts.length);
        setV3Farms(v3FarmContracts);
      } catch (err: any) {
        console.error('Error fetching V3 farms:', err);
        setV3Error('Failed to load V3 farms');
      } finally {
        setV3Loading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Quick action buttons
  const actionButtons = [
    {
      label: 'Swap',
      href: '/swap',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      accentColor: '#0e76fd'
    },
    {
      label: 'NFT',
      href: '/nft-staking',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      accentColor: '#8b5cf6'
    },
    {
      label: 'Deploy',
      href: '/deploy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ),
      accentColor: '#1f71fe'
    },
    {
      label: 'Earn',
      href: '/earn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accentColor: '#10b981'
    }
  ];

  // Banner data for rotation
  const banners = [
    {
      id: 'stake',
      title: 'Stake, Earn and Deploy',
      subtitle: 'Forever free. Start earning passive income with our user-friendly staking platform.',
      ctaText: 'Start Earning',
      ctaLink: '/stake',
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    {
      id: 'earn',
      title: 'Earn with DeFi',
      subtitle: 'Explore yield farming opportunities and maximize your returns across multiple protocols.',
      ctaText: 'Explore Earnings',
      ctaLink: '/earn',
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      id: 'deploy',
      title: 'Create A Staking Contract',
      subtitle: 'Deploy your own staking contract in minutes with our easy-to-use wizard.',
      ctaText: 'Start Deployment',
      ctaLink: '/deploy',
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
      )
    },
    {
      id: 'trading-bot',
      title: 'Kris Trading Bot',
      subtitle: 'Snipe tokens, automate DCA, and trade smarter on Telegram. Hold KRIS for priority execution!',
      ctaText: 'Start Trading',
      ctaLink: '/trading-bot',
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
        </svg>
      ),
      badge: 'FREE',
      extraInfo: ['• NO FEES for Trades 🎉', '• 3% Sniper Fees', '• Priority for KRIS Holders'],
      telegramIcon: true
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <MainLayout>
      {/* Rotating Hero Banner with Enhanced Glassmorphism */}
      <motion.div 
        className="relative mb-4 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute -z-10 w-full h-full">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-indigo-500/10 rounded-full filter blur-[80px]"></div>
          <div className="absolute top-1/3 right-1/3 w-1/4 h-1/4 bg-purple-500/10 rounded-full filter blur-[60px]"></div>
        </div>

        {/* Banner Container */}
        <div className="relative overflow-hidden rounded-lg md:rounded-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`${bannerStyles.banner} relative overflow-hidden`}
            >
              {/* Floating particles */}
              <div className={`${bannerStyles.particle}`}></div>
              <div className={`${bannerStyles.particle}`}></div>
              <div className={`${bannerStyles.particle}`}></div>
              
              <motion.div 
                className={bannerStyles.content}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-blue-500/20 rounded-xl md:rounded-2xl blur-xl animate-pulse" />
                    <div className="relative p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
                      {banners[currentBanner].icon}
                    </div>
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1 text-center md:text-left">
                    <motion.div 
                      className="flex items-center justify-center md:justify-start gap-3 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <h2 className={`${bannerStyles.heroText} text-gradient-blue text-xl sm:text-2xl md:text-3xl`}>
                        {banners[currentBanner].title}
                      </h2>
                      {banners[currentBanner].badge && (
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-green-400/20 border border-green-400/30 rounded-full text-green-300 text-[10px] md:text-xs font-bold animate-pulse">
                          {banners[currentBanner].badge}
                        </span>
                      )}
                    </motion.div>
                    
                    <motion.p 
                      className={bannerStyles.subtext}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {banners[currentBanner].subtitle}
                    </motion.p>

                    {banners[currentBanner].extraInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex items-center justify-center md:justify-start gap-6 text-xs text-gray-400 mt-3"
                      >
                        {banners[currentBanner].extraInfo.map((info, index) => (
                          <span key={index}>{info}</span>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link href={banners[currentBanner].ctaLink}>
                    <motion.button 
                      className="btn-glass px-4 py-2 md:px-6 md:py-3 rounded-full font-medium md:font-semibold text-white text-sm md:text-base relative overflow-hidden flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {banners[currentBanner].telegramIcon && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      )}
                      <span>{banners[currentBanner].ctaText}</span>
                      <span className="btn-shine-effect"></span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                className={bannerStyles.accent}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              ></motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Banner Indicators */}
        <div className="flex justify-center gap-2 mt-3 md:mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentBanner === index
                  ? 'w-8 bg-white'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Quick Action Buttons */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-4 md:mb-8"
      >
        <QuickActions actions={actionButtons} className="mb-3 md:mb-5" />
      </motion.div>
      
      {/* Earn Section */}
      <motion.div 
        className="mb-4 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Earn</h2>
          <Link href="/earn" className={styles.seeAllLink}>See All</Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="relative w-12 h-12">
              {/* Premium loading spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-blue-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-blue-500/20"></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-t-transparent border-r-blue-500 border-b-blue-400 border-l-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-[45%] rounded-full bg-blue-500 animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : stakingContracts.length === 0 ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-gray-400 text-sm">No staking contracts available</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {stakingContracts.slice(0, 3).map((contract, index) => {
              // Extract token name from contract name
              const nameParts = contract.name.split(' ');
              const tokenName = nameParts[0];
              
              return (
                <motion.div
                  key={contract.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    href={`/stake/${contract.id}`}
                    className="block"
                  >
                    <div className={`${styles.stakingCard} hover-lift`}>
                      <div className={styles.stakingCardContent}>
                        <div className={styles.coinIcon}>
                          <Image
                            src={contract.logoUrl || `https://picsum.photos/id/${Math.floor(Math.random() * 10) + 240}/400/400`}
                            alt={tokenName}
                            width={40}
                            height={40}
                            className="object-cover rounded-full"
                          />
                        </div>
                        
                        <div className={styles.coinInfo}>
                          <h3 className={styles.coinName}>{tokenName}</h3>
                          <p className={styles.coinDescription}>
                            {contract.description || 'DeFi Staking'}
                          </p>
                        </div>
                        
                        <div className={styles.aprContainer}>
                          <div className={styles.aprValue}>{contract.apr}</div>
                          <div className={styles.aprLabel}>APR</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
      
      {/* NFT Staking Section */}
      <motion.div 
        className="mb-4 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>NFT-Staking</h2>
          <Link href="/nft-staking" className={styles.seeAllLink}>See All</Link>
        </div>
        
        {nftLoading ? (
          <div className="flex justify-center py-6">
            <div className="relative w-12 h-12">
              {/* Premium loading spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-purple-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-purple-500/20"></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-t-transparent border-r-purple-500 border-b-purple-400 border-l-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-[45%] rounded-full bg-purple-500 animate-pulse"></div>
            </div>
          </div>
        ) : nftError ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-red-400 text-sm">{nftError}</p>
          </div>
        ) : nftStakingContracts.length === 0 ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-gray-400 text-sm">No NFT staking contracts available</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {nftStakingContracts.slice(0, 3).map((contract, index) => (
              <motion.div
                key={contract.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={`/nft-staking/${contract.id}`}
                  className="block"
                >
                  <div className={`${styles.stakingCard} hover-lift`}>
                    <div className={styles.stakingCardContent}>
                      <div className={styles.coinIcon}>
                        {contract.collections && contract.collections.length > 0 && contract.collections[0].image ? (
                          <Image
                            src={contract.collections[0].image}
                            alt={contract.name}
                            width={40}
                            height={40}
                            className="object-cover rounded-full"
                            unoptimized={true}
                          />
                        ) : contract.logoUrl ? (
                          <Image
                            src={contract.logoUrl}
                            alt={contract.name}
                            width={40}
                            height={40}
                            className="object-cover rounded-full"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-blue-900 text-white text-xs rounded-full">
                            {contract.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.coinInfo}>
                        <h3 className={styles.coinName}>{contract.name}</h3>
                        <p className={styles.coinDescription}>
                          {contract.description || 'NFT Staking'}
                        </p>
                      </div>
                      
                      <div className={styles.aprContainer}>
                        <div className={styles.aprValue}>
                          {nftRewardRates.get(contract.id)?.isLoading ? (
                            <span className="text-xs">Loading...</span>
                          ) : (
                            `${nftRewardRates.get(contract.id)?.weeklyRewardRate || '0'}`
                          )}
                        </div>
                        <div className={styles.aprLabel}>Per Week</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      
      {/* V3 LP Staking Section */}
      <motion.div 
        className="mb-4 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35 }}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>V3 LP-Staking</h2>
        </div>
        
        {v3Loading ? (
          <div className="flex justify-center py-6">
            <div className="relative w-12 h-12">
              {/* Premium loading spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-indigo-500/20"></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-t-transparent border-r-indigo-500 border-b-indigo-400 border-l-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-[45%] rounded-full bg-indigo-500 animate-pulse"></div>
            </div>
          </div>
        ) : v3Error ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-red-400 text-sm">{v3Error}</p>
          </div>
        ) : v3Farms.length === 0 ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-gray-400 text-sm">No V3 farms available</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {v3Farms.slice(0, 3).map((farm, index) => (
              <motion.div
                key={farm.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={`/lp-staking/v3/${farm.id}`}
                  className="block"
                >
                  <div className={`${styles.stakingCard} hover-lift`}>
                    <div className={styles.stakingCardContent}>
                      <div className={styles.coinIcon}>
                        <SafeImage
                          src={farm.logoUrl || '/kris-logo.svg'}
                          alt={farm.name}
                          width={40}
                          height={40}
                          className="object-cover rounded-full"
                          fallbackSrc="/kris-logo.svg"
                        />
                      </div>
                      
                      <div className={styles.coinInfo}>
                        <h3 className={styles.coinName}>{farm.name}</h3>
                        <p className={styles.coinDescription}>
                          V3 LP Staking
                        </p>
                      </div>
                      
                      <div className={styles.aprContainer}>
                        <div className={styles.aprValue}>{farm.apr}</div>
                        <div className={styles.aprLabel}>APR</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      
      {/* LP Staking Section */}
      <motion.div 
        className="mb-4 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>LP-Staking</h2>
          <Link href="/lp-staking" className={styles.seeAllLink}>See All</Link>
        </div>
        
        {lpLoading ? (
          <div className="flex justify-center py-6">
            <div className="relative w-12 h-12">
              {/* Premium loading spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-pink-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-t-pink-500 border-r-pink-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-pink-500/20"></div>
              <div className="absolute inset-[25%] rounded-full border-2 border-t-transparent border-r-pink-500 border-b-pink-400 border-l-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-[45%] rounded-full bg-pink-500 animate-pulse"></div>
            </div>
          </div>
        ) : lpError ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-red-400 text-sm">{lpError}</p>
          </div>
        ) : lpStakingContracts.length === 0 ? (
          <div className="text-center py-4 glass-panel-dark">
            <p className="text-gray-400 text-sm">No LP staking contracts available</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {lpStakingContracts.slice(0, 3).map((contract, index) => (
              <motion.div
                key={contract.id}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={`/lp-staking/${contract.id}`}
                  className="block"
                >
                  <div className={`${styles.stakingCard} hover-lift`}>
                    <div className={styles.stakingCardContent}>
                      <div className={styles.coinIcon}>
                        <SafeImage
                          src={contract.logoUrl || '/kris-logo.svg'}
                          alt={contract.name}
                          width={40}
                          height={40}
                          className="object-cover rounded-full"
                          fallbackSrc="/kris-logo.svg"
                        />
                      </div>
                      
                      <div className={styles.coinInfo}>
                        <h3 className={styles.coinName}>{contract.name}</h3>
                        <p className={styles.coinDescription}>
                          {contract.description || 'LP Token Staking'}
                        </p>
                      </div>
                      
                      <div className={styles.aprContainer}>
                        <div className={styles.aprValue}>{contract.apr}</div>
                        <div className={styles.aprLabel}>APR</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      
      {/* The Kris Story - Timed Cards */}
      <motion.div 
        className="mb-4 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.45 }}
      >
        <KrisStorySection />
      </motion.div>
      
      {/* KRIS Token Benefits Section */}
      <motion.div
        className="mb-6 md:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl" />
          
          {/* Main content */}
          <div className="relative glass-panel-dark rounded-xl md:rounded-2xl p-6 md:p-8 border border-white/10 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
                animation: 'slide 20s linear infinite'
              }} />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Title with gradient */}
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  The $KRIS Master Plan
                </span>
              </h2>
              
              {/* Story */}
              <p className="text-white/80 text-center mb-6 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
                We bought $LION token. We made bank. Imagine if we had put the taxes we earn on a CDC snipe into a Vault... 
                <span className="text-white font-semibold"> That's unlimited APR forever for $KRIS holders.</span>
              </p>
              
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Benefit 1 */}
                <motion.div 
                  className="glass-panel p-4 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-3xl mb-2">💎</div>
                  <h3 className="font-semibold text-white mb-1">Revenue Sharing</h3>
                  <p className="text-white/70 text-sm">40% of all bot fees go directly to staking rewards</p>
                </motion.div>
                
                {/* Benefit 2 */}
                <motion.div 
                  className="glass-panel p-4 rounded-lg border border-white/10 hover:border-purple-400/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-3xl mb-2">🔥</div>
                  <h3 className="font-semibold text-white mb-1">Buyback & Burn</h3>
                  <p className="text-white/70 text-sm">40% of revenue buys and burns $KRIS tokens</p>
                </motion.div>
                
                {/* Benefit 3 */}
                <motion.div 
                  className="glass-panel p-4 rounded-lg border border-white/10 hover:border-pink-400/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold text-white mb-1">Priority Access</h3>
                  <p className="text-white/70 text-sm">$KRIS holders get priority execution on snipes</p>
                </motion.div>
              </div>
              
              {/* CTA */}
              <div className="text-center">
                <Link href="/buy">
                  <motion.button 
                    className="btn-glass px-6 py-3 rounded-full font-semibold text-white relative overflow-hidden inline-flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Buy $KRIS</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="btn-shine-effect"></span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Sniper Bot Announcement */}
      <motion.div
        className="mb-6 md:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="relative">
          {/* Glitch effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-yellow-600/10 rounded-2xl blur-3xl animate-pulse" />
          
          <div className="relative glass-panel-dark rounded-xl md:rounded-2xl p-6 md:p-8 border border-orange-500/20 overflow-hidden">
            {/* Animated glitch lines */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" 
              style={{ animation: 'glitch-1 3s linear infinite' }} />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" 
              style={{ animation: 'glitch-2 3s linear infinite' }} />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div 
                  className="inline-block"
                  animate={{ 
                    textShadow: [
                      "0 0 10px #ff6b6b",
                      "0 0 20px #ff6b6b",
                      "0 0 10px #ff6b6b"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="text-gradient-orange">🎯 KRIS SNIPER JUNE BETA DROP 🎯</span>
                  </h2>
                </motion.div>
                <p className="text-white/80 italic">ok frens, time to spill the alpha on what we've been cooking 👨‍🍳</p>
              </div>
              
              {/* Intro text */}
              <div className="text-center mb-6">
                <p className="text-white/70 text-sm md:text-base mb-2">
                  <span className="italic">*adjusts hyperfixation goggles*</span>
                </p>
                <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                  we might've bricked it as a meme coin BUT plot twist - we're about to make you disgustingly rich with trading tools 
                  <span className="text-orange-400"> (or get you rugged trying, no cap) 💀</span>
                </p>
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Beta Features */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-orange-400 uppercase tracking-wider">
                    BETA FEATURES THAT'LL MAKE YOUR DOPAMINE GO BRRR:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📊</span>
                      <p className="text-white/80 text-sm">Buy/sell orders <span className="text-white/60 italic">(groundbreaking, i know)</span></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">⏰</span>
                      <p className="text-white/80 text-sm">Limit orders & DCA <span className="text-white/60 italic">(for the patient degens)</span></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🎯</span>
                      <p className="text-white/80 text-sm">Sniper functionality</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🐺</span>
                      <p className="text-white/80 text-sm">Wolf Street sniping <span className="text-white/60 italic">(because we're unhinged like that)</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Coming Soon */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-yellow-400 uppercase tracking-wider">
                    COMING SOON™ <span className="text-sm font-normal">(my brain is already there):</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🤖</span>
                      <p className="text-white/80 text-sm">AI agent that'll trade faster than your ex left you</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📈</span>
                      <p className="text-white/80 text-sm">Chart insights that actually make sense</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🍯</span>
                      <p className="text-white/80 text-sm">Enhanced honeypot detection <span className="text-white/60 italic">(no more getting rekd by scams)</span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info Dump */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-center text-white/60 text-sm mb-4 italic">*info dump incoming*</p>
                
                {/* Fee Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-4 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-3">FEES <span className="text-white/60 text-sm">(because transparency is sexy):</span></h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Standard trades:</span>
                        <span className="text-green-400 font-mono">FREE 🎉</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Snipes:</span>
                        <span className="text-yellow-400 font-mono">3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Wolf/Puush:</span>
                        <span className="text-orange-400 font-mono">3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-panel p-4 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-3">REVENUE SPLIT:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Buyback & burn 🔥:</span>
                        <span className="text-red-400 font-mono">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Staking rewards 💰:</span>
                        <span className="text-blue-400 font-mono">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Dev fund:</span>
                        <span className="text-purple-400 font-mono">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Infrastructure:</span>
                        <span className="text-green-400 font-mono">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CTA */}
                <div className="text-center mt-6">
                  <Link href="/trading-bot">
                    <motion.button 
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-3 rounded-full font-bold text-white relative overflow-hidden inline-flex items-center gap-2 shadow-lg"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 146, 60, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Join Beta</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    </motion.button>
                  </Link>
                  <p className="text-white/50 text-xs mt-2">SPEED = LIFE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* FAQ Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.7 }}
        className="mb-3 md:mb-5"
      >
        <FaqSection items={faqItems} className="mb-3 md:mb-5" />
      </motion.div>
    </MainLayout>
  );
}
