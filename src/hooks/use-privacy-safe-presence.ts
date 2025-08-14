import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSecurity } from './use-enhanced-security';
import { adaptiveRateLimiter } from '@/lib/adaptive-rate-limiter';
import { securityMonitor } from '@/lib/security-monitor';

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
    const startTime = performance.now();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    // Verificar rate limit adaptativo e monitoramento de segurança
    const canProceed = adaptiveRateLimiter.canPerformAction(
      user.id, 
      'privacy_safe_presence_check',
      Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) // dias desde criação
    );

    if (!canProceed) {
      console.warn('Rate limit exceeded for privacy_safe_presence_check');
      return;
    }

    // Monitoramento de segurança
    const isAllowed = securityMonitor.checkRequest({
      userId: user.id,
      action: 'privacy_safe_presence_check',
      userAgent: navigator.userAgent,
      requestTime: startTime,
      success: true
    });

    if (!isAllowed) {
      console.warn('Security monitor blocked presence check');
      return;
    }

    try {
      setLoading(true);
      
      // Use the privacy-safe function to get anonymized stats
      const { data: stats, error: statsError } = await supabase
        .rpc('get_anonymized_user_stats');

      if (statsError) {
        console.error('Error fetching anonymized stats:', statsError);
        securityMonitor.checkRequest({
          userId: user.id,
          action: 'privacy_safe_presence_check',
          userAgent: navigator.userAgent,
          requestTime: startTime,
          success: false
        });
        return;
      }

      setPresenceData({
        totalOnlineUsers: stats?.[0]?.total_online_users || 0,
        totalActiveUsers: stats?.[0]?.total_active_users || 0
      });

      // Log success de forma mais inteligente
      if (Math.random() < 0.1) { // Log apenas 10% das requisições bem-sucedidas
        logSecurityAction('privacy_safe_presence_check', {
          totalOnlineUsers: stats?.[0]?.total_online_users || 0,
          totalActiveUsers: stats?.[0]?.total_active_users || 0
        });
      }

    } catch (error) {
      console.error('Error in privacy-safe presence:', error);
      securityMonitor.checkRequest({
        userId: user.id,
        action: 'privacy_safe_presence_check',
        userAgent: navigator.userAgent,
        requestTime: startTime,
        success: false
      });
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