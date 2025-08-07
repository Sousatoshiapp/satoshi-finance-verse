import { useMemo } from 'react';
import { useCachedLeaderboardData } from './use-cached-leaderboard-data';
import { useLeaderboardProcessingWorker } from '../utils/web-workers';

export const useOptimizedLeaderboard = (type: string = 'weekly', limit: number = 50) => {
  const { data: leaderboardData, isLoading, error } = useCachedLeaderboardData(type, limit);
  const { execute: processLeaderboard } = useLeaderboardProcessingWorker();

  const optimizedLeaderboard = useMemo(() => {
    if (!leaderboardData) return [];

    return leaderboardData.map((user: any, index: number) => ({
      ...user,
      rank: index + 1,
      percentile: Math.round((1 - (index / leaderboardData.length)) * 100)
    }));
  }, [leaderboardData]);

  const processWithFilters = async (filters: any) => {
    if (!leaderboardData) return [];

    try {
      return await processLeaderboard({ 
        data: leaderboardData, 
        filters 
      });
    } catch (error) {
      console.warn('Leaderboard processing failed, using fallback:', error);
      return optimizedLeaderboard;
    }
  };

  return {
    data: optimizedLeaderboard,
    isLoading,
    error,
    processWithFilters
  };
};
