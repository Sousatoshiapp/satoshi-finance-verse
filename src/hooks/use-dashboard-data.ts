import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Get profile with avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      avatars (
        id, name, description, image_url, avatar_class, 
        district_theme, rarity, evolution_level
      )
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile) return null;

  // Parallel queries for district and team
  const [districtResult, teamResult] = await Promise.all([
    supabase
      .from('user_districts')
      .select(`districts(id, name, color_primary, color_secondary, theme)`)
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
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardDataOptimized,
    staleTime: 3 * 60 * 1000, // 3 minutes (increased from 2)
    gcTime: 10 * 60 * 1000, // 10 minutes (increased from 5)
    refetchOnWindowFocus: false,
    retry: 2, // Increased from 1
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};