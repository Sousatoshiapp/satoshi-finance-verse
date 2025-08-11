import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { ultraSubscriptionManager, useUltraSubscription } from '@/utils/ultra-subscription-manager';
import { ultraMemoryManager } from '@/utils/ultra-memory-manager';
import { ultraQueryDeduplicator } from '@/utils/ultra-query-deduplicator';

interface UltraRealtimeState {
  points: number;
  isOnline: boolean;
  lastUpdate: Date | null;
  onlineUsers: Array<{
    user_id: string;
    username: string;
    avatar_url?: string;
    last_seen: string;
  }>;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  memoryPressure: number;
  subscriptionCount: number;
}

interface UltraRealtimeContextType extends UltraRealtimeState {
  updateOnlineStatus: () => Promise<void>;
  optimizeConnections: () => void;
  forceCleanup: () => void;
}

const UltraRealtimeContext = createContext<UltraRealtimeContextType>({
  points: 0,
  isOnline: false,
  lastUpdate: null,
  onlineUsers: [],
  connectionQuality: 'disconnected',
  memoryPressure: 0,
  subscriptionCount: 0,
  updateOnlineStatus: async () => {},
  optimizeConnections: () => {},
  forceCleanup: () => {},
});

export const useUltraRealtime = () => useContext(UltraRealtimeContext);

export function UltraRealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<UltraRealtimeState>({
    points: 0,
    isOnline: false,
    lastUpdate: null,
    onlineUsers: [],
    connectionQuality: 'disconnected',
    memoryPressure: 0,
    subscriptionCount: 0,
  });

  // Ultra-debounced invalidation (5 seconds)
  const debouncedInvalidate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (userId: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Only invalidate truly critical queries
          queryClient.invalidateQueries({ 
            queryKey: ['dashboard-super-data', userId],
            refetchType: 'active' // Only refetch if actively observed
          });
        }, 5000);
      };
    })(),
    [queryClient]
  );

  // Initialize ultra-optimized subscriptions
  const { subscribe: subscribeToProfiles } = useUltraSubscription({
    table: 'profiles',
    event: 'UPDATE',
    filter: user ? `user_id=eq.${user.id}` : '',
    priority: 'critical',
    callback: useCallback((payload) => {
      const newPoints = payload.new.points;
      if (typeof newPoints === 'number') {
        setState(prev => ({
          ...prev,
          points: newPoints,
          lastUpdate: new Date()
        }));
        
        if (user) {
          debouncedInvalidate(user.id);
        }
      }
    }, [user, debouncedInvalidate])
  });

  const { subscribe: subscribeToPresence } = useUltraSubscription({
    table: 'user_presence',
    event: '*',
    priority: 'normal',
    callback: useCallback(async () => {
      // Batch fetch online users with deduplication
      try {
        const onlineUsers = await ultraQueryDeduplicator.deduplicateRequest(
          'online-users-list',
          async () => {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data } = await supabase
              .from('user_presence')
              .select(`
                user_id,
                last_seen,
                profiles!inner(nickname, profile_image_url)
              `)
              .gte('last_seen', new Date(Date.now() - 3 * 60 * 1000).toISOString()) // 3 minutes
              .eq('is_online', true)
              .limit(20); // Limit results to prevent memory issues

            return data?.map(item => ({
              user_id: item.user_id,
              username: item.profiles?.nickname || 'Anonymous',
              avatar_url: item.profiles?.profile_image_url || null,
              last_seen: item.last_seen,
            })) || [];
          },
          { priority: 'normal', useCache: true }
        );

        setState(prev => ({
          ...prev,
          onlineUsers: onlineUsers.slice(0, 10) // Ultra-limit to 10 users
        }));
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    }, [])
  });

  // Online status management with ultra-optimized heartbeat
  const updateOnlineStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      await ultraQueryDeduplicator.deduplicateRequest(
        `update-presence-${user.id}`,
        async () => {
          const { supabase } = await import('@/integrations/supabase/client');
          
          // Try update first, then insert if needed
          const { error: updateError } = await supabase
            .from('user_presence')
            .update({
              last_seen: new Date().toISOString(),
              is_online: true,
            })
            .eq('user_id', user.id);

          if (updateError) {
            await supabase
              .from('user_presence')
              .insert({
                user_id: user.id,
                last_seen: new Date().toISOString(),
                is_online: true,
              });
          }
        },
        { priority: 'critical', useCache: false }
      );
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, [user]);

  // Connection optimization
  const optimizeConnections = useCallback(() => {
    const stats = ultraMemoryManager.getMemoryStats();
    const connectionState = ultraSubscriptionManager.getConnectionState();
    
    setState(prev => ({
      ...prev,
      memoryPressure: stats.percentage,
      subscriptionCount: ultraSubscriptionManager.getActiveSubscriptionCount(),
      connectionQuality: stats.pressure === 'critical' ? 'poor' : 
                        stats.pressure === 'high' ? 'good' : 'excellent'
    }));

    // Auto-optimize based on memory pressure
    if (stats.pressure === 'critical') {
      ultraMemoryManager.performCleanup('emergency');
    } else if (stats.pressure === 'high') {
      ultraMemoryManager.performCleanup('aggressive');
    }
  }, []);

  // Force cleanup
  const forceCleanup = useCallback(() => {
    ultraMemoryManager.performCleanup('emergency');
    ultraQueryDeduplicator.invalidateCache('');
  }, []);

  // Initialize monitoring and subscriptions
  useEffect(() => {
    if (!user) {
      setState(prev => ({
        ...prev,
        points: 0,
        isOnline: false,
        onlineUsers: []
      }));
      return;
    }

    // Start memory monitoring
    ultraMemoryManager.startMonitoring();

    // Fetch initial data with deduplication
    const fetchInitialData = async () => {
      try {
        const profileData = await ultraQueryDeduplicator.deduplicateRequest(
          `initial-profile-${user.id}`,
          async () => {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data } = await supabase
              .from('profiles')
              .select('points')
              .eq('user_id', user.id)
              .single();
            return data;
          },
          { priority: 'critical' }
        );
        
        if (profileData) {
          setState(prev => ({
            ...prev,
            points: profileData.points || 0,
            isOnline: true
          }));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    // Set up ultra-optimized subscriptions
    const cleanupProfile = subscribeToProfiles();
    const cleanupPresence = subscribeToPresence();

    // Ultra-optimized heartbeat (2 minutes instead of 30 seconds)
    updateOnlineStatus();
    const heartbeatInterval = setInterval(updateOnlineStatus, 120000);

    // Connection quality monitoring
    const monitoringInterval = setInterval(optimizeConnections, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(monitoringInterval);
      cleanupProfile();
      cleanupPresence();
      ultraMemoryManager.stopMonitoring();
    };
  }, [user, subscribeToProfiles, subscribeToPresence, updateOnlineStatus, optimizeConnections]);

  // Visibility change optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Resumed - update status immediately
        updateOnlineStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, updateOnlineStatus]);

  return (
    <UltraRealtimeContext.Provider value={{
      ...state,
      updateOnlineStatus,
      optimizeConnections,
      forceCleanup
    }}>
      {children}
    </UltraRealtimeContext.Provider>
  );
}