// FASE 2: Ultra Route Generator - Geração otimizada com preload inteligente
import React from 'react';
import { Route } from 'react-router-dom';
import { LazyRoutes } from '@/utils/advanced-lazy-loading';
import { UltraRouteWrapper } from './UltraRouteWrapper';
import { routeConfig, RouteConfig } from '@/routes';
// import { ultraRoutePreloader } from '@/utils/ultra-route-preloader';

// Critical imports - apenas para rotas que precisam ser imediatas
import TranslationTestPage from '@/pages/TranslationTest';

// FASE 2.1: Ultra route generation com preload automático
export function generateRoutes() {
  console.log('🏗️ Gerando rotas...');
  
  // FASE 2.2: Warmup crítico no boot - disabled
  // React.useEffect(() => {
  //   ultraRoutePreloader.warmupCriticalRoutes();
  // }, []);

  const routes = routeConfig.map((route: RouteConfig) => {
    console.log('🛤️ Processando rota:', route.path);
    // FASE 2.3: Lazy loading otimizado com preload
    const Component = LazyRoutes[route.element as keyof typeof LazyRoutes];
    
    if (!Component) {
      console.error('❌ Componente não encontrado para rota:', route.path, route.element);
      return null;
    }
    
    console.log('✅ Componente encontrado para:', route.path);
    
    // FASE 2.4: Determinar tipo de rota para skeleton otimizado
    const routeType = route.path === '/dashboard' ? 'dashboard' :
                     route.path === '/profile' ? 'profile' :
                     route.path.includes('/user/') ? 'profile' :
                     route.path === '/social' ? 'social' :
                     route.path.includes('/chat/') ? 'social' :
                     route.path.includes('quiz') ? 'quiz' :
                     route.path === '/store' ? 'store' :
                     route.path.includes('leaderboard') ? 'leaderboard' :
                     'default';
      
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <UltraRouteWrapper
            requiresAuth={route.requiresAuth}
            showNavbar={route.showNavbar}
            adminOnly={route.adminOnly}
            routeType={routeType}
          >
            <Component />
          </UltraRouteWrapper>
        }
      />
    );
  });

  routes.push(
    <Route
      key="/translation-test"
      path="/translation-test"
      element={<TranslationTestPage />}
    />
  );

  return routes;
}
