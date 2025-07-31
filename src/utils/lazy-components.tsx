import { lazy, Suspense, memo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load heavy components with memoization to prevent re-renders during language changes
export const LazyQuizCard = memo(lazy(() => import('@/components/quiz-card').then(module => ({ default: module.QuizCard }))));
export const LazyEnhancedQuizCard = memo(lazy(() => import('@/components/quiz/enhanced-quiz-card').then(module => ({ default: module.EnhancedQuizCard }))));
export const LazyTradingInterface = memo(lazy(() => import('@/components/trading/trading-interface').then(module => ({ default: module.TradingInterface }))));
export const LazyPortfolioCharts = memo(lazy(() => import('@/components/portfolio/portfolio-charts').then(module => ({ default: module.PortfolioCharts }))));
export const LazyAdvancedAnalytics = memo(lazy(() => import('@/components/advanced-analytics-dashboard').then(module => ({ default: module.AdvancedAnalyticsDashboard }))));

export const LazySocialFeed = memo(lazy(() => import('@/components/social/social-feed').then(module => ({ default: module.SocialFeed }))));
export const LazyLeaderboards = memo(lazy(() => import('@/components/leaderboards').then(module => ({ default: module.Leaderboards }))));

// Detail pages
export const LazyAvatarDetail = memo(lazy(() => import('@/pages/AvatarDetail')));
export const LazyBoostDetail = memo(lazy(() => import('@/pages/BoostDetail')));
export const LazySkinDetail = memo(lazy(() => import('@/pages/SkinDetail')));
export const LazyAccessoryDetail = memo(lazy(() => import('@/pages/AccessoryDetail')));
export const LazyPasswordReset = memo(lazy(() => import('@/pages/PasswordReset')));

// Wrapper component for lazy loaded components with memoization
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper = memo(({ children, fallback }: LazyWrapperProps) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
));

// Higher-order component for lazy loading with error boundary and memoization
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const MemoizedComponent = memo(Component);
  return memo((props: P) => (
    <LazyWrapper fallback={fallback}>
      <MemoizedComponent {...(props as any)} />
    </LazyWrapper>
  ));
};
