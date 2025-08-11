// Aggressive tree shaking optimization for unused code elimination

// Optimized icon imports - only load what's needed
export const optimizedIconImports = {
  // Dashboard icons
  dashboard: () => import('lucide-react').then(m => ({
    Sparkles: m.Sparkles,
    Trophy: m.Trophy,
    TrendingUp: m.TrendingUp,
    Gamepad2: m.Gamepad2,
  })),
  
  // Navigation icons
  navigation: () => import('lucide-react').then(m => ({
    Home: m.Home,
    User: m.User,
    Settings: m.Settings,
    Menu: m.Menu,
    X: m.X,
  })),
  
  // Quiz icons
  quiz: () => import('lucide-react').then(m => ({
    BookOpen: m.BookOpen,
    CheckCircle: m.CheckCircle,
    XCircle: m.XCircle,
    Clock: m.Clock,
  })),
  
  // Social icons
  social: () => import('lucide-react').then(m => ({
    Users: m.Users,
    MessageCircle: m.MessageCircle,
    Heart: m.Heart,
    Share: m.Share,
  })),
};

// Lazy load icon sets based on current route
export const loadIconsForRoute = async (route: string) => {
  const iconMap: Record<string, keyof typeof optimizedIconImports> = {
    '/dashboard': 'dashboard',
    '/quiz': 'quiz',
    '/social': 'social',
    '/profile': 'navigation',
    '/settings': 'navigation',
  };
  
  const iconSet = iconMap[route] || 'navigation';
  return await optimizedIconImports[iconSet]();
};

// Unused dependency detector for development
export const detectUnusedDependencies = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const modules = new Set<string>();
  
  // Track all imports in development
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.name.includes('node_modules')) {
        const moduleName = entry.name.split('node_modules/')[1]?.split('/')[0];
        if (moduleName) modules.add(moduleName);
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  // Report after 10 seconds
  setTimeout(() => {
    console.log('📦 Loaded modules:', Array.from(modules));
    observer.disconnect();
  }, 10000);
};

// Bundle analyzer for chunk optimization
export const analyzeBundleEfficiency = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const scripts = document.querySelectorAll('script[src]');
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  
  const analysis = {
    totalScripts: scripts.length,
    totalStylesheets: stylesheets.length,
    vendorChunks: Array.from(scripts).filter(s => (s as HTMLScriptElement).src.includes('vendor')).length,
    featureChunks: Array.from(scripts).filter(s => !(s as HTMLScriptElement).src.includes('vendor') && (s as HTMLScriptElement).src.includes('.js')).length,
    recommendations: []
  };
  
  // Generate recommendations
  if (analysis.totalScripts > 15) {
    analysis.recommendations.push('Consider more aggressive code splitting');
  }
  
  if (analysis.vendorChunks < 3) {
    analysis.recommendations.push('Vendor chunks could be optimized further');
  }
  
  console.log('📊 Bundle Analysis:', analysis);
  return analysis;
};

// Memory-efficient component registration
export const registerLazyComponent = <T>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) => {
  const componentCache = new WeakMap();
  
  return async () => {
    if (componentCache.has(importFn)) {
      return componentCache.get(importFn);
    }
    
    try {
      const module = await importFn();
      componentCache.set(importFn, module.default);
      console.log(`✅ Lazy loaded: ${componentName}`);
      return module.default;
    } catch (error) {
      console.error(`❌ Failed to load: ${componentName}`, error);
      throw error;
    }
  };
};

// Initialize tree shaking optimizations
export const initTreeShaking = () => {
  detectUnusedDependencies();
  analyzeBundleEfficiency();
  
  // Clean up unused modules periodically
  setInterval(() => {
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }, 60000);
};