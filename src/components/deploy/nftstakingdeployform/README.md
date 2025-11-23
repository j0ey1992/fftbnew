# NFT Staking Deploy Form Module

A modular, reusable component system for NFT staking contract deployment with a clean, Crypto.com-inspired design.

## Architecture

This module follows a modular design pattern with clear separation of concerns:

### Core Components

- **`NftStakingDeployForm.tsx`** - Main orchestrator component that manages the deployment flow
- **`types.ts`** - TypeScript type definitions for the entire module
- **`index.ts`** - Barrel export file for clean imports

### UI Components (`/components`)

- **`ErrorAlert.tsx`** - Reusable error display component
- **`ProgressBar.tsx`** - Step progress indicator with gradient styling
- **`StepHeader.tsx`** - Numbered step headers with titles and descriptions
- **`ImageUploader.tsx`** - File upload component for logos and banners
- **`SocialLinksForm.tsx`** - Social media links input form
- **`CollectionCard.tsx`** - Individual NFT collection configuration card

### Step Components (`/steps`)

- **`CollectionSetupStep.tsx`** - Step 1: NFT collections and contract parameters
- **`ProjectDetailsStep.tsx`** - Step 2: Project information and branding
- **`ReviewDeployStep.tsx`** - Step 3: Review and deployment confirmation

## Features

### 🎨 Design System
- **Crypto.com inspired UI** - Clean, modern design with soft shadows and rounded corners
- **Dark mode default** - Professional dark theme with blue accent gradients
- **Mobile-first responsive** - Optimized for all screen sizes
- **Smooth transitions** - Subtle animations and hover effects

### 🔧 Technical Features
- **Modular architecture** - Easy to maintain and extend
- **TypeScript support** - Full type safety throughout
- **Reusable components** - Components can be used independently
- **Step-based flow** - Clear user journey with validation
- **File upload handling** - Image preview and validation
- **Form validation** - Real-time validation with error handling

### 🚀 Web3 Integration
- **Reown wallet connection** - Seamless wallet integration
- **Contract deployment** - Direct blockchain deployment
- **Firebase storage** - Project data and image storage
- **Admin approval flow** - Contracts require admin approval

## Usage

```tsx
import { NftStakingDeployForm } from '@/components/deploy/nftstakingdeployform'

function MyComponent() {
  return (
    <NftStakingDeployForm
      template={contractTemplate}
      onClose={() => console.log('Form closed')}
      onSuccess={(address) => console.log('Deployed at:', address)}
    />
  )
}
```

## Component Structure

```
nftstakingdeployform/
├── index.ts                    # Barrel exports
├── types.ts                    # Type definitions
├── NftStakingDeployForm.tsx    # Main component
├── components/                 # Reusable UI components
│   ├── ErrorAlert.tsx
│   ├── ProgressBar.tsx
│   ├── StepHeader.tsx
│   ├── ImageUploader.tsx
│   ├── SocialLinksForm.tsx
│   └── CollectionCard.tsx
└── steps/                      # Step-specific components
    ├── CollectionSetupStep.tsx
    ├── ProjectDetailsStep.tsx
    └── ReviewDeployStep.tsx
```

## Extending the Module

### Adding New Steps
1. Create a new component in `/steps`
2. Add the step to the main form's step routing
3. Update validation logic
4. Export from `index.ts`

### Adding New Components
1. Create component in `/components`
2. Follow the existing design patterns
3. Add TypeScript interfaces to `types.ts`
4. Export from `index.ts`

### Customizing Styles
- All components use Tailwind CSS classes
- Follow the Crypto.com design system:
  - Primary gradient: `from-[#0072ff] to-[#00c2ff]`
  - Background: `bg-[#0a0f1f]`
  - Cards: `bg-gray-900/40 border border-gray-700/50`
  - Text: `text-white`, `text-gray-400`, `text-gray-300`

## Best Practices

1. **Component Isolation** - Each component should be self-contained
2. **Type Safety** - Always use TypeScript interfaces
3. **Error Handling** - Provide clear error messages
4. **Accessibility** - Include proper ARIA labels and keyboard navigation
5. **Performance** - Use React.memo for expensive components
6. **Testing** - Write unit tests for complex logic

## Future Enhancements

- [ ] Add animation libraries (Framer Motion)
- [ ] Implement drag-and-drop for collection ordering
- [ ] Add more file format support
- [ ] Create template-specific step variations
- [ ] Add internationalization support
- [ ] Implement advanced validation rules
