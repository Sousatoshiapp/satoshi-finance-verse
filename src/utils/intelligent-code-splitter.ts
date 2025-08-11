// Ultra-aggressive code splitting with intelligent preloading
import { lazy } from 'react';

// Route-based splitting with priority loading
export const LazyRoutes = {
  // Priority 1: Critical routes (immediate preload)
  Dashboard: lazy(() => 
    import('@/pages/Dashboard').then(module => {
      // Preload likely next routes
      setTimeout(() => {
        import('@/pages/quiz/SoloQuiz');
        import('@/pages/Social');
      }, 1000);
      return module;
    })
  ),
  
  Profile: lazy(() => 
    import('@/pages/Profile').then(module => {
      setTimeout(() => {
        import('@/pages/Settings');
        import('@/pages/Achievements');
      }, 1500);
      return module;
    })
  ),

  // Priority 2: Feature routes (conditional preload)
  SoloQuiz: lazy(() => 
    import('@/pages/quiz/SoloQuiz').then(module => {
      setTimeout(() => {
        import('@/pages/quiz/StudyMode');
        import('@/pages/Leaderboard');
      }, 2000);
      return module;
    })
  ),

  Social: lazy(() => 
    import('@/pages/Social').then(module => {
      setTimeout(() => {
        import('@/pages/Messages');
        import('@/pages/DirectChat');
      }, 2000);
      return module;
    })
  ),

  BtcDuel: lazy(() => 
    import('@/pages/BtcDuel').then(module => {
      setTimeout(() => {
        import('@/pages/FindOpponent');
        import('@/pages/Duels');
      }, 1500);
      return module;
    })
  ),

  // Priority 3: Secondary routes (lazy preload)
  Settings: lazy(() => import('@/pages/Settings')),
  Achievements: lazy(() => import('@/pages/Achievements')),
  Leaderboard: lazy(() => import('@/pages/Leaderboard')),
  Messages: lazy(() => import('@/pages/Messages')),
  DirectChat: lazy(() => import('@/pages/DirectChat')),

  // Priority 4: Low priority routes
  Store: lazy(() => import('@/pages/Store')),
  Inventory: lazy(() => import('@/pages/Inventory')),
  Tournaments: lazy(() => import('@/pages/Tournaments')),
  
  // Utility routes
  Welcome: lazy(() => import('@/pages/Welcome')),
  Auth: lazy(() => import('@/pages/Auth')),
};

// Component-level splitting for heavy features
export const LazyComponents = {
  // Heavy dashboard components
  AdvancedAnalytics: lazy(() => 
    import('@/components/advanced-analytics-dashboard').then(module => ({
      default: module.AdvancedAnalyticsDashboard
    }))
  ),
  
  TradingInterface: lazy(() => 
    import('@/components/trading/trading-interface').then(module => ({
      default: module.TradingInterface
    }))
  ),

  PortfolioCharts: lazy(() => 
    import('@/components/portfolio/portfolio-charts').then(module => ({
      default: module.PortfolioCharts
    }))
  ),

  // Social features
  SocialFeed: lazy(() => 
    import('@/components/features/social/social-feed').then(module => ({
      default: module.SocialFeed
    }))
  ),

  // Quiz components
  EnhancedQuizCard: lazy(() => 
    import('@/components/quiz/enhanced-quiz-card').then(module => ({
      default: module.EnhancedQuizCard
    }))
  ),
};

// Vendor splitting configuration for Vite
export const getVendorChunks = () => ({
  // React ecosystem
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  
  // UI libraries  
  'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'framer-motion'],
  
  // Data & State
  'data-vendor': ['@tanstack/react-query', '@supabase/supabase-js'],
  
  // Icons & Graphics
  'icons-vendor': ['lucide-react', '@react-three/fiber', '@react-three/drei'],
  
  // Utils
  'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
});

// Bundle analysis for development
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    const totalScripts = scripts.length;
    
    console.log(`📦 Bundle Analysis:`, {
      totalScripts,
      chunksLoaded: Array.from(scripts).map(s => (s as HTMLScriptElement).src.split('/').pop()),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 'N/A'
    });
  }
};

// Intelligent preloading based on user behavior
export const preloadBasedOnRoute = (currentRoute: string) => {
  const preloadMap: Record<string, (() => Promise<any>)[]> = {
    '/dashboard': [
      () => import('@/pages/quiz/SoloQuiz'),
      () => import('@/pages/Social'),
      () => import('@/pages/Profile'),
    ],
    '/quiz': [
      () => import('@/pages/Leaderboard'),
      () => import('@/pages/quiz/StudyMode'),
    ],
    '/social': [
      () => import('@/pages/Messages'),
      () => import('@/pages/Profile'),
    ],
    '/profile': [
      () => import('@/pages/Settings'),
      () => import('@/pages/Achievements'),
    ],
  };

  const preloadFunctions = preloadMap[currentRoute];
  if (preloadFunctions) {
    // Preload with delay to avoid blocking current route
    setTimeout(() => {
      preloadFunctions.forEach((preloadFn, index) => {
        setTimeout(preloadFn, index * 500);
      });
    }, 1000);
  }
};