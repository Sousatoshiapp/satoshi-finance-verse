import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSecurity } from './use-enhanced-security';
import { useDebounce } from './use-debounced-callback';

// Import cleanup utility to fix rate limiter issues
import '../lib/performance-cleanup';

interface PrivacySafePresenceData {
  totalOnlineUsers: number;
  totalActiveUsers: number;
  userAvailableForDuel?: boolean;
  isInActiveDuel?: boolean;
}

export function usePrivacySafePresence() {
  const [presenceData, setPresenceData] = useState<PrivacySafePresenceData>({
    totalOnlineUsers: 0,
    totalActiveUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { logSecurityAction } = useEnhancedSecurity();
  
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<PrivacySafePresenceData | null>(null);
  const isInitializedRef = useRef(false);

  const fetchPresenceData = useCallback(async () => {
    const now = Date.now();
    
    // Throttle: Don't fetch more than once every 3 seconds
    if (now - lastFetchRef.current < 3000) {
      // Return cached data if available
      if (cacheRef.current) {
        return;
      }
    }
    
    lastFetchRef.current = now;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use the privacy-safe function to get anonymized stats
      const { data: stats, error: statsError } = await supabase
        .rpc('get_anonymized_user_stats');

      if (statsError) {
        console.error('Error fetching anonymized stats:', statsError);
        return;
      }

      const newData = {
        totalOnlineUsers: stats?.[0]?.total_online_users || 0,
        totalActiveUsers: stats?.[0]?.total_active_users || 0
      };

      // Only update if data actually changed
      if (JSON.stringify(newData) !== JSON.stringify(cacheRef.current)) {
        setPresenceData(newData);
        cacheRef.current = newData;
        
        // Reduced logging
        if (Math.random() < 0.05) { // Log apenas 5% das requisições bem-sucedidas
          logSecurityAction('privacy_safe_presence_check', newData);
        }
      }

    } catch (error) {
      console.error('Error in privacy-safe presence:', error);
    } finally {
      setLoading(false);
    }
  }, [logSecurityAction]);

  // Debounced fetch function to prevent excessive calls
  const debouncedFetchPresenceData = useDebounce(fetchPresenceData, 5000);

  useEffect(() => {
    // Initial fetch only once
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchPresenceData();
    }
    
    // Set up real-time subscription with debounced callback
    const channel = supabase
      .channel('privacy-safe-presence-optimized')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
      }, () => {
        // Use debounced version to prevent spam
        debouncedFetchPresenceData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debouncedFetchPresenceData, fetchPresenceData]);

  const checkUserAvailability = async (targetUserId: string) => {
    try {
      logSecurityAction('user_availability_check', { targetUserId });
      
      const { data: isAvailable, error } = await supabase
        .rpc('is_user_available_for_duel', { target_user_id: targetUserId });

      if (error) {
        console.error('Error checking user availability:', error);
        return false;
      }

      return isAvailable || false;
    } catch (error) {
      console.error('Error in user availability check:', error);
      return false;
    }
  };

  const getVisibleOnlineUsers = async () => {
    try {
      // This will only return users visible according to the new privacy policies
      // (users in active duels, etc.)
      const { data, error } = await supabase
        .from('user_presence')
        .select(`
          user_id,
          last_seen,
          profiles!inner(nickname, profile_image_url)
        `)
        .eq('is_online', true)
        .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching visible online users:', error);
        return [];
      }

      logSecurityAction('visible_users_fetch', { 
        count: data?.length || 0 
      });

      return data || [];
    } catch (error) {
      console.error('Error in get visible online users:', error);
      return [];
    }
  };

  return {
    presenceData,
    loading,
    checkUserAvailability,
    getVisibleOnlineUsers,
    refreshPresenceData: fetchPresenceData
  };
}