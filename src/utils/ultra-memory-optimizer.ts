// Ultra Memory Optimizer - Critical performance management
export class UltraMemoryOptimizer {
  private static instance: UltraMemoryOptimizer;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryPressureThreshold = 0.75; // 75%
  private emergencyThreshold = 0.90; // 90%

  static getInstance(): UltraMemoryOptimizer {
    if (!UltraMemoryOptimizer.instance) {
      UltraMemoryOptimizer.instance = new UltraMemoryOptimizer();
    }
    return UltraMemoryOptimizer.instance;
  }

  // Ultra-aggressive memory monitoring
  startMonitoring(intervalMs: number = 5000) {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.checkMemoryPressure();
    }, intervalMs);
  }

  private checkMemoryPressure() {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

    if (usageRatio > this.emergencyThreshold) {
      this.emergencyCleanup();
    } else if (usageRatio > this.memoryPressureThreshold) {
      this.aggressiveCleanup();
    }
  }

  private emergencyCleanup() {
    console.warn('🚨 Emergency memory cleanup triggered');
    
    // Clear all possible caches
    this.clearAllCaches();
    
    // Force garbage collection
    this.forceGC();
    
    // Clear unused DOM nodes
    this.clearUnusedDOMNodes();
    
    // Clear localStorage of non-critical data
    this.clearNonCriticalStorage();
  }

  private aggressiveCleanup() {
    console.log('⚡ Aggressive memory cleanup');
    
    // Clear old cached data
    this.clearOldCaches();
    
    // Optimize images
    this.optimizeImages();
    
    // Clear event listeners on detached elements
    this.clearDetachedListeners();
  }

  private clearAllCaches() {
    try {
      // Clear all browser caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    } catch (error) {
      console.debug('Cache clearing failed:', error);
    }
  }

  private clearOldCaches() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    Object.keys(localStorage).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const data = JSON.parse(item);
          if (data.timestamp && (now - data.timestamp > oneHour)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove invalid items
        localStorage.removeItem(key);
      }
    });
  }

  private forceGC() {
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }

  private clearUnusedDOMNodes() {
    // Remove detached DOM nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as HTMLElement;
          if (!element.isConnected || 
              (element.offsetParent === null && 
               element !== document.body &&
               !element.contains(document.activeElement))) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const nodesToRemove: Node[] = [];
    let node = walker.nextNode();
    while (node) {
      nodesToRemove.push(node);
      node = walker.nextNode();
    }

    nodesToRemove.forEach(node => {
      try {
        node.parentNode?.removeChild(node);
      } catch (error) {
        console.debug('Node removal failed:', error);
      }
    });
  }

  private clearNonCriticalStorage() {
    const criticalKeys = ['user', 'auth', 'theme', 'language'];
    
    Object.keys(localStorage).forEach(key => {
      if (!criticalKeys.some(critical => key.includes(critical))) {
        localStorage.removeItem(key);
      }
    });
  }

  private optimizeImages() {
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        img.loading = 'lazy';
      }
    });
  }

  private clearDetachedListeners() {
    // Clear event listeners on elements that are no longer in the DOM
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      if (!element.isConnected) {
        const clonedElement = element.cloneNode(true);
        element.parentNode?.replaceChild(clonedElement, element);
      }
    });
  }

  stopMonitoring() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get current memory status
  getMemoryStatus() {
    if (!('memory' in performance)) {
      return { available: false };
    }

    const memory = (performance as any).memory;
    return {
      available: true,
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
}

// Singleton instance
export const ultraMemoryOptimizer = UltraMemoryOptimizer.getInstance();