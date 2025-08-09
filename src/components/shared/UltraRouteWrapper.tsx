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