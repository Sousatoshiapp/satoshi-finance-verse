// Production Hardening - Core orchestrator for production-ready features
import { ErrorHandler } from '@/utils/error-handling';

interface ProductionConfig {
  enableOfflineMode: boolean;
  enableServiceWorker: boolean;
  enableAdvancedErrorHandling: boolean;
  enableMemoryManagement: boolean;
  enableGracefulDegradation: boolean;
}

class ProductionHardening {
  private static instance: ProductionHardening;
  private config: ProductionConfig;
  private logger = ErrorHandler.createLogger('ProductionHardening');
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private degradationState: Map<string, boolean> = new Map();

  private constructor() {
    this.config = {
      enableOfflineMode: true,
      enableServiceWorker: 'serviceWorker' in navigator,
      enableAdvancedErrorHandling: true,
      enableMemoryManagement: true,
      enableGracefulDegradation: true
    };
  }

  static getInstance(): ProductionHardening {
    if (!ProductionHardening.instance) {
      ProductionHardening.instance = new ProductionHardening();
    }
    return ProductionHardening.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing production hardening systems');
      
      // Initialize all systems in parallel
      await Promise.allSettled([
        this.initializeServiceWorker(),
        this.initializeOfflineHandling(),
        this.initializeErrorRecovery(),
        this.initializeMemoryManagement(),
        this.initializeHealthChecks()
      ]);

      // Start monitoring
      this.startSystemMonitoring();
      
      this.logger.info('Production hardening initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize production hardening', error);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!this.config.enableServiceWorker) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.logger.info('Service Worker registered', { scope: registration.scope });
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdate();
            }
          });
        }
      });
    } catch (error) {
      this.logger.error('Service Worker registration failed', error);
    }
  }

  private async initializeOfflineHandling(): Promise<void> {
    if (!this.config.enableOfflineMode) return;

    window.addEventListener('online', () => {
      this.logger.info('Connection restored');
      this.handleOnlineRecovery();
    });

    window.addEventListener('offline', () => {
      this.logger.info('Connection lost - switching to offline mode');
      this.handleOfflineMode();
    });
  }

  private async initializeErrorRecovery(): Promise<void> {
    if (!this.config.enableAdvancedErrorHandling) return;

    // Enhanced error handling with recovery strategies
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // Monitor React error boundaries
    this.setupErrorBoundaryMonitoring();
  }

  private async initializeMemoryManagement(): Promise<void> {
    if (!this.config.enableMemoryManagement) return;

    // Set up memory monitoring
    this.startMemoryMonitoring();
    
    // Set up cleanup on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performMemoryCleanup();
      }
    });
  }

  private async initializeHealthChecks(): Promise<void> {
    // Register core health checks
    this.healthChecks.set('database', this.checkDatabaseHealth.bind(this));
    this.healthChecks.set('network', this.checkNetworkHealth.bind(this));
    this.healthChecks.set('memory', this.checkMemoryHealth.bind(this));
    this.healthChecks.set('storage', this.checkStorageHealth.bind(this));
  }

  private startSystemMonitoring(): void {
    // Health check every 30 seconds
    setInterval(() => {
      this.performHealthChecks();
    }, 30000);

    // Memory check every 5 minutes
    setInterval(() => {
      this.checkMemoryPressure();
    }, 300000);
  }

  private async performHealthChecks(): Promise<void> {
    for (const [service, check] of this.healthChecks) {
      try {
        const isHealthy = await check();
        this.updateServiceHealth(service, isHealthy);
      } catch (error) {
        this.logger.error(`Health check failed for ${service}`, error);
        this.updateServiceHealth(service, false);
      }
    }
  }

  private updateServiceHealth(service: string, isHealthy: boolean): void {
    const wasHealthy = !this.degradationState.get(service);
    
    if (wasHealthy && !isHealthy) {
      this.logger.warn(`Service degraded: ${service}`);
      this.degradationState.set(service, true);
      this.activateGracefulDegradation(service);
    } else if (!wasHealthy && isHealthy) {
      this.logger.info(`Service recovered: ${service}`);
      this.degradationState.set(service, false);
      this.deactivateGracefulDegradation(service);
    }
  }

  private activateGracefulDegradation(service: string): void {
    if (!this.config.enableGracefulDegradation) return;

    switch (service) {
      case 'database':
        this.enableOfflineDataMode();
        break;
      case 'network':
        this.enableCachedDataMode();
        break;
      case 'memory':
        this.enableLowMemoryMode();
        break;
    }
  }

  private deactivateGracefulDegradation(service: string): void {
    switch (service) {
      case 'database':
        this.disableOfflineDataMode();
        break;
      case 'network':
        this.disableCachedDataMode();
        break;
      case 'memory':
        this.disableLowMemoryMode();
        break;
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Simple connectivity check
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkNetworkHealth(): Promise<boolean> {
    return navigator.onLine;
  }

  private async checkMemoryHealth(): Promise<boolean> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usageRatio < 0.8; // Less than 80% memory usage
    }
    return true;
  }

  private async checkStorageHealth(): Promise<boolean> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usageRatio = (estimate.usage || 0) / (estimate.quota || 1);
        return usageRatio < 0.9; // Less than 90% storage usage
      }
      return true;
    } catch {
      return true;
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.logger.error('Unhandled promise rejection', event.reason);
    
    // Try to recover based on error type
    if (event.reason?.code === 'NETWORK_ERROR') {
      this.activateGracefulDegradation('network');
    } else if (event.reason?.code === 'QUOTA_EXCEEDED') {
      this.performMemoryCleanup();
    }
  }

  private setupErrorBoundaryMonitoring(): void {
    // Monitor error boundary catches
    window.addEventListener('error-boundary-caught', ((event: CustomEvent) => {
      this.logger.error('Error boundary caught error', event.detail);
      this.attemptErrorRecovery(event.detail.error);
    }) as EventListener);
  }

  private attemptErrorRecovery(error: Error): void {
    // Implement smart recovery strategies
    if (error.message.includes('ChunkLoadError')) {
      // Handle dynamic import failures
      window.location.reload();
    } else if (error.message.includes('NetworkError')) {
      this.activateGracefulDegradation('network');
    }
  }

  private startMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    setInterval(() => {
      this.checkMemoryPressure();
    }, 60000); // Check every minute
  }

  private checkMemoryPressure(): void {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

    if (usageRatio > 0.8) {
      this.logger.warn('High memory usage detected', { usageRatio });
      this.performMemoryCleanup();
    }
  }

  private performMemoryCleanup(): void {
    try {
      // Clear caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old') || name.includes('temp')) {
              caches.delete(name);
            }
          });
        });
      }

      // Clear old localStorage entries
      this.cleanupLocalStorage();

      // Trigger garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }

      this.logger.info('Memory cleanup performed');
    } catch (error) {
      this.logger.error('Memory cleanup failed', error);
    }
  }

  private cleanupLocalStorage(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('temp_') || key?.includes('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      this.logger.error('localStorage cleanup failed', error);
    }
  }

  private enableOfflineDataMode(): void {
    // Implementation for offline data mode
    this.logger.info('Enabling offline data mode');
  }

  private disableOfflineDataMode(): void {
    this.logger.info('Disabling offline data mode');
  }

  private enableCachedDataMode(): void {
    this.logger.info('Enabling cached data mode');
  }

  private disableCachedDataMode(): void {
    this.logger.info('Disabling cached data mode');
  }

  private enableLowMemoryMode(): void {
    this.logger.info('Enabling low memory mode');
  }

  private disableLowMemoryMode(): void {
    this.logger.info('Disabling low memory mode');
  }

  private handleOnlineRecovery(): void {
    // Sync offline data when coming back online
    this.logger.info('Handling online recovery');
  }

  private handleOfflineMode(): void {
    // Switch to offline-first strategies
    this.logger.info('Switching to offline mode');
  }

  private notifyUpdate(): void {
    // Notify user of available update
    this.logger.info('New version available');
  }

  public getSystemHealth(): Record<string, boolean> {
    const health: Record<string, boolean> = {};
    for (const service of this.healthChecks.keys()) {
      health[service] = !this.degradationState.get(service);
    }
    return health;
  }

  public isServiceDegraded(service: string): boolean {
    return this.degradationState.get(service) || false;
  }
}

export const productionHardening = ProductionHardening.getInstance();
export { ProductionHardening };