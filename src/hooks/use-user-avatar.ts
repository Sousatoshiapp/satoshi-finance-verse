import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AVATAR_QUERY_FRAGMENT, resolveAvatarImage, type AvatarData, type ResolvedAvatar } from '@/lib/avatar-utils';

interface UseUserAvatarOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseUserAvatarReturn {
  avatarData: ResolvedAvatar | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Centralized hook for user avatar data with global synchronization
 * Uses React Query for caching and real-time updates
 */
export function useUserAvatar({ userId, enabled = true }: UseUserAvatarOptions = {}): UseUserAvatarReturn {
  const queryClient = useQueryClient();

  const {
    data: avatarData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-avatar', userId],
    queryFn: async () => {
      if (!userId) return null;

      console.log('🔍 Fetching avatar for userId:', userId);

      const { data, error: queryError } = await supabase
        .from('profiles')
        .select(`nickname, ${AVATAR_QUERY_FRAGMENT}`)
        .eq('user_id', userId)
        .single();

      console.log('🔍 Avatar query result:', { data, error: queryError });

      if (queryError) {
        console.error('❌ Avatar query error:', queryError);
        throw queryError;
      }

      if (data) {
        const resolved = resolveAvatarImage({
          profile_image_url: data.profile_image_url,
          current_avatar_id: data.current_avatar_id,
          avatars: data.avatars || null
        }, data.nickname);
        
        console.log('🎯 Resolved avatar:', resolved);
        return resolved;
      }

      return null;
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime in newer versions)
  });

  // Set up real-time subscription for avatar changes
  useEffect(() => {
    if (!userId || !enabled) return;

    const channel = supabase
      .channel(`user-avatar-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Invalidate and refetch when avatar-related fields change
          if (
            payload.old.current_avatar_id !== payload.new.current_avatar_id ||
            payload.old.profile_image_url !== payload.new.profile_image_url
          ) {
            queryClient.invalidateQueries({ queryKey: ['user-avatar', userId] });
            // Also invalidate related caches
            queryClient.invalidateQueries({ queryKey: ['leaderboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['social-feed'] });
          }
        }
      )
      .subscribe();

    // Listen for custom avatar change events
    const handleAvatarChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatar', userId] });
    };
    
    window.addEventListener('avatar-changed', handleAvatarChanged);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('avatar-changed', handleAvatarChanged);
    };
  }, [userId, enabled, queryClient]);

  return {
    avatarData,
    loading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook for getting current authenticated user's avatar
 */
export function useCurrentUserAvatar(): UseUserAvatarReturn {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: userLoading
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 1000 * 60 * 5,
  });

  const avatarQuery = useUserAvatar({ 
    userId: user?.id, 
    enabled: !!user?.id 
  });

  return {
    ...avatarQuery,
    loading: userLoading || avatarQuery.loading
  };
}