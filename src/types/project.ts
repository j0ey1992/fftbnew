import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Component types that can be customized
 */
export type ComponentType = 'header' | 'footer' | 'card' | 'button' | 'navigation' | 'section' | 'hero' | 'module';

/**
 * Style template options for project themes
 */
export type StyleTemplateId = 1 | 2 | 3 | 4;
export type StyleTemplateName = 'Crypto Pro' | 'Minimal Modern' | 'Gradient Glow' | 'Enterprise';

/**
 * Background type options
 */
export type BackgroundType = 'solid' | 'gradient' | 'image';

/**
 * Project theme configuration
 */
export interface ProjectTheme {
  templateId: StyleTemplateId;
  templateName: StyleTemplateName;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundType: BackgroundType;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  logoImage?: string;
  fontFamily?: string;
}

/**
 * Module configuration with enabled state and contract address
 */
export interface ModuleConfig {
  enabled: boolean;
  contractAddress?: string;
  name?: string;
  description?: string;
}

/**
 * All available modules
 */
export interface ProjectModules {
  nftMint: ModuleConfig;
  nftStaking: ModuleConfig;
  coinStaking: ModuleConfig;
  lpStaking: ModuleConfig;
  quests: ModuleConfig;
  vaults: ModuleConfig;
}

/**
 * Content section types
 */
export type SectionType = 'hero' | 'text' | 'features' | 'faq' | 'cta' | 'social';

/**
 * Base content section
 */
export interface ContentSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  position: 'top' | 'middle' | 'bottom';
}

/**
 * Hero section
 */
