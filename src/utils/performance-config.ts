// Performance configuration constants and thresholds
export const PERFORMANCE_CONFIG = {
  // Memory thresholds (in MB)
  MEMORY: {
    WARNING_THRESHOLD: 100,
    CRITICAL_THRESHOLD: 120,
    PRESSURE_RATIO: 0.8,
    GC_THRESHOLD: 150,
  },
  
  // Query optimization settings
  QUERY: {
    STALE_TIME_CRITICAL: 30 * 1000,      // 30 seconds for critical data
    STALE_TIME_NORMAL: 2 * 60 * 1000,    // 2 minutes for normal data
    GC_TIME: 3 * 60 * 1000,              // 3 minutes garbage collection
    OPTIMIZATION_INTERVAL: 5 * 60 * 1000, // 5 minutes cache optimization
    STALE_QUERY_AGE: 10 * 60 * 1000,     // 10 minutes for stale queries
  },
  
  // Bundle and loading thresholds
  BUNDLE: {
    SLOW_RESOURCE_THRESHOLD: 1000,       // 1 second for slow resources
    ICON_LOAD_WARNING: 100,              // 100ms for slow icon loads
    COMPONENT_RENDER_WARNING: 16,        // 16ms for 60fps
  },
  
  // Real-time optimization
  REALTIME: {
    DEBOUNCE_TIME: 300,                  // 300ms debounce for invalidations
    RECONNECT_DELAY: 1000,               // 1 second base reconnect delay
    MAX_RECONNECT_DELAY: 30000,          // 30 seconds max reconnect delay
    CONNECTION_TIMEOUT: 5000,            // 5 seconds connection timeout
  },
  
  // Memory optimization intervals
  INTERVALS: {
    MEMORY_CHECK: 45000,                 // 45 seconds
    ADVANCED_OPTIMIZATION: 60000,        // 60 seconds
    PERFORMANCE_MONITORING: 30000,       // 30 seconds
    CACHE_CLEANUP: 5 * 60 * 1000,       // 5 minutes
  },
} as const;

// Performance monitoring utilities
export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }
  
  const memory = (performance as any).memory;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    memory: memory ? {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
    } : null,
    
    navigation: navigation ? {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    } : null,
    
    resources: {
      total: performance.getEntriesByType('resource').length,
      slowResources: performance.getEntriesByType('resource').filter(r => r.duration > PERFORMANCE_CONFIG.BUNDLE.SLOW_RESOURCE_THRESHOLD).length,
    },
  };
};

// Performance budget checks
export const checkPerformanceBudget = () => {
  const metrics = getPerformanceMetrics();
  if (!metrics) return { passed: true, violations: [] };
  
  const violations: string[] = [];
  
  // Memory budget check
  if (metrics.memory && metrics.memory.usageRatio > PERFORMANCE_CONFIG.MEMORY.PRESSURE_RATIO) {
    violations.push(`High memory usage: ${(metrics.memory.usageRatio * 100).toFixed(1)}%`);
  }
  
  // Loading performance check
  if (metrics.navigation && metrics.navigation.firstContentfulPaint > 2500) {
    violations.push(`Slow FCP: ${metrics.navigation.firstContentfulPaint}ms`);
  }
  
  // Resource loading check
  if (metrics.resources.slowResources > 5) {
    violations.push(`Too many slow resources: ${metrics.resources.slowResources}`);
  }
  
  return {
    passed: violations.length === 0,
    violations,
    metrics,
  };
};

// Environment-specific optimizations
export const getOptimizationLevel = (): 'development' | 'production' | 'aggressive' => {
  if (import.meta.env.DEV) return 'development';
  
  const metrics = getPerformanceMetrics();
  if (!metrics?.memory) return 'production';
  
  // Use aggressive optimizations on low-end devices
  return metrics.memory.limit < 500 * 1024 * 1024 ? 'aggressive' : 'production';
};

export const applyOptimizationLevel = (level: ReturnType<typeof getOptimizationLevel>) => {
  switch (level) {
    case 'development':
      return {
        enableDebugLogs: true,
        memoryCheckInterval: PERFORMANCE_CONFIG.INTERVALS.MEMORY_CHECK * 2,
        enableBundleAnalysis: true,
        cacheStrategy: 'permissive',
      };
      
    case 'production':
      return {
        enableDebugLogs: false,
        memoryCheckInterval: PERFORMANCE_CONFIG.INTERVALS.MEMORY_CHECK,
        enableBundleAnalysis: false,
        cacheStrategy: 'optimal',
      };
      
    case 'aggressive':
      return {
        enableDebugLogs: false,
        memoryCheckInterval: PERFORMANCE_CONFIG.INTERVALS.MEMORY_CHECK / 2,
        enableBundleAnalysis: false,
        cacheStrategy: 'minimal',
      };
  }
};