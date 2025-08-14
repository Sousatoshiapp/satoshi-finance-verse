// PHASE 2: Network Request Optimization
// Advanced request caching, batching, and optimization

interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  priority: 'high' | 'normal' | 'low';
  timeout?: number;
  retries?: number;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
}

class NetworkOptimizer {
  private requestCache = new Map<string, CachedResponse>();
  private pendingRequests = new Map<string, Promise<any>>();
  private requestBatches = new Map<string, RequestConfig[]>();
  private readonly BATCH_DELAY = 50; // 50ms batch window
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;

  // Request deduplication and caching
  async optimizedFetch<T = any>(config: RequestConfig): Promise<T> {
    const cacheKey = this.generateCacheKey(config);
    
    // Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      return cached.data;
    }

    // Check for pending identical request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create new request with optimizations
    const requestPromise = this.executeOptimizedRequest(config, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result as T;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async executeOptimizedRequest<T>(config: RequestConfig, cacheKey: string): Promise<T> {
    const { url, method = 'GET', headers = {}, body, timeout = 10000, retries = this.MAX_RETRIES } = config;

    // Add optimization headers
    const optimizedHeaders = {
      ...headers,
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Add conditional headers if cached version exists
    const cached = this.requestCache.get(cacheKey);
    if (cached && method === 'GET') {
      if (cached.etag) {
        optimizedHeaders['If-None-Match'] = cached.etag;
      }
      if (cached.lastModified) {
        optimizedHeaders['If-Modified-Since'] = cached.lastModified;
      }
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: optimizedHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          // Enable browser caching optimizations
          cache: 'default',
          credentials: 'same-origin'
        });

        clearTimeout(timeoutId);

        // Handle 304 Not Modified
        if (response.status === 304 && cached) {
          // Update timestamp on cached entry
          cached.timestamp = Date.now();
          return cached.data;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache successful responses
        if (method === 'GET') {
          this.cacheResponse(cacheKey, data, response);
        }

        return data as T;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error && 
            (error.name === 'AbortError' || 
             error.message.includes('404') || 
             error.message.includes('401'))) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private generateCacheKey(config: RequestConfig): string {
    const { url, method, body } = config;
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyHash}`;
  }

  private getCachedResponse(cacheKey: string): CachedResponse | null {
    const cached = this.requestCache.get(cacheKey);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.requestCache.delete(cacheKey);
      return null;
    }
    
    return cached;
  }

  private cacheResponse(cacheKey: string, data: any, response: Response) {
    const ttl = this.parseCacheControl(response.headers.get('cache-control')) || this.DEFAULT_TTL;
    
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
      etag: response.headers.get('etag') || undefined,
      lastModified: response.headers.get('last-modified') || undefined
    });

    // Cleanup old entries periodically
    if (this.requestCache.size > 100) {
      this.cleanupCache();
    }
  }

  private parseCacheControl(cacheControl: string | null): number | null {
    if (!cacheControl) return null;
    
    const maxAge = cacheControl.match(/max-age=(\d+)/);
    return maxAge ? parseInt(maxAge[1]) * 1000 : null;
  }

  private cleanupCache() {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, cached] of this.requestCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.requestCache.delete(key));
  }

  // Request batching for multiple similar requests
  async batchRequests<T = any>(configs: RequestConfig[], batchKey: string): Promise<T[]> {
    return new Promise((resolve) => {
      // Add configs to batch
      if (!this.requestBatches.has(batchKey)) {
        this.requestBatches.set(batchKey, []);
      }
      
      this.requestBatches.get(batchKey)!.push(...configs);
      
      // Process batch after delay
      setTimeout(async () => {
        const batch = this.requestBatches.get(batchKey);
        if (!batch) return;
        
        this.requestBatches.delete(batchKey);
        
        // Execute all requests in parallel
        const results = await Promise.allSettled(
          batch.map(config => this.optimizedFetch(config))
        );
        
        const successfulResults = results
          .filter((result): result is PromiseFulfilledResult<T> => result.status === 'fulfilled')
          .map(result => result.value);
        
        resolve(successfulResults);
      }, this.BATCH_DELAY);
    });
  }

  // Priority-based request queue
  private requestQueue: Array<{config: RequestConfig, resolve: Function, reject: Function}> = [];
  private isProcessingQueue = false;

  async queueRequest<T = any>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ config, resolve, reject });
      this.requestQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.config.priority] - priorityOrder[a.config.priority];
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    // Process high priority requests first, then normal, then low
    const concurrent = {
      high: 6,   // Allow more concurrent high priority requests
      normal: 4, // Normal concurrency for regular requests
      low: 2     // Limit low priority requests
    };
    
    while (this.requestQueue.length > 0) {
      const currentBatch: Array<{config: RequestConfig, resolve: Function, reject: Function}> = [];
      const priorityCounts = { high: 0, normal: 0, low: 0 };
      
      // Select requests for current batch based on priority limits
      for (let i = 0; i < this.requestQueue.length; i++) {
        const item = this.requestQueue[i];
        const priority = item.config.priority;
        
        if (priorityCounts[priority] < concurrent[priority]) {
          currentBatch.push(item);
          priorityCounts[priority]++;
          this.requestQueue.splice(i, 1);
          i--;
          
          if (currentBatch.length >= 8) break; // Max 8 concurrent requests
        }
      }
      
      if (currentBatch.length === 0) break;
      
      // Execute batch
      await Promise.allSettled(
        currentBatch.map(async ({ config, resolve, reject }) => {
          try {
            const result = await this.optimizedFetch(config);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      );
    }
    
    this.isProcessingQueue = false;
  }

  // Preconnect to domains for faster subsequent requests
  preconnectToDomains(domains: string[]) {
    domains.forEach(domain => {
      // Create preconnect link
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Also create DNS prefetch as fallback
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);
    });
  }

  // Clear cache and reset
  clearCache() {
    this.requestCache.clear();
    this.pendingRequests.clear();
    this.requestBatches.clear();
    this.requestQueue = [];
  }

  // Get performance statistics
  getStats() {
    return {
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      queueSize: this.requestQueue.length,
      cacheHitRatio: this.calculateCacheHitRatio()
    };
  }

  private calculateCacheHitRatio(): number {
    // This would need to be tracked during actual usage
    return 0.0; // Placeholder
  }
}

// Singleton instance
export const networkOptimizer = new NetworkOptimizer();

// Convenience functions for common operations
export const optimizedGet = <T = any>(url: string, options: Partial<RequestConfig> = {}): Promise<T> => {
  return networkOptimizer.optimizedFetch({
    url,
    method: 'GET',
    priority: 'normal',
    ...options
  });
};

export const optimizedPost = <T = any>(url: string, data: any, options: Partial<RequestConfig> = {}): Promise<T> => {
  return networkOptimizer.optimizedFetch({
    url,
    method: 'POST',
    body: data,
    priority: 'normal',
    ...options
  });
};

// React hook for network optimization
export const useNetworkOptimization = () => {
  return {
    fetch: networkOptimizer.optimizedFetch.bind(networkOptimizer),
    get: optimizedGet,
    post: optimizedPost,
    queue: networkOptimizer.queueRequest.bind(networkOptimizer),
    batch: networkOptimizer.batchRequests.bind(networkOptimizer),
    getStats: networkOptimizer.getStats.bind(networkOptimizer),
    preconnect: networkOptimizer.preconnectToDomains.bind(networkOptimizer)
  };
};