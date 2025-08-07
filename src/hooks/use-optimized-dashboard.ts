import { useMemo } from 'react';
import { useCachedDashboardData } from './use-cached-dashboard-data';
import { useAdvancedRankingWorker } from '../utils/web-workers';

export const useOptimizedDashboard = (userId: string) => {
  const { data: dashboardData, isLoading, error } = useCachedDashboardData(userId);
  const { execute: processRankings } = useAdvancedRankingWorker();

  const optimizedData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      ...dashboardData,
      processedAt: Date.now(),
      cacheHit: true
    };
  }, [dashboardData]);

  const processAdvancedRankings = async (users: any[], metrics: any) => {
    try {
      return await processRankings({ users, metrics });
    } catch (error) {
      console.warn('Advanced ranking processing failed, using fallback:', error);
      return users.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }
  };

  return {
    data: optimizedData,
    isLoading,
    error,
    processAdvancedRankings
  };
};
