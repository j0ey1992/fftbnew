# Enhanced Quest System Styling Guide

This guide provides comprehensive documentation for the Enhanced Quest System styling implementation, including all CSS files, utility classes, and best practices for visual design.

## 📁 File Structure

```
src/styles/components/
├── EnhancedQuestSystem.css          # Main import file with utilities
├── EnhancedQuests.css               # Core quest card and component styles
├── QuestTypes.css                   # Quest type-specific styling
├── QuestVerification.css            # Verification status and method styling
├── EnhancedQuestWizard.css          # Quest creation wizard styling
├── EnhancedSubmissionForm.css       # Quest submission form styling
├── EnhancedQuestFilters.css         # Quest filtering interface styling
├── EnhancedQuestAnimations.css      # Animations and interactions
└── ENHANCED-QUEST-STYLING-GUIDE.md  # This documentation file
```

## 🎨 Color System

### Primary Colors
- **Primary Blue**: `#3772FF` - Main brand color for buttons and accents
- **Primary Light**: `#44C4FF` - Lighter variant for gradients
- **Secondary Purple**: `#6A29ED` - Secondary brand color
- **Success Green**: `#01E5A9` - Success states and completed quests
- **Warning Orange**: `#FFB800` - Warning states and pending items
- **Error Red**: `#FF4757` - Error states and rejected items

### Quest Type Colors
- **Social Media**: Twitter Blue (`#1DA1F2`), Reddit Orange (`#FF4500`), Discord Purple (`#5865F2`)
- **Engagement**: Community Purple (`#8B5CF6`), DexScreener Green (`#10B981`)
- **Web3/DeFi**: Token Green (`#01E5A9`), NFT Gold (`#F59E0B`), Staking Purple (`#8B5CF6`)

## 🧩 Component Classes

### Enhanced Quest Cards

```css
/* Basic enhanced quest card */
.enhanced-quest-card {
  /* Glassmorphic background with blur effect */
  /* Hover animations and interactions */
  /* Responsive design built-in */
}

/* Quest type-specific styling */
.quest-type-twitter_like_retweet {
  /* Twitter-specific colors and styling */
}

.quest-type-token_purchase {
  /* Web3 token purchase styling */
}
```

### Status Indicators

```css
/* Verification status badges */
.verification-status-pending {
  /* Animated pending state with pulse effect */
}

.verification-status-approved {
  /* Success state with green colors */
}

.verification-status-rejected {
  /* Error state with red colors */
}
```

### Interactive Elements

```css
/* Enhanced buttons with animations */
.enhanced-quest-button-primary {
  /* Gradient background with hover effects */
}

.enhanced-quest-button-secondary {
  /* Transparent background with border */
}
```

## 🎭 Quest Type Styling

### Social Media Quests

```css
/* Twitter Quests */
.quest-type-twitter_like_retweet,
.quest-type-twitter_comment,
.quest-type-twitter_combined_actions {
  border-left: 4px solid #1DA1F2;
  background: linear-gradient(135deg, rgba(29, 161, 242, 0.05), rgba(13, 139, 217, 0.02));
}

/* Reddit Quests */
.quest-type-reddit_post_creation,
.quest-type-reddit_comment,
.quest-type-reddit_upvote {
  border-left: 4px solid #FF4500;
  background: linear-gradient(135deg, rgba(255, 69, 0, 0.05), rgba(224, 61, 0, 0.02));
}
```

### Web3/DeFi Quests

```css
/* Token Purchase Quests */
.quest-type-token_purchase {
  border-left: 4px solid #01E5A9;
  background: linear-gradient(135deg, rgba(1, 229, 169, 0.05), rgba(0, 212, 170, 0.02));
}

/* NFT Purchase Quests */
.quest-type-nft_purchase {
  border-left: 4px solid #F59E0B;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.02));
}
```

## 🔧 Verification Styling

### AI Verification

```css
/* AI verification indicators */
.ai-verification-indicator {
  background: rgba(55, 114, 255, 0.1);
  color: #3772FF;
  border: 1px solid rgba(55, 114, 255, 0.2);
}

/* AI confidence scores */
.ai-confidence-high { color: #01E5A9; }
.ai-confidence-medium { color: #FFB800; }
.ai-confidence-low { color: #FF4757; }
```

