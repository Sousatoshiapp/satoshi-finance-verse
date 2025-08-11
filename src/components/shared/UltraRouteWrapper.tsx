// FASE 2: Ultra Route Wrapper - ProfileStyleLoader for all screens
import React, { memo, Suspense, useEffect } from 'react';
import { RouteWrapper } from './RouteWrapper';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';
// import { useUltraRoutePreloader } from '@/utils/ultra-route-preloader';
import { useLocation } from 'react-router-dom';

// Universal loader for all screens
const UniversalLoader = memo(() => (
  <ProfileStyleLoader size="lg" />
));

UniversalLoader.displayName = 'UniversalLoader';

// Loader map for different route types
const LoaderMap = {
  dashboard: UniversalLoader,
  profile: UniversalLoader, 
  social: UniversalLoader,
  quiz: UniversalLoader,
  store: UniversalLoader,
  leaderboard: UniversalLoader,
  default: UniversalLoader
};

interface UltraRouteWrapperProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  showNavbar?: boolean;
  adminOnly?: boolean;
  routeType?: keyof typeof LoaderMap;
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
  
  // FASE 2.4: Performance tracking por rota com validação defensiva
  useEffect(() => {
    const routeName = location.pathname.replace('/', '') || 'dashboard';
    const startMarkName = `ultra-route-${routeName}-start`;
    const endMarkName = `ultra-route-${routeName}-end`;
    const measureName = `ultra-route-${routeName}`;
    
    try {
      performance.mark(startMarkName);
    } catch (e) {
      console.debug(`Failed to create start mark for ${routeName}:`, e);
    }
    
    return () => {
      try {
        performance.mark(endMarkName);
        
        // Verificar se a marca de início existe antes de medir
        const startMarks = performance.getEntriesByName(startMarkName, 'mark');
        if (startMarks.length > 0) {
          performance.measure(measureName, startMarkName, endMarkName);
          
          // Log route performance
          setTimeout(() => {
            const measures = performance.getEntriesByName(measureName);
            if (measures.length > 0) {
              console.log(`🚀 Route ${routeName} Load Time: ${measures[0].duration.toFixed(2)}ms`);
            }
          }, 100);
        } else {
          console.debug(`Start mark not found for route ${routeName}, skipping measurement`);
        }
      } catch (e) {
        console.debug(`Failed to measure performance for ${routeName}:`, e);
      }
    };
  }, [location.pathname]);

  // Loader component for route type
  const LoaderComponent = LoaderMap[routeType] || LoaderMap.default;

  return (
    <RouteWrapper
      requiresAuth={requiresAuth}
      showNavbar={showNavbar}
      adminOnly={adminOnly}
    >
      <Suspense fallback={<LoaderComponent />}>
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
    routeType?: keyof typeof LoaderMap;
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