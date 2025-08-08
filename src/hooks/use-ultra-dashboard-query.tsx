// Simplified Dashboard Hook - Clean and Focused
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
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
  error?: string;
}

// Clear all dashboard-related cache
export const clearDashboardCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('dashboard') || key.includes('ultra-dashboard')) {
      localStorage.removeItem(key);
    }
  });
  console.log('🧹 Dashboard cache cleared');
};

// Simplified data fetching with proper error handling
const fetchDashboardData = async (userId: string): Promise<DashboardData | null> => {
  console.log('🔄 Fetching dashboard data for user:', userId);
  
  try {
    // Primary: Use optimized RPC function
    const { data, error } = await supabase
      .rpc('get_dashboard_data_optimized', { target_user_id: userId });

    if (error) {
      console.error('❌ RPC Error:', error.message);
      throw error;
    }

    if (!data) {
      console.warn('⚠️ No data returned from RPC');
      throw new Error('No data returned');
    }

    // Handle error in response
    if ((data as any).error) {
      console.warn('⚠️ RPC returned error:', (data as any).error);
      // Still try to use partial data if available
    }

    const result: DashboardData = {
      profile: (data as any).profile,
      avatar: (data as any).avatar,
      district: (data as any).district,
      team: (data as any).team,
      points: (data as any).points || 0,
      xp: (data as any).xp || 0,
      level: (data as any).level || 1,
      nextLevelXP: (data as any).nextLevelXP || 100,
      streak: (data as any).streak || 0,
      completedQuizzes: (data as any).completedQuizzes || 0,
      dailyMissions: (data as any).dailyMissions || [],
      leaderboard: (data as any).leaderboard || [],
      subscription: (data as any).subscription || { tier: 'free' },
      btzYield: (data as any).btzYield || 0,
      error: (data as any).error
    };
    
    console.log('✅ Dashboard data loaded:', {
      hasProfile: !!result.profile,
      points: result.points,
      level: result.level,
      hasError: !!result.error
    });
    
    return result;
  } catch (error) {
    console.error('🚨 Primary query failed, using fallback:', error);
    
    // Fallback: Get basic profile data
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Fallback profile query failed:', profileError);
        return null;
      }

      if (!profile) {
        console.error('❌ No profile found for user:', userId);
        return null;
      }

      const fallbackResult: DashboardData = {
        profile,
        avatar: null,
        district: null,
        team: null,
        points: profile.points || 0,
        xp: profile.xp || 0,
        level: profile.level || 1,
        nextLevelXP: 100,
        streak: profile.streak || 0,
        completedQuizzes: 0,
        dailyMissions: [],
        leaderboard: [],
        subscription: { tier: profile.subscription_tier || 'free' },
        btzYield: 0,
        error: 'Using fallback data'
      };
      
      console.log('🆘 Fallback data ready:', { nickname: profile.nickname });
      return fallbackResult;
    } catch (fallbackError) {
      console.error('🔥 Complete failure:', fallbackError);
      return null;
    }
  }
};

export const useDashboardQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: () => {
      if (!user?.id) {
        console.warn('⚠️ No user ID available for dashboard query');
        return Promise.resolve(null);
      }
      return fetchDashboardData(user.id);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount for fresh data
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      console.log(`🔄 Retry ${failureCount + 1}/3:`, error?.message);
      return failureCount < 2; // Max 3 attempts
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    networkMode: 'online',
  });
};