### Cronos Chain Verification

```css
/* Blockchain verification styling */
.cronos-verification-indicator {
  background: rgba(106, 41, 237, 0.1);
  color: #A855F7;
  border: 1px solid rgba(106, 41, 237, 0.2);
}

/* Transaction hash display */
.transaction-hash {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 🎪 Animation System

### Loading Animations

```css
/* Skeleton loading for quest cards */
.quest-card-skeleton {
  animation: skeleton-shimmer 1.5s infinite;
}

/* AI analysis loading effect */
.ai-analysis-loading::after {
  animation: ai-scan 2s ease-in-out infinite;
}

/* Verification loading pulse */
.verification-loading-pulse {
  animation: verification-pulse 2s ease-in-out infinite;
}
```

### Success Animations

```css
/* Quest completion celebration */
.quest-completion-success {
  animation: completion-celebration 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Reward animation */
.reward-animation {
  animation: reward-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Hover Effects

```css
/* Enhanced card hover */
.enhanced-quest-card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
}

/* Button hover with ripple effect */
.enhanced-button-hover:hover::after {
  width: 300px;
  height: 300px;
}
```

## 🛠 Utility Classes

### Layout Utilities

```css
/* Grid systems */
.eq-grid { display: grid; gap: 1rem; }
.eq-grid-2 { grid-template-columns: repeat(2, 1fr); }
.eq-grid-3 { grid-template-columns: repeat(3, 1fr); }
.eq-grid-auto { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }

/* Flexbox utilities */
.eq-flex { display: flex; }
.eq-flex-center { align-items: center; justify-content: center; }
.eq-flex-between { justify-content: space-between; }
```

### Spacing Utilities

```css
/* Padding utilities */
.eq-p-sm { padding: 0.5rem; }
.eq-p-md { padding: 1rem; }
.eq-p-lg { padding: 1.5rem; }

/* Margin utilities */
.eq-m-sm { margin: 0.5rem; }
.eq-m-md { margin: 1rem; }
.eq-m-lg { margin: 1.5rem; }
```

### Typography Utilities

```css
/* Font sizes */
.eq-text-xs { font-size: 0.75rem; }
.eq-text-sm { font-size: 0.875rem; }
.eq-text-base { font-size: 1rem; }
.eq-text-lg { font-size: 1.125rem; }

/* Font weights */
.eq-font-normal { font-weight: 400; }
.eq-font-medium { font-weight: 500; }
.eq-font-semibold { font-weight: 600; }
.eq-font-bold { font-weight: 700; }

/* Text colors */
.eq-text-primary { color: rgba(255, 255, 255, 0.9); }
.eq-text-secondary { color: rgba(255, 255, 255, 0.7); }
.eq-text-success { color: #01E5A9; }
.eq-text-warning { color: #FFB800; }
.eq-text-error { color: #FF4757; }
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: `max-width: 640px`
- **Tablet**: `max-width: 768px`
- **Desktop**: `max-width: 1024px`
- **Large Desktop**: `max-width: 1200px`

### Responsive Grid

```css
@media (max-width: 1024px) {
  .eq-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .eq-grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .eq-grid-2,
  .eq-grid-3,
  .eq-grid-4 { grid-template-columns: 1fr; }
}
```

## ♿ Accessibility Features

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .eq-border { border-width: 2px; }
  :root {
    --eq-text-primary: rgba(255, 255, 255, 1);
    --eq-border-primary: rgba(255, 255, 255, 0.3);
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Management

```css
.enhanced-focus-ring:focus {
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(55, 114, 255, 0.3),
    0 0 0 6px rgba(55, 114, 255, 0.1);
}
```

## 🎯 Usage Examples

### Basic Quest Card

```tsx
<div className="enhanced-quest-card quest-type-twitter_like_retweet">
  <div className="enhanced-quest-card-header">
    <div className="quest-type-icon-container">
      🐦
    </div>
    <div>
      <h3>Twitter Engagement Quest</h3>
      <div className="enhanced-badge enhanced-badge-blue">
        Enhanced
      </div>
    </div>
    <div className="status-indicator status-indicator-available">
      Available
    </div>
  </div>
  
  <div className="eq-p-lg">
    <p>Like and retweet our latest announcement</p>
    
    <div className="eq-flex eq-flex-between eq-mt-md">
      <div className="reward-display">
        <div className="reward-amount">100 KRIS</div>
        <div className="reward-xp">+50 XP</div>
      </div>
      
      <div className="verification-method verification-method-ai">
        AI Verification
      </div>
    </div>
  </div>
  
  <div className="enhanced-quest-actions">
    <button className="enhanced-quest-button enhanced-quest-button-primary">
      Start Quest
    </button>
  </div>
</div>
```

### Verification Status Display

```tsx
<div className="verification-status verification-status-pending">
  <div className="verification-loading-spinner"></div>
  Verifying with AI...
</div>

<div className="ai-verification-indicator">
  <svg className="ai-icon">...</svg>
  AI Powered
</div>

<div className="ai-confidence-score ai-confidence-high">
  95% Confidence
</div>
```

### Quest Creation Wizard

```tsx
<div className="enhanced-quest-wizard">
  <div className="wizard-header">
    <h1 className="wizard-title">Create Enhanced Quest</h1>
    <p className="wizard-subtitle">
      Create advanced quests with AI verification and blockchain integration
    </p>
  </div>
  
  <div className="wizard-progress">
    <div className="wizard-step wizard-step-completed">
      <div className="wizard-step-indicator">✓</div>
      <span className="wizard-step-label">Details</span>
    </div>
    <div className="wizard-step-connector wizard-step-connector-completed"></div>
    <div className="wizard-step wizard-step-active">
      <div className="wizard-step-indicator">2</div>
      <span className="wizard-step-label">Requirements</span>
    </div>
    <div className="wizard-step-connector"></div>
    <div className="wizard-step wizard-step-inactive">
      <div className="wizard-step-indicator">3</div>
      <span className="wizard-step-label">Review</span>
    </div>
  </div>
</div>
```

## 🔧 Customization

### CSS Custom Properties

You can customize the Enhanced Quest System by overriding CSS custom properties:

```css
:root {
  --eq-primary: #your-brand-color;
  --eq-success: #your-success-color;
  --eq-spacing-md: 1.25rem; /* Increase default spacing */
  --eq-radius-lg: 1rem; /* Adjust border radius */
}
```

### Component Variants

Create custom quest type variants:

```css
.quest-type-custom-type {
  border-left: 4px solid #your-color;
  background: linear-gradient(135deg, rgba(your-color, 0.05), rgba(your-color, 0.02));
}

.quest-type-custom-type .quest-type-icon {
  background: linear-gradient(135deg, #your-color, #your-color-dark);
  color: white;
  box-shadow: 0 4px 12px rgba(your-color, 0.3);
}
```

## 📋 Best Practices

### Performance
- Use CSS custom properties for consistent theming
- Leverage hardware acceleration with `transform` and `opacity`
- Minimize repaints with `will-change` property when needed
- Use `backdrop-filter` sparingly for better performance

### Accessibility
- Always provide focus states for interactive elements
- Use semantic HTML with appropriate ARIA labels
- Ensure sufficient color contrast ratios
- Support reduced motion preferences
- Test with screen readers

### Maintainability
- Use the utility class system for consistent spacing and typography
- Follow the established naming conventions
- Group related styles in logical sections
- Document any custom modifications
- Use CSS custom properties for values that might change

### Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Backdrop filter support (fallbacks provided)
- CSS custom properties support
- Modern animation and transition support

## 🚀 Getting Started

1. **Import the main stylesheet** in your application:
   ```tsx
   import '@/styles/components/EnhancedQuestSystem.css';
   ```

2. **Use utility classes** for layout and spacing:
   ```tsx
   <div className="eq-container eq-grid eq-grid-auto eq-gap-lg">
     {/* Quest cards */}
   </div>
   ```

3. **Apply component classes** for styled elements:
   ```tsx
   <div className="enhanced-quest-card quest-type-twitter_like_retweet">
     {/* Quest content */}
   </div>
   ```

4. **Add animations** for enhanced user experience:
   ```tsx
   <div className="enhanced-quest-card-hover staggered-animation">
     {/* Animated quest card */}
   </div>
   ```

This comprehensive styling system provides everything needed to create a professional, accessible, and engaging Enhanced Quest System interface.