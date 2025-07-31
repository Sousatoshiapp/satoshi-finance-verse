# Testing Guide

## Overview
Comprehensive testing strategy for the Satoshi Finance Verse application using Vitest and React Testing Library.

## Setup

### Test Environment
- **Framework**: Vitest with jsdom environment
- **Testing Library**: React Testing Library
- **Mocking**: Vitest built-in mocking capabilities

### Configuration
Tests are configured in `vitest.config.ts` with:
- Global test utilities
- jsdom environment for DOM testing
- Path aliases matching the main application

## Test Structure

### Directory Organization
```
src/
├── test/
│   ├── setup.ts          # Global test setup
│   └── utils.tsx         # Test utilities and providers
├── components/
│   └── ui/
│       └── __tests__/    # Component tests
├── hooks/
│   └── __tests__/        # Hook tests
└── contexts/
    └── __tests__/        # Context tests
```

### Test Categories

#### Unit Tests
- Individual component functionality
- Hook behavior and state management
- Utility function testing
- Context provider testing

#### Integration Tests
- Component interaction testing
- API integration testing
- User flow testing

## Writing Tests

### Component Testing
```typescript
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Button } from '../button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCustomHook } from '../use-custom-hook';

describe('useCustomHook', () => {
  it('should return expected values', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(expectedValue);
  });
});
```

### Mocking Strategies

#### External Dependencies
```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string) => key),
    i18n: { language: 'pt-BR' },
  }),
}));
```

#### Supabase Client
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
  },
}));
```

## Test Commands

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
Aim for:
- **Unit tests**: 80%+ coverage for critical components
- **Integration tests**: Key user flows covered
- **E2E tests**: Critical business logic paths

## Best Practices

### Test Organization
1. Group related tests in describe blocks
2. Use descriptive test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Keep tests focused and isolated

### Mocking Guidelines
1. Mock external dependencies
2. Use real implementations for internal code when possible
3. Mock at the boundary of your system
4. Keep mocks simple and focused

### Performance Testing
1. Test component render performance
2. Verify lazy loading behavior
3. Test memory usage patterns
4. Monitor bundle size impact

## Continuous Integration

### Pre-commit Hooks
Tests run automatically before commits to ensure:
- All tests pass
- Code coverage meets requirements
- No linting errors

### CI Pipeline
Tests run in CI environment with:
- Multiple Node.js versions
- Different browser environments
- Performance regression testing
