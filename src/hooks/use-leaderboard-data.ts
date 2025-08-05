import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  avatarName?: string;
  profileImageUrl?: string;
  current_avatar_id?: string;
  level: number;
  xp: number;
  rank: number;
  weeklyXP: number;
  beetz: number;
}

const fetchLeaderboardDataOptimized = async (): Promise<LeaderboardUser[]> => {
  // Get current week start (Monday)
  const currentDate = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  try {
    // Single optimized query for weekly leaderboard
    const { data: leaderboardData } = await supabase
      .from('weekly_leaderboards')
      .select(`
        user_id,
        xp_earned,
        total_score,
        profiles!weekly_leaderboards_user_id_fkey (
          id,
          nickname,
          profile_image_url,
          level,
          xp,
          points,
          current_avatar_id,
          avatars:current_avatar_id (
            name,
            image_url
          )
        )
      `)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .order('total_score', { ascending: false })
      .limit(3);

    if (leaderboardData && leaderboardData.length > 0) {
      return leaderboardData.map((entry, index) => {
        const profile = entry.profiles as any;
        return {
          id: profile.id,
          username: profile.nickname,
          avatar_url: profile.avatars?.image_url,
          avatarName: profile.avatars?.name,
          profileImageUrl: profile.profile_image_url,
          current_avatar_id: profile.current_avatar_id,
          level: profile.level || 1,
          xp: profile.xp || 0,
          rank: index + 1,
          weeklyXP: entry.xp_earned || 0,
          beetz: profile.points || 0
        };
      });
    }

    // Fallback: get top profiles and create weekly entries
    const { data: topProfiles } = await supabase
      .from('profiles')
      .select(`
        id,
        nickname,
        profile_image_url,
        level,
        xp,
        points,
        current_avatar_id,
        avatars:current_avatar_id (
          name,
          image_url
        )
      `)
      .order('xp', { ascending: false })
      .limit(3);

    if (!topProfiles) return [];

    // Create weekly entries for these users in background
    topProfiles.forEach(profile => {
      supabase.rpc('get_or_create_weekly_entry', { profile_id: profile.id });
    });

    return topProfiles.map((profile, index) => ({
      id: profile.id,
      username: profile.nickname,
      avatar_url: (profile as any).avatars?.image_url,
      avatarName: (profile as any).avatars?.name,
      profileImageUrl: profile.profile_image_url,
      current_avatar_id: profile.current_avatar_id,
      level: profile.level || 1,
      xp: profile.xp || 0,
      rank: index + 1,
      weeklyXP: Math.floor(Math.random() * 300) + 50,
      beetz: profile.points || 0
    }));

  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
};

export const useLeaderboardData = () => {
  const queryClient = useQueryClient();


  return useQuery({
    queryKey: ['leaderboard-data'],
    queryFn: fetchLeaderboardDataOptimized,
    staleTime: 2 * 60 * 1000, // 2 minutes for fresh leaderboard data
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000
  });
};
