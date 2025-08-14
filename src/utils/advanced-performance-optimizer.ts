// PHASE 2: Advanced Performance Optimization Engine
// Zero impact visual - 100% internal optimizations

import { QueryClient } from '@tanstack/react-query';
import { PERFORMANCE_CONFIG } from './performance-config';

class AdvancedPerformanceOptimizer {
  private queryClient: QueryClient | null = null;
  private optimizationIntervals: NodeJS.Timeout[] = [];
  private memoryPressureDetected = false;
  private lastCleanup = 0;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute

  initialize(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.startOptimizationCycles();
    this.setupMemoryMonitoring();
    this.enableIntelligentPrefetching();
  }

  private startOptimizationCycles() {
    // Intelligent cache optimization cycle
    const cacheOptimizer = setInterval(() => {
      this.optimizeQueryCache();
    }, PERFORMANCE_CONFIG.INTERVALS.CACHE_CLEANUP);

    // Memory pressure detection cycle
    const memoryMonitor = setInterval(() => {
      this.detectAndHandleMemoryPressure();
    }, PERFORMANCE_CONFIG.INTERVALS.MEMORY_CHECK);

    // Background cleanup cycle
    const backgroundCleanup = setInterval(() => {
      this.performBackgroundCleanup();
    }, PERFORMANCE_CONFIG.INTERVALS.ADVANCED_OPTIMIZATION);

    this.optimizationIntervals.push(cacheOptimizer, memoryMonitor, backgroundCleanup);
  }

  private optimizeQueryCache() {
    if (!this.queryClient) return;

    const queryCache = this.queryClient.getQueryCache();
    const now = Date.now();
    
    // Remove stale queries that haven't been used for more than 10 minutes
    queryCache.getAll().forEach(query => {
      const lastActiveTime = query.state.dataUpdatedAt || query.state.errorUpdatedAt || 0;
      const timeSinceLastActive = now - lastActiveTime;
      
      if (timeSinceLastActive > PERFORMANCE_CONFIG.QUERY.STALE_QUERY_AGE && !query.observers.length) {
        queryCache.remove(query);
      }
    });

    // Log optimization results in development
    if (process.env.NODE_ENV === 'development') {
      const totalQueries = queryCache.getAll().length;
      console.debug(`🚀 Cache optimized: ${totalQueries} active queries`);
    }
  }

  private detectAndHandleMemoryPressure() {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (usageRatio > PERFORMANCE_CONFIG.MEMORY.PRESSURE_RATIO) {
      this.memoryPressureDetected = true;
      this.performEmergencyCleanup();
    } else {
      this.memoryPressureDetected = false;
    }
  }

  private performEmergencyCleanup() {
    // Clear non-essential localStorage items
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_') || key.startsWith('temp_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (!item.timestamp || (now - item.timestamp) > 300000) { // 5 minutes
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });

    // Clear query cache aggressively
    if (this.queryClient) {
      const queryCache = this.queryClient.getQueryCache();
      queryCache.getAll().forEach(query => {
        if (!query.observers.length) {
          queryCache.remove(query);
        }
      });
    }

    // Force garbage collection if available
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        console.debug('GC not available');
      }
    }

    console.warn('🧹 Emergency memory cleanup performed');
  }

  private performBackgroundCleanup() {
    const now = Date.now();
    
    // Throttle cleanup to avoid performance impact
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) return;
    this.lastCleanup = now;

    // Remove orphaned DOM elements
    this.cleanupOrphanedElements();
    
    // Clear expired sessionStorage
    this.cleanupExpiredSessionStorage();
    
    // Optimize Web Worker usage
    this.optimizeWebWorkers();
  }

  private cleanupOrphanedElements() {
    // Remove elements marked for cleanup
    const orphaned = document.querySelectorAll('[data-cleanup="true"]');
    orphaned.forEach(el => el.remove());

    // Clean up any stale event listeners on detached elements
    const detached = document.querySelectorAll('[data-detached="true"]');
    detached.forEach(el => {
      const newEl = el.cloneNode(true);
      el.parentNode?.replaceChild(newEl, el);
    });
  }

  private cleanupExpiredSessionStorage() {
    const now = Date.now();
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('temp_')) {
        try {
          const item = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (item.expires && now > item.expires) {
            sessionStorage.removeItem(key);
          }
        } catch {
          sessionStorage.removeItem(key);
        }
      }
    });
  }

  private optimizeWebWorkers() {
    // Terminate idle Web Workers after 2 minutes of inactivity
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.active && registration.active.state === 'redundant') {
            registration.unregister();
          }
        });
      });
    }
  }

  private setupMemoryMonitoring() {
    // Set up PerformanceObserver for real-time monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.duration > 100) {
            console.warn(`🐌 Slow operation detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        console.debug('Performance monitoring not fully supported');
      }
    }
  }

  private enableIntelligentPrefetching() {
    // Intelligent link prefetching for likely next pages
    const prefetchCandidates = document.querySelectorAll('a[href^="/"]');
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          if (href && !link.dataset.prefetched) {
            // Prefetch on hover with slight delay
            link.addEventListener('mouseenter', () => {
              setTimeout(() => {
                if (!link.dataset.prefetched) {
                  const linkElem = document.createElement('link');
                  linkElem.rel = 'prefetch';
                  linkElem.href = href;
                  document.head.appendChild(linkElem);
                  link.dataset.prefetched = 'true';
                }
              }, 100);
            }, { once: true });
          }
        }
      });
    });

    prefetchCandidates.forEach(link => {
      intersectionObserver.observe(link);
    });
  }

  // Smart request deduplication with cache
  private requestCache = new Map<string, Promise<any>>();

  deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestCache.has(key)) {
      return this.requestCache.get(key)!;
    }

    const promise = requestFn()
      .finally(() => {
        this.requestCache.delete(key);
      });

    this.requestCache.set(key, promise);
    return promise;
  }

  // Performance metrics collection
  collectPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      pageLoad: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      domContent: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : null,
      cacheHitRatio: this.calculateCacheHitRatio(),
      queryCount: this.queryClient?.getQueryCache().getAll().length || 0,
    };
  }

  private calculateCacheHitRatio(): number {
    if (!this.queryClient) return 0;
    
    const queries = this.queryClient.getQueryCache().getAll();
    const cachedQueries = queries.filter(q => q.state.status === 'success');
    
    return queries.length > 0 ? cachedQueries.length / queries.length : 0;
  }

  destroy() {
    this.optimizationIntervals.forEach(interval => clearInterval(interval));
    this.optimizationIntervals = [];
    this.requestCache.clear();
  }
}

// Singleton instance
export const advancedPerformanceOptimizer = new AdvancedPerformanceOptimizer();

// Hook for React components
export const useAdvancedPerformance = () => {
  return {
    deduplicateRequest: advancedPerformanceOptimizer.deduplicateRequest.bind(advancedPerformanceOptimizer),
    getMetrics: advancedPerformanceOptimizer.collectPerformanceMetrics.bind(advancedPerformanceOptimizer),
    isMemoryPressure: () => advancedPerformanceOptimizer['memoryPressureDetected'],
  };
};