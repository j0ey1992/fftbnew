/**
 * Defines the customization options for staking pages
 */
export interface StakingPageCustomization {
  // Background options
  backgroundType: 'image' | 'gradient' | 'solid';
  backgroundImage?: string;
  backgroundGradient?: string;
  backgroundColor?: string;
  
  // Banner options
  bannerImage?: string;
  profileImage?: string;
  
  // Content options
  name: string;
  description: string;
  
  // Social links
  socialLinks: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    facebook?: string;
    instagram?: string;
    medium?: string;
    github?: string;
  };
  
  // UI customization
  primaryColor?: string;
  accentColor?: string;
  
  // Additional content
  additionalSections?: {
    title: string;
    content: string;
    position: 'top' | 'middle' | 'bottom';
  }[];
}

/**
 * Default customization values
 */
export const defaultCustomization: StakingPageCustomization = {
  backgroundType: 'gradient',
  backgroundGradient: 'linear-gradient(to bottom, #0f172a, #020617)',
  name: 'Staking',
  description: 'Stake your tokens to earn rewards',
  socialLinks: {},
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6'
};
