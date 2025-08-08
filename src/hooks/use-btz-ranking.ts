import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface BTZUser {
  id: string;
  username: string;
  avatar_url?: string;
  avatarName?: string;
  profileImageUrl?: string;
  current_avatar_id?: string;
  beetz: number;
  rank: number;
}

const fetchBTZRanking = async (): Promise<BTZUser[]> => {
  try {
    // Fetch top 3 users by BTZ (points)
    const { data: topUsers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        nickname,
        profile_image_url,
        points,
        current_avatar_id,
        avatars!current_avatar_id (
          name,
          image_url
        )
      `)
      .eq('is_bot', false)
      .order('points', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching BTZ ranking:', error);
      return [];
    }

    return (topUsers || []).map((profile, index) => ({
      id: profile.id,
      username: profile.nickname, // Este campo continuará sendo username para compatibilidade
      avatar_url: (profile.avatars as any)?.image_url,
      avatarName: (profile.avatars as any)?.name,
      profileImageUrl: profile.profile_image_url,
      current_avatar_id: profile.current_avatar_id,
      beetz: profile.points || 0,
      rank: index + 1
    }));

  } catch (error) {
    console.error('Error loading BTZ ranking:', error);
    return [];
  }
};

export const useBTZRanking = () => {
  const queryClient = useQueryClient();

  // Set up realtime subscription for BTZ updates
  useEffect(() => {
    const channel = supabase
      .channel('btz-ranking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'profiles',
        },
        (payload) => {
          // Invalidate if points changed
          if (payload.old.points !== payload.new.points) {
            queryClient.invalidateQueries({ queryKey: ['btz-ranking'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['btz-ranking'],
    queryFn: fetchBTZRanking,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000
  });
};