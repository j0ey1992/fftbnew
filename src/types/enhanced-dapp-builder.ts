import { DAppComponent, VisualDApp, DAppPage } from './visual-dapp-builder';

// Enhanced component with modern features
export interface EnhancedDAppComponent extends DAppComponent {
  // Positioning
  position?: {
    x?: number;
    y?: number;
    width?: string | number;
    height?: string | number;
    order?: number;
    zIndex?: number;
  };
  
  // Layout properties
  layout?: {
    gridColumn?: string;
    gridRow?: string;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: string;
    alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justifySelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
  };
  
  // Visual styling
  style?: {
    margin?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    padding?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    background?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    opacity?: number;
    transform?: string;
    transition?: string;
    filter?: string;
  };
  
  // Responsive overrides
  responsive?: {
    mobile?: Partial<EnhancedDAppComponent['position'] & EnhancedDAppComponent['layout'] & EnhancedDAppComponent['style']>;
    tablet?: Partial<EnhancedDAppComponent['position'] & EnhancedDAppComponent['layout'] & EnhancedDAppComponent['style']>;
    desktop?: Partial<EnhancedDAppComponent['position'] & EnhancedDAppComponent['layout'] & EnhancedDAppComponent['style']>;
  };
  
  // Animations
  animations?: {
    entrance?: AnimationConfig;
    hover?: AnimationConfig;
    exit?: AnimationConfig;
  };
  
  // Component states
  states?: {
    default?: Partial<EnhancedDAppComponent['style']>;
    hover?: Partial<EnhancedDAppComponent['style']>;
    active?: Partial<EnhancedDAppComponent['style']>;
    focus?: Partial<EnhancedDAppComponent['style']>;
  };
}

// Animation configuration
export interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  duration: number;
  delay?: number;
  easing?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: string;
  scale?: number;
  rotate?: number;
  custom?: string;
}

// Section-based layout
export interface Section {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'content' | 'cta' | 'footer' | 'custom';
  layout: SectionLayout;
  components: EnhancedDAppComponent[];
  style: SectionStyle;
  locked?: boolean;
}

export interface SectionLayout {
  type: 'flex' | 'grid' | 'stack' | 'masonry';
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: string;
  columns?: number | string;
  rows?: number | string;
}

export interface SectionStyle {
  minHeight?: string;
  maxHeight?: string;
  background?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  padding?: string;
  margin?: string;
  borderTop?: string;
  borderBottom?: string;
}

// Enhanced page with sections
export interface EnhancedDAppPage extends DAppPage {
  sections: Section[];
  layout?: undefined; // Remove old layout
  components?: undefined; // Remove old components
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

// Enhanced builder state
export interface EnhancedBuilderState {
  // Canvas state
  canvas: {
    zoom: number;
    pan: { x: number; y: number };
    gridSize: number;
    showGrid: boolean;
    showRulers: boolean;
    showGuides: boolean;
    snapToGrid: boolean;
    snapToGuides: boolean;
  };
  
  // Selection
  selection: {
    componentIds: string[];
    sectionId?: string;
  };
  
  // Interaction
  interaction: {
    mode: 'select' | 'pan' | 'zoom' | 'text' | 'draw';
    tool: 'pointer' | 'hand' | 'zoom' | 'text' | 'shape';
    isDragging: boolean;
    isResizing: boolean;
    draggedItem?: string;
  };
  
  // UI state
  ui: {
    leftPanel: 'components' | 'pages' | 'assets' | 'none';
    rightPanel: 'properties' | 'layers' | 'none';
    bottomPanel: 'timeline' | 'code' | 'none';
    activeTab: string;
  };
  
  // History
  history: {
    past: VisualDApp[];
    present: VisualDApp;
    future: VisualDApp[];
    savedVersion?: VisualDApp;
  };
}

// Component preset
export interface ComponentPreset {
  id: string;
  name: string;
  thumbnail?: string;
  config: Partial<EnhancedDAppComponent>;
  category?: string;
  tags?: string[];
}

// Design system
export interface DesignSystem {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  
  typography: {
    fontFamily: string;
    headingFamily?: string;
    monoFamily?: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
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
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
}

// Export all types
export type {
  AnimationConfig,
  Section,
  SectionLayout,
  SectionStyle,
  ComponentPreset,
  DesignSystem
};