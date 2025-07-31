# Satoshi Finance Verse - Architecture Documentation

## Overview
Comprehensive guide to the application architecture, optimization strategies, and development patterns for the Satoshi Finance Verse platform.

## Table of Contents
- [Component Organization](#component-organization)
- [Context Architecture](#context-architecture)
- [Performance Optimizations](#performance-optimizations)
- [Testing Strategy](#testing-strategy)
- [Development Guidelines](#development-guidelines)

## Component Organization

### Feature-Based Structure
Components are organized by feature domains to improve maintainability and reduce coupling:

```
src/components/
├── features/
│   ├── quiz/           # Quiz and learning components
│   ├── social/         # Social interaction components  
│   ├── trading/        # Trading and portfolio components
│   ├── admin/          # Administrative interfaces
│   ├── auth/           # Authentication components
│   ├── gamification/   # Achievement and reward components
│   ├── learning/       # Educational content components
│   └── ai/             # AI-powered features
├── shared/             # Reusable UI components
└── ui/                 # Base UI primitives
```

### Import Patterns
- Use barrel exports (`index.ts`) for clean imports
- Prefer relative imports within feature folders
- Use absolute imports (`@/`) for cross-feature dependencies

## Context Architecture

### Split Context Strategy
Contexts are split by data domain to minimize re-renders and improve performance:

#### Core Contexts
- **AuthContext** - User authentication state and session management
- **I18nProvider** - Internationalization and language switching
- **LoadingContext** - Global loading states
- **SponsorThemeProvider** - Theme and branding

#### Data-Specific Contexts
- **PointsContext** - User points and BTZ balance tracking
- **NotificationContext** - Real-time notifications and alerts
- **OnlineStatusContext** - User presence and online status
- **RealtimeContext** - WebSocket connections and live updates

#### Context Hierarchy
```typescript
<GlobalErrorBoundary>
  <I18nProvider>
    <LoadingProvider>
      <AuthProvider>
        <PointsProvider>
          <NotificationProvider>
            <OnlineStatusProvider>
              <RealtimeProvider>
                <SponsorThemeProvider>
                  <App />
                </SponsorThemeProvider>
              </RealtimeProvider>
            </OnlineStatusProvider>
          </NotificationProvider>
        </PointsProvider>
      </AuthProvider>
    </LoadingProvider>
  </I18nProvider>
</GlobalErrorBoundary>
```

## Performance Optimizations

### Code Splitting Strategy
The application uses a multi-layered code splitting approach:

1. **Vendor Chunks**: Critical libraries separated by usage patterns
   - `vendor-react`: Core React libraries
   - `vendor-ui-core`: Essential UI components
   - `vendor-ui-forms`: Form-related UI components
   - `vendor-charts`: Chart and visualization libraries
   - `vendor-icons`: Icon libraries with tree-shaking

2. **Feature Chunks**: Application features split by domain
   - `chunk-quiz-core`: Core quiz functionality
   - `chunk-quiz-features`: Advanced quiz features
   - `chunk-social-core`: Basic social features
   - `chunk-admin-*`: Admin functionality split by area

### Icon Tree-Shaking
Icons are optimized using a two-tier system:
- **Core icons**: Bundled with main chunk (most frequently used)
- **Secondary icons**: Lazy-loaded on demand
- **Estimated savings**: ~200KB reduction in bundle size

### Lazy Loading
- 76+ routes with React.lazy()
- Component-level splitting for heavy features
- Intelligent preloading based on user behavior

## Testing Strategy

### Unit Testing with Vitest
- Fast test execution with Vite integration
- Component testing with React Testing Library
- Mocked dependencies for isolated testing

### Test Organization
```
src/
├── test/
│   ├── setup.ts          # Global test configuration
│   └── utils.tsx         # Test utilities and providers
├── components/
│   └── ui/
│       └── __tests__/    # Component tests
├── hooks/
│   └── __tests__/        # Hook tests
└── contexts/
    └── __tests__/        # Context tests
```

## Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting
- Comprehensive test coverage

### Performance Best Practices
1. Use lazy loading for non-critical components
2. Implement proper memoization for expensive operations
3. Split contexts by data domain
4. Use tree-shaking for icon imports
5. Monitor bundle size regularly

### File Organization
- Group components by feature domain
- Use barrel exports for clean imports
- Implement proper TypeScript typing
- Follow consistent naming conventions

## Internationalization

### Multi-Language Support
- React i18next for translations
- Preloaded translations for instant switching
- RTL support for Arabic
- IP-based language detection

### Language Files
```
src/i18n/locales/
├── pt-BR.json    # Portuguese (Brazil)
├── en-US.json    # English (US)
├── es-ES.json    # Spanish (Spain)
├── hi-IN.json    # Hindi (India)
├── zh-CN.json    # Chinese (China)
└── ar-SA.json    # Arabic (Saudi Arabia)
```

## Real-time Features

### WebSocket Integration
- Supabase real-time subscriptions
- Live updates for points, notifications, and user presence
- Optimized connection management
- Automatic reconnection handling

### Data Synchronization
- Real-time points updates
- Live notification delivery
- User presence tracking
- Social feed updates

## Security Considerations

### Authentication
- Supabase Auth integration
- JWT token management
- Role-based access control
- Secure API endpoints

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure data transmission

## Deployment and Monitoring

### Build Optimization
- Vite for fast builds
- Tree shaking for smaller bundles
- Asset optimization
- Source map generation

### Performance Monitoring
- Bundle size tracking
- Core Web Vitals monitoring
- Error tracking and reporting
- User analytics integration
