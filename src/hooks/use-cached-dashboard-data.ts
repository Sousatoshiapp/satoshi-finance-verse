import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { getCachedDashboardData, setCachedDashboardData } from '../utils/redis-cache';

export const useCachedDashboardData = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard-data-cached', userId],
    queryFn: async () => {
      const cachedData = await getCachedDashboardData(userId);
      if (cachedData) {
        return cachedData;
      }

      const { data, error } = await supabase
        .rpc('get_dashboard_data_optimized', { target_user_id: userId });

      if (error) throw error;

      if (data) {
        await setCachedDashboardData(userId, data);
      }

      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};
