import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  id: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
  priority: 'critical' | 'normal' | 'low';
}

interface ConnectionState {
  isConnected: boolean;
  isVisible: boolean;
  lastActivity: number;
  memoryPressure: number;
}

class UltraSubscriptionManager {
  private subscriptions = new Map<string, SubscriptionConfig>();
  private activeChannels = new Map<string, RealtimeChannel>();
  private connectionState: ConnectionState = {
    isConnected: false,
    isVisible: true,
    lastActivity: Date.now(),
    memoryPressure: 0
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private consolidatedChannel: RealtimeChannel | null = null;
  private maxConcurrentSubscriptions = 2; // Ultra-aggressive limit

  constructor() {
    this.setupVisibilityHandling();
    this.setupMemoryMonitoring();
    this.startConnectionManager();
  }

  private setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      this.connectionState.isVisible = !document.hidden;
      
      if (document.hidden) {
        this.pauseNonCriticalSubscriptions();
      } else {
        this.resumeSubscriptions();
      }
    });

    // Page unload cleanup
    window.addEventListener('beforeunload', () => {
      this.disconnectAll();
    });
  }

  private setupMemoryMonitoring() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.connectionState.memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        // Emergency disconnect at 85% memory usage
        if (this.connectionState.memoryPressure > 0.85) {
          this.emergencyOptimization();
        }
      }
    }, 5000);
  }

  private startConnectionManager() {
    // Ultra-optimized heartbeat - 120s instead of 30s
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionState.isVisible && this.connectionState.memoryPressure < 0.80) {
        this.optimizeConnections();
      }
    }, 120000);
  }

  private createConsolidatedChannel(): RealtimeChannel {
    if (this.consolidatedChannel) {
      return this.consolidatedChannel;
    }

    this.consolidatedChannel = supabase.channel('ultra-consolidated-realtime', {
      config: {
        broadcast: { self: false },
        presence: { key: 'user_presence' }
      }
    });

    // Set up consolidated event handlers
    this.setupConsolidatedHandlers();

    this.consolidatedChannel.subscribe((status) => {
      this.connectionState.isConnected = status === 'SUBSCRIBED';
      if (status === 'SUBSCRIBED') {
        console.log('🚀 Ultra-consolidated channel connected');
      }
    });

    return this.consolidatedChannel;
  }

  private setupConsolidatedHandlers() {
    if (!this.consolidatedChannel) return;

    // Group subscriptions by table for batch processing
    const tableGroups = new Map<string, SubscriptionConfig[]>();
    
    this.subscriptions.forEach(config => {
      const existing = tableGroups.get(config.table) || [];
      existing.push(config);
      tableGroups.set(config.table, existing);
    });

    // Set up one listener per table
    tableGroups.forEach((configs, table) => {
      this.consolidatedChannel?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        (payload) => {
          // Batch process all callbacks for this table
          configs.forEach(config => {
            if (this.shouldProcessEvent(config, payload)) {
              // Debounce critical events
              if (config.priority === 'critical') {
                config.callback(payload);
              } else {
                // Throttle non-critical events
                setTimeout(() => config.callback(payload), 100);
              }
            }
          });
        }
      );
    });
  }

  private shouldProcessEvent(config: SubscriptionConfig, payload: any): boolean {
    // Filter by event type
    if (config.event !== '*' && config.event !== payload.eventType) {
      return false;
    }

    // Apply custom filters
    if (config.filter && !this.matchesFilter(payload, config.filter)) {
      return false;
    }

    // Skip if tab not visible and not critical
    if (!this.connectionState.isVisible && config.priority !== 'critical') {
      return false;
    }

    return true;
  }

  private matchesFilter(payload: any, filter: string): boolean {
    // Simple filter matching - can be enhanced
    try {
      const [field, operator, value] = filter.split(/[=<>]/);
      const payloadValue = payload.new?.[field] || payload.old?.[field];
      
      switch (operator) {
        case '=':
          return String(payloadValue) === value;
        default:
          return true;
      }
    } catch {
      return true;
    }
  }

  addSubscription(config: SubscriptionConfig): () => void {
    // Check subscription limit
    if (this.subscriptions.size >= this.maxConcurrentSubscriptions) {
      console.warn('🚨 Subscription limit reached, removing lowest priority');
      this.removeLowPrioritySubscription();
    }

    this.subscriptions.set(config.id, config);
    
    // Only create channel if this is a critical subscription or we're below memory threshold
    if (config.priority === 'critical' || this.connectionState.memoryPressure < 0.70) {
      this.createConsolidatedChannel();
      this.setupConsolidatedHandlers();
    }

    // Return cleanup function
    return () => this.removeSubscription(config.id);
  }

  removeSubscription(id: string): void {
    this.subscriptions.delete(id);
    
    // If no subscriptions left, cleanup channel
    if (this.subscriptions.size === 0) {
      this.cleanup();
    } else {
      // Recreate handlers without removed subscription
      this.setupConsolidatedHandlers();
    }
  }

  private removeLowPrioritySubscription(): void {
    const lowPriorityId = Array.from(this.subscriptions.entries())
      .filter(([_, config]) => config.priority === 'low')
      .map(([id]) => id)[0];
    
    if (lowPriorityId) {
      this.removeSubscription(lowPriorityId);
    }
  }

  private pauseNonCriticalSubscriptions(): void {
    console.log('⏸️ Pausing non-critical subscriptions (tab hidden)');
    // Mark non-critical subscriptions as paused
    // They won't process events until tab is visible again
  }

  private resumeSubscriptions(): void {
    console.log('▶️ Resuming subscriptions (tab visible)');
    this.connectionState.lastActivity = Date.now();
  }

  private optimizeConnections(): void {
    const now = Date.now();
    const inactiveThreshold = 300000; // 5 minutes

    // Disconnect if inactive for too long
    if (now - this.connectionState.lastActivity > inactiveThreshold) {
      console.log('🔌 Disconnecting due to inactivity');
      this.disconnectAll();
    }
  }

  private emergencyOptimization(): void {
    console.warn('🚨 Emergency memory optimization - disconnecting all non-critical subscriptions');
    
    // Keep only critical subscriptions
    const criticalSubs = Array.from(this.subscriptions.entries())
      .filter(([_, config]) => config.priority === 'critical');
    
    this.subscriptions.clear();
    criticalSubs.forEach(([id, config]) => {
      this.subscriptions.set(id, config);
    });

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  private disconnectAll(): void {
    this.subscriptions.clear();
    this.cleanup();
  }

  private cleanup(): void {
    if (this.consolidatedChannel) {
      supabase.removeChannel(this.consolidatedChannel);
      this.consolidatedChannel = null;
    }

    this.activeChannels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.activeChannels.clear();

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Public methods for monitoring
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getSubscriptionsByPriority(priority: 'critical' | 'normal' | 'low'): number {
    return Array.from(this.subscriptions.values())
      .filter(config => config.priority === priority).length;
  }
}

export const ultraSubscriptionManager = new UltraSubscriptionManager();

// Hook for easy integration
export const useUltraSubscription = (config: Omit<SubscriptionConfig, 'id'>) => {
  const id = `${config.table}-${config.event}-${Date.now()}`;
  
  const subscribe = () => {
    return ultraSubscriptionManager.addSubscription({
      ...config,
      id
    });
  };

  return { subscribe };
};
