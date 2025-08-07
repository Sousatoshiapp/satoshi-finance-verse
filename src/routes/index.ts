import { publicRoutes } from './publicRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { gameRoutes } from './gameRoutes';
import { adminRoutes } from './adminRoutes';
import { storeRoutes } from './storeRoutes';
import { districtRoutes } from './districtRoutes';
import { gamificationRoutes } from './gamificationRoutes';
import { aiRoutes } from './aiRoutes';
import { monetizationRoutes } from './monetizationRoutes';
import { detailRoutes } from './detailRoutes';
import { devRoutes } from './devRoutes';

export interface RouteConfig {
  path: string;
  element: string;
  requiresAuth?: boolean;
  showNavbar?: boolean;
  adminOnly?: boolean;
  isDirectImport?: boolean;
}

export const routeConfig: RouteConfig[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...gameRoutes,
  ...adminRoutes,
  ...storeRoutes,
  ...districtRoutes,
  ...gamificationRoutes,
  ...aiRoutes,
  ...monetizationRoutes,
  ...detailRoutes,
  ...devRoutes,
  {
    path: '/duel-waiting/:duelId',
    element: 'DuelWaitingScreen',
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: false
  },
  {
    path: '/duel/:duelId',
    element: 'EnhancedSimultaneousDuel',
    requiresAuth: true,
    showNavbar: false,
    isDirectImport: false
  }
];
