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
    staleTime: 5 * 60 * 1000, // FASE 1: Cache agressivo de 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos retenção
    refetchOnWindowFocus: false, // Sem refetch automático
    refetchOnMount: false, // Só se stale
    retry: 1,
  });
};
