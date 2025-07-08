// Streaming Dashboard para carregamento progressivo
import { memo, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useRenderPerformance } from '@/hooks/use-performance-monitor';

// Componentes lazy para streaming
const DashboardSummaryOptimized = memo(() => {
  const [Component, setComponent] = useState<any>(null);
  
  useEffect(() => {
    import('@/components/dashboard-summary-optimized').then(module => {
      setComponent(() => module.DashboardSummaryOptimized);
    });
  }, []);
  
  if (!Component) {
    return <div className="h-24 bg-muted/20 animate-pulse rounded-lg" />;
  }
  
  return <Component />;
});

const QuickActionsOptimized = memo(() => {
  const [Component, setComponent] = useState<any>(null);
  
  useEffect(() => {
    import('@/components/quick-actions-optimized').then(module => {
      setComponent(() => module.QuickActionsOptimized);
    });
  }, []);
  
  if (!Component) {
    return <div className="h-48 bg-muted/20 animate-pulse rounded-lg" />;
  }
  
  return <Component />;
});

const CompactLeaderboard = memo(() => {
  const [Component, setComponent] = useState<any>(null);
  
  useEffect(() => {
    import('@/components/compact-leaderboard').then(module => {
      setComponent(() => module.CompactLeaderboard);
    });
  }, []);
  
  if (!Component) {
    return <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />;
  }
  
  return <Component />;
});

const CompactDailyRewards = memo(() => {
  const [Component, setComponent] = useState<any>(null);
  
  useEffect(() => {
    import('@/components/compact-daily-rewards').then(module => {
      setComponent(() => module.CompactDailyRewards);
    });
  }, []);
  
  if (!Component) {
    return <div className="h-32 bg-muted/20 animate-pulse rounded-lg" />;
  }
  
  return <Component />;
});

// Loading skeleton para primeira renderização
const DashboardSkeleton = memo(() => (
  <div className="container mx-auto p-4 space-y-6 max-w-7xl">
    {/* Header skeleton */}
    <div className="h-24 bg-muted/20 animate-pulse rounded-lg" />
    
    {/* Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="h-48 bg-muted/20 animate-pulse rounded-lg" />
      <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
      <div className="h-32 bg-muted/20 animate-pulse rounded-lg" />
      <div className="h-32 bg-muted/20 animate-pulse rounded-lg" />
    </div>
  </div>
));

// Error fallback otimizado
const ErrorFallback = memo(({ error, resetErrorBoundary }: any) => (
  <div className="flex items-center justify-center min-h-[400px] p-4">
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold text-destructive">
        Ops! Algo deu errado
      </h2>
      <p className="text-muted-foreground">
        {error.message || 'Erro inesperado no dashboard'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </div>
  </div>
));

// Hook para streaming de dados
const useStreamingData = () => {
  const [streamedData, setStreamedData] = useState<{
    summary: boolean;
    actions: boolean;
    leaderboard: boolean;
    rewards: boolean;
  }>({
    summary: false,
    actions: false,
    leaderboard: false,
    rewards: false
  });

  const { data: dashboardData, isLoading } = useDashboardData();

  useEffect(() => {
    if (!isLoading && dashboardData) {
      // Stream componentes progressivamente
      setTimeout(() => setStreamedData(prev => ({ ...prev, summary: true })), 0);
      setTimeout(() => setStreamedData(prev => ({ ...prev, actions: true })), 100);
      setTimeout(() => setStreamedData(prev => ({ ...prev, leaderboard: true })), 200);
      setTimeout(() => setStreamedData(prev => ({ ...prev, rewards: true })), 300);
    }
  }, [isLoading, dashboardData]);

  return streamedData;
};

// Componente principal com streaming
export const StreamingDashboard = memo(function StreamingDashboard() {
  useRenderPerformance('StreamingDashboard');
  const streamedData = useStreamingData();
  const { isLoading } = useDashboardData();

  // Loading inicial
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="container mx-auto p-4 space-y-6 max-w-7xl">
        {/* Summary - Primeira prioridade */}
        <Suspense fallback={<div className="h-24 bg-muted/20 animate-pulse rounded-lg" />}>
          {streamedData.summary && <DashboardSummaryOptimized />}
        </Suspense>

        {/* Grid de componentes secundários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Quick Actions */}
          <Suspense fallback={<div className="h-48 bg-muted/20 animate-pulse rounded-lg" />}>
            {streamedData.actions && <QuickActionsOptimized />}
          </Suspense>

          {/* Leaderboard */}
          <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-lg" />}>
            {streamedData.leaderboard && <CompactLeaderboard />}
          </Suspense>

          {/* Daily Rewards */}
          <Suspense fallback={<div className="h-32 bg-muted/20 animate-pulse rounded-lg" />}>
            {streamedData.rewards && <CompactDailyRewards />}
          </Suspense>

          {/* Placeholder para futuro componente */}
          <div className="h-32 bg-muted/20 animate-pulse rounded-lg opacity-50" />
        </div>
      </div>
    </ErrorBoundary>
  );
});

// Hook para preload de próximas páginas baseado na interação
export const useDashboardPreloading = () => {
  useEffect(() => {
    // Preload páginas com alta probabilidade de navegação
    const preloadTargets = [
      () => import('@/pages/Quiz'),
      () => import('@/pages/Profile'),
      () => import('@/pages/Leaderboard')
    ];

    // Preload após idle callback
    requestIdleCallback(() => {
      preloadTargets.forEach((preload, index) => {
        setTimeout(() => {
          preload().catch(() => {
            // Ignore preload errors
          });
        }, index * 500); // Espaçar preloads
      });
    }, { timeout: 2000 });
  }, []);
};