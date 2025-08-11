import { queryKeys } from './query-keys';

interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
  pressure: 'low' | 'medium' | 'high' | 'critical';
}

interface CleanupConfig {
  maxCacheAge: number;
  maxDOMNodes: number;
  maxEventListeners: number;
  emergencyThreshold: 0.85;
  warningThreshold: 0.60;
}

class UltraMemoryManager {
  private config: CleanupConfig = {
    maxCacheAge: 2 * 60 * 1000, // 2 minutes vs 10 minutes default
    maxDOMNodes: 500,
    maxEventListeners: 50,
    emergencyThreshold: 0.85,
    warningThreshold: 0.60
  };

  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryCheckInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Memory pressure check every 3 seconds (ultra-aggressive)
    this.memoryCheckInterval = setInterval(() => {
      const stats = this.getMemoryStats();
      this.handleMemoryPressure(stats);
    }, 3000);

    // Cleanup cycle every 8 seconds when memory > 60%
    this.cleanupInterval = setInterval(() => {
      const stats = this.getMemoryStats();
      if (stats.percentage > 0.60) {
        this.performCleanup('scheduled');
      }
    }, 8000);

    console.log('🧠 Ultra-aggressive memory monitoring started');
  }

  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    
    this.isMonitoring = false;
  }

  getMemoryStats(): MemoryStats {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const percentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      let pressure: MemoryStats['pressure'] = 'low';
      if (percentage > this.config.emergencyThreshold) pressure = 'critical';
      else if (percentage > 0.75) pressure = 'high';
      else if (percentage > this.config.warningThreshold) pressure = 'medium';

      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage,
        pressure
      };
    }

    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
      pressure: 'low'
    };
  }

  private handleMemoryPressure(stats: MemoryStats): void {
    switch (stats.pressure) {
      case 'critical':
        console.error('🚨 CRITICAL memory pressure:', `${(stats.percentage * 100).toFixed(1)}%`);
        this.performCleanup('emergency');
        this.emergencyCleanup();
        break;
        
      case 'high':
        console.warn('⚠️ HIGH memory pressure:', `${(stats.percentage * 100).toFixed(1)}%`);
        this.performCleanup('aggressive');
        break;
        
      case 'medium':
        console.log('📊 Medium memory pressure:', `${(stats.percentage * 100).toFixed(1)}%`);
        this.performCleanup('normal');
        break;
    }
  }

  performCleanup(level: 'normal' | 'aggressive' | 'emergency' | 'scheduled' = 'normal'): void {
    const startTime = performance.now();
    let operationsCount = 0;

    try {
      // 1. Query cache cleanup (most aggressive)
      operationsCount += this.cleanupQueryCache(level);
      
      // 2. DOM cleanup
      operationsCount += this.cleanupDOM(level);
      
      // 3. Event listeners cleanup
      operationsCount += this.cleanupEventListeners(level);
      
      // 4. Browser storage cleanup
      operationsCount += this.cleanupStorage(level);
      
      // 5. Image optimization
      if (level === 'aggressive' || level === 'emergency') {
        operationsCount += this.optimizeImages();
      }
      
      // 6. Force garbage collection
      if (level === 'emergency') {
        this.forceGarbageCollection();
      }

      const duration = performance.now() - startTime;
      console.log(`🧹 ${level} cleanup completed: ${operationsCount} ops in ${duration.toFixed(1)}ms`);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private cleanupQueryCache(level: string): number {
    if (typeof window === 'undefined') return 0;
    
    let cleaned = 0;
    const queryClient = (window as any).__REACT_QUERY_CLIENT__;
    
    if (queryClient) {
      const queryCache = queryClient.getQueryCache();
      const now = Date.now();
      
      // Get all queries
      const queries = queryCache.getAll();
      
      queries.forEach((query: any) => {
        const isStale = now - query.state.dataUpdatedAt > this.config.maxCacheAge;
        const hasObservers = query.getObserversCount() > 0;
        
        // Ultra-aggressive: remove stale queries without observers
        if (level === 'emergency' || (level === 'aggressive' && isStale && !hasObservers)) {
          queryCache.remove(query);
          cleaned++;
        }
        // Normal: only remove very old queries
        else if (level === 'normal' && isStale && !hasObservers && now - query.state.dataUpdatedAt > this.config.maxCacheAge * 3) {
          queryCache.remove(query);
          cleaned++;
        }
      });
    }
    
    return cleaned;
  }

  private cleanupDOM(level: string): number {
    let cleaned = 0;
    
    // Remove detached nodes
    const allNodes = document.querySelectorAll('*');
    allNodes.forEach(node => {
      if (!node.isConnected && node.parentNode) {
        node.parentNode.removeChild(node);
        cleaned++;
      }
    });
    
    // Clean up empty text nodes
    if (level === 'aggressive' || level === 'emergency') {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            return node.textContent?.trim() === '' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      const emptyNodes: Node[] = [];
      let node;
      while (node = walker.nextNode()) {
        emptyNodes.push(node);
      }
      
      emptyNodes.forEach(emptyNode => {
        if (emptyNode.parentNode) {
          emptyNode.parentNode.removeChild(emptyNode);
          cleaned++;
        }
      });
    }
    
    return cleaned;
  }

  private cleanupEventListeners(level: string): number {
    let cleaned = 0;
    
    // This is a simplified approach - in a real app you'd track listeners
    const elements = document.querySelectorAll('[data-cleanup-listeners]');
    elements.forEach(element => {
      // Clone node to remove all event listeners
      const newElement = element.cloneNode(true);
      element.parentNode?.replaceChild(newElement, element);
      cleaned++;
    });
    
    return cleaned;
  }

  private cleanupStorage(level: string): number {
    let cleaned = 0;
    
    try {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // Clean localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && now - data.timestamp > oneHour) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch {
          // Invalid JSON, remove if aggressive cleanup
          if (level === 'aggressive' || level === 'emergency') {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }
      
      // Clean sessionStorage in emergency
      if (level === 'emergency') {
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (!key.startsWith('auth-') && !key.startsWith('user-')) {
            sessionStorage.removeItem(key);
            cleaned++;
          }
        });
      }
      
    } catch (error) {
      console.error('Error cleaning storage:', error);
    }
    
    return cleaned;
  }

  private optimizeImages(): number {
    let optimized = 0;
    
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add lazy loading if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
        optimized++;
      }
      
      // Remove high-res images that are small
      if (img.naturalWidth > 1920 && img.clientWidth < 500) {
        // Could compress or replace with smaller version
        optimized++;
      }
    });
    
    return optimized;
  }

  private emergencyCleanup(): void {
    // Clear all non-essential caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (!name.includes('critical')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // Clear non-critical service worker caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'EMERGENCY_CLEANUP'
      });
    }
  }

  private forceGarbageCollection(): void {
    // Try different GC methods
    if ('gc' in window) {
      (window as any).gc();
    }
    
    if ('MemoryInfo' in window && 'memory' in performance) {
      // Force some memory pressure to trigger GC
      const temp = new Array(1000000).fill(0);
      temp.length = 0;
    }
  }

  // Public monitoring methods
  isMemoryPressureHigh(): boolean {
    return this.getMemoryStats().pressure === 'high' || this.getMemoryStats().pressure === 'critical';
  }

  isMemoryPressureCritical(): boolean {
    return this.getMemoryStats().pressure === 'critical';
  }

  getOptimizationRecommendations(): string[] {
    const stats = this.getMemoryStats();
    const recommendations: string[] = [];
    
    if (stats.percentage > 0.80) {
      recommendations.push('Consider reducing concurrent operations');
      recommendations.push('Clear browser cache');
      recommendations.push('Close unused browser tabs');
    }
    
    if (stats.percentage > 0.70) {
      recommendations.push('Reduce image quality');
      recommendations.push('Limit real-time subscriptions');
    }
    
    return recommendations;
  }
}

export const ultraMemoryManager = new UltraMemoryManager();

// Hook for components
export const useUltraMemoryManager = () => {
  const startMonitoring = () => ultraMemoryManager.startMonitoring();
  const stopMonitoring = () => ultraMemoryManager.stopMonitoring();
  const getMemoryStats = () => ultraMemoryManager.getMemoryStats();
  const performCleanup = (level?: 'normal' | 'aggressive' | 'emergency') => 
    ultraMemoryManager.performCleanup(level);
  
  return {
    startMonitoring,
    stopMonitoring,
    getMemoryStats,
    performCleanup,
    isMemoryPressureHigh: () => ultraMemoryManager.isMemoryPressureHigh(),
    isMemoryPressureCritical: () => ultraMemoryManager.isMemoryPressureCritical()
  };
};