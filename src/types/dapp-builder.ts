// Enhanced dApp Builder Types

export type ComponentCategory = 
  | 'layout'
  | 'hero'
  | 'header'
  | 'footer'
  | 'navigation'
  | 'content'
  | 'cards'
  | 'features'
  | 'web3'
  | 'forms'
  | 'media'
  | 'social'
  | 'pricing'
  | 'team'
  | 'stats'
  | 'testimonials'
  | 'faq'
  | 'cta';

export type LayoutType = 
  | 'full-width'
  | 'container'
  | 'two-column'
  | 'three-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'grid';

export interface ComponentStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: {
    from: string;
    to: string;
    direction: string;
  };
  textColor?: string;
  padding?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  border?: {
    width: string;
    style: string;
    color: string;
    radius: string;
  };
  shadow?: string;
  opacity?: number;
  blur?: string;
  animation?: {
    type: string;
    duration: string;
    delay: string;
  };
}

export interface DAppComponent {
  id: string;
  type: string;
  category: ComponentCategory;
  name: string;
  gridArea?: {
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
  };
  props: Record<string, any>;
  style: ComponentStyle;
  children?: DAppComponent[];
  parentId?: string;
}

export interface DAppSection {
  id: string;
  name: string;
  layout: LayoutType;
  components: DAppComponent[];
  style: ComponentStyle;
  order: number;
}

export interface DAppPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  sections: DAppSection[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
}

export interface DAppTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    base: string;
    slow: string;
  };
}

export interface DAppTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'nft' | 'defi' | 'gaming' | 'dao' | 'marketplace' | 'social' | 'portfolio';
  pages: DAppPage[];
  theme: DAppTheme;
  requiredModules: string[];
}

export interface DAppProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  domain?: {
    subdomain?: string;
    customDomain?: string;
  };
  theme: DAppTheme;
  pages: DAppPage[];
  navigation: {
    header: {
      links: Array<{
        label: string;
        href: string;
        external?: boolean;
      }>;
      style: ComponentStyle;
    };
    footer: {
      sections: Array<{
        title: string;
        links: Array<{
          label: string;
          href: string;
        }>;
      }>;
      style: ComponentStyle;
    };
  };
  integrations: {
    analytics?: {
      googleAnalytics?: string;
      mixpanel?: string;
    };
    seo?: {
      googleSearchConsole?: string;
    };
    social?: {
      twitter?: string;
      discord?: string;
      telegram?: string;
      github?: string;
    };
  };
  web3Config: {
    chainId: number;
    contracts: {
      nftStaking?: string;
      tokenStaking?: string;
      lpStaking?: string;
      vaults?: string;
      marketplace?: string;
      governance?: string;
    };
    tokens: {
      native?: string;
      governance?: string;
      reward?: string;
    };
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}