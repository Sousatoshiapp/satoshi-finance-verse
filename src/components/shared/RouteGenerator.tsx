import { Route } from 'react-router-dom';
import { LazyRoutes } from '@/utils/advanced-lazy-loading';
import { RouteWrapper } from './RouteWrapper';
import { routeConfig, RouteConfig } from '@/routes';
import TranslationTestPage from '@/pages/TranslationTest';

import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import Social from '@/pages/Social';
import Duels from '@/pages/Duels';
import SatoshiCity from '@/pages/SatoshiCity';
import DistrictDetail from '@/pages/DistrictDetail';
import DistrictQuiz from '@/pages/DistrictQuiz';
import DistrictQuizPage from '@/pages/DistrictQuizPage';
import { ImmersiveDistrictPage } from '@/components/district/ImmersiveDistrictPage';
import GameMode from '@/pages/GameMode';
import Store from '@/pages/Store';
import SubscriptionPlans from '@/pages/SubscriptionPlans';
import Icons from '@/pages/Icons';
import AdminPanel from '@/pages/AdminPanel';

const directImports: Record<string, React.ComponentType> = {
  Dashboard,
  Profile,
  UserProfile,
  Social,
  Duels,
  SatoshiCity,
  DistrictDetail,
  DistrictQuiz,
  DistrictQuizPage,
  ImmersiveDistrictPage,
  GameMode,
  Store,
  SubscriptionPlans,
  Icons,
  AdminPanel,
  TranslationTestPage
};

export function generateRoutes() {
  const routes = routeConfig.map((route: RouteConfig) => {
    const Component = route.isDirectImport 
      ? directImports[route.element]
      : LazyRoutes[route.element as keyof typeof LazyRoutes];
      
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
