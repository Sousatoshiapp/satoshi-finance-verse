import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardData {
  profile: any;
  avatar: any;
  district: any;
  team: any;
  nextLevelXP: number;
  calculatedLevel: number;
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
      calculatedLevel: parsed.profile?.level || 1
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

  // Parallel queries for district and team
  const [districtResult, teamResult] = await Promise.all([
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
      .maybeSingle()
  ]);

  const calculatedLevel = profile.level || 1;
  const nextLevelXP = (calculatedLevel + 1) * 100; // Simple calculation

  return {
    profile: { ...profile, level: calculatedLevel },
    avatar: profile.avatars,
    district: districtResult.data?.districts,
    team: teamResult.data?.district_teams,
    nextLevelXP,
    calculatedLevel
  };
};

export const useDashboardData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardDataOptimized,
    staleTime: 5 * 60 * 1000, // 5 minutes (increased for better performance)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
