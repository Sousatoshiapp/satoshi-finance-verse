import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createSmartInvalidator } from '@/utils/query-keys';
import { usePerformanceMonitoring, useMemoryOptimization } from './use-performance-monitoring';

interface PerformanceConfig {
  memoryOptimizationInterval?: number;
  enableBundleAnalysis?: boolean;
  enableQueryOptimization?: boolean;
  enableMemoryMonitoring?: boolean;
}

export const usePerformanceOptimization = (config: PerformanceConfig = {}) => {
  const {
    memoryOptimizationInterval = 45000, // Reduced from 60s to 45s
    enableBundleAnalysis = false,
    enableQueryOptimization = true,
    enableMemoryMonitoring = true,
  } = config;

  const queryClient = useQueryClient();
  const smartInvalidator = createSmartInvalidator(queryClient);
  
  // Use existing performance monitoring hooks
  usePerformanceMonitoring();
  useMemoryOptimization(memoryOptimizationInterval);

  // Enhanced query cache management
  useEffect(() => {
    if (!enableQueryOptimization) return;

    const optimizeQueries = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Remove stale queries older than 10 minutes
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      
      queries.forEach(query => {
        const lastFetched = query.state.dataUpdatedAt;
        if (lastFetched && lastFetched < tenMinutesAgo && query.getObserversCount() === 0) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
      
      // Log cache statistics
      if (import.meta.env.DEV) {
        console.debug('Query cache optimized:', {
          totalQueries: queries.length,
          activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
          staleQueries: queries.filter(q => q.isStale()).length,
        });
      }
    };

    const interval = setInterval(optimizeQueries, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [queryClient, enableQueryOptimization]);

  // Bundle analysis for development
  useEffect(() => {
    if (!enableBundleAnalysis || !import.meta.env.DEV) return;

    const analyzePerformance = () => {
      if ('performance' in window) {
        const entries = performance.getEntriesByType('resource');
        const jsFiles = entries.filter(entry => entry.name.includes('.js'));
        const cssFiles = entries.filter(entry => entry.name.includes('.css'));
        
        console.group('🚀 Bundle Analysis');
        console.log('📦 JavaScript files:', jsFiles.length);
        console.log('🎨 CSS files:', cssFiles.length);
        console.log('⚡ Total resources:', entries.length);
        
        // Analyze slow loading resources
        const slowResources = entries.filter(entry => entry.duration > 1000);
        if (slowResources.length > 0) {
          console.warn('🐌 Slow loading resources:', slowResources);
        }
        
        console.groupEnd();
      }
    };

    // Run analysis after initial load
    setTimeout(analyzePerformance, 3000);
  }, [enableBundleAnalysis]);

  // Performance metrics tracking
  const trackPerformanceMetric = useCallback((name: string, value: number, unit = 'ms') => {
    if (import.meta.env.DEV) {
      console.debug(`📊 Performance: ${name} = ${value}${unit}`);
    }
    
    // You could send this to an analytics service
    // analytics.track('performance_metric', { name, value, unit });
  }, []);

  // Enhanced cache invalidation
  const optimizedInvalidate = useCallback((action: string, context: Record<string, any> = {}) => {
    smartInvalidator.invalidateByAction(action, context);
    trackPerformanceMetric('cache_invalidation', performance.now());
  }, [smartInvalidator, trackPerformanceMetric]);

  // Memory pressure detection
  const detectMemoryPressure = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const pressureRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (pressureRatio > 0.9) {
        console.warn('🚨 High memory pressure detected:', `${(pressureRatio * 100).toFixed(1)}%`);
        
        // Emergency cache clearing
        queryClient.getQueryCache().clear();
        
        // Trigger garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        
        return true;
      }
    }
    return false;
  }, [queryClient]);

  // Component cleanup optimization
  const optimizeComponentCleanup = useCallback(() => {
    // Remove unused DOM nodes
    const unusedNodes = document.querySelectorAll('[data-cleanup="true"]');
    unusedNodes.forEach(node => node.remove());
    
    // Clear event listeners on unused elements
    const elements = document.querySelectorAll('[data-listeners]');
    elements.forEach(element => {
      if (!element.isConnected) {
        // Element is detached, clear any remaining listeners
        element.removeEventListener?.('*', () => {});
      }
    });
  }, []);

  return {
    trackPerformanceMetric,
    optimizedInvalidate,
    detectMemoryPressure,
    optimizeComponentCleanup,
    smartInvalidator,
  };
};