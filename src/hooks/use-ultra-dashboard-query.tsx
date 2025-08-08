// FASE 1: Dashboard Query Ultra-Otimizada - Apenas RPC otimizada
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UltraDashboardData {
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

// Query ultra-otimizada sem fallbacks complexos
const fetchUltraDashboardData = async (userId: string): Promise<UltraDashboardData | null> => {
  console.debug('🔄 Starting ultra dashboard fetch for user:', userId);
  
  // Tentar localStorage cache primeiro (backup instantâneo)
  const cacheKey = `ultra-dashboard-${userId}`;
  const cached = localStorage.getItem(cacheKey);
  
  try {
    console.debug('📡 Calling RPC get_dashboard_data_optimized...');
    // Usar APENAS a função RPC otimizada
    const { data: superData, error } = await supabase
      .rpc('get_dashboard_data_optimized', { target_user_id: userId });

    console.debug('📊 RPC Response:', { hasData: !!superData, error });

    if (superData && !error) {
      const parsed = superData as any;
      const result = {
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
        dailyMissions: parsed.dailyMissions || [],
        leaderboard: parsed.leaderboard || [],
        subscription: parsed.subscription || { tier: 'free' },
        btzYield: parsed.btzYield || 0,
      };
      
      console.debug('✅ Dashboard data processed successfully:', {
        hasProfile: !!result.profile,
        points: result.points,
        level: result.level
      });
      
      // Cache no localStorage para próxima visita
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    }
    
    if (error) {
      console.error('❌ RPC Error:', error);
    }
  } catch (error) {
    console.error('🚨 RPC query failed, trying fallback:', error);
  }

  // Se falhou, usar cache do localStorage se disponível e não muito antigo
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 10 * 60 * 1000) { // 10 minutos max
        console.debug('📦 Using cached data (age:', Math.round(age / 1000), 'seconds)');
        return data;
      }
    } catch (e) {
      console.warn('Cache parse error:', e);
    }
  }

  console.debug('⚠️ Falling back to basic profile query...');
  // Fallback robusto - usar maybeSingle para evitar erros
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fallback error:', profileError);
      return null;
    }

    const fallbackResult = {
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
    
    console.debug('🆘 Fallback data ready:', { hasProfile: !!profile });
    return fallbackResult;
  } catch (fallbackError) {
    console.error('🔥 Complete fallback failure:', fallbackError);
    return null;
  }
};

export const useUltraDashboardQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ultra-dashboard-data', user?.id],
    queryFn: () => {
      if (!user?.id) {
        console.warn('⚠️ No user ID available for dashboard query');
        return Promise.resolve(null);
      }
      return fetchUltraDashboardData(user.id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - cache agressivo
    gcTime: 15 * 60 * 1000, // 15 minutos - retenção longa
    refetchOnWindowFocus: false, // Sem refetch automático
    refetchOnMount: false, // Só se stale
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      console.error(`💥 Query retry ${failureCount}:`, error);
      return failureCount < 2; // Max 2 retries
    },
    retryDelay: 1000,
    networkMode: 'online',
  });
};