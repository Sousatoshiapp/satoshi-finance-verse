import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSecurity } from './use-enhanced-security';

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

  useEffect(() => {
    fetchPresenceData();
    
    // Set up real-time subscription for presence updates
    const channel = supabase
      .channel('privacy-safe-presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
      }, () => {
        fetchPresenceData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPresenceData = async () => {
    try {
      setLoading(true);
      
      // Use the privacy-safe function to get anonymized stats
      const { data: stats, error: statsError } = await supabase
        .rpc('get_anonymized_user_stats');

      if (statsError) {
        console.error('Error fetching anonymized stats:', statsError);
        return;
      }

      setPresenceData({
        totalOnlineUsers: stats?.[0]?.total_online_users || 0,
        totalActiveUsers: stats?.[0]?.total_active_users || 0
      });

      logSecurityAction('privacy_safe_presence_check', {
        totalOnlineUsers: stats?.[0]?.total_online_users || 0,
        totalActiveUsers: stats?.[0]?.total_active_users || 0
      });

    } catch (error) {
      console.error('Error in privacy-safe presence:', error);
    } finally {
      setLoading(false);
    }
  };

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