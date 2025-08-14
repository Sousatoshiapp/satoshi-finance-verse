// Graceful Degradation System
import { ErrorHandler } from '@/utils/error-handling';

interface DegradationConfig {
  retryAttempts: number;
  retryDelay: number;
  fallbackTimeout: number;
  enableFallbacks: boolean;
}

interface ServiceState {
  isHealthy: boolean;
  lastCheck: number;
  failureCount: number;
  fallbackActive: boolean;
}

interface FallbackStrategy {
  service: string;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  isActive: () => boolean;
}

class GracefulDegradationManager {
  private static instance: GracefulDegradationManager;
  private logger = ErrorHandler.createLogger('GracefulDegradation');
  private config: DegradationConfig;
  private services: Map<string, ServiceState> = new Map();
  private fallbacks: Map<string, FallbackStrategy> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      retryAttempts: 3,
      retryDelay: 5000,
      fallbackTimeout: 30000,
      enableFallbacks: true
    };
    
    this.initializeDefaultFallbacks();
  }

  static getInstance(): GracefulDegradationManager {
    if (!GracefulDegradationManager.instance) {
      GracefulDegradationManager.instance = new GracefulDegradationManager();
    }
    return GracefulDegradationManager.instance;
  }

  private initializeDefaultFallbacks(): void {
    // Database fallback
    this.registerFallback('database', {
      service: 'database',
      activate: async () => {
        this.logger.info('Activating database fallback - switching to local storage');
        localStorage.setItem('db_fallback_active', 'true');
        this.showUserNotification('Modo offline ativado', 'warning');
      },
      deactivate: async () => {
        this.logger.info('Deactivating database fallback');
        localStorage.removeItem('db_fallback_active');
        this.showUserNotification('Conexão restaurada', 'success');
      },
      isActive: () => localStorage.getItem('db_fallback_active') === 'true'
    });

    // Network fallback
    this.registerFallback('network', {
      service: 'network',
      activate: async () => {
        this.logger.info('Activating network fallback - using cached data');
        sessionStorage.setItem('network_fallback_active', 'true');
        this.enableOfflineMode();
      },
      deactivate: async () => {
        this.logger.info('Deactivating network fallback');
        sessionStorage.removeItem('network_fallback_active');
        this.disableOfflineMode();
      },
      isActive: () => sessionStorage.getItem('network_fallback_active') === 'true'
    });

    // API fallback
    this.registerFallback('api', {
      service: 'api',
      activate: async () => {
        this.logger.info('Activating API fallback - using mock responses');
        sessionStorage.setItem('api_fallback_active', 'true');
        this.enableMockResponses();
      },
      deactivate: async () => {
        this.logger.info('Deactivating API fallback');
        sessionStorage.removeItem('api_fallback_active');
        this.disableMockResponses();
      },
      isActive: () => sessionStorage.getItem('api_fallback_active') === 'true'
    });

    // Memory fallback
    this.registerFallback('memory', {
      service: 'memory',
      activate: async () => {
        this.logger.info('Activating memory fallback - reducing resource usage');
        sessionStorage.setItem('memory_fallback_active', 'true');
        this.enableLowMemoryMode();
      },
      deactivate: async () => {
        this.logger.info('Deactivating memory fallback');
        sessionStorage.removeItem('memory_fallback_active');
        this.disableLowMemoryMode();
      },
      isActive: () => sessionStorage.getItem('memory_fallback_active') === 'true'
    });
  }

  registerService(serviceName: string): void {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, {
        isHealthy: true,
        lastCheck: Date.now(),
        failureCount: 0,
        fallbackActive: false
      });
      this.logger.info(`Registered service: ${serviceName}`);
    }
  }

  registerFallback(serviceName: string, strategy: FallbackStrategy): void {
    this.fallbacks.set(serviceName, strategy);
    this.logger.info(`Registered fallback for service: ${serviceName}`);
  }

  async reportServiceFailure(serviceName: string, error?: Error): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      this.registerService(serviceName);
      return this.reportServiceFailure(serviceName, error);
    }

    service.failureCount++;
    service.lastCheck = Date.now();
    
    this.logger.warn(`Service failure reported: ${serviceName}`, {
      failureCount: service.failureCount,
      error: error?.message
    });

    // Activate fallback if threshold exceeded
    if (service.failureCount >= this.config.retryAttempts && !service.fallbackActive) {
      await this.activateFallback(serviceName);
    }
  }

  async reportServiceRecovery(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) return;

    service.isHealthy = true;
    service.failureCount = 0;
    service.lastCheck = Date.now();

    this.logger.info(`Service recovery reported: ${serviceName}`);

    // Deactivate fallback if active
    if (service.fallbackActive) {
      await this.deactivateFallback(serviceName);
    }
  }

  private async activateFallback(serviceName: string): Promise<void> {
    if (!this.config.enableFallbacks) return;

    const service = this.services.get(serviceName);
    const fallback = this.fallbacks.get(serviceName);
    
    if (!service || !fallback || service.fallbackActive) return;

    try {
      await fallback.activate();
      service.fallbackActive = true;
      service.isHealthy = false;
      
      this.logger.info(`Fallback activated for service: ${serviceName}`);
      
      // Schedule retry
      this.scheduleServiceRetry(serviceName);
    } catch (error) {
      this.logger.error(`Failed to activate fallback for ${serviceName}`, error);
    }
  }

  private async deactivateFallback(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    const fallback = this.fallbacks.get(serviceName);
    
    if (!service || !fallback || !service.fallbackActive) return;

    try {
      await fallback.deactivate();
      service.fallbackActive = false;
      service.isHealthy = true;
      
      this.logger.info(`Fallback deactivated for service: ${serviceName}`);
    } catch (error) {
      this.logger.error(`Failed to deactivate fallback for ${serviceName}`, error);
    }
  }

  private scheduleServiceRetry(serviceName: string): void {
    setTimeout(async () => {
      await this.attemptServiceRecovery(serviceName);
    }, this.config.fallbackTimeout);
  }

  private async attemptServiceRecovery(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service || !service.fallbackActive) return;

    this.logger.info(`Attempting recovery for service: ${serviceName}`);
    
    // Emit event for service-specific recovery checks
    window.dispatchEvent(new CustomEvent('service-recovery-attempt', {
      detail: { serviceName }
    }));
  }

  private enableOfflineMode(): void {
    document.body.classList.add('offline-mode');
    this.showUserNotification('Modo offline ativado', 'warning');
  }

  private disableOfflineMode(): void {
    document.body.classList.remove('offline-mode');
    this.showUserNotification('Modo online restaurado', 'success');
  }

  private enableMockResponses(): void {
    // Enable mock API responses
    window.addEventListener('fetch', this.mockResponseHandler as EventListener);
  }

  private disableMockResponses(): void {
    window.removeEventListener('fetch', this.mockResponseHandler as EventListener);
  }

  private mockResponseHandler = (event: Event): void => {
    // Implementation for mock responses
    const fetchEvent = event as any;
    if (fetchEvent.request?.url?.includes('/api/')) {
      this.logger.info('Using mock response for API call');
    }
  };

  private enableLowMemoryMode(): void {
    document.body.classList.add('low-memory-mode');
    
    // Reduce image quality, disable animations, etc.
    const style = document.createElement('style');
    style.textContent = `
      .low-memory-mode * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
      .low-memory-mode img {
        filter: blur(0.5px);
      }
    `;
    document.head.appendChild(style);
    
    this.showUserNotification('Modo de economia de memória ativado', 'info');
  }

  private disableLowMemoryMode(): void {
    document.body.classList.remove('low-memory-mode');
    
    // Remove low memory styles
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
      if (style.textContent?.includes('low-memory-mode')) {
        style.remove();
      }
    });
    
    this.showUserNotification('Modo normal restaurado', 'success');
  }

  private showUserNotification(message: string, type: 'success' | 'warning' | 'error' | 'info'): void {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  isServiceHealthy(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service?.isHealthy ?? true;
  }

  isFallbackActive(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service?.fallbackActive ?? false;
  }

  getServiceStatus(): Record<string, ServiceState> {
    const status: Record<string, ServiceState> = {};
    this.services.forEach((state, name) => {
      status[name] = { ...state };
    });
    return status;
  }

  startMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    this.logger.info('Graceful degradation monitoring started');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.logger.info('Graceful degradation monitoring stopped');
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName] of this.services) {
      // Emit health check event for each service
      window.dispatchEvent(new CustomEvent('service-health-check', {
        detail: { serviceName }
      }));
    }
  }
}

export const gracefulDegradation = GracefulDegradationManager.getInstance();
export { GracefulDegradationManager };