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

// Query ultra-otimizada com melhor tratamento de erro e debug
const fetchUltraDashboardData = async (userId: string): Promise<UltraDashboardData | null> => {
  console.log('🔍 Dashboard Query iniciada para userId:', userId);
  
  // Tentar localStorage cache primeiro (backup instantâneo)
  const cacheKey = `ultra-dashboard-${userId}`;
  const cached = localStorage.getItem(cacheKey);
  
  try {
    // Usar APENAS a função RPC otimizada (CORRIGIDA)
    console.log('🚀 Executando RPC get_dashboard_data_optimized...');
    
    const { data: superData, error } = await supabase
      .rpc('get_dashboard_data_optimized', { target_user_id: userId });

    if (error) {
      console.error('❌ Dashboard RPC Error:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      // Não lançar erro, continuar para fallback
    } else if (superData) {
      console.log('✅ RPC retornou dados:', superData);
      
      const parsed = superData as any;
      const result = {
        profile: parsed.profile,
        avatar: parsed.avatar,
        district: parsed.district,
        team: parsed.team,
        points: parsed.points || parsed.profile?.points || 0,
        xp: parsed.xp || parsed.profile?.xp || 0,
        level: parsed.level || parsed.profile?.level || 1,
        nextLevelXP: parsed.nextLevelXP || 100,
        streak: parsed.streak || parsed.profile?.streak || 0,
        completedQuizzes: parsed.completedQuizzes || 0,
        dailyMissions: parsed.dailyMissions || [],
        leaderboard: parsed.leaderboard || [],
        subscription: parsed.subscription || { tier: 'free' },
        btzYield: parsed.btzYield || 0,
      };
      
      console.log('✅ Dados processados com sucesso:', result);
      
      // Cache no localStorage para próxima visita
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    } else {
      console.warn('⚠️ RPC retornou null/undefined, usando fallback');
    }
  } catch (error) {
    console.error('💥 RPC query exception:', error);
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
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid errors if no profile

    return {
      profile: profile || {
        id: null,
        user_id: userId,
        nickname: 'User',
        level: 1,
        xp: 0,
        points: 0,
        streak: 0,
        consecutive_login_days: 0,
        last_login_date: null,
        current_avatar_id: null,
        subscription_tier: 'free',
        created_at: new Date().toISOString()
      },
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
  } catch (fallbackError) {
    console.error('Profile fallback failed:', fallbackError);
    
    // Último recurso - dados hardcoded funcionais
    return {
      profile: {
        id: null,
        user_id: userId,
        nickname: 'User',
        level: 1,
        xp: 0,
        points: 0,
        streak: 0,
        consecutive_login_days: 0,
        last_login_date: null,
        current_avatar_id: null,
        subscription_tier: 'free',
        created_at: new Date().toISOString()
      },
      avatar: null,
      district: null,
      team: null,
      points: 0,
      xp: 0,
      level: 1,
      nextLevelXP: 100,
      streak: 0,
      completedQuizzes: 0,
      dailyMissions: [],
      leaderboard: [],
      subscription: { tier: 'free' },
      btzYield: 0,
    };
  }
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