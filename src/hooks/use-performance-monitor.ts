import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalMountTime = unmountTime - mountTime.current;
      
      // Log component lifecycle performance
      if (totalMountTime > 100) { // Log if component was mounted for more than 100ms
        console.debug(`${componentName} lifecycle: ${totalMountTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Log slow renders
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      renderStartTime.current = 0;
      return renderTime;
    }
    return 0;
  }, [componentName]);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  return {
    startRender,
    endRender,
    measureMemory
  };
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName: string) => {
  const { startRender, endRender } = usePerformanceMonitor(componentName);
  
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });
};