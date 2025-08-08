// Bundle optimization utilities

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/src/index.css';
  document.head.appendChild(criticalCSS);

  // Preload critical fonts if any
  const font = document.createElement('link');
  font.rel = 'preload';
  font.as = 'font';
  font.type = 'font/woff2';
  font.crossOrigin = 'anonymous';
  // Add font URL when available
};

// Dynamic import wrapper with error handling
export const lazyLoad = <T>(importFn: () => Promise<T>) => {
  return importFn().catch((error) => {
    console.warn('Lazy load failed:', error);
    // Return a default or retry
    return importFn();
  });
};

// Resource cleanup for unused modules
export const cleanupUnusedModules = () => {
  // This would clean up modules that are no longer needed
  if (typeof window !== 'undefined' && 'webpackChunkName' in window) {
    // Webpack specific cleanup
    // Implement based on your build tool
  }
};

// Image optimization
export const optimizeImage = (src: string, quality = 75): string => {
  // For production, this could integrate with image optimization services
  if (src.includes('lovable-uploads') || src.includes('unsplash')) {
    return `${src}?q=${quality}&auto=format&fit=crop`;
  }
  return src;
};

// Memory management for large data
export const optimizeMemoryUsage = () => {
  // Clear large objects from memory when not needed
  const memory = (performance as any).memory;
  
  if (memory?.usedJSHeapSize) {
    const memoryUsage = memory.usedJSHeapSize / 1048576; // MB
    
    // Only warn if memory usage is extremely high to reduce console spam
    if (memoryUsage > 100) { // Reduced threshold to 100MB for earlier detection
      console.warn('High memory usage detected:', memoryUsage, 'MB');
      
      // Try to garbage collect only if really necessary
      if (memoryUsage > 120 && 'gc' in window) {
        (window as any).gc();
      }
    }
  }
};

export const advancedMemoryOptimization = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const memory = (performance as any).memory;
    if (memory) {
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (memoryUsage > 0.8) {
        if ('gc' in window) {
          (window as any).gc();
        }
        
        // Clear React Query cache if available
        if ((window as any).queryClient) {
          (window as any).queryClient.getQueryCache().clear();
        }
        
        const unusedNodes = document.querySelectorAll('[data-unused="true"]');
        unusedNodes.forEach(node => node.remove());
        
        const virtualLists = document.querySelectorAll('[data-virtual-list="true"]');
        virtualLists.forEach(list => {
          const items = list.querySelectorAll('[data-virtual-item="true"]');
          items.forEach((item, index) => {
            if (index > 100) {
              item.remove();
            }
          });
        });
      }
      
      console.log(`Memory usage: ${(memoryUsage * 100).toFixed(2)}%`);
    }
  }
};

// Performance monitoring and optimization
export const monitorPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance measure: ${entry.name} took ${entry.duration}ms`);
        }
        
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log(`Page load time: ${navEntry.loadEventEnd - navEntry.startTime}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    setTimeout(() => {
      observer.disconnect();
    }, 30000);
  }
};

// Bundle analyzer helper (development only)
export const analyzeBundle = () => {
  if (import.meta.env.DEV) {
    // Simple bundle analysis without external dependency
    const scripts = document.querySelectorAll('script[src]');
    console.log('Loaded scripts:', scripts.length);
    
    // Log performance metrics
    if (window.performance?.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      console.log('JS resources loaded:', jsResources.length);
    }
  }
};
