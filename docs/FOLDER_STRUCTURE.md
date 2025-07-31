# Folder Structure Guide

## Overview
This document outlines the recommended folder structure for organizing components and features in the Satoshi Finance Verse application.

## Current Structure

### Root Level Organization
```
src/
├── components/           # Reusable UI components
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── pages/               # Route-level components
├── utils/               # Utility functions
├── integrations/        # External service integrations
├── i18n/               # Internationalization files
├── assets/             # Static assets
├── test/               # Testing utilities
└── docs/               # Documentation
```

## Component Organization

### Feature-Based Structure
Components should be organized by feature domain for better maintainability:

```
src/components/
├── features/
│   ├── quiz/
│   │   ├── index.ts                    # Barrel exports
│   │   ├── components/
│   │   │   ├── quiz-engine.tsx
│   │   │   ├── quiz-card.tsx
│   │   │   ├── enhanced-quiz-card.tsx
│   │   │   └── btz-counter.tsx
│   │   ├── hooks/
│   │   │   ├── use-quiz-state.ts
│   │   │   └── use-quiz-timer.ts
│   │   └── __tests__/
│   │       ├── quiz-engine.test.tsx
│   │       └── quiz-card.test.tsx
│   │
│   ├── social/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── social-feed.tsx
│   │   │   ├── chat-window.tsx
│   │   │   ├── post-card.tsx
│   │   │   └── user-profile.tsx
│   │   ├── hooks/
│   │   │   ├── use-social-feed.ts
│   │   │   └── use-chat.ts
│   │   └── __tests__/
│   │
│   ├── trading/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── trading-interface.tsx
│   │   │   ├── portfolio-charts.tsx
│   │   │   ├── holdings-manager.tsx
│   │   │   └── portfolio-builder.tsx
│   │   ├── hooks/
│   │   │   ├── use-portfolio.ts
│   │   │   └── use-trading-data.ts
│   │   └── __tests__/
│   │
│   ├── admin/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── user-management.tsx
│   │   │   ├── analytics-dashboard.tsx
│   │   │   └── content-moderation.tsx
│   │   ├── hooks/
│   │   │   ├── use-admin-data.ts
│   │   │   └── use-user-management.ts
│   │   └── __tests__/
│   │
│   ├── auth/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   ├── password-reset.tsx
│   │   │   └── email-verification.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   └── use-password-reset.ts
│   │   └── __tests__/
│   │
│   ├── gamification/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── achievement-card.tsx
│   │   │   ├── leaderboard.tsx
│   │   │   ├── progress-tracker.tsx
│   │   │   └── reward-system.tsx
│   │   ├── hooks/
│   │   │   ├── use-achievements.ts
│   │   │   └── use-leaderboard.ts
│   │   └── __tests__/
│   │
│   ├── learning/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── learning-path.tsx
│   │   │   ├── progress-tracker.tsx
│   │   │   ├── content-viewer.tsx
│   │   │   └── assessment-tool.tsx
│   │   ├── hooks/
│   │   │   ├── use-learning-progress.ts
│   │   │   └── use-content-data.ts
│   │   └── __tests__/
│   │
│   └── ai/
│       ├── index.ts
│       ├── components/
│       │   ├── ai-tutor-chat.tsx
│       │   ├── content-generator.tsx
│       │   ├── personalized-recommendations.tsx
│       │   └── learning-analytics.tsx
│       ├── hooks/
│       │   ├── use-ai-chat.ts
│       │   └── use-ai-recommendations.ts
│       └── __tests__/
│
├── shared/                             # Shared components across features
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── navigation.tsx
│   ├── forms/
│   │   ├── form-field.tsx
│   │   ├── form-validation.tsx
│   │   └── form-submit.tsx
│   ├── data-display/
│   │   ├── data-table.tsx
│   │   ├── chart-wrapper.tsx
│   │   └── stats-card.tsx
│   └── feedback/
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── toast-notifications.tsx
│
└── ui/                                 # Base UI primitives
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown.tsx
    └── __tests__/
```

## Import Patterns

### Barrel Exports
Each feature folder should have an `index.ts` file for clean imports:

```typescript
// src/components/features/quiz/index.ts
export { QuizEngine } from './components/quiz-engine';
export { QuizCard } from './components/quiz-card';
export { EnhancedQuizCard } from './components/enhanced-quiz-card';
export { useQuizState } from './hooks/use-quiz-state';
export { useQuizTimer } from './hooks/use-quiz-timer';
```

### Import Guidelines
```typescript
// ✅ Good: Use barrel exports for feature imports
import { QuizEngine, QuizCard } from '@/components/features/quiz';

// ✅ Good: Direct imports for specific components
import { Button } from '@/components/ui/button';

// ✅ Good: Relative imports within the same feature
import { useQuizState } from '../hooks/use-quiz-state';

// ❌ Avoid: Deep imports from other features
import { QuizEngine } from '@/components/features/quiz/components/quiz-engine';
```

## Migration Strategy

### Phase 1: Create Feature Folders
1. Create the new folder structure
2. Move existing components to appropriate feature folders
3. Create barrel export files

### Phase 2: Update Imports
1. Update all import statements to use new paths
2. Test that all imports resolve correctly
3. Update build configuration if needed

### Phase 3: Add Tests
1. Create test files for each feature
2. Ensure test coverage for critical components
3. Update CI configuration

## Benefits

### Improved Maintainability
- Related code is co-located
- Easier to find and modify features
- Clear separation of concerns

### Better Scalability
- New features can be added without affecting existing code
- Team members can work on different features independently
- Easier to extract features into separate packages if needed

### Enhanced Developer Experience
- Clearer mental model of the application
- Faster navigation and code discovery
- Better IDE support for auto-imports

## Best Practices

### Naming Conventions
- Use kebab-case for folder names
- Use PascalCase for component files
- Use camelCase for hook files
- Use descriptive, feature-specific names

### File Organization
- Keep related files together
- Use consistent folder structure across features
- Limit nesting depth to improve navigation
- Include tests alongside the code they test

### Dependencies
- Minimize cross-feature dependencies
- Use shared components for common functionality
- Keep feature-specific logic within feature folders
- Document any necessary cross-feature dependencies
