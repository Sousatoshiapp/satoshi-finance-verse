import { Route } from 'react-router-dom';
import { LazyRoutes } from '@/utils/advanced-lazy-loading';
import { RouteWrapper } from './RouteWrapper';
import { routeConfig, RouteConfig } from '@/routes';

// Only keep critical direct imports for immediate navigation
import TranslationTestPage from '@/pages/TranslationTest';

export function generateRoutes() {
  const routes = routeConfig.map((route: RouteConfig) => {
    // Force all routes to use lazy loading for better performance
    const Component = LazyRoutes[route.element as keyof typeof LazyRoutes];
      
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <RouteWrapper
            requiresAuth={route.requiresAuth}
            showNavbar={route.showNavbar}
            adminOnly={route.adminOnly}
          >
            <Component />
          </RouteWrapper>
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
