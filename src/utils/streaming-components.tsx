import React, { Suspense, lazy } from 'react';
import { LoadingSkeleton } from '../components/shared/ui/LoadingStateManager';

const createStreamingComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: T) => (
    <Suspense fallback={fallback || <LoadingSkeleton variant="card" count={1} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export const StreamingDashboard = createStreamingComponent(
  () => import('../components/shared/performance-optimized-dashboard'),
  <LoadingSkeleton variant="card" count={3} />
);

export const StreamingLeaderboard = createStreamingComponent(
  () => import('../components/shared/optimized-leaderboard-list'),
  <LoadingSkeleton variant="list" count={5} />
);

export const StreamingMissionList = createStreamingComponent(
  () => import('../components/shared/missions/mission-list-view'),
  <LoadingSkeleton variant="card" count={4} />
);

export const StreamingSocialFeed = createStreamingComponent(
  () => import('../components/features/social/social-feed'),
  <LoadingSkeleton variant="card" count={3} />
);

export const StreamingQuizEngine = createStreamingComponent(
  () => import('../components/quiz/quiz-engine'),
  <LoadingSkeleton variant="card" count={1} />
);

export const createProgressiveComponent = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  loadingStates: {
    skeleton: React.ReactNode;
    partial: React.ReactNode;
    complete: React.ReactNode;
  }
) => {
  return (props: T & { loadingState?: 'skeleton' | 'partial' | 'complete' }) => {
    const { loadingState = 'complete', ...componentProps } = props;
    
    switch (loadingState) {
      case 'skeleton':
        return <>{loadingStates.skeleton}</>;
      case 'partial':
        return <>{loadingStates.partial}</>;
      default:
        return <Component {...(componentProps as T)} />;
    }
  };
};
