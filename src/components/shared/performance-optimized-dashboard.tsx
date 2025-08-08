import { memo, useMemo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { CompactLeaderboard } from '@/components/shared/compact-leaderboard';
import { CompactDailyRewards } from '@/components/features/gamification/compact-daily-rewards';
import { CompactStreakCounter } from '@/components/features/gamification/compact-streak-counter';
import { QuickActionsOptimized } from '@/components/shared/quick-actions-optimized';
import { useRenderPerformance } from '@/hooks/use-performance-monitor';
import { useDashboardSuperQuery } from '@/hooks/use-dashboard-super-query';

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
    <h2 className="text-lg font-semibold text-destructive mb-2">Erro no componente</h2>
    <p className="text-sm text-muted-foreground">{error.message}</p>
  </div>
);

const DashboardSection = memo(({ 
  title, 
  children, 
  priority = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  priority?: boolean;
}) => (
  <section aria-label={title} className="space-y-4">
    {priority ? children : (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    )}
  </section>
));

DashboardSection.displayName = 'DashboardSection';

export const PerformanceOptimizedDashboard = memo(function PerformanceOptimizedDashboard() {
  useRenderPerformance('PerformanceOptimizedDashboard');
  const { data: dashboardData } = useDashboardSuperQuery();

  // Memoize grid layout configuration
  const gridConfig = useMemo(() => ({
    mobile: "grid-cols-1 gap-4",
    tablet: "md:grid-cols-2 lg:grid-cols-3",
    desktop: "xl:grid-cols-4"
  }), []);

  const gridClassName = `grid ${gridConfig.mobile} ${gridConfig.tablet} ${gridConfig.desktop}`;

  // Get current streak from dashboard data
  const currentStreak = dashboardData?.profile?.streak || 0;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Secondary content - optimized grid */}
      <div className={gridClassName}>
        <DashboardSection title="Ações rápidas">
          <QuickActionsOptimized />
        </DashboardSection>

        <DashboardSection title="Ranking">
          <CompactLeaderboard />
        </DashboardSection>

        <DashboardSection title="Sequência">
          <CompactStreakCounter currentStreak={currentStreak} />
        </DashboardSection>

        <DashboardSection title="Recompensas">
          <CompactDailyRewards />
        </DashboardSection>
      </div>
    </div>
  );
});
