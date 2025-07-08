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

const fetchDashboardData = async (): Promise<DashboardData | null> => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  // Single consolidated query for all user data
  const [profileResult, districtResult, teamResult] = await Promise.all([
    // Profile with avatar in one query
    supabase
      .from('profiles')
      .select(`
        *,
        avatars (
          id,
          name,
          description,
          image_url,
          avatar_class,
          district_theme,
          rarity,
          evolution_level
        )
      `)
      .eq('user_id', authUser.id)
      .maybeSingle(),

    // User district
    supabase
      .from('user_districts')
      .select(`
        districts (
          id,
          name,
          color_primary,
          color_secondary,
          theme
        )
      `)
      .eq('user_id', authUser.id)
      .eq('is_residence', true)
      .maybeSingle(),

    // User team
    supabase
      .from('team_members')
      .select(`
        district_teams (
          id,
          name,
          team_color
        )
      `)
      .eq('user_id', authUser.id)
      .eq('is_active', true)
      .maybeSingle()
  ]);

  const profile = profileResult.data;
  if (!profile) return null;

  // Calculate level and next level XP in parallel
  const [calculatedLevelResult, nextLevelXPResult] = await Promise.all([
    supabase.rpc('calculate_user_level', { user_xp: profile.xp || 0 }),
    supabase.rpc('get_next_level_xp', { current_level: profile.level || 1 })
  ]);

  const calculatedLevel = calculatedLevelResult.data || profile.level || 1;
  const nextLevelXP = nextLevelXPResult.data || (calculatedLevel + 1) * 100;

  return {
    profile: {
      ...profile,
      level: calculatedLevel
    },
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
    queryFn: async () => {
      const data = await fetchDashboardData();
      
      // Update level if needed (non-blocking)
      if (data?.profile && data.calculatedLevel !== data.profile.level) {
        supabase
          .from('profiles')
          .update({ level: data.calculatedLevel })
          .eq('id', data.profile.id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
          });
      }
      
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
};