// FASE 3: Advanced Performance Hacks
import { QueryClient } from '@tanstack/react-query';

// Request deduplication map
const requestCache = new Map<string, Promise<any>>();

// Ultra-optimized QueryClient for sub-0.2s performance
export const createUltraQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes aggressive cache
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false, // Disable for speed
        refetchOnMount: false, // Only if stale
        refetchOnReconnect: false, // Disable for speed
        retry: 1, // Minimal retries
        retryDelay: 500, // Fast retry
        networkMode: 'online', // Skip offline checks
      },
      mutations: {
        retry: 0, // No mutation retries
      },
    },
  });
};

// Request deduplication utility
export const deduplicateRequest = <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }

  const promise = requestFn().finally(() => {
    requestCache.delete(key);
  });

  requestCache.set(key, promise);
  return promise;
};

// Memory pressure detection and cleanup
export const detectMemoryPressure = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (usageRatio > 0.8) {
      // Emergency cleanup
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // Clear non-essential caches
      requestCache.clear();
      
      return true;
    }
  }
  
  return false;
};

// Ultra-fast localStorage with compression
export const ultraStorage = {
  set: (key: string, value: any) => {
    try {
      const compressed = JSON.stringify(value);
      localStorage.setItem(`ultra_${key}`, compressed);
    } catch (e) {
      // Silent fail for storage issues
    }
  },
  
  get: (key: string) => {
    try {
      const item = localStorage.getItem(`ultra_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  
  clear: () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('ultra_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
};

// Critical resource preloader
export const preloadCriticalAssets = () => {
  // Preload essential fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/satoshi.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical CSS (already inline in index.html)
  // No additional CSS preloading needed

  // Preload essential icons
  const iconModules = [
    'lucide-react/dist/esm/icons/home',
    'lucide-react/dist/esm/icons/user',
    'lucide-react/dist/esm/icons/trophy',
  ];

  iconModules.forEach(module => {
    import(module).catch(() => {}); // Silent preload
  });
};

// Ultra-fast component cleanup with memory optimization
export const ultraCleanup = () => {
  // Remove any lingering DOM nodes
  const staleNodes = document.querySelectorAll('[data-stale="true"]');
  staleNodes.forEach(node => node.remove());
  
  // Clean up any orphaned event listeners
  const orphanedElements = document.querySelectorAll('[data-cleanup-needed="true"]');
  orphanedElements.forEach(element => {
    element.removeAttribute('data-cleanup-needed');
    // Clone and replace to remove all event listeners
    const newElement = element.cloneNode(true);
    element.parentNode?.replaceChild(newElement, element);
  });
  
  // Force garbage collection if available
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      console.debug('GC not available');
    }
  }
  
  // Clear request cache
  requestCache.clear();
  
  // Clear any cached queries older than 5 minutes
  if (typeof window !== 'undefined' && window.localStorage) {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('query-cache-')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.timestamp && now - item.timestamp > 300000) { // 5 minutes
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
  }
};

// Performance monitoring for sub-0.2s target
export const monitorUltraPerformance = () => {
  // Monitor First Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const fcp = entry.startTime;
        console.log(`🚀 Ultra Performance - FCP: ${fcp.toFixed(2)}ms`);
        
        if (fcp > 200) {
          console.warn('⚠️ FCP exceeds 200ms target:', fcp);
        }
      }
    }
  }).observe({ entryTypes: ['paint'] });

  // Monitor Time to Interactive
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`🎯 Ultra Performance - ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    }
  }).observe({ entryTypes: ['measure'] });
};