// PWA Optimization System
import { ErrorHandler } from '@/utils/error-handling';

interface PWAConfig {
  enableServiceWorker: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'fastest';
  offlinePages: string[];
  backgroundSync: boolean;
  pushNotifications: boolean;
}

interface CacheConfig {
  staticAssets: {
    strategy: 'cache-first';
    maxAge: number;
  };
  apiCalls: {
    strategy: 'network-first';
    maxAge: number;
  };
  images: {
    strategy: 'cache-first';
    maxAge: number;
  };
}

class PWAOptimization {
  private static instance: PWAOptimization;
  private logger = ErrorHandler.createLogger('PWAOptimization');
  private config: PWAConfig;
  private cacheConfig: CacheConfig;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.config = {
      enableServiceWorker: 'serviceWorker' in navigator,
      cacheStrategy: 'network-first',
      offlinePages: ['/dashboard', '/offline'],
      backgroundSync: true,
      pushNotifications: 'Notification' in window
    };

    this.cacheConfig = {
      staticAssets: {
        strategy: 'cache-first',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      },
      apiCalls: {
        strategy: 'network-first',
        maxAge: 5 * 60 * 1000 // 5 minutes
      },
      images: {
        strategy: 'cache-first',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    };
  }

  static getInstance(): PWAOptimization {
    if (!PWAOptimization.instance) {
      PWAOptimization.instance = new PWAOptimization();
    }
    return PWAOptimization.instance;
  }

  async initialize(): Promise<void> {
    if (!this.config.enableServiceWorker) {
      this.logger.warn('Service Worker not supported');
      return;
    }

    try {
      await this.registerServiceWorker();
      await this.setupCacheStrategies();
      await this.enableBackgroundSync();
      await this.setupPushNotifications();
      
      this.logger.info('PWA optimization initialized successfully');
    } catch (error) {
      this.logger.error('PWA initialization failed', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      // Register service worker with update handling
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.handleServiceWorkerUpdate();
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      this.logger.info('Service Worker registered successfully', {
        scope: this.registration.scope
      });
    } catch (error) {
      this.logger.error('Service Worker registration failed', error);
      throw error;
    }
  }

  private async setupCacheStrategies(): Promise<void> {
    if (!this.registration) return;

    // Send cache configuration to service worker
    this.sendMessageToServiceWorker({
      type: 'CACHE_CONFIG',
      config: this.cacheConfig
    });

    // Precache critical assets
    await this.precacheCriticalAssets();
  }

  private async precacheCriticalAssets(): Promise<void> {
    const criticalAssets = [
      '/',
      '/dashboard',
      '/manifest.json',
      '/offline.html',
      // Add more critical assets
    ];

    this.sendMessageToServiceWorker({
      type: 'PRECACHE_ASSETS',
      assets: criticalAssets
    });
  }

  private async enableBackgroundSync(): Promise<void> {
    if (!this.config.backgroundSync || !this.registration) return;

    try {
      // Check if background sync is supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        this.sendMessageToServiceWorker({
          type: 'ENABLE_BACKGROUND_SYNC'
        });
        this.logger.info('Background sync enabled');
      } else {
        this.logger.warn('Background sync not supported');
      }
    } catch (error) {
      this.logger.error('Background sync registration failed', error);
    }
  }

  private async setupPushNotifications(): Promise<void> {
    if (!this.config.pushNotifications || !this.registration) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.logger.info('Push notifications enabled');
        
        // Setup push subscription if needed
        await this.setupPushSubscription();
      } else {
        this.logger.warn('Push notifications permission denied');
      }
    } catch (error) {
      this.logger.error('Push notification setup failed', error);
    }
  }

  private async setupPushSubscription(): Promise<void> {
    try {
      const subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      this.logger.info('Push subscription created');
    } catch (error) {
      this.logger.error('Push subscription failed', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      this.logger.error('Failed to send subscription to server', error);
    }
  }

  private handleServiceWorkerUpdate(): void {
    this.logger.info('New service worker version available');
    
    // Show update notification to user
    this.showUpdateNotification();
  }

  private showUpdateNotification(): void {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span>Nova versão disponível!</span>
        <button id="update-btn" class="ml-4 bg-white text-blue-500 px-3 py-1 rounded text-sm">
          Atualizar
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Handle update button click
    const updateBtn = notification.querySelector('#update-btn');
    updateBtn?.addEventListener('click', () => {
      this.skipWaiting();
      notification.remove();
    });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 10000);
  }

  private skipWaiting(): void {
    this.sendMessageToServiceWorker({ type: 'SKIP_WAITING' });
  }

  private sendMessageToServiceWorker(message: any): void {
    if (!this.registration) return;

    if (this.registration.active) {
      this.registration.active.postMessage(message);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.logger.info('Cache updated', data.payload);
        break;
      case 'OFFLINE_READY':
        this.logger.info('Offline functionality ready');
        break;
      case 'BACKGROUND_SYNC_SUCCESS':
        this.logger.info('Background sync completed', data.payload);
        break;
      case 'BACKGROUND_SYNC_FAILED':
        this.logger.error('Background sync failed', data.payload);
        break;
      default:
        this.logger.debug('Unknown service worker message', data);
    }
  }

  // Public methods for app integration
  async cacheResource(url: string, strategy?: 'cache-first' | 'network-first'): Promise<void> {
    this.sendMessageToServiceWorker({
      type: 'CACHE_RESOURCE',
      url,
      strategy: strategy || this.config.cacheStrategy
    });
  }

  async clearCache(pattern?: string): Promise<void> {
    this.sendMessageToServiceWorker({
      type: 'CLEAR_CACHE',
      pattern
    });
  }

  async forceUpdate(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getStorageUsage(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return null;
  }

  async persistStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      return await navigator.storage.persist();
    }
    return false;
  }

  // Install app prompt
  private deferredPrompt: any = null;

  setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.logger.info('PWA was installed');
      this.deferredPrompt = null;
    });
  }

  private showInstallButton(): void {
    // Create install button
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Instalar App';
    installBtn.className = 'fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50';
    
    installBtn.addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        this.logger.info('Install prompt result', { outcome });
        this.deferredPrompt = null;
        installBtn.remove();
      }
    });
    
    document.body.appendChild(installBtn);
  }

  async showInstallPrompt(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.logger.info('Install prompt triggered', { outcome });
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
      }
    }
  }

  // Analytics integration
  trackPWAUsage(): void {
    // Track installation
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.logger.info('Running as PWA');
    }

    // Track offline usage
    window.addEventListener('online', () => {
      this.logger.info('App came online');
    });

    window.addEventListener('offline', () => {
      this.logger.info('App went offline');
    });
  }

  getInstallationStatus(): 'not-supported' | 'installed' | 'installable' | 'not-installable' {
    if (!('serviceWorker' in navigator)) {
      return 'not-supported';
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'installed';
    }

    if (this.deferredPrompt) {
      return 'installable';
    }

    return 'not-installable';
  }
}

export const pwaOptimization = PWAOptimization.getInstance();
export { PWAOptimization };