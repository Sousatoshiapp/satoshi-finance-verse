import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load heavy components to improve initial bundle size
export const LazyQuizCard = lazy(() => import('@/components/quiz-card').then(module => ({ default: module.QuizCard })));
export const LazyEnhancedQuizCard = lazy(() => import('@/components/quiz/enhanced-quiz-card').then(module => ({ default: module.EnhancedQuizCard })));
export const LazyTradingInterface = lazy(() => import('@/components/trading/trading-interface').then(module => ({ default: module.TradingInterface })));
export const LazyPortfolioCharts = lazy(() => import('@/components/portfolio/portfolio-charts').then(module => ({ default: module.PortfolioCharts })));
export const LazyAdvancedAnalytics = lazy(() => import('@/components/advanced-analytics-dashboard').then(module => ({ default: module.AdvancedAnalyticsDashboard })));

export const LazySocialFeed = lazy(() => import('@/components/social/social-feed').then(module => ({ default: module.SocialFeed })));
export const LazyLeaderboards = lazy(() => import('@/components/leaderboards').then(module => ({ default: module.Leaderboards })));

// Detail pages
export const LazyAvatarDetail = lazy(() => import('@/pages/AvatarDetail'));
export const LazyBoostDetail = lazy(() => import('@/pages/BoostDetail'));
export const LazySkinDetail = lazy(() => import('@/pages/SkinDetail'));
export const LazyAccessoryDetail = lazy(() => import('@/pages/AccessoryDetail'));
export const LazyPasswordReset = lazy(() => import('@/pages/PasswordReset'));

// Wrapper component for lazy loaded components
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper = ({ children, fallback }: LazyWrapperProps) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
);

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <Component {...props} />
    </LazyWrapper>
  );
};