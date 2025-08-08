import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { AVATAR_QUERY_FRAGMENT } from '@/lib/avatar-utils';

export interface FastLeaderboardUser {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  points: number;
  profile_image_url?: string;
  current_avatar_id?: string | null;
  avatars?: {
    name: string;
    image_url: string;
  } | null;
  rank: number;
}

// Single optimized query for all leaderboard data
const fetchAllLeaderboardData = async (limit: number = 50) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, 
      nickname, 
      level, 
      xp, 
      streak, 
      points, 
      ${AVATAR_QUERY_FRAGMENT}
    `)
    .eq('is_bot', false)
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const useOptimizedLeaderboardFast = (initialLimit: number = 10) => {
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard-fast', initialLimit],
    queryFn: () => fetchAllLeaderboardData(initialLimit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,   // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Memoized calculations for different sorting orders
  const leaderboards = useMemo(() => {
    if (!rawData) return { xp: [], streak: [], level: [], points: [] };

    const addRank = (users: any[], sortField: keyof FastLeaderboardUser) => {
      return [...users]
        .sort((a, b) => (b[sortField] as number) - (a[sortField] as number))
        .map((user, index) => ({ ...user, rank: index + 1 }));
    };

    return {
      xp: addRank(rawData, 'xp'),
      streak: addRank(rawData, 'streak'),
      level: addRank(rawData, 'level'),
      points: addRank(rawData, 'points'),
    };
  }, [rawData]);

  // Progressive loading for more data
  const loadMore = async (newLimit: number) => {
    return fetchAllLeaderboardData(newLimit);
  };

  return {
    leaderboards,
    isLoading,
    error,
    refetch,
    loadMore,
    hasData: !!rawData?.length,
  };
};