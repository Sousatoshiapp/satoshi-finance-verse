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
  // Tentar localStorage cache primeiro (backup instantâneo)
  const cacheKey = `ultra-dashboard-${userId}`;
  const cached = localStorage.getItem(cacheKey);
  
  try {
    // Usar APENAS a função RPC otimizada
    const { data: superData, error } = await supabase
      .rpc('get_dashboard_data_optimized', { target_user_id: userId });

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
        dailyMissions: [],
        leaderboard: [],
        subscription: { tier: 'free' },
        btzYield: 0,
      };
      
      // Cache no localStorage para próxima visita
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    }
  } catch (error) {
    console.warn('RPC query failed, using cache:', error);
  }

  // Se falhou, usar cache do localStorage se disponível e não muito antigo
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 10 * 60 * 1000) { // 10 minutos max
        return data;
      }
    } catch {}
  }

  // Fallback mínimo apenas se tudo falhou
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

export const useUltraDashboardQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ultra-dashboard-data', user?.id],
    queryFn: () => user ? fetchUltraDashboardData(user.id) : null,
    staleTime: 5 * 60 * 1000, // 5 minutos - cache agressivo
    gcTime: 15 * 60 * 1000, // 15 minutos - retenção longa
    refetchOnWindowFocus: false, // Sem refetch automático
    refetchOnMount: false, // Só se stale
    enabled: !!user,
    retry: 1, // Apenas 1 retry
    networkMode: 'online',
  });
};