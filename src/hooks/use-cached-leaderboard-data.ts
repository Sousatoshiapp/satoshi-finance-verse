import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { getCachedLeaderboardData, setCachedLeaderboardData } from '../utils/redis-cache';

export const useCachedLeaderboardData = (type: string = 'weekly', limit: number = 50) => {
  return useQuery({
    queryKey: ['leaderboard-data-cached', type, limit],
    queryFn: async () => {
      const cachedData = await getCachedLeaderboardData(type, limit);
      if (cachedData) {
        return cachedData;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, level, xp, points, streak, subscription_tier')
        .order('xp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (data) {
        await setCachedLeaderboardData(type, data, limit);
      }

      return data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};
