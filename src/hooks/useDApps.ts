'use client'

import { useState, useEffect } from 'react'

// Define the DApp interface
export interface DApp {
  id: string
  name: string
  description: string
  logo: string
  banner?: string
  category: string
  features: string[]
  website?: string
  github?: string
  twitter?: string
  telegram?: string
  discord?: string
  launchDate?: string
}

/**
 * Hook for fetching and managing dApp data
 */
export function useDApps() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dapps, setDapps] = useState<DApp[]>([])

  useEffect(() => {
    const fetchDApps = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // In a future implementation, this would fetch from Firebase
        // For now, we're using hardcoded data
        setDapps(mockDApps)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dApps')
        console.error('Error fetching dApps:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDApps()
  }, [])

  return {
    dapps,
    loading,
    error,
    getFeaturedDApps: () => dapps.slice(0, 3),
    getDAppById: (id: string) => dapps.find(dapp => dapp.id === id) || null,
    getDAppsByCategory: (category: string) => dapps.filter(dapp => dapp.category === category)
  }
}

// Mock data for dApps
const mockDApps: DApp[] = [
  {
    id: 'forfoxsake',
    name: 'For Fox Sake',
    description: 'A raffle dApp where users can earn rewards through participation in community-driven raffles.',
    logo: '/uploads/pictures/forfoxsake.png',
    banner: '/uploads/pictures/forfoxsake.png',
    category: 'Gaming',
    features: [
      'Raffle system',
      'Earn rewards',
      'Community raffles',
      'Prize distribution'
    ],
    website: 'https://forfoxsake.io',
    twitter: 'https://twitter.com/forfoxsake',
    discord: 'https://discord.gg/forfoxsake',
    launchDate: '2023-09-15'
  },
  {
    id: 'cronos-legends',
    name: 'Cronos Legends',
    description: 'NFT project that minted out in 5 minutes on Crypto.com, showcasing the power of the Cronos ecosystem.',
    logo: '/uploads/pictures/crolegends.png',
    banner: '/uploads/pictures/crolegends.png',
    category: 'NFT',
    features: [
      'Sold out in 5 minutes',
      'Crypto.com launch',
      'Limited collection',
      'Community driven'
    ],
    website: 'https://crolegends.com',
    github: 'https://github.com/crolegends',
    twitter: 'https://twitter.com/crolegends',
    discord: 'https://discord.gg/crolegends',
    launchDate: '2023-11-20'
  },
  {
    id: 'lex-the-husky',
    name: 'Lex The Husky',
    description: 'An NFT and token project with bold gamification features combining collectibles with gameplay.',
    logo: '/uploads/pictures/lexthehusky.png',
    banner: '/uploads/pictures/lexthehusky.png',
    category: 'NFT',
    features: [
      'NFT collection',
      'Token ecosystem',
      'Bold gamification',
      'Play-to-earn mechanics'
    ],
    website: 'https://lexthehusky.io',
    twitter: 'https://twitter.com/lexthehusky',
    telegram: 'https://t.me/lexthehusky',
    launchDate: '2024-01-10'
  },
  {
    id: 'cards-of-cronos',
    name: 'Cards of Cronos',
    description: 'A burn and buy mechanism project creating value through strategic token burns and buybacks.',
    logo: '/uploads/pictures/cardsofcronos2.png',
    banner: '/uploads/pictures/cardsofcronos2.png',
    category: 'DeFi',
    features: [
      'Burn mechanism',
      'Buy mechanism',
      'Deflationary model',
      'Value creation'
    ],
    website: 'https://cardsofcronos.io',
    twitter: 'https://twitter.com/cardsofcronos',
    discord: 'https://discord.gg/cardsofcronos',
    launchDate: '2023-12-05'
  },
  {
    id: 'aurum-trust',
    name: 'Aurum Trust',
    description: 'Backed by gold with deflationary mechanics, bringing real-world asset stability to Cronos.',
    logo: '/uploads/pictures/aurumtrust.png',
    banner: '/uploads/pictures/aurumtrust.png',
    category: 'DeFi',
    features: [
      'Gold-backed',
      'Deflationary nature',
      'Real-world assets',
      'Stable value'
    ],
    website: 'https://aurumtrust.io',
    twitter: 'https://twitter.com/aurumtrust',
    telegram: 'https://t.me/aurumtrust',
    launchDate: '2023-08-22'
  },
  {
    id: 'elon-wig',
    name: 'Elon Wig',
    description: 'Influencer project with raffle opportunities connecting social influence with community rewards.',
    logo: '/uploads/pictures/elonwig.png',
    banner: '/uploads/pictures/elonwig.png',
    category: 'Social',
    features: [
      'Influencer driven',
      'Raffle opportunities',
      'Community rewards',
      'Social engagement'
    ],
    website: 'https://elonwig.io',
    twitter: 'https://twitter.com/elonwig',
    telegram: 'https://t.me/elonwig',
    launchDate: '2023-10-31'
  },
  {
    id: 'caw777',
    name: 'CAW777',
    description: 'A tax and burn system project creating sustainable tokenomics through automated mechanisms.',
    logo: '/uploads/pictures/caw777.png',
    banner: '/uploads/pictures/caw777.png',
    category: 'DeFi',
    features: [
      'Tax system',
      'Burn mechanism',
      'Automated tokenomics',
      'Sustainable model'
    ],
    website: 'https://caw777.io',
    twitter: 'https://twitter.com/caw777',
    telegram: 'https://t.me/caw777',
    discord: 'https://discord.gg/caw777',
    launchDate: '2024-02-15'
  },
  {
    id: 'autism-intelligence',
    name: 'Autism Intelligence',
    description: 'A concept idea exploring data analysis and AI applications for autism research and support.',
    logo: '/uploads/pictures/autism.png',
    banner: '/uploads/pictures/autism.png',
    category: 'AI',
    features: [
      'Data analysis',
      'AI research',
      'Concept exploration',
      'Innovation focus'
    ],
    website: 'https://autismtoken.io',
    twitter: 'https://twitter.com/autismtoken',
    telegram: 'https://t.me/autismtoken',
    launchDate: '2023-12-01'
  },
  {
    id: 'pawflow',
    name: 'Pawflow',
    description: 'A gamified experience similar to Wolfswap, bringing innovative DeFi mechanics to the ecosystem.',
    logo: '/uploads/pictures/pawflow.png',
    banner: '/uploads/pictures/pawflow.png',
    category: 'DeFi',
    features: [
      'Gamified DeFi',
      'Similar to Wolfswap',
      'Innovative mechanics',
      'User rewards'
    ],
    website: 'https://pawflow.io',
    twitter: 'https://twitter.com/pawflow',
    telegram: 'https://t.me/pawflow',
    discord: 'https://discord.gg/pawflow',
    launchDate: '2024-01-20'
  }
]

export default useDApps