import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AVATAR_QUERY_FRAGMENT, resolveAvatarImage, type AvatarData, type ResolvedAvatar } from '@/lib/avatar-utils';

interface UseAvatarDataOptions {
  userId?: string;
  profileId?: string;
  enabled?: boolean;
}

interface UseAvatarDataReturn {
  avatarData: ResolvedAvatar | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Centralized hook for fetching and resolving avatar data
 * Handles both auth user ID and profile ID lookups
 */
export function useAvatarData({ 
  userId, 
  profileId, 
  enabled = true 
}: UseAvatarDataOptions = {}): UseAvatarDataReturn {
  const [avatarData, setAvatarData] = useState<ResolvedAvatar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatarData = async () => {
    if (!enabled || (!userId && !profileId)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select(`nickname, ${AVATAR_QUERY_FRAGMENT}`);

      if (profileId) {
        query = query.eq('id', profileId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: queryError } = await query.single();

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const resolved = resolveAvatarImage({
          profile_image_url: data.profile_image_url,
          current_avatar_id: data.current_avatar_id,
          avatars: data.avatars || null
        }, data.nickname);
        setAvatarData(resolved);
      }
    } catch (err) {
      console.error('Error fetching avatar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch avatar data');
      // Set default fallback
      setAvatarData({
        imageUrl: '/avatars/default-avatar.jpg',
        fallbackText: 'U',
        source: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatarData();
    
    // Listen for real-time updates to profiles table
    const channel = supabase
      .channel('profile-avatar-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: userId ? `user_id=eq.${userId}` : profileId ? `id=eq.${profileId}` : ''
        },
        () => {
          fetchAvatarData();
        }
      )
      .subscribe();

    // Listen for custom avatar change events
    const handleAvatarChanged = () => {
      fetchAvatarData();
    };
    
    window.addEventListener('avatar-changed', handleAvatarChanged);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('avatar-changed', handleAvatarChanged);
    };
  }, [userId, profileId, enabled]);

  return {
    avatarData,
    loading,
    error,
    refetch: fetchAvatarData
  };
}

/**
 * Hook for getting current user's avatar data
 */
export function useCurrentUserAvatar(): UseAvatarDataReturn {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  return useAvatarData({ userId: currentUserId, enabled: !!currentUserId });
}