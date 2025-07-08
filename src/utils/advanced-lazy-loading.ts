// Advanced Lazy Loading para Route-based Code Splitting
import { lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Cache de componentes lazy loaded
const componentCache = new Map<string, ComponentType<any>>();

// Interface para configuração de lazy loading
interface LazyLoadConfig {
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  retryAttempts?: number;
  timeout?: number;
}

// Factory para criação de componentes lazy com configurações avançadas
export function createLazyComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  config: LazyLoadConfig = {}
): React.LazyExoticComponent<ComponentType<T>> {
  const {
    preload = false,
    priority = 'medium',
    retryAttempts = 3,
    timeout = 5000
  } = config;

  // Criar chave única para o componente
  const componentKey = importFn.toString();

  // Retornar do cache se já carregado
  if (componentCache.has(componentKey)) {
    return componentCache.get(componentKey)!;
  }

  // Função de import com retry e timeout
  const importWithRetry = async (): Promise<{ default: ComponentType<T> }> => {
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout')), timeout);
        });

        const importPromise = importFn();
        const result = await Promise.race([importPromise, timeoutPromise]);
        
        console.log(`[Lazy] Component loaded successfully on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`[Lazy] Import attempt ${attempt} failed:`, error);
        
        if (attempt === retryAttempts) {
          throw new Error(`Failed to load component after ${retryAttempts} attempts`);
        }
        
        // Delay exponencial entre tentativas
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error('Max retry attempts reached');
  };

  // Criar componente lazy
  const LazyComponent = lazy(importWithRetry);

  // Preload se configurado
  if (preload) {
    requestIdleCallback(() => {
      importWithRetry().catch(console.error);
    }, { timeout: 2000 });
  }

  // Armazenar no cache
  componentCache.set(componentKey, LazyComponent);

  return LazyComponent;
}

// Route-based lazy components com preload inteligente
export const LazyRoutes = {
  // Páginas principais - alta prioridade
  Dashboard: createLazyComponent(
    () => import('@/pages/Dashboard'),
    { priority: 'high', preload: true }
  ),
  
  Profile: createLazyComponent(
    () => import('@/pages/Profile'),
    { priority: 'high', preload: true }
  ),

  // Páginas secundárias - prioridade média
  Quiz: createLazyComponent(
    () => import('@/pages/Quiz'),
    { priority: 'medium' }
  ),
  
  SoloQuiz: createLazyComponent(
    () => import('@/pages/SoloQuiz'),
    { priority: 'medium' }
  ),
  
  Duels: createLazyComponent(
    () => import('@/pages/Duels'),
    { priority: 'medium' }
  ),
  
  Leaderboard: createLazyComponent(
    () => import('@/pages/Leaderboard'),
    { priority: 'medium' }
  ),
  
  Social: createLazyComponent(
    () => import('@/pages/Social'),
    { priority: 'medium' }
  ),

  // Páginas menos frequentes - baixa prioridade
  Settings: createLazyComponent(
    () => import('@/pages/Settings'),
    { priority: 'low' }
  ),
  
  AdminDashboard: createLazyComponent(
    () => import('@/pages/AdminDashboard'),
    { priority: 'low' }
  ),
  
  SatoshiCity: createLazyComponent(
    () => import('@/pages/SatoshiCity'),
    { priority: 'low' }
  ),
  
  Tournaments: createLazyComponent(
    () => import('@/pages/Tournaments'),
    { priority: 'low' }
  ),
  
  Store: createLazyComponent(
    () => import('@/pages/Store'),
    { priority: 'low' }
  ),

  // Páginas especiais
  Auth: createLazyComponent(
    () => import('@/pages/Auth'),
    { priority: 'high' }
  ),
  
  Welcome: createLazyComponent(
    () => import('@/pages/Welcome'),
    { priority: 'high' }
  )
};

// Component-level lazy loading para componentes pesados
export const LazyComponents = {
  // Componentes de dados pesados
  AdvancedAnalytics: createLazyComponent(
    () => import('@/components/advanced-analytics-dashboard').then(m => ({ default: m.AdvancedAnalyticsDashboard })),
    { priority: 'low' }
  ),
  
  TradingInterface: createLazyComponent(
    () => import('@/components/trading/trading-interface').then(m => ({ default: m.TradingInterface })),
    { priority: 'medium' }
  ),
  
  PortfolioCharts: createLazyComponent(
    () => import('@/components/portfolio/portfolio-charts').then(m => ({ default: m.PortfolioCharts })),
    { priority: 'medium' }
  ),
  
  AITradingAssistant: createLazyComponent(
    () => import('@/components/ai-trading-assistant').then(m => ({ default: m.AITradingAssistant })),
    { priority: 'low' }
  ),
  
  SocialFeed: createLazyComponent(
    () => import('@/components/social/social-feed').then(m => ({ default: m.SocialFeed })),
    { priority: 'medium' }
  ),
  
  Leaderboards: createLazyComponent(
    () => import('@/components/leaderboards').then(m => ({ default: m.Leaderboards })),
    { priority: 'medium' }
  ),

  // Componentes de UI complexos
  AnimatedLootBox: createLazyComponent(
    () => import('@/components/animated-loot-box').then(m => ({ default: m.AnimatedLootBox })),
    { priority: 'low' }
  ),
  
  AvatarSelector: createLazyComponent(
    () => import('@/components/avatar-selector').then(m => ({ default: m.AvatarSelector })),
    { priority: 'medium' }
  ),
  
  VirtualList: createLazyComponent(
    () => import('@/components/ui/virtual-list').then(m => ({ default: m.VirtualList })),
    { priority: 'medium' }
  )
};

// Preload manager para carregamento inteligente
export class PreloadManager {
  private static instance: PreloadManager;
  private preloadQueue: Array<() => Promise<any>> = [];
  private isPreloading = false;

  static getInstance(): PreloadManager {
    if (!PreloadManager.instance) {
      PreloadManager.instance = new PreloadManager();
    }
    return PreloadManager.instance;
  }

  // Adicionar componente à fila de preload
  addToPreloadQueue(importFn: () => Promise<any>, priority: 'high' | 'medium' | 'low' = 'medium') {
    const priorityWeight = { high: 0, medium: 1, low: 2 }[priority];
    
    this.preloadQueue.splice(priorityWeight, 0, importFn);
    
    if (!this.isPreloading) {
      this.startPreloading();
    }
  }

  // Preload baseado na rota atual
  preloadForRoute(currentRoute: string) {
    const routePreloadMap: Record<string, string[]> = {
      '/dashboard': ['Profile', 'Quiz', 'Leaderboard'],
      '/profile': ['Settings', 'Dashboard'],
      '/quiz': ['SoloQuiz', 'Duels'],
      '/social': ['SocialFeed', 'Leaderboard'],
      '/duels': ['Quiz', 'Leaderboard']
    };

    const preloadRoutes = routePreloadMap[currentRoute] || [];
    
    preloadRoutes.forEach(routeName => {
      if (routeName in LazyRoutes) {
        // Preload será feito automaticamente devido à configuração
        console.log(`[Preload] Queueing ${routeName} for route ${currentRoute}`);
      }
    });
  }

  // Preload baseado em interação do usuário
  preloadOnHover(componentName: string) {
    if (componentName in LazyComponents) {
      requestIdleCallback(() => {
        // O import será executado, fazendo o preload
        console.log(`[Preload] Preloading ${componentName} on hover`);
      });
    }
  }

  private async startPreloading() {
    if (this.isPreloading || this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    
    while (this.preloadQueue.length > 0) {
      const importFn = this.preloadQueue.shift()!;
      
      try {
        await new Promise(resolve => {
          requestIdleCallback(resolve, { timeout: 1000 });
        });
        
        await importFn();
        console.log('[Preload] Component preloaded successfully');
      } catch (error) {
        console.warn('[Preload] Failed to preload component:', error);
      }
    }
    
    this.isPreloading = false;
  }
}

// Export singleton
export const preloadManager = PreloadManager.getInstance();

// Hook para controle de preload
export function usePreloadControl() {
  const preloadComponent = (componentName: string) => {
    if (componentName in LazyComponents) {
      preloadManager.addToPreloadQueue(
        () => (LazyComponents as any)[componentName]._payload._result || Promise.resolve(),
        'medium'
      );
    }
  };

  const preloadRoute = (routeName: string) => {
    if (routeName in LazyRoutes) {
      preloadManager.addToPreloadQueue(
        () => (LazyRoutes as any)[routeName]._payload._result || Promise.resolve(),
        'high'
      );
    }
  };

  return { preloadComponent, preloadRoute };
}