export interface HeroSection extends ContentSection {
  type: 'hero';
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

/**
 * Text section
 */
export interface TextSection extends ContentSection {
  type: 'text';
  content: string;
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Feature item
 */
export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

/**
 * Features section
 */
export interface FeaturesSection extends ContentSection {
  type: 'features';
  features: FeatureItem[];
  layout?: 'grid' | 'list';
}

/**
 * FAQ item
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ section
 */
export interface FaqSection extends ContentSection {
  type: 'faq';
  items: FaqItem[];
}

/**
 * CTA section
 */
export interface CtaSection extends ContentSection {
  type: 'cta';
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
}

/**
 * Social link
 */
export interface SocialLink {
  platform: 'website' | 'twitter' | 'discord' | 'telegram' | 'medium' | 'github';
  url: string;
  label?: string;
}

/**
 * Social section
 */
export interface SocialSection extends ContentSection {
  type: 'social';
  links: SocialLink[];
}

/**
 * Union type for all section types
 */
export type ProjectContentSection = 
  | HeroSection
  | TextSection
  | FeaturesSection
  | FaqSection
  | CtaSection
  | SocialSection;

/**
 * Project content
 */
export interface ProjectContent {
  heroTitle: string;
  description: string;
  sections: ProjectContentSection[];
}

/**
 * Domain configuration
 */
export interface ProjectDomain {
  customDomain?: string;
  redirectEnabled: boolean;
}

/**
 * Component style template options
 */
export type ComponentTemplateId = 1 | 2 | 3 | 4 | 5;

/**
 * Component style configuration
 */
export interface ComponentStyle {
  id: string;
  componentType: ComponentType;
  templateId: ComponentTemplateId;
  name: string;
  customStyles: {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    spacing?: Record<string, string>;
    effects?: Record<string, string>;
    images?: {
      backgroundImage?: string;
      logoImage?: string;
      iconImage?: string;
      additionalImages?: Record<string, string>;
    };
  };
  aiGeneratedCSS?: string;
  deleted?: boolean;
}

/**
 * Project visibility
 */
export type ProjectVisibility = 'public' | 'private' | 'unlisted';

/**
 * Project settings
 */
export interface ProjectSettings {
  visibility: ProjectVisibility;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Project component in the registry
 */
export interface ProjectComponent {
  id: string;
  type: ComponentType;
  content?: string | Record<string, any>;
  styles?: ComponentStyle;
  position: string; // e.g., "header", "main-content-1", "footer"
  isActive: boolean;
  children?: string[]; // IDs of child components
}

/**
 * Project page model
 */
export interface ProjectPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isHomePage: boolean;
  componentRegistry?: ProjectComponent[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Project model
 */
export interface Project {
  id: string;
  slug: string;
  name: string;
  owner: string;
  theme: ProjectTheme;
  modules: ProjectModules;
  content: ProjectContent;
  domains: ProjectDomain;
  settings: ProjectSettings;
  componentStyles?: ComponentStyle[];
  componentRegistry?: ProjectComponent[]; // For backward compatibility
  pages?: ProjectPage[]; // New field for multi-page support
}

/**
 * Default page configuration
 */
export const defaultPage = (title: string, isHomePage: boolean = false): ProjectPage => ({
  id: uuidv4(),
  slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  title,
  isHomePage,
  componentRegistry: []
});

/**
 * Default theme configuration
 */
export const defaultTheme: ProjectTheme = {
  templateId: 1,
  templateName: 'Crypto Pro',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  textColor: '#ffffff',
  backgroundType: 'gradient',
  backgroundGradient: 'linear-gradient(to bottom, #0f172a, #020617)',
};

/**
 * Default modules configuration
 */
export const defaultModules: ProjectModules = {
  nftMint: { enabled: false },
  nftStaking: { enabled: false },
  coinStaking: { enabled: false },
  lpStaking: { enabled: false },
  quests: { enabled: false },
  vaults: { enabled: false },
};

/**
 * Default content
 */
export const defaultContent: ProjectContent = {
  heroTitle: 'My Web3 Project',
  description: 'A customizable Web3 project with various DeFi features',
  sections: [],
};

/**
 * Default domain configuration
 */
export const defaultDomain: ProjectDomain = {
  redirectEnabled: false,
};

/**
 * Default project settings
 */
export const defaultSettings = (now: Timestamp): ProjectSettings => ({
  visibility: 'public',
  createdAt: now,
  updatedAt: now,
});

/**
 * Default component styles
 */
export const defaultComponentStyles: ComponentStyle[] = [
  // Header templates
  {
    id: 'header-default',
    componentType: 'header',
    templateId: 1,
    name: 'Default Header',
    customStyles: {
      colors: {
        background: 'rgba(10, 15, 31, 0.75)',
        text: '#ffffff',
        border: 'rgba(255, 255, 255, 0.1)'
      },
      effects: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  {
    id: 'header-minimal',
    componentType: 'header',
    templateId: 2,
    name: 'Minimal Header',
    customStyles: {
      colors: {
        background: 'transparent',
        text: '#ffffff'
      },
      spacing: {
        padding: '1rem 2rem'
      }
    }
  },
  {
    id: 'header-gradient',
    componentType: 'header',
    templateId: 3,
    name: 'Gradient Header',
    customStyles: {
      colors: {
        background: 'linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d)',
        text: '#ffffff'
      },
      effects: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }
    }
  },
  
  // Card templates
  {
    id: 'card-glass',
    componentType: 'card',
    templateId: 1,
    name: 'Glass Card',
    customStyles: {
      colors: {
        background: 'rgba(20, 25, 45, 0.6)',
        border: 'rgba(255, 255, 255, 0.08)',
        text: '#ffffff'
      },
      effects: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        borderRadius: '12px'
      },
      spacing: {
        padding: '1.5rem'
      }
    }
  },
  {
    id: 'card-solid',
    componentType: 'card',
    templateId: 2,
    name: 'Solid Card',
    customStyles: {
      colors: {
        background: '#1e293b',
        text: '#ffffff'
      },
      effects: {
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      },
      spacing: {
        padding: '1.25rem'
      }
    }
  },
  {
    id: 'card-gradient',
    componentType: 'card',
    templateId: 3,
    name: 'Gradient Card',
    customStyles: {
      colors: {
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        text: '#ffffff'
      },
      effects: {
        borderRadius: '12px',
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)'
      }
    }
  },
  
  // Button templates
  {
    id: 'button-primary',
    componentType: 'button',
    templateId: 1,
    name: 'Primary Button',
    customStyles: {
      colors: {
        background: '#3b82f6',
        text: '#ffffff',
        hoverBackground: '#2563eb'
      },
      effects: {
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      },
      spacing: {
        padding: '0.75rem 1.5rem'
      },
      typography: {
        fontWeight: '600'
      }
    }
  },
  {
    id: 'button-gradient',
    componentType: 'button',
    templateId: 2,
    name: 'Gradient Button',
    customStyles: {
      colors: {
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
        text: '#ffffff',
        hoverBackground: 'linear-gradient(90deg, #2563eb, #7c3aed)'
      },
      effects: {
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
        transition: 'all 0.3s ease'
      }
    }
  },
  {
    id: 'button-glass',
    componentType: 'button',
    templateId: 3,
    name: 'Glass Button',
    customStyles: {
      colors: {
        background: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        border: 'rgba(255, 255, 255, 0.2)',
        hoverBackground: 'rgba(255, 255, 255, 0.2)'
      },
      effects: {
        backdropFilter: 'blur(4px)',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      }
    }
  },
  
  // Hero templates
  {
    id: 'hero-centered',
    componentType: 'hero',
    templateId: 1,
    name: 'Centered Hero',
    customStyles: {
      spacing: {
        padding: '6rem 2rem'
      },
      typography: {
        textAlign: 'center'
      },
      effects: {
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
  },
  {
    id: 'hero-split',
    componentType: 'hero',
    templateId: 2,
    name: 'Split Hero',
    customStyles: {
      spacing: {
        padding: '4rem 2rem'
      },
      typography: {
        textAlign: 'left'
      }
    }
  }
];
