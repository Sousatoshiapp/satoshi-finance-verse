import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLevelSync } from "./use-level-sync";

export interface DashboardData {
  profile: any;
  avatar: any;
  district: any;
  team: any;
  nextLevelXP: number;
  calculatedLevel: number;
  completedQuizzes: number;
}

const fetchDashboardDataOptimized = async (): Promise<DashboardData | null> => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  try {
    // Use optimized database function for single query
    const { data: optimizedData, error } = await supabase
      .rpc('get_dashboard_data_optimized', { target_user_id: authUser.id });

    if (error) {
      console.warn('Optimized query failed, falling back to individual queries:', error);
      return fetchDashboardDataFallback(authUser.id);
    }

    if (!optimizedData) return null;

    const parsed = optimizedData as any;
    return {
      profile: {
        ...parsed.profile,
        level: parsed.profile?.level || 1
      },
      avatar: parsed.avatar,
      district: parsed.district,
      team: parsed.team,
      nextLevelXP: parsed.nextLevelXP || 100,
      calculatedLevel: parsed.profile?.level || 1,
      completedQuizzes: parsed.completedQuizzes || 0
    };
  } catch (error) {
    console.warn('Database function not available, using fallback:', error);
    return fetchDashboardDataFallback(authUser.id);
  }
};

// Fallback to individual queries if optimized function fails
const fetchDashboardDataFallback = async (userId: string): Promise<DashboardData | null> => {
  // Get profile with avatar - using same query structure as Profile page
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_image_url,
      current_avatar_id,
      avatars!current_avatar_id (
        id, name, image_url
      )
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile) return null;

  // Parallel queries for district, team, and quiz completions
  const [districtResult, teamResult, quizResult] = await Promise.all([
    supabase
      .from('user_districts')
      .select(`
        districts(
          id, name, color_primary, color_secondary, theme, 
          sponsor_logo_url, sponsor_company, description
        )
      `)
      .eq('user_id', profile.id)
      .eq('is_residence', true)
      .maybeSingle(),
    
    supabase
      .from('team_members')
      .select(`district_teams(id, name, team_color)`)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .maybeSingle(),

    // Get completed quiz sessions count
    supabase
      .from('quiz_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('session_type', 'practice')
      .gte('questions_correct', 5) // Only count quizzes with at least 5 correct answers
  ]);

  const calculatedLevel = profile.level || 1;
  
  // Get correct next level XP from database
  const { data: nextLevelData } = await supabase.rpc('get_next_level_xp', { 
    current_level: calculatedLevel 
  });
  const nextLevelXP = nextLevelData || (calculatedLevel * 500); // Fallback
  
  const completedQuizzes = quizResult.count || 0;

  return {
    profile: { ...profile, level: calculatedLevel },
    avatar: profile.avatars,
    district: districtResult.data?.districts,
    team: teamResult.data?.district_teams,
    nextLevelXP,
    calculatedLevel,
    completedQuizzes
  };
};

export const useDashboardData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Enable level sync for automatic corrections
  useLevelSync();
  
  // Set up realtime subscription for profile and quiz updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated, invalidating dashboard cache:', payload);
          // Immediately invalidate and refetch for level changes
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
          queryClient.refetchQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public', 
          table: 'quiz_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate dashboard data when new quiz is completed
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
          queryClient.refetchQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    // Listen to custom avatar change events
    const handleAvatarChange = () => {
      console.log('Avatar changed event received, invalidating dashboard cache');
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      // Force refresh with delay to ensure DB update is complete
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['dashboard-data'] });
      }, 1000);
    };

    window.addEventListener('avatar-changed', handleAvatarChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('avatar-changed', handleAvatarChange);
    };
  }, [user, queryClient]);
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardDataOptimized,
    staleTime: 0, // Force fresh data on every fetch to prevent cache issues
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: true, // Always refresh on component mount
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
