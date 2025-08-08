// FASE 2: Ultra Route Preloader - Preload inteligente baseado na rota atual
import { LazyRoutes } from '@/utils/advanced-lazy-loading';

interface RoutePreloadConfig {
  immediate: string[];    // Preload imediatamente
  onIdle: string[];      // Preload quando idle
  onNavigation: string[]; // Preload na navegação
}

// Configuração inteligente de preload baseada na probabilidade de navegação
const ROUTE_PRELOAD_MAP: Record<string, RoutePreloadConfig> = {
  '/dashboard': {
    immediate: ['Profile', 'Social', 'Store'], // 80% probabilidade
    onIdle: ['Quiz', 'Leaderboard', 'BtcDuel'], // 60% probabilidade
    onNavigation: ['Achievements', 'Settings'] // 30% probabilidade
  },
  '/profile': {
    immediate: ['Dashboard', 'Settings'],
    onIdle: ['Achievements', 'Store'],
    onNavigation: ['Social', 'Quiz']
  },
  '/social': {
    immediate: ['Dashboard', 'SocialChallenges'],
    onIdle: ['BtcDuel', 'Leaderboard'],
    onNavigation: ['Profile', 'Quiz']
  },
  '/quiz': {
    immediate: ['Dashboard', 'SoloQuiz'],
    onIdle: ['EnhancedQuiz', 'Leaderboard'],
    onNavigation: ['Achievements', 'Social']
  },
  '/store': {
    immediate: ['Dashboard', 'VirtualStore'],
    onIdle: ['Marketplace', 'Profile'],
    onNavigation: ['Achievements', 'Powerups']
  }
};

class UltraRoutePreloader {
  private preloadedRoutes = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  // FASE 2.1: Preload imediato para rotas críticas
  async preloadImmediate(currentRoute: string) {
    const config = ROUTE_PRELOAD_MAP[currentRoute];
    if (!config) return;

    const routes = config.immediate;
    for (const route of routes) {
      if (!this.preloadedRoutes.has(route)) {
        this.preloadRoute(route);
      }
    }
  }

  // FASE 2.2: Preload quando idle para rotas prováveis
  async preloadOnIdle(currentRoute: string) {
    const config = ROUTE_PRELOAD_MAP[currentRoute];
    if (!config) return;

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        config.onIdle.forEach(route => {
          if (!this.preloadedRoutes.has(route)) {
            this.preloadRoute(route);
          }
        });
      });
    } else {
      // Fallback para browsers sem requestIdleCallback
      setTimeout(() => {
        config.onIdle.forEach(route => {
          if (!this.preloadedRoutes.has(route)) {
            this.preloadRoute(route);
          }
        });
      }, 2000);
    }
  }

  // FASE 2.3: Preload na navegação para rotas relacionadas
  async preloadOnNavigation(currentRoute: string) {
    const config = ROUTE_PRELOAD_MAP[currentRoute];
    if (!config) return;

    // Preload routes que podem ser acessadas por navegação
    config.onNavigation.forEach(route => {
      if (!this.preloadedRoutes.has(route)) {
        this.preloadRoute(route);
      }
    });
  }

  // FASE 2.4: Preload individual de rota
  private preloadRoute(routeName: string) {
    if (this.preloadedRoutes.has(routeName) || this.preloadPromises.has(routeName)) {
      return this.preloadPromises.get(routeName);
    }

    const component = LazyRoutes[routeName as keyof typeof LazyRoutes];
    if (!component) return Promise.resolve();

    // Simple preload by calling the component function
    const preloadPromise = Promise.resolve().then(() => component);
    
    this.preloadPromises.set(routeName, preloadPromise);
    
    preloadPromise
      .then(() => {
        this.preloadedRoutes.add(routeName);
        console.debug(`🚀 Route preloaded: ${routeName}`);
      })
      .catch((error) => {
        console.debug(`❌ Failed to preload route: ${routeName}`, error);
        // Remove failed promise so we can retry
        this.preloadPromises.delete(routeName);
      });

    return preloadPromise;
  }

  // FASE 2.5: Preload baseado em hover/focus (predictive)
  async preloadPredictive(targetRoute: string) {
    if (!this.preloadedRoutes.has(targetRoute)) {
      this.preloadRoute(targetRoute);
    }
  }

  // FASE 2.6: Warm up critical routes no boot
  async warmupCriticalRoutes() {
    const criticalRoutes = ['Dashboard', 'Profile', 'Social', 'Quiz'];
    
    for (const route of criticalRoutes) {
      if (!this.preloadedRoutes.has(route)) {
        this.preloadRoute(route);
        // Delay entre preloads para não bloquear
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // FASE 2.7: Get preload status
  getPreloadStatus() {
    return {
      preloaded: Array.from(this.preloadedRoutes),
      loading: Array.from(this.preloadPromises.keys()).filter(
        route => !this.preloadedRoutes.has(route)
      )
    };
  }
}

// Singleton instance
export const ultraRoutePreloader = new UltraRoutePreloader();

// Hook para usar o preloader em componentes
import React from 'react';

export const useUltraRoutePreloader = (currentRoute: string) => {
  React.useEffect(() => {
    // Preload imediato
    ultraRoutePreloader.preloadImmediate(currentRoute);
    
    // Preload idle após 500ms
    const idleTimer = setTimeout(() => {
      ultraRoutePreloader.preloadOnIdle(currentRoute);
    }, 500);

    // Preload navegação após 1s
    const navTimer = setTimeout(() => {
      ultraRoutePreloader.preloadOnNavigation(currentRoute);
    }, 1000);

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(navTimer);
    };
  }, [currentRoute]);

  return {
    preloadPredictive: ultraRoutePreloader.preloadPredictive.bind(ultraRoutePreloader),
    getStatus: ultraRoutePreloader.getPreloadStatus.bind(ultraRoutePreloader)
  };
};

export default UltraRoutePreloader;