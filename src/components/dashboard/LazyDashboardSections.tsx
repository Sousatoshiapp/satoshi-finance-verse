import { memo, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/shared/ui/skeleton';

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

// Skeleton components
const SectionSkeleton = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-24 w-full rounded-lg" />
  </div>
));

const GridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SectionSkeleton />
    <SectionSkeleton />
  </div>
));

// Lazy section components
export const LazyDashboardSummary = memo(({ userStats, subscription }: any) => (
  <Suspense fallback={<SectionSkeleton />}>
    <DashboardSummaryOptimized userStats={userStats} subscription={subscription} />
  </Suspense>
));

export const LazyQuickActions = memo(() => (
  <Suspense fallback={<GridSkeleton />}>
    <QuickActionsOptimized />
  </Suspense>
));

export const LazyLeaderboard = memo(() => (
  <Suspense fallback={<SectionSkeleton />}>
    <CompactLeaderboard />
  </Suspense>
));

export const LazyDailyMissions = memo(() => (
  <Suspense fallback={<SectionSkeleton />}>
    <CarouselDailyMissions />
  </Suspense>
));

export const LazyBtcDuelCard = memo(() => (
  <Suspense fallback={<SectionSkeleton />}>
    <BtcDuelCard />
  </Suspense>
));

LazyDashboardSummary.displayName = 'LazyDashboardSummary';
LazyQuickActions.displayName = 'LazyQuickActions';
LazyLeaderboard.displayName = 'LazyLeaderboard';
LazyDailyMissions.displayName = 'LazyDailyMissions';
LazyBtcDuelCard.displayName = 'LazyBtcDuelCard';