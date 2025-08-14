import { memo, lazy, Suspense } from 'react';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';

// Lazy load dashboard sections
const DashboardSummaryOptimized = lazy(() => 
  import('@/components/shared/dashboard-summary-optimized').then(module => ({
    default: module.DashboardSummaryOptimized
  }))
);

const QuickActionsOptimized = lazy(() => 
  import('@/components/shared/quick-actions-optimized').then(module => ({
    default: module.QuickActionsOptimized
  }))
);

const CompactLeaderboard = lazy(() => 
  import('@/components/shared/compact-leaderboard').then(module => ({
    default: module.CompactLeaderboard
  }))
);

const CarouselDailyMissions = lazy(() => 
  import('@/components/shared/carousel-daily-missions').then(module => ({
    default: module.CarouselDailyMissions
  }))
);

const BtcDuelCard = lazy(() => 
  import('@/components/features/duels/btc/BtcDuelCard').then(module => ({
    default: module.BtcDuelCard
  }))
);

// FASE 1: Social Explosion Components
const SocialHub = lazy(() => 
  import('@/components/dashboard/SocialHub').then(module => ({
    default: module.SocialHub
  }))
);

// Standardized loader for all sections
const StandardLoader = memo(() => (
  <ProfileStyleLoader size="md" />
));

// Lazy section components
export const LazyDashboardSummary = memo(({ userStats, subscription }: any) => (
  <Suspense fallback={<StandardLoader />}>
    <DashboardSummaryOptimized userStats={userStats} subscription={subscription} />
  </Suspense>
));

export const LazyQuickActions = memo(() => (
  <Suspense fallback={<StandardLoader />}>
    <QuickActionsOptimized />
  </Suspense>
));

export const LazyLeaderboard = memo(() => (
  <Suspense fallback={<StandardLoader />}>
    <CompactLeaderboard />
  </Suspense>
));

export const LazyDailyMissions = memo(() => (
  <Suspense fallback={<StandardLoader />}>
    <CarouselDailyMissions />
  </Suspense>
));

export const LazyBtcDuelCard = memo(() => (
  <Suspense fallback={<StandardLoader />}>
    <BtcDuelCard />
  </Suspense>
));

// FASE 1: Social Hub Export
export const LazySocialHub = memo(() => (
  <Suspense fallback={<StandardLoader />}>
    <SocialHub />
  </Suspense>
));

LazyDashboardSummary.displayName = 'LazyDashboardSummary';
LazyQuickActions.displayName = 'LazyQuickActions';
LazyLeaderboard.displayName = 'LazyLeaderboard';
LazyDailyMissions.displayName = 'LazyDailyMissions';
LazyBtcDuelCard.displayName = 'LazyBtcDuelCard';
LazySocialHub.displayName = 'LazySocialHub';