// Performance monitoring and background task management

import { supabase } from "@/integrations/supabase/client";

// Cache management
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const cacheManager = {
  set: (key: string, data: any, ttlMs: number = 5 * 60 * 1000) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  },

  get: (key: string) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  },

  clear: () => {
    cache.clear();
  },

  size: () => cache.size
};

// Background task scheduler
class BackgroundTaskScheduler {
  private tasks: Map<string, { fn: () => Promise<void>; interval: number; lastRun: number }> = new Map();
  private running = false;

  addTask(name: string, fn: () => Promise<void>, intervalMs: number) {
    this.tasks.set(name, {
      fn,
      interval: intervalMs,
      lastRun: 0
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.scheduleNext();
  }

  stop() {
    this.running = false;
  }

  private async scheduleNext() {
    if (!this.running) return;

    const now = Date.now();
    
    for (const [name, task] of this.tasks) {
      if (now - task.lastRun >= task.interval) {
        try {
          await task.fn();
          task.lastRun = now;
          console.debug(`Background task ${name} completed`);
        } catch (error) {
          console.warn(`Background task ${name} failed:`, error);
        }
      }
    }

    // Schedule next check
    setTimeout(() => this.scheduleNext(), 30000); // Check every 30 seconds
  }
}

export const backgroundScheduler = new BackgroundTaskScheduler();

// Performance monitoring
export const performanceMonitor = {
  // Monitor query performance
  async trackQuery(queryName: string, queryFn: () => Promise<any>) {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Query failed: ${queryName} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Database health check
  async checkDatabaseHealth() {
    try {
      const { data } = await supabase.functions.invoke('background-optimization', {
        body: { action: 'cache_warming' }
      });
      return { healthy: true, data };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { healthy: false, error: error.message };
    }
  },

  // Run database maintenance
  async runMaintenance() {
    try {
      await supabase.functions.invoke('background-optimization', {
        body: { action: 'vacuum_analyze' }
      });
      console.log('Database maintenance completed');
    } catch (error) {
      console.error('Database maintenance failed:', error);
    }
  }
};

// Component performance tracking
export const trackComponentPerformance = (componentName: string, renderTime: number) => {
  // Store performance metrics
  const performanceKey = `perf_${componentName}`;
  const metrics = cacheManager.get(performanceKey) || [];
  
  metrics.push({
    timestamp: Date.now(),
    renderTime,
    memory: (performance as any).memory?.usedJSHeapSize || 0
  });
  
  // Keep only last 10 measurements
  if (metrics.length > 10) {
    metrics.splice(0, metrics.length - 10);
  }
  
  cacheManager.set(performanceKey, metrics, 10 * 60 * 1000); // 10 minutes
  
  // Log slow renders
  if (renderTime > 50) {
    console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
  }
};

// Frontend optimization utilities
export const frontendOptimizations = {
  // Preload critical resources
  preloadImages: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Optimize scroll performance
  optimizeScrollHandlers: () => {
    let ticking = false;
    
    return (callback: () => void) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  },

  // Memory cleanup for React components
  cleanupComponentMemory: () => {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cache.delete(key);
      }
    }
  }
};

// Initialize background tasks
export const initializePerformanceOptimizations = () => {
  // Cache warming task - every 10 minutes
  backgroundScheduler.addTask('cache-warming', async () => {
    await supabase.functions.invoke('background-optimization', {
      body: { action: 'cache_warming' }
    });
  }, 10 * 60 * 1000);

  // Bot activity updates - every 5 minutes
  backgroundScheduler.addTask('bot-activities', async () => {
    await supabase.functions.invoke('background-optimization', {
      body: { action: 'update_bot_activities' }
    });
  }, 5 * 60 * 1000);

  // Data cleanup - every hour
  backgroundScheduler.addTask('data-cleanup', async () => {
    await supabase.functions.invoke('background-optimization', {
      body: { action: 'cleanup_old_data' }
    });
  }, 60 * 60 * 1000);

  // Memory cleanup - every 15 minutes
  backgroundScheduler.addTask('memory-cleanup', async () => {
    // Clear old cache entries
    const maxCacheSize = 100;
    if (cacheManager.size() > maxCacheSize) {
      cacheManager.clear();
    }
    
    // Frontend specific cleanup
    frontendOptimizations.cleanupComponentMemory();
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }, 15 * 60 * 1000);

  // Frontend performance monitoring - every 5 minutes
  backgroundScheduler.addTask('frontend-performance', async () => {
    // Monitor memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1048576; // MB
      
      if (memoryUsage > 150) { // Over 150MB
        console.warn('High memory usage detected:', memoryUsage, 'MB');
        frontendOptimizations.cleanupComponentMemory();
      }
    }
    
    // Check for slow components
    const performanceEntries = performance.getEntriesByType('measure');
    const slowMeasures = performanceEntries.filter(entry => entry.duration > 100);
    
    if (slowMeasures.length > 0) {
      console.warn('Slow performance measures detected:', slowMeasures);
    }
  }, 5 * 60 * 1000);

  backgroundScheduler.start();
  console.log('Performance optimization tasks initialized');
};

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export const deduplicateRequest = async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};