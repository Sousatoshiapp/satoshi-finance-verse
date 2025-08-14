// PHASE 2: Intelligent Bundle Optimization
// Advanced code splitting and lazy loading strategies

interface ModuleMetrics {
  name: string;
  size: number;
  loadTime: number;
  usage: number;
  priority: 'critical' | 'normal' | 'low';
}

class IntelligentBundler {
  private moduleMetrics = new Map<string, ModuleMetrics>();
  private loadingPromises = new Map<string, Promise<any>>();
  private readonly USAGE_THRESHOLD = 0.3; // 30% usage threshold for optimization

  // Smart dynamic import with caching and error handling
  async importModule<T = any>(
    moduleName: string, 
    importFn: () => Promise<T>,
    priority: 'critical' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    const startTime = performance.now();
    
    // Return existing promise if already loading
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName)!;
    }

    // Create loading promise with metrics tracking
    const loadingPromise = importFn()
      .then(module => {
        const loadTime = performance.now() - startTime;
        this.updateModuleMetrics(moduleName, loadTime, priority);
        return module;
      })
      .catch(error => {
        console.error(`Failed to load module ${moduleName}:`, error);
        // Return a fallback or retry logic
        throw error;
      })
      .finally(() => {
        this.loadingPromises.delete(moduleName);
      });

    this.loadingPromises.set(moduleName, loadingPromise);
    return loadingPromise;
  }

  private updateModuleMetrics(name: string, loadTime: number, priority: 'critical' | 'normal' | 'low') {
    const existing = this.moduleMetrics.get(name);
    
    this.moduleMetrics.set(name, {
      name,
      size: 0, // Would be populated by build analysis
      loadTime,
      usage: existing ? existing.usage + 1 : 1,
      priority
    });
  }

  // Preload critical modules based on usage patterns
  async preloadCriticalModules() {
    const criticalModules = Array.from(this.moduleMetrics.values())
      .filter(m => m.priority === 'critical' || m.usage > this.USAGE_THRESHOLD)
      .sort((a, b) => b.usage - a.usage);

    // Preload top 3 most used modules
    const topModules = criticalModules.slice(0, 3);
    
    for (const module of topModules) {
      try {
        // Use link rel="modulepreload" for better browser optimization
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = `/src/components/${module.name}`;
        document.head.appendChild(link);
      } catch (error) {
        console.debug(`Could not preload ${module.name}:`, error);
      }
    }
  }

  // Lazy load components with Intersection Observer
  createLazyComponent<T = any>(
    componentName: string,
    importFn: () => Promise<{ default: T }>,
    options: IntersectionObserverInit = {}
  ) {
    let componentPromise: Promise<{ default: T }> | null = null;
    
    return {
      load: () => {
        if (!componentPromise) {
          componentPromise = this.importModule(componentName, importFn, 'normal');
        }
        return componentPromise;
      },
      
      // Create an intersection observer for viewport-based loading
      createViewportLoader: (threshold = 0.1) => {
        return new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !componentPromise) {
                this.importModule(componentName, importFn, 'normal');
              }
            });
          },
          { threshold, ...options }
        );
      }
    };
  }

  // Optimize icon loading with sprite sheets
  private loadedIcons = new Set<string>();
  
  async loadIcon(iconName: string): Promise<void> {
    if (this.loadedIcons.has(iconName)) return;

    try {
      // Use dynamic import for tree-shaking
      await this.importModule(
        `icon-${iconName}`,
        () => import(`lucide-react/dist/esm/icons/${iconName}`),
        'low'
      );
      
      this.loadedIcons.add(iconName);
    } catch (error) {
      console.warn(`Icon ${iconName} not found, using fallback`);
    }
  }

  // Batch load multiple icons
  async loadIconBatch(iconNames: string[]): Promise<void> {
    const unloadedIcons = iconNames.filter(name => !this.loadedIcons.has(name));
    
    if (unloadedIcons.length === 0) return;

    // Load icons in parallel batches of 5
    const batchSize = 5;
    for (let i = 0; i < unloadedIcons.length; i += batchSize) {
      const batch = unloadedIcons.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(iconName => this.loadIcon(iconName))
      );
    }
  }

  // Smart route-based code splitting
  createRouteBasedLoader() {
    const routeModules = new Map<string, () => Promise<any>>();
    
    return {
      registerRoute: (path: string, loader: () => Promise<any>) => {
        routeModules.set(path, loader);
      },
      
      loadRoute: async (path: string) => {
        const loader = routeModules.get(path);
        if (!loader) {
          throw new Error(`Route ${path} not registered`);
        }
        
        return this.importModule(`route-${path}`, loader, 'critical');
      },
      
      // Preload likely next routes based on current route
      preloadNextRoutes: (currentPath: string) => {
        const nextRoutes = this.predictNextRoutes(currentPath);
        nextRoutes.forEach(route => {
          const loader = routeModules.get(route);
          if (loader) {
            // Preload after a small delay to not block current route
            setTimeout(() => {
              this.importModule(`route-${route}`, loader, 'low');
            }, 1000);
          }
        });
      }
    };
  }

  private predictNextRoutes(currentPath: string): string[] {
    // Simple prediction logic - can be enhanced with ML
    const routePredictions: Record<string, string[]> = {
      '/': ['/dashboard', '/quiz', '/leaderboard'],
      '/dashboard': ['/quiz', '/profile', '/missions'],
      '/quiz': ['/dashboard', '/leaderboard'],
      '/profile': ['/dashboard', '/settings'],
      '/leaderboard': ['/dashboard', '/quiz']
    };
    
    return routePredictions[currentPath] || [];
  }

  // Bundle analysis and optimization suggestions
  analyzeBundlePerformance() {
    const analysis = {
      totalModules: this.moduleMetrics.size,
      criticalModules: Array.from(this.moduleMetrics.values()).filter(m => m.priority === 'critical').length,
      averageLoadTime: 0,
      slowModules: [] as ModuleMetrics[],
      optimizationSuggestions: [] as string[]
    };

    const metrics = Array.from(this.moduleMetrics.values());
    
    if (metrics.length > 0) {
      analysis.averageLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
      analysis.slowModules = metrics.filter(m => m.loadTime > 100); // Modules taking >100ms
    }

    // Generate optimization suggestions
    if (analysis.slowModules.length > 0) {
      analysis.optimizationSuggestions.push(
        `Consider code splitting for ${analysis.slowModules.length} slow modules`
      );
    }

    if (analysis.criticalModules > 10) {
      analysis.optimizationSuggestions.push(
        'Too many critical modules - consider reducing critical path'
      );
    }

    return analysis;
  }

  // Cleanup and reset metrics
  reset() {
    this.moduleMetrics.clear();
    this.loadingPromises.clear();
    this.loadedIcons.clear();
  }
}

// Singleton instance
export const intelligentBundler = new IntelligentBundler();

// React hooks for bundle optimization
export const useBundleOptimization = () => {
  return {
    loadModule: intelligentBundler.importModule.bind(intelligentBundler),
    loadIcon: intelligentBundler.loadIcon.bind(intelligentBundler),
    loadIconBatch: intelligentBundler.loadIconBatch.bind(intelligentBundler),
    createLazyComponent: intelligentBundler.createLazyComponent.bind(intelligentBundler),
    getAnalysis: intelligentBundler.analyzeBundlePerformance.bind(intelligentBundler),
  };
};

// Utility function for creating optimized lazy imports
import React from 'react';

export const createOptimizedLazy = <T extends React.ComponentType<any>>(
  componentName: string,
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(() => 
    intelligentBundler.importModule(componentName, importFn, 'normal')
  );
};