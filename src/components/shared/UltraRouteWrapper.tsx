// FASE 2: Ultra Route Wrapper - Skeleton-first rendering para todas as telas
import React, { memo, Suspense, useEffect } from 'react';
import { RouteWrapper } from './RouteWrapper';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { Skeleton } from '@/components/shared/ui/skeleton';
// import { useUltraRoutePreloader } from '@/utils/ultra-route-preloader';
import { useLocation } from 'react-router-dom';

// FASE 2.1: Skeleton universal para todas as telas
const UniversalSkeleton = memo(() => (
  <div className="min-h-screen bg-background pb-20">
    <div className="px-4 pt-8 pb-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        {/* Main content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          
          {/* List skeleton */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));

UniversalSkeleton.displayName = 'UniversalSkeleton';

// FASE 2.2: Skeleton específico por tipo de tela
const SkeletonMap = {
  dashboard: UniversalSkeleton,
  profile: UniversalSkeleton, 
  social: UniversalSkeleton,
  quiz: UniversalSkeleton,
  store: UniversalSkeleton,
  leaderboard: UniversalSkeleton,
  default: UniversalSkeleton
};

interface UltraRouteWrapperProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  showNavbar?: boolean;
  adminOnly?: boolean;
  routeType?: keyof typeof SkeletonMap;
}

// FASE 2.3: Ultra Route Wrapper com preload inteligente
export const UltraRouteWrapper = memo(({ 
  children, 
  requiresAuth, 
  showNavbar, 
  adminOnly,
  routeType = 'default'
}: UltraRouteWrapperProps) => {
  const location = useLocation();
  // const { preloadPredictive } = useUltraRoutePreloader(location.pathname);
  
  // FASE 2.4: Performance tracking por rota
  useEffect(() => {
    const routeName = location.pathname.replace('/', '') || 'dashboard';
    performance.mark(`ultra-route-${routeName}-start`);
    
    return () => {
      performance.mark(`ultra-route-${routeName}-end`);
      performance.measure(
        `ultra-route-${routeName}`, 
        `ultra-route-${routeName}-start`, 
        `ultra-route-${routeName}-end`
      );
      
      // Log route performance
      setTimeout(() => {
        const measure = performance.getEntriesByName(`ultra-route-${routeName}`)[0];
        if (measure) {
          console.log(`🚀 Route ${routeName} Load Time: ${measure.duration.toFixed(2)}ms`);
        }
      }, 100);
    };
  }, [location.pathname]);

  // FASE 2.5: Skeleton otimizado por tipo de rota
  const SkeletonComponent = SkeletonMap[routeType] || SkeletonMap.default;

  return (
    <RouteWrapper
      requiresAuth={requiresAuth}
      showNavbar={showNavbar}
      adminOnly={adminOnly}
    >
      <Suspense fallback={<SkeletonComponent />}>
        {children}
      </Suspense>
    </RouteWrapper>
  );
});

UltraRouteWrapper.displayName = 'UltraRouteWrapper';

// FASE 2.6: HOC para wrap automático de rotas com preload
export const withUltraRoute = (
  Component: React.ComponentType<any>,
  config: {
    requiresAuth?: boolean;
    showNavbar?: boolean;
    adminOnly?: boolean;
    routeType?: keyof typeof SkeletonMap;
  } = {}
) => {
  const WrappedComponent = memo((props: any) => (
    <UltraRouteWrapper {...config}>
      <Component {...props} />
    </UltraRouteWrapper>
  ));
  
  WrappedComponent.displayName = `withUltraRoute(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default UltraRouteWrapper;