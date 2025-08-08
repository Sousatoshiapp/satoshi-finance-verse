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
    staleTime: 0, // Force fresh data to prevent cache issues
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: true, // Always refresh on mount
    retry: 1,
  });
};
