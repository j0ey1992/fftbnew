import { DAppComponent, ComponentCategory } from '@/types/dapp-builder';

// Component Library - Pre-built components for drag and drop

export const componentLibrary: Record<ComponentCategory, DAppComponent[]> = {
  header: [
    {
      id: 'header-classic',
      type: 'header-classic',
      category: 'header',
      name: 'Classic Header',
      props: {
        logo: '/placeholder-logo.png',
        logoText: 'Your Brand',
        menuItems: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Features', href: '/features' },
          { label: 'Contact', href: '/contact' }
        ],
        ctaButton: {
          text: 'Get Started',
          href: '/get-started'
        }
      },
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' },
        shadow: 'sm'
      },
      children: []
    },
    {
      id: 'header-modern',
      type: 'header-modern',
      category: 'header',
      name: 'Modern Header',
      props: {
        logo: '/placeholder-logo.png',
        menuItems: [
          { label: 'Products', href: '/products' },
          { label: 'Solutions', href: '/solutions' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Resources', href: '/resources' }
        ],
        showWalletConnect: true,
        transparentBackground: true
      },
      style: {
        backgroundColor: 'transparent',
        backgroundGradient: {
          from: 'rgba(0,0,0,0)',
          to: 'rgba(0,0,0,0.1)',
          direction: 'to bottom'
        },
        padding: { top: '1.5rem', right: '3rem', bottom: '1.5rem', left: '3rem' }
      },
      children: []
    },
    {
      id: 'header-minimal',
      type: 'header-minimal',
      category: 'header',
      name: 'Minimal Header',
      props: {
        logoText: 'LOGO',
        centerLogo: true,
        menuStyle: 'hamburger'
      },
      style: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        padding: { top: '1rem', right: '1.5rem', bottom: '1rem', left: '1.5rem' }
      },
      children: []
    }
  ],
  footer: [
    {
      id: 'footer-comprehensive',
      type: 'footer-comprehensive',
      category: 'footer',
      name: 'Comprehensive Footer',
      props: {
        columns: [
          {
            title: 'Product',
            links: [
              { label: 'Features', href: '/features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Security', href: '/security' },
              { label: 'Roadmap', href: '/roadmap' }
            ]
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Blog', href: '/blog' },
              { label: 'Careers', href: '/careers' },
              { label: 'Contact', href: '/contact' }
            ]
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '/docs' },
              { label: 'API', href: '/api' },
              { label: 'Support', href: '/support' },
              { label: 'Status', href: '/status' }
            ]
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookie Policy', href: '/cookies' }
            ]
          }
        ],
        socialLinks: [
          { platform: 'twitter', url: 'https://twitter.com' },
          { platform: 'discord', url: 'https://discord.com' },
          { platform: 'telegram', url: 'https://telegram.org' },
          { platform: 'github', url: 'https://github.com' }
        ],
        copyright: '© 2024 Your Company. All rights reserved.',
        newsletter: {
          title: 'Subscribe to our newsletter',
          placeholder: 'Enter your email',
          buttonText: 'Subscribe'
        }
      },
      style: {
        backgroundColor: '#111827',
        textColor: '#9CA3AF',
        padding: { top: '4rem', right: '2rem', bottom: '2rem', left: '2rem' }
      },
      children: []
    },
    {
      id: 'footer-simple',
      type: 'footer-simple',
      category: 'footer',
      name: 'Simple Footer',
      props: {
        logo: '/placeholder-logo.png',
        copyright: '© 2024 Your Brand',
        links: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'Contact', href: '/contact' }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        borderTop: { width: '1px', style: 'solid', color: '#e5e7eb', radius: '0' },
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' }
      },
      children: []
    },
    {
      id: 'footer-centered',
      type: 'footer-centered',
      category: 'footer',
      name: 'Centered Footer',
      props: {
        logoText: 'YOUR BRAND',
        tagline: 'Building the future of Web3',
        socialOnly: true,
        socialLinks: [
          { platform: 'twitter', url: '#' },
          { platform: 'discord', url: '#' },
          { platform: 'telegram', url: '#' }
        ]
      },
      style: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        padding: { top: '3rem', right: '2rem', bottom: '3rem', left: '2rem' }
      },
      children: []
    }
  ],
  hero: [
    {
      id: 'hero-gradient',
      type: 'hero-gradient',
      category: 'hero',
      name: 'Gradient Hero',
      props: {
        title: 'Welcome to the Future of DeFi',
        subtitle: 'Build, trade, and earn with our decentralized platform',
        primaryButton: {
          text: 'Launch App',
          href: '/app'
        },
        secondaryButton: {
          text: 'Learn More',
          href: '/docs'
        },
        backgroundType: 'gradient',
        showStats: true,
        stats: [
          { label: 'Total Value Locked', value: '$100M+' },
          { label: 'Active Users', value: '50K+' },
          { label: 'Transactions', value: '1M+' }
        ]
      },
      style: {
        backgroundGradient: {
          from: '#6366F1',
          to: '#8B5CF6',
          direction: 'to bottom right'
        },
        textColor: '#ffffff',
        padding: { top: '6rem', right: '2rem', bottom: '6rem', left: '2rem' },
        minHeight: '80vh'
      },
      children: []
    },
    {
      id: 'hero-image',
      type: 'hero-image',
      category: 'hero',
      name: 'Image Hero',
      props: {
        title: 'Your NFT Collection Starts Here',
        subtitle: 'Discover, collect, and trade unique digital assets',
        backgroundImage: '/hero-bg.jpg',
        overlay: true,
        alignment: 'left',
        ctaButton: {
          text: 'Explore Collection',
          href: '/collection'
        }
      },
      style: {
        backgroundImage: '/hero-bg.jpg',
        backgroundColor: 'rgba(0,0,0,0.5)',
        textColor: '#ffffff',
        padding: { top: '8rem', right: '2rem', bottom: '8rem', left: '2rem' },
        minHeight: '100vh'
      },
      children: []
    },
    {
      id: 'hero-video',
      type: 'hero-video',
      category: 'hero',
      name: 'Video Hero',
      props: {
        title: 'Experience the Metaverse',
        subtitle: 'Join thousands exploring virtual worlds',
        videoUrl: '/hero-video.mp4',
        autoplay: true,
        muted: true,
        loop: true,
        primaryButton: {
          text: 'Enter Metaverse',
          href: '/metaverse'
        }
      },
      style: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        padding: { top: '10rem', right: '2rem', bottom: '10rem', left: '2rem' },
        minHeight: '100vh'
      },
      children: []
    }
  ],
  cards: [
    {
      id: 'card-feature',
      type: 'card-feature',
      category: 'cards',
      name: 'Feature Card',
      props: {
        icon: 'star',
        title: 'Amazing Feature',
        description: 'This feature will revolutionize how you interact with blockchain',
        link: {
          text: 'Learn More',
          href: '/features'
        }
      },
      style: {
        backgroundColor: '#ffffff',
        border: { width: '1px', style: 'solid', color: '#e5e7eb', radius: 'lg' },
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        shadow: 'md',
        hover: {
          shadow: 'lg',
          transform: 'translateY(-4px)'
        }
      },
      children: []
    },
    {
      id: 'card-stats',
      type: 'card-stats',
      category: 'cards',
      name: 'Stats Card',
      props: {
        title: 'Total Revenue',
        value: '$45,231.89',
        change: '+20.1%',
        changeType: 'positive',
        period: 'from last month',
        icon: 'dollar',
        sparkline: true
      },
      style: {
        backgroundColor: '#ffffff',
        border: { width: '1px', style: 'solid', color: '#e5e7eb', radius: 'xl' },
        padding: { top: '1.5rem', right: '1.5rem', bottom: '1.5rem', left: '1.5rem' },
        shadow: 'sm'
      },
      children: []
    },
    {
      id: 'card-nft',
      type: 'card-nft',
      category: 'cards',
      name: 'NFT Card',
      props: {
        image: '/nft-placeholder.jpg',
        collection: 'Cool Collection',
        name: 'NFT #1234',
        price: '2.5 ETH',
        likes: 42,
        rarity: 'Legendary',
        attributes: [
          { trait: 'Background', value: 'Purple' },
          { trait: 'Eyes', value: 'Laser' },
          { trait: 'Mouth', value: 'Smile' }
        ]
      },
      style: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        border: { width: '1px', style: 'solid', color: '#333333', radius: '2xl' },
        overflow: 'hidden',
        shadow: 'xl'
      },
      children: []
    },
    {
      id: 'card-pricing',
      type: 'card-pricing',
      category: 'cards',
      name: 'Pricing Card',
      props: {
        tier: 'Pro',
        price: '$29',
        period: '/month',
        description: 'Perfect for growing projects',
        features: [
          'Unlimited transactions',
          'Advanced analytics',
          'Priority support',
          'Custom integrations',
          'API access'
        ],
        recommended: true,
        ctaText: 'Get Started'
      },
      style: {
        backgroundColor: '#ffffff',
        border: { width: '2px', style: 'solid', color: '#6366F1', radius: '2xl' },
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        shadow: 'xl',
        position: 'relative'
      },
      children: []
    },
    {
      id: 'card-team',
      type: 'card-team',
      category: 'cards',
      name: 'Team Member Card',
      props: {
        image: '/team-placeholder.jpg',
        name: 'John Doe',
        role: 'CEO & Founder',
        bio: 'Passionate about blockchain and decentralization',
        social: [
          { platform: 'twitter', url: '#' },
          { platform: 'linkedin', url: '#' },
          { platform: 'github', url: '#' }
        ]
      },
      style: {
        backgroundColor: '#f9fafb',
        border: { width: '0', style: 'none', color: 'transparent', radius: 'xl' },
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        textAlign: 'center'
      },
      children: []
    },
    {
      id: 'card-testimonial',
      type: 'card-testimonial',
      category: 'cards',
      name: 'Testimonial Card',
      props: {
        quote: 'This platform has completely transformed how we manage our DeFi portfolio. The user experience is unmatched.',
        author: 'Sarah Johnson',
        role: 'DeFi Investor',
        company: 'Crypto Ventures',
        image: '/testimonial-avatar.jpg',
        rating: 5
      },
      style: {
        backgroundColor: '#ffffff',
        border: { width: '1px', style: 'solid', color: '#e5e7eb', radius: 'xl' },
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        shadow: 'md'
      },
      children: []
    }
  ],
  layout: [
    {
      id: 'layout-container',
      type: 'layout-container',
      category: 'layout',
      name: 'Container',
      props: {
        maxWidth: '1200px',
        centered: true
      },
      style: {
        padding: { top: '0', right: '1rem', bottom: '0', left: '1rem' },
        margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' }
      },
      children: []
    },
    {
      id: 'layout-grid',
      type: 'layout-grid',
      category: 'layout',
      name: 'Grid Layout',
      props: {
        columns: 3,
        gap: '2rem',
        responsive: {
          mobile: 1,
          tablet: 2,
          desktop: 3
        }
      },
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem'
      },
      children: []
    },
    {
      id: 'layout-flex',
      type: 'layout-flex',
      category: 'layout',
      name: 'Flex Layout',
      props: {
        direction: 'row',
        justify: 'space-between',
        align: 'center',
        wrap: true
      },
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      },
      children: []
    }
  ],
  features: [
    {
      id: 'features-grid',
      type: 'features-grid',
      category: 'features',
      name: 'Features Grid',
      props: {
        title: 'Why Choose Us',
        subtitle: 'Everything you need to succeed in Web3',
        features: [
          {
            icon: 'shield',
            title: 'Secure by Design',
            description: 'Military-grade encryption and smart contract audits'
          },
          {
            icon: 'lightning',
            title: 'Lightning Fast',
            description: 'Optimized for speed with sub-second transactions'
          },
          {
            icon: 'globe',
            title: 'Global Access',
            description: 'Available worldwide with multi-language support'
          },
          {
            icon: 'users',
            title: 'Community Driven',
            description: 'Governed by our community of token holders'
          }
        ]
      },
      style: {
        backgroundColor: '#f9fafb',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    },
    {
      id: 'features-alternating',
      type: 'features-alternating',
      category: 'features',
      name: 'Alternating Features',
      props: {
        features: [
          {
            title: 'Powerful Analytics',
            description: 'Get deep insights into your portfolio performance',
            image: '/feature-1.jpg',
            bullets: [
              'Real-time data tracking',
              'Advanced charting tools',
              'Custom alerts and notifications'
            ],
            imagePosition: 'right'
          },
          {
            title: 'Automated Strategies',
            description: 'Set it and forget it with our smart automation',
            image: '/feature-2.jpg',
            bullets: [
              'DCA strategies',
              'Yield optimization',
              'Risk management tools'
            ],
            imagePosition: 'left'
          }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    }
  ],
  content: [
    {
      id: 'content-richtext',
      type: 'content-richtext',
      category: 'content',
      name: 'Rich Text Block',
      props: {
        content: '<h2>About Our Mission</h2><p>We are building the future of decentralized finance...</p>',
        maxWidth: '800px',
        centered: true
      },
      style: {
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        lineHeight: '1.6'
      },
      children: []
    },
    {
      id: 'content-timeline',
      type: 'content-timeline',
      category: 'content',
      name: 'Timeline/Roadmap',
      props: {
        title: 'Our Journey',
        items: [
          {
            date: 'Q1 2024',
            title: 'Platform Launch',
            description: 'Initial release with core features',
            status: 'completed'
          },
          {
            date: 'Q2 2024',
            title: 'Mobile App',
            description: 'iOS and Android apps release',
            status: 'in-progress'
          },
          {
            date: 'Q3 2024',
            title: 'DEX Integration',
            description: 'Full DEX functionality',
            status: 'planned'
          }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    }
  ],
  web3: [
    {
      id: 'web3-wallet-connect',
      type: 'web3-wallet-connect',
      category: 'web3',
      name: 'Wallet Connect Button',
      props: {
        buttonText: 'Connect Wallet',
        showBalance: true,
        showNetwork: true,
        supportedChains: ['ethereum', 'polygon', 'bsc', 'cronos']
      },
      style: {
        position: 'fixed',
        top: '1rem',
        right: '1rem'
      },
      children: []
    },
    {
      id: 'web3-token-info',
      type: 'web3-token-info',
      category: 'web3',
      name: 'Token Info Display',
      props: {
        tokenAddress: '0x...',
        showPrice: true,
        showChart: true,
        showHolders: true,
        showMarketCap: true
      },
      style: {
        backgroundColor: '#ffffff',
        border: { width: '1px', style: 'solid', color: '#e5e7eb', radius: 'xl' },
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        shadow: 'lg'
      },
      children: []
    },
    {
      id: 'web3-nft-gallery',
      type: 'web3-nft-gallery',
      category: 'web3',
      name: 'NFT Gallery',
      props: {
        collectionAddress: '0x...',
        itemsPerPage: 12,
        showFilters: true,
        enablePurchase: true
      },
      style: {
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' }
      },
      children: []
    }
  ],
  forms: [
    {
      id: 'form-contact',
      type: 'form-contact',
      category: 'forms',
      name: 'Contact Form',
      props: {
        fields: [
          { type: 'text', name: 'name', label: 'Name', required: true },
          { type: 'email', name: 'email', label: 'Email', required: true },
          { type: 'text', name: 'subject', label: 'Subject', required: true },
          { type: 'textarea', name: 'message', label: 'Message', required: true, rows: 5 }
        ],
        submitText: 'Send Message',
        successMessage: 'Thank you! We\'ll get back to you soon.'
      },
      style: {
        backgroundColor: '#ffffff',
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        border: { width: '1px', style: 'solid', color: '#e5e7eb', radius: 'lg' },
        maxWidth: '600px'
      },
      children: []
    },
    {
      id: 'form-newsletter',
      type: 'form-newsletter',
      category: 'forms',
      name: 'Newsletter Signup',
      props: {
        title: 'Stay Updated',
        description: 'Get the latest news and updates',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        showSocialProof: true,
        socialProofText: 'Join 10,000+ subscribers'
      },
      style: {
        backgroundColor: '#6366F1',
        textColor: '#ffffff',
        padding: { top: '3rem', right: '3rem', bottom: '3rem', left: '3rem' },
        border: { width: '0', style: 'none', color: 'transparent', radius: '2xl' }
      },
      children: []
    }
  ],
  media: [
    {
      id: 'media-image',
      type: 'media-image',
      category: 'media',
      name: 'Image',
      props: {
        src: '/placeholder.jpg',
        alt: 'Description',
        caption: 'Optional caption',
        aspectRatio: '16:9',
        objectFit: 'cover'
      },
      style: {
        border: { width: '0', style: 'none', color: 'transparent', radius: 'lg' },
        overflow: 'hidden'
      },
      children: []
    },
    {
      id: 'media-video',
      type: 'media-video',
      category: 'media',
      name: 'Video',
      props: {
        src: '/video.mp4',
        poster: '/video-poster.jpg',
        controls: true,
        autoplay: false,
        loop: false,
        muted: false
      },
      style: {
        border: { width: '0', style: 'none', color: 'transparent', radius: 'lg' },
        overflow: 'hidden',
        width: '100%'
      },
      children: []
    },
    {
      id: 'media-embed',
      type: 'media-embed',
      category: 'media',
      name: 'Embed',
      props: {
        embedType: 'youtube',
        embedId: 'dQw4w9WgXcQ',
        aspectRatio: '16:9'
      },
      style: {
        border: { width: '0', style: 'none', color: 'transparent', radius: 'lg' },
        overflow: 'hidden'
      },
      children: []
    }
  ],
  social: [
    {
      id: 'social-links',
      type: 'social-links',
      category: 'social',
      name: 'Social Links',
      props: {
        links: [
          { platform: 'twitter', url: 'https://twitter.com' },
          { platform: 'discord', url: 'https://discord.com' },
          { platform: 'telegram', url: 'https://telegram.org' },
          { platform: 'github', url: 'https://github.com' },
          { platform: 'medium', url: 'https://medium.com' }
        ],
        style: 'colored',
        size: 'lg'
      },
      style: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      },
      children: []
    },
    {
      id: 'social-feed',
      type: 'social-feed',
      category: 'social',
      name: 'Twitter Feed',
      props: {
        username: 'yourproject',
        limit: 5,
        showRetweets: false,
        theme: 'dark'
      },
      style: {
        backgroundColor: '#1a1a1a',
        padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' },
        border: { width: '1px', style: 'solid', color: '#333333', radius: 'xl' }
      },
      children: []
    }
  ],
  pricing: [
    {
      id: 'pricing-table',
      type: 'pricing-table',
      category: 'pricing',
      name: 'Pricing Table',
      props: {
        title: 'Choose Your Plan',
        subtitle: 'Start free, upgrade when you need',
        plans: [
          {
            name: 'Basic',
            price: 'Free',
            period: '',
            description: 'Perfect for getting started',
            features: [
              '10 transactions/month',
              'Basic analytics',
              'Email support'
            ],
            ctaText: 'Get Started',
            highlighted: false
          },
          {
            name: 'Pro',
            price: '$29',
            period: '/month',
            description: 'For growing projects',
            features: [
              'Unlimited transactions',
              'Advanced analytics',
              'Priority support',
              'API access',
              'Custom integrations'
            ],
            ctaText: 'Start Trial',
            highlighted: true
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large organizations',
            features: [
              'Everything in Pro',
              'Dedicated support',
              'Custom features',
              'SLA guarantee',
              'On-premise option'
            ],
            ctaText: 'Contact Sales',
            highlighted: false
          }
        ]
      },
      style: {
        backgroundColor: '#f9fafb',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    }
  ],
  team: [
    {
      id: 'team-grid',
      type: 'team-grid',
      category: 'team',
      name: 'Team Grid',
      props: {
        title: 'Meet Our Team',
        subtitle: 'The people behind the project',
        members: [
          {
            image: '/team-1.jpg',
            name: 'John Smith',
            role: 'CEO & Founder',
            bio: 'Serial entrepreneur with 10+ years in blockchain',
            social: [
              { platform: 'twitter', url: '#' },
              { platform: 'linkedin', url: '#' }
            ]
          },
          {
            image: '/team-2.jpg',
            name: 'Sarah Chen',
            role: 'CTO',
            bio: 'Former Google engineer, Solidity expert',
            social: [
              { platform: 'twitter', url: '#' },
              { platform: 'github', url: '#' }
            ]
          },
          {
            image: '/team-3.jpg',
            name: 'Mike Johnson',
            role: 'Head of Marketing',
            bio: 'Growth hacker, previously at Coinbase',
            social: [
              { platform: 'twitter', url: '#' },
              { platform: 'linkedin', url: '#' }
            ]
          }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    }
  ],
  stats: [
    {
      id: 'stats-counter',
      type: 'stats-counter',
      category: 'stats',
      name: 'Stats Counter',
      props: {
        stats: [
          {
            label: 'Total Value Locked',
            value: '$125M',
            prefix: '',
            suffix: '+',
            animate: true
          },
          {
            label: 'Active Users',
            value: '50K',
            prefix: '',
            suffix: '+',
            animate: true
          },
          {
            label: 'Transactions',
            value: '2.5M',
            prefix: '',
            suffix: '+',
            animate: true
          },
          {
            label: 'Countries',
            value: '150',
            prefix: '',
            suffix: '+',
            animate: true
          }
        ],
        layout: 'horizontal'
      },
      style: {
        backgroundColor: '#111827',
        textColor: '#ffffff',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    }
  ],
  testimonials: [
    {
      id: 'testimonials-slider',
      type: 'testimonials-slider',
      category: 'testimonials',
      name: 'Testimonials Slider',
      props: {
        title: 'What Our Users Say',
        testimonials: [
          {
            quote: 'This platform has revolutionized how I manage my crypto portfolio.',
            author: 'Alex Thompson',
            role: 'DeFi Trader',
            image: '/testimonial-1.jpg',
            rating: 5
          },
          {
            quote: 'The best user experience in DeFi. Period.',
            author: 'Maria Garcia',
            role: 'Crypto Investor',
            image: '/testimonial-2.jpg',
            rating: 5
          },
          {
            quote: 'Security and ease of use - exactly what I was looking for.',
            author: 'David Kim',
            role: 'NFT Collector',
            image: '/testimonial-3.jpg',
            rating: 5
          }
        ],
        autoplay: true,
        showDots: true,
        showArrows: true
      },
      style: {
        backgroundColor: '#f9fafb',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' }
      },
      children: []
    }
  ],
  faq: [
    {
      id: 'faq-accordion',
      type: 'faq-accordion',
      category: 'faq',
      name: 'FAQ Accordion',
      props: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know',
        items: [
          {
            question: 'What is this platform?',
            answer: 'We are a decentralized finance platform that allows you to trade, stake, and earn with your crypto assets.'
          },
          {
            question: 'Is it safe to use?',
            answer: 'Yes, our smart contracts are audited by leading security firms and we use industry-standard security practices.'
          },
          {
            question: 'What chains do you support?',
            answer: 'We currently support Ethereum, Polygon, BSC, and Cronos with more chains coming soon.'
          },
          {
            question: 'How do I get started?',
            answer: 'Simply connect your wallet and you\'re ready to go. No KYC or lengthy sign-up process required.'
          }
        ],
        expandIcon: 'plus',
        collapseIcon: 'minus'
      },
      style: {
        backgroundColor: '#ffffff',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' },
        maxWidth: '800px',
        margin: { top: '0', right: 'auto', bottom: '0', left: 'auto' }
      },
      children: []
    }
  ],
  cta: [
    {
      id: 'cta-banner',
      type: 'cta-banner',
      category: 'cta',
      name: 'CTA Banner',
      props: {
        title: 'Ready to Get Started?',
        subtitle: 'Join thousands of users already using our platform',
        primaryButton: {
          text: 'Launch App',
          href: '/app'
        },
        secondaryButton: {
          text: 'Learn More',
          href: '/docs'
        },
        backgroundImage: '/cta-bg.jpg',
        overlay: true
      },
      style: {
        backgroundColor: '#6366F1',
        textColor: '#ffffff',
        padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' },
        borderRadius: '2xl',
        textAlign: 'center'
      },
      children: []
    },
    {
      id: 'cta-floating',
      type: 'cta-floating',
      category: 'cta',
      name: 'Floating CTA',
      props: {
        text: 'Need Help?',
        icon: 'message',
        position: 'bottom-right',
        action: 'openChat'
      },
      style: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        backgroundColor: '#6366F1',
        textColor: '#ffffff',
        padding: { top: '1rem', right: '1.5rem', bottom: '1rem', left: '1.5rem' },
        borderRadius: 'full',
        shadow: 'lg'
      },
      children: []
    }
  ],
  navigation: [
    {
      id: 'nav-breadcrumb',
      type: 'nav-breadcrumb',
      category: 'navigation',
      name: 'Breadcrumb',
      props: {
        separator: '/',
        items: [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Current Page', href: '#', current: true }
        ]
      },
      style: {
        padding: { top: '1rem', right: '0', bottom: '1rem', left: '0' },
        fontSize: 'sm',
        textColor: '#6B7280'
      },
      children: []
    },
    {
      id: 'nav-tabs',
      type: 'nav-tabs',
      category: 'navigation',
      name: 'Tab Navigation',
      props: {
        tabs: [
          { label: 'Overview', href: '#overview', active: true },
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' }
        ],
        style: 'underline'
      },
      style: {
        borderBottom: { width: '1px', style: 'solid', color: '#e5e7eb', radius: '0' },
        marginBottom: '2rem'
      },
      children: []
    }
  ]
};

// Helper function to get components by category
export function getComponentsByCategory(category: ComponentCategory): DAppComponent[] {
  return componentLibrary[category] || [];
}

// Helper function to get all components
export function getAllComponents(): DAppComponent[] {
  return Object.values(componentLibrary).flat();
}

// Helper function to search components
export function searchComponents(query: string): DAppComponent[] {
  const lowercaseQuery = query.toLowerCase();
  return getAllComponents().filter(component => 
    component.name.toLowerCase().includes(lowercaseQuery) ||
    component.type.toLowerCase().includes(lowercaseQuery) ||
    component.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Helper function to clone a component with new ID
export function cloneComponent(component: DAppComponent): DAppComponent {
  return {
    ...component,
    id: `${component.type}-${Date.now()}`,
    children: component.children?.map(child => cloneComponent(child)) || []
  };
}