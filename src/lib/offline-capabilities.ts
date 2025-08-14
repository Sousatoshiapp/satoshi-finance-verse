// Offline Capabilities System
import { ErrorHandler } from '@/utils/error-handling';

interface OfflineConfig {
  enableOfflineStorage: boolean;
  syncInterval: number;
  maxStorageSize: number;
  criticalData: string[];
}

interface OfflineData {
  id: string;
  data: any;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineCapabilities {
  private static instance: OfflineCapabilities;
  private logger = ErrorHandler.createLogger('OfflineCapabilities');
  private config: OfflineConfig;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: SyncQueue[] = [];
  private offlineData: Map<string, OfflineData> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableOfflineStorage: true,
      syncInterval: 30000, // 30 seconds
      maxStorageSize: 50 * 1024 * 1024, // 50MB
      criticalData: ['profiles', 'dashboard_data', 'quiz_sessions']
    };

    this.initializeOfflineHandling();
  }

  static getInstance(): OfflineCapabilities {
    if (!OfflineCapabilities.instance) {
      OfflineCapabilities.instance = new OfflineCapabilities();
    }
    return OfflineCapabilities.instance;
  }

  private initializeOfflineHandling(): void {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Load existing offline data
    this.loadOfflineData();
    this.loadSyncQueue();

    // Start sync interval if online
    if (this.isOnline) {
      this.startSyncInterval();
    }

    this.logger.info('Offline capabilities initialized');
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.logger.info('Device came online - starting sync');
    
    // Start syncing queued operations
    this.startSyncInterval();
    this.syncPendingOperations();
    
    // Notify app
    window.dispatchEvent(new CustomEvent('offline-status-changed', {
      detail: { isOnline: true }
    }));
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.logger.info('Device went offline');
    
    // Stop sync interval
    this.stopSyncInterval();
    
    // Notify app
    window.dispatchEvent(new CustomEvent('offline-status-changed', {
      detail: { isOnline: false }
    }));
  }

  // Data Storage Methods
  async storeData(key: string, data: any, critical: boolean = false): Promise<void> {
    if (!this.config.enableOfflineStorage) return;

    try {
      const offlineData: OfflineData = {
        id: key,
        data,
        timestamp: Date.now(),
        syncStatus: this.isOnline ? 'synced' : 'pending',
        retryCount: 0
      };

      // Store in memory
      this.offlineData.set(key, offlineData);

      // Store in IndexedDB for persistence
      await this.storeInIndexedDB(key, offlineData);

      // Store critical data in localStorage as backup
      if (critical) {
        this.storeCriticalData(key, data);
      }

      this.logger.debug(`Data stored offline: ${key}`);
    } catch (error) {
      this.logger.error('Failed to store offline data', error);
    }
  }

  async getData(key: string): Promise<any | null> {
    try {
      // Check memory first
      const memoryData = this.offlineData.get(key);
      if (memoryData) {
        return memoryData.data;
      }

      // Check IndexedDB
      const dbData = await this.getFromIndexedDB(key);
      if (dbData) {
        this.offlineData.set(key, dbData);
        return dbData.data;
      }

      // Check localStorage for critical data
      const criticalData = this.getCriticalData(key);
      if (criticalData) {
        return criticalData;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get offline data', error);
      return null;
    }
  }

  async removeData(key: string): Promise<void> {
    try {
      // Remove from memory
      this.offlineData.delete(key);

      // Remove from IndexedDB
      await this.removeFromIndexedDB(key);

      // Remove from localStorage
      localStorage.removeItem(`offline_critical_${key}`);

      this.logger.debug(`Offline data removed: ${key}`);
    } catch (error) {
      this.logger.error('Failed to remove offline data', error);
    }
  }

  // Sync Queue Methods
  queueOperation(action: 'create' | 'update' | 'delete', table: string, data: any): void {
    const operation: SyncQueue = {
      id: `${table}_${Date.now()}_${Math.random()}`,
      action,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(operation);
    this.saveSyncQueue();

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncSingleOperation(operation);
    }

    this.logger.debug(`Operation queued: ${action} on ${table}`);
  }

  private async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    this.logger.info(`Syncing ${this.syncQueue.length} pending operations`);

    const operationsToSync = [...this.syncQueue];
    
    for (const operation of operationsToSync) {
      try {
        await this.syncSingleOperation(operation);
        
        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
      } catch (error) {
        this.logger.error('Sync operation failed', { operation, error });
        
        // Increment retry count
        operation.retryCount++;
        
        // Remove if max retries exceeded
        if (operation.retryCount >= 3) {
          this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
          this.logger.error(`Operation removed after max retries: ${operation.id}`);
        }
      }
    }

    this.saveSyncQueue();
  }

  private async syncSingleOperation(operation: SyncQueue): Promise<void> {
    const { action, table, data } = operation;
    
    // Build API endpoint
    const endpoint = `/api/${table}${action === 'update' || action === 'delete' ? `/${data.id}` : ''}`;
    
    const requestOptions: RequestInit = {
      method: action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: action !== 'delete' ? JSON.stringify(data) : undefined
    };

    const response = await fetch(endpoint, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    this.logger.debug(`Operation synced: ${operation.id}`);
  }

  // IndexedDB Methods
  private async storeInIndexedDB(key: string, data: OfflineData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineData', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const putRequest = store.put(data, key);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }
      };
    });
  }

  private async getFromIndexedDB(key: string): Promise<OfflineData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineData', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineData', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  // localStorage Methods for Critical Data
  private storeCriticalData(key: string, data: any): void {
    try {
      localStorage.setItem(`offline_critical_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      this.logger.error('Failed to store critical data in localStorage', error);
    }
  }

  private getCriticalData(key: string): any | null {
    try {
      const stored = localStorage.getItem(`offline_critical_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      this.logger.error('Failed to get critical data from localStorage', error);
    }
    return null;
  }

  // Persistence Methods
  private loadOfflineData(): void {
    // Load will happen lazily when data is requested
    this.logger.debug('Offline data loading initialized');
  }

  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        this.logger.info(`Loaded ${this.syncQueue.length} pending operations`);
      }
    } catch (error) {
      this.logger.error('Failed to load sync queue', error);
      this.syncQueue = [];
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      this.logger.error('Failed to save sync queue', error);
    }
  }

  // Sync Management
  private startSyncInterval(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncPendingOperations();
    }, this.config.syncInterval);

    this.logger.debug('Sync interval started');
  }

  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.logger.debug('Sync interval stopped');
    }
  }

  // Public API
  isOffline(): boolean {
    return !this.isOnline;
  }

  getPendingOperationsCount(): number {
    return this.syncQueue.length;
  }

  async clearOfflineData(): Promise<void> {
    try {
      // Clear memory
      this.offlineData.clear();

      // Clear IndexedDB
      const request = indexedDB.deleteDatabase('OfflineData');
      request.onsuccess = () => this.logger.info('IndexedDB cleared');

      // Clear localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('offline_critical_')) {
          localStorage.removeItem(key);
        }
      });

      this.logger.info('Offline data cleared');
    } catch (error) {
      this.logger.error('Failed to clear offline data', error);
    }
  }

  async getStorageUsage(): Promise<{ used: number; available: number } | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
      }
    } catch (error) {
      this.logger.error('Failed to get storage usage', error);
    }
    return null;
  }

  // Smart caching for API responses
  async cacheApiResponse(url: string, response: any, ttl: number = 300000): Promise<void> {
    const cacheKey = `api_cache_${btoa(url)}`;
    await this.storeData(cacheKey, {
      response,
      expiry: Date.now() + ttl
    });
  }

  async getCachedApiResponse(url: string): Promise<any | null> {
    const cacheKey = `api_cache_${btoa(url)}`;
    const cached = await this.getData(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.response;
    }
    
    // Remove expired cache
    if (cached) {
      await this.removeData(cacheKey);
    }
    
    return null;
  }
}

export const offlineCapabilities = OfflineCapabilities.getInstance();
export { OfflineCapabilities };