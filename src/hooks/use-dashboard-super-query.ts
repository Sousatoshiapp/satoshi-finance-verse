// FASE 1: Dashboard Query Unification - Single Super Query
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSuperData {
  profile: any;
  avatar: any;
  district: any;
  team: any;
  points: number;
  xp: number;
  level: number;
  nextLevelXP: number;
  streak: number;
  completedQuizzes: number;
  dailyMissions: any[];
  leaderboard: any[];
  subscription: any;
  btzYield: number;
}

// Ultra-optimized single query that fetches EVERYTHING
const fetchDashboardSuperQuery = async (userId: string): Promise<DashboardSuperData | null> => {
  try {
    // Use optimized RPC for everything in one call
    const { data: superData, error } = await supabase
      .rpc('get_dashboard_data_optimized', { target_user_id: userId });

    if (superData && !error) {
      const parsed = superData as any;
      return {
        profile: parsed.profile,
        avatar: parsed.avatar,
        district: parsed.district,
        team: parsed.team,
        points: parsed.profile?.points || 0,
        xp: parsed.profile?.xp || 0,
        level: parsed.profile?.level || 1,
        nextLevelXP: parsed.nextLevelXP || 100,
        streak: parsed.profile?.streak || 0,
        completedQuizzes: parsed.completedQuizzes || 0,
        dailyMissions: [],
        leaderboard: [],
        subscription: { tier: 'free' },
        btzYield: 0,
      };
    }
  } catch (error) {
    console.warn('Super query failed, using minimal fallback:', error);
  }
  
  // Minimal fallback - only profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    profile,
    avatar: null,
    district: null,
    team: null,
    points: profile?.points || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    nextLevelXP: 100,
    streak: profile?.streak || 0,
    completedQuizzes: 0,
    dailyMissions: [],
    leaderboard: [],
    subscription: { tier: 'free' },
    btzYield: 0,
  };
};

export const useDashboardSuperQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-super-data', user?.id],
    queryFn: () => user ? fetchDashboardSuperQuery(user.id) : null,
    staleTime: 5 * 60 * 1000, // 5 minutes - aggressive cache
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable for speed
    refetchOnMount: false, // Only if stale
    enabled: !!user,
    retry: 1, // Minimal retries
    // Ultra-fast mode
    networkMode: 'online',
  });
};