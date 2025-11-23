import { DAppTemplate } from '@/types/dapp-builder';

// Pre-built page templates for different types of dApps

export const dappTemplates: DAppTemplate[] = [
  {
    id: 'nft-mint-template',
    name: 'NFT Minting dApp',
    description: 'Complete NFT minting website with collection showcase and minting functionality',
    thumbnail: '/templates/nft-mint-preview.jpg',
    category: 'nft',
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        title: 'Amazing NFT Collection - Mint Now',
        description: 'Join the exclusive NFT collection',
        sections: [
          {
            id: 'header-section',
            name: 'Header',
            layout: 'full-width',
            components: [/* Header component */],
            style: {},
            order: 0
          },
          {
            id: 'hero-section',
            name: 'Hero',
            layout: 'full-width',
            components: [/* Hero with mint button */],
            style: {},
            order: 1
          },
          {
            id: 'collection-preview',
            name: 'Collection Preview',
            layout: 'container',
            components: [/* NFT grid preview */],
            style: {},
            order: 2
          },
          {
            id: 'roadmap-section',
            name: 'Roadmap',
            layout: 'container',
            components: [/* Timeline component */],
            style: {},
            order: 3
          },
          {
            id: 'team-section',
            name: 'Team',
            layout: 'container',
            components: [/* Team grid */],
            style: {},
            order: 4
          },
          {
            id: 'faq-section',
            name: 'FAQ',
            layout: 'container',
            components: [/* FAQ accordion */],
            style: {},
            order: 5
          },
          {
            id: 'footer-section',
            name: 'Footer',
            layout: 'full-width',
            components: [/* Footer component */],
            style: {},
            order: 6
          }
        ],
        seo: {
          metaTitle: 'Amazing NFT Collection - Mint Now',
          metaDescription: 'Join our exclusive NFT collection. Limited supply, amazing art, strong community.',
          keywords: ['NFT', 'mint', 'collection', 'crypto', 'art']
        }
      },
      {
        id: 'mint',
        name: 'Mint',
        slug: '/mint',
        title: 'Mint Your NFT',
        sections: [
          {
            id: 'mint-interface',
            name: 'Minting Interface',
            layout: 'container',
            components: [/* Minting component with Web3 integration */],
            style: {},
            order: 0
          }
        ]
      }
    ],
    theme: {
      name: 'Dark NFT Theme',
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        accent: '#F59E0B',
        background: '#0F0F0F',
        surface: '#1A1A1A',
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          disabled: '#52525B'
        },
        border: '#27272A',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      typography: {
        fontFamily: {
          heading: 'Space Grotesk, sans-serif',
          body: 'Inter, sans-serif',
          mono: 'JetBrains Mono, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['nft-minting', 'web3-wallet-connect']
  },
  {
    id: 'defi-platform-template',
    name: 'DeFi Platform',
    description: 'Full-featured DeFi platform with staking, farming, and swap functionality',
    thumbnail: '/templates/defi-platform-preview.jpg',
    category: 'defi',
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        title: 'DeFi Platform - Trade, Stake, Earn',
        sections: [
          {
            id: 'header',
            name: 'Header',
            layout: 'full-width',
            components: [],
            style: {},
            order: 0
          },
          {
            id: 'hero',
            name: 'Hero',
            layout: 'full-width',
            components: [],
            style: {},
            order: 1
          },
          {
            id: 'stats',
            name: 'Platform Stats',
            layout: 'container',
            components: [],
            style: {},
            order: 2
          },
          {
            id: 'products',
            name: 'Products',
            layout: 'container',
            components: [],
            style: {},
            order: 3
          },
          {
            id: 'footer',
            name: 'Footer',
            layout: 'full-width',
            components: [],
            style: {},
            order: 4
          }
        ]
      },
      {
        id: 'stake',
        name: 'Staking',
        slug: '/stake',
        title: 'Stake Your Tokens',
        sections: [
          {
            id: 'staking-pools',
            name: 'Staking Pools',
            layout: 'container',
            components: [],
            style: {},
            order: 0
          }
        ]
      },
      {
        id: 'farm',
        name: 'Farming',
        slug: '/farm',
        title: 'Yield Farming',
        sections: [
          {
            id: 'farming-pools',
            name: 'Farming Pools',
            layout: 'container',
            components: [],
            style: {},
            order: 0
          }
        ]
      },
      {
        id: 'swap',
        name: 'Swap',
        slug: '/swap',
        title: 'Token Swap',
        sections: [
          {
            id: 'swap-interface',
            name: 'Swap Interface',
            layout: 'container',
            components: [],
            style: {},
            order: 0
          }
        ]
      }
    ],
    theme: {
      name: 'Clean DeFi Theme',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF'
        },
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      typography: {
        fontFamily: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
          mono: 'IBM Plex Mono, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['token-staking', 'lp-staking', 'swap', 'web3-wallet-connect']
  },
  {
    id: 'gaming-template',
    name: 'Gaming Platform',
    description: 'Web3 gaming platform with NFT marketplace and play-to-earn features',
    thumbnail: '/templates/gaming-preview.jpg',
    category: 'gaming',
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        title: 'Play to Earn Gaming Platform',
        sections: []
      },
      {
        id: 'games',
        name: 'Games',
        slug: '/games',
        title: 'Browse Games',
        sections: []
      },
      {
        id: 'marketplace',
        name: 'Marketplace',
        slug: '/marketplace',
        title: 'NFT Marketplace',
        sections: []
      },
      {
        id: 'leaderboard',
        name: 'Leaderboard',
        slug: '/leaderboard',
        title: 'Top Players',
        sections: []
      }
    ],
    theme: {
      name: 'Gaming Theme',
      colors: {
        primary: '#F000B8',
        secondary: '#00D9FF',
        accent: '#FFD700',
        background: '#0A0A0A',
        surface: '#1A1A1A',
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          disabled: '#606060'
        },
        border: '#2A2A2A',
        error: '#FF4444',
        warning: '#FFA500',
        success: '#00FF00',
        info: '#00BFFF'
      },
      typography: {
        fontFamily: {
          heading: 'Orbitron, sans-serif',
          body: 'Rajdhani, sans-serif',
          mono: 'Space Mono, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(240, 0, 184, 0.1)',
        base: '0 1px 3px 0 rgba(240, 0, 184, 0.15), 0 1px 2px 0 rgba(240, 0, 184, 0.1)',
        md: '0 4px 6px -1px rgba(240, 0, 184, 0.2), 0 2px 4px -1px rgba(240, 0, 184, 0.15)',
        lg: '0 10px 15px -3px rgba(240, 0, 184, 0.25), 0 4px 6px -2px rgba(240, 0, 184, 0.2)',
        xl: '0 20px 25px -5px rgba(240, 0, 184, 0.3), 0 10px 10px -5px rgba(240, 0, 184, 0.25)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['nft-marketplace', 'leaderboard', 'quests', 'web3-wallet-connect']
  },
  {
    id: 'dao-template',
    name: 'DAO Platform',
    description: 'Decentralized Autonomous Organization platform with governance and proposals',
    thumbnail: '/templates/dao-preview.jpg',
    category: 'dao',
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        title: 'DAO Governance Platform',
        sections: []
      },
      {
        id: 'proposals',
        name: 'Proposals',
        slug: '/proposals',
        title: 'Governance Proposals',
        sections: []
      },
      {
        id: 'treasury',
        name: 'Treasury',
        slug: '/treasury',
        title: 'DAO Treasury',
        sections: []
      },
      {
        id: 'members',
        name: 'Members',
        slug: '/members',
        title: 'DAO Members',
        sections: []
      }
    ],
    theme: {
      name: 'DAO Theme',
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#EC4899',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          disabled: '#9CA3AF'
        },
        border: '#E5E7EB',
        error: '#DC2626',
        warning: '#F59E0B',
        success: '#059669',
        info: '#2563EB'
      },
      typography: {
        fontFamily: {
          heading: 'Sora, sans-serif',
          body: 'Inter, sans-serif',
          mono: 'Fira Code, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['governance', 'treasury', 'web3-wallet-connect']
  },
  {
    id: 'marketplace-template',
    name: 'NFT Marketplace',
    description: 'Full-featured NFT marketplace with buying, selling, and auction functionality',
    thumbnail: '/templates/marketplace-preview.jpg',
    category: 'marketplace',
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        title: 'NFT Marketplace',
        sections: []
      },
      {
        id: 'explore',
        name: 'Explore',
        slug: '/explore',
        title: 'Explore NFTs',
        sections: []
      },
      {
        id: 'collections',
        name: 'Collections',
        slug: '/collections',
        title: 'NFT Collections',
        sections: []
      },
      {
        id: 'create',
        name: 'Create',
        slug: '/create',
        title: 'Create NFT',
        sections: []
      }
    ],
    theme: {
      name: 'Marketplace Theme',
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#D1D5DB'
        },
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      typography: {
        fontFamily: {
          heading: 'DM Sans, sans-serif',
          body: 'Inter, sans-serif',
          mono: 'JetBrains Mono, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        base: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['nft-marketplace', 'nft-gallery', 'web3-wallet-connect']
  },
  {
    id: 'social-template',
    name: 'Social Platform',
    description: 'Web3 social platform with profiles, posts, and token rewards',
    thumbnail: '/templates/social-preview.jpg',
    category: 'social',
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        title: 'Web3 Social Network',
        sections: []
      },
      {
        id: 'feed',
        name: 'Feed',
        slug: '/feed',
        title: 'Your Feed',
        sections: []
      },
      {
        id: 'profile',
        name: 'Profile',
        slug: '/profile',
        title: 'Your Profile',
        sections: []
      },
      {
        id: 'discover',
        name: 'Discover',
        slug: '/discover',
        title: 'Discover Users',
        sections: []
      }
    ],
    theme: {
      name: 'Social Theme',
      colors: {
        primary: '#0EA5E9',
        secondary: '#8B5CF6',
        accent: '#F97316',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          disabled: '#CBD5E1'
        },
        border: '#E2E8F0',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      typography: {
        fontFamily: {
          heading: 'Poppins, sans-serif',
          body: 'Inter, sans-serif',
          mono: 'Fira Code, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        base: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['profiles', 'social-feed', 'token-rewards', 'web3-wallet-connect']
  },
  {
    id: 'portfolio-template',
    name: 'Portfolio Tracker',
    description: 'Crypto portfolio tracker with analytics and performance insights',
    thumbnail: '/templates/portfolio-preview.jpg',
    category: 'portfolio',
    pages: [
      {
        id: 'home',
        name: 'Dashboard',
        slug: '/',
        title: 'Portfolio Dashboard',
        sections: []
      },
      {
        id: 'assets',
        name: 'Assets',
        slug: '/assets',
        title: 'Your Assets',
        sections: []
      },
      {
        id: 'analytics',
        name: 'Analytics',
        slug: '/analytics',
        title: 'Portfolio Analytics',
        sections: []
      },
      {
        id: 'history',
        name: 'History',
        slug: '/history',
        title: 'Transaction History',
        sections: []
      }
    ],
    theme: {
      name: 'Portfolio Theme',
      colors: {
        primary: '#10B981',
        secondary: '#3B82F6',
        accent: '#8B5CF6',
        background: '#0F172A',
        surface: '#1E293B',
        text: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          disabled: '#64748B'
        },
        border: '#334155',
        error: '#F87171',
        warning: '#FBBF24',
        success: '#34D399',
        info: '#60A5FA'
      },
      typography: {
        fontFamily: {
          heading: 'Rubik, sans-serif',
          body: 'Inter, sans-serif',
          mono: 'Source Code Pro, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
      },
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    },
    requiredModules: ['portfolio-tracker', 'charts', 'web3-wallet-connect']
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string): DAppTemplate | undefined {
  return dappTemplates.find(template => template.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): DAppTemplate[] {
  return dappTemplates.filter(template => template.category === category);
}

// Helper function to get all template categories
export function getTemplateCategories(): string[] {
  return [...new Set(dappTemplates.map(template => template.category))];
}