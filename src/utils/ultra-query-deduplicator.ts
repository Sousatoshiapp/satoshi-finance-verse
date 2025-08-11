interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  priority: 'critical' | 'normal' | 'low';
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  priority: 'critical' | 'normal' | 'low';
  maxSize: number;
}

class UltraQueryDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private requestCounts = new Map<string, number>();
  private maxPendingRequests = 5; // Ultra-aggressive limit
  
  // Different TTLs based on data type
  private cacheConfigs: Record<string, CacheConfig> = {
    // Critical data - shorter TTL for accuracy
    'user-profile': { ttl: 30000, priority: 'critical', maxSize: 10 },
    'user-stats': { ttl: 30000, priority: 'critical', maxSize: 10 },
    'dashboard-data': { ttl: 120000, priority: 'critical', maxSize: 5 },
    
    // Normal data
    'leaderboard': { ttl: 180000, priority: 'normal', maxSize: 3 },
    'missions': { ttl: 300000, priority: 'normal', maxSize: 5 },
    'achievements': { ttl: 600000, priority: 'normal', maxSize: 10 },
    
    // Low priority data
    'messages': { ttl: 60000, priority: 'low', maxSize: 20 },
    'notifications': { ttl: 120000, priority: 'low', maxSize: 15 },
    'store-items': { ttl: 1800000, priority: 'low', maxSize: 5 } // 30 minutes
  };

  constructor() {
    this.startCleanupCycle();
    this.setupMemoryPressureHandling();
  }

  async deduplicateRequest<T>(
    key: string, 
    requestFn: () => Promise<T>,
    options: { 
      priority?: 'critical' | 'normal' | 'low';
      useCache?: boolean;
      forceFresh?: boolean;
    } = {}
  ): Promise<T> {
    const { priority = 'normal', useCache = true, forceFresh = false } = options;
    
    // Check cache first (unless forced fresh)
    if (useCache && !forceFresh) {
      const cached = this.getFromCache<T>(key);
      if (cached) {
        return cached;
      }
    }

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest && !forceFresh) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return pendingRequest.promise;
    }

    // Check pending request limits
    if (this.pendingRequests.size >= this.maxPendingRequests) {
      this.cleanupLowPriorityRequests();
    }

    // Track request frequency
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

    // Create new request
    const promise = this.executeRequest(key, requestFn, priority);
    
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
      priority
    });

    try {
      const result = await promise;
      
      // Cache result based on config
      if (useCache) {
        this.addToCache(key, result);
      }
      
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async executeRequest<T>(
    key: string, 
    requestFn: () => Promise<T>,
    priority: 'critical' | 'normal' | 'low'
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await requestFn();
      const duration = performance.now() - startTime;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`🐌 Slow request (${duration.toFixed(0)}ms): ${key}`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Request failed: ${key}`, error);
      throw error;
    }
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`💾 Cache hit: ${key}`);
    return cached.data;
  }

  private addToCache(key: string, data: any): void {
    const config = this.getCacheConfig(key);
    
    // Check cache size limits
    this.enforceCacheLimit(config.maxSize);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: config.ttl
    });
  }

  private getCacheConfig(key: string): CacheConfig {
    // Find matching config based on key prefix
    for (const [prefix, config] of Object.entries(this.cacheConfigs)) {
      if (key.includes(prefix)) {
        return config;
      }
    }
    
    // Default config
    return { ttl: 300000, priority: 'normal', maxSize: 10 };
  }

  private enforceCacheLimit(maxSize: number): void {
    if (this.cache.size >= maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = Math.ceil(maxSize * 0.3); // Remove 30% of cache
      for (let i = 0; i < toRemove && entries[i]; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  private cleanupLowPriorityRequests(): void {
    const lowPriorityKeys = Array.from(this.pendingRequests.entries())
      .filter(([, request]) => request.priority === 'low')
      .map(([key]) => key);
    
    // Cancel low priority requests
    lowPriorityKeys.forEach(key => {
      this.pendingRequests.delete(key);
    });
    
    console.log(`🧹 Cleaned up ${lowPriorityKeys.length} low priority requests`);
  }

  private startCleanupCycle(): void {
    // Ultra-aggressive cleanup every 30 seconds
    setInterval(() => {
      this.performCleanup();
    }, 30000);
  }

  private setupMemoryPressureHandling(): void {
    // Monitor memory and adjust caching behavior
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (memoryPressure > 0.75) {
          this.emergencyCleanup();
        } else if (memoryPressure > 0.60) {
          this.aggressiveCleanup();
        }
      }
    }, 10000);
  }

  private performCleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean expired cache entries
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    // Clean old pending requests (> 30 seconds)
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > 30000) {
        this.pendingRequests.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired entries`);
    }
  }

  private aggressiveCleanup(): void {
    console.warn('⚠️ Aggressive cache cleanup due to memory pressure');
    
    // Keep only critical cache entries
    const criticalEntries = Array.from(this.cache.entries())
      .filter(([key]) => this.getCacheConfig(key).priority === 'critical');
    
    this.cache.clear();
    criticalEntries.forEach(([key, value]) => {
      this.cache.set(key, value);
    });
  }

  private emergencyCleanup(): void {
    console.error('🚨 Emergency cache cleanup - clearing all cache');
    this.cache.clear();
    this.pendingRequests.clear();
    this.requestCounts.clear();
  }

  // Background refresh for critical data
  backgroundRefresh(key: string, requestFn: () => Promise<any>): void {
    const config = this.getCacheConfig(key);
    
    if (config.priority === 'critical') {
      // Refresh in background before TTL expires
      setTimeout(() => {
        this.deduplicateRequest(key, requestFn, { priority: 'critical', forceFresh: true });
      }, config.ttl * 0.8); // Refresh at 80% of TTL
    }
  }

  // Analytics and monitoring
  getStats(): {
    pendingRequests: number;
    cacheSize: number;
    hitRate: number;
    topRequests: Array<[string, number]>;
  } {
    const totalRequests = Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0);
    const cacheHits = Array.from(this.cache.values()).length;
    
    return {
      pendingRequests: this.pendingRequests.size,
      cacheSize: this.cache.size,
      hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      topRequests: Array.from(this.requestCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    };
  }

  // Clear specific cache entries
  invalidateCache(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
  }
}

export const ultraQueryDeduplicator = new UltraQueryDeduplicator();

// Hook for easy integration with React Query
export const useUltraQuery = () => {
  const deduplicateRequest = <T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: {
      priority?: 'critical' | 'normal' | 'low';
      useCache?: boolean;
      forceFresh?: boolean;
    }
  ) => ultraQueryDeduplicator.deduplicateRequest(key, requestFn, options);

  const invalidateCache = (pattern: string) => 
    ultraQueryDeduplicator.invalidateCache(pattern);

  const getStats = () => ultraQueryDeduplicator.getStats();

  return {
    deduplicateRequest,
    invalidateCache,
    getStats
  };
};
