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
    
    if (memoryUsage > 100) { // Over 100MB
      console.warn('High memory usage detected:', memoryUsage, 'MB');
      // Trigger garbage collection hints
      if ('gc' in window) {
        (window as any).gc();
      }
    }
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