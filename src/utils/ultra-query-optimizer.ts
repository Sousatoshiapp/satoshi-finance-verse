// FASE 3: Ultra Query Optimizer - Otimização global de queries
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// FASE 3.1: Super Queries para múltiplas telas
interface SuperQueryConfig {
  staleTime: number;
  gcTime: number;
  enabled: boolean;
  prefetchOnMount?: boolean;
}

const SUPER_QUERY_CONFIG: Record<string, SuperQueryConfig> = {
  dashboard: {
    staleTime: 30 * 1000,      // 30s para dashboard
    gcTime: 5 * 60 * 1000,     // 5min cache
    enabled: true,
    prefetchOnMount: true
  },
  profile: {
    staleTime: 60 * 1000,      // 1min para profile
    gcTime: 10 * 60 * 1000,    // 10min cache
    enabled: true,
    prefetchOnMount: true
  },
  social: {
    staleTime: 20 * 1000,      // 20s para social (mais dinâmico)
    gcTime: 3 * 60 * 1000,     // 3min cache
    enabled: true
  },
  quiz: {
    staleTime: 2 * 60 * 1000,  // 2min para quiz (menos dinâmico)
    gcTime: 15 * 60 * 1000,    // 15min cache
    enabled: true
  },
  leaderboard: {
    staleTime: 45 * 1000,      // 45s para leaderboard
    gcTime: 5 * 60 * 1000,     // 5min cache
    enabled: true
  }
};

class UltraQueryOptimizer {
  private queryClient: QueryClient;
  private prefetchQueue = new Set<string>();
  private requestCache = new Map<string, Promise<any>>();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.initBackground();
  }

  // FASE 3.2: Background prefetching baseado na rota atual
  async prefetchForRoute(routeName: string) {
    const config = SUPER_QUERY_CONFIG[routeName];
    if (!config?.prefetchOnMount) return;

    const prefetchPromises: Promise<any>[] = [];

    switch (routeName) {
      case 'dashboard':
        prefetchPromises.push(
          this.prefetchQuery('dashboard-super', () => this.fetchDashboardSuper()),
          this.prefetchQuery('user-profile', () => this.fetchUserProfile()),
          this.prefetchQuery('daily-missions', () => this.fetchDailyMissions())
        );
        break;

      case 'profile':
        prefetchPromises.push(
          this.prefetchQuery('user-profile', () => this.fetchUserProfile()),
          this.prefetchQuery('user-stats', () => this.fetchUserStats()),
          this.prefetchQuery('user-achievements', () => this.fetchUserAchievements())
        );
        break;

      case 'social':
        prefetchPromises.push(
          this.prefetchQuery('social-feed', () => this.fetchSocialFeed()),
          this.prefetchQuery('user-friends', () => this.fetchUserFriends()),
          this.prefetchQuery('online-users', () => this.fetchOnlineUsers())
        );
        break;

      case 'quiz':
        prefetchPromises.push(
          this.prefetchQuery('quiz-categories', () => this.fetchQuizCategories()),
          this.prefetchQuery('user-progress', () => this.fetchUserProgress())
        );
        break;

      case 'leaderboard':
        prefetchPromises.push(
          this.prefetchQuery('global-leaderboard', () => this.fetchGlobalLeaderboard()),
          this.prefetchQuery('weekly-leaderboard', () => this.fetchWeeklyLeaderboard())
        );
        break;
    }

    // Execute all prefetches in parallel
    await Promise.allSettled(prefetchPromises);
  }

  // FASE 3.3: Smart prefetch com deduplication
  private async prefetchQuery(key: string, queryFn: () => Promise<any>) {
    if (this.prefetchQueue.has(key)) return;
    
    this.prefetchQueue.add(key);
    
    try {
      await this.queryClient.prefetchQuery({
        queryKey: [key],
        queryFn,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000
      });
    } catch (error) {
      console.debug(`Failed to prefetch ${key}:`, error);
    } finally {
      this.prefetchQueue.delete(key);
    }
  }

  // FASE 3.4: Request deduplication global
  async deduplicatedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestCache.has(key)) {
      return this.requestCache.get(key)!;
    }

    const promise = requestFn();
    this.requestCache.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Remove after 5 seconds to allow for deduplication window
      setTimeout(() => {
        this.requestCache.delete(key);
      }, 5000);
    }
  }

  // FASE 3.5: Background cache warming
  private initBackground() {
    // Warm cache every 2 minutes for critical queries
    setInterval(() => {
      this.warmCriticalCache();
    }, 2 * 60 * 1000);

    // Clean expired cache every 5 minutes
    setInterval(() => {
      this.cleanExpiredCache();
    }, 5 * 60 * 1000);
  }

  private async warmCriticalCache() {
    const criticalQueries = [
      'dashboard-super',
      'user-profile',
      'daily-missions'
    ];

    for (const query of criticalQueries) {
      const cached = this.queryClient.getQueryData([query]);
      if (!cached) {
        this.prefetchQuery(query, this.getCriticalQueryFn(query));
      }
    }
  }

  private cleanExpiredCache() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach(query => {
      const staleness = Date.now() - (query.state.dataUpdatedAt || 0);
      if (staleness > 10 * 60 * 1000) { // 10 minutes
        query.reset();
      }
    });
  }

  // FASE 3.6: Query functions otimizadas
  private async fetchDashboardSuper() {
    return this.deduplicatedRequest('dashboard-super', async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      // Use existing dashboard hook data
      const { data: dashboardData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      return dashboardData;
    });
  }

  private async fetchUserProfile() {
    return this.deduplicatedRequest('user-profile', async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      return profile;
    });
  }

  private async fetchDailyMissions() {
    return this.deduplicatedRequest('daily-missions', async () => {
      const { data } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data;
    });
  }

  private async fetchUserStats() {
    return this.deduplicatedRequest('user-stats', async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      return profile;
    });
  }

  private async fetchUserAchievements() {
    return this.deduplicatedRequest('user-achievements', async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });
      
      return achievements;
    });
  }

  private async fetchSocialFeed() {
    return this.deduplicatedRequest('social-feed', async () => {
      const { data } = await supabase
        .from('activity_feed')
        .select('*, profiles(nickname, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(20);
      
      return data;
    });
  }

  private async fetchUserFriends() {
    return this.deduplicatedRequest('user-friends', async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      const { data: following } = await supabase
        .from('user_follows')
        .select('*, profiles!user_follows_following_id_fkey(nickname, avatar_url)')
        .eq('follower_id', data.user.id);
      
      return following;
    });
  }

  private async fetchOnlineUsers() {
    return this.deduplicatedRequest('online-users', async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, last_seen')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .limit(50);
      
      return data;
    });
  }

  private async fetchQuizCategories() {
    return this.deduplicatedRequest('quiz-categories', async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('category')
        .limit(50);
      
      return data;
    });
  }

  private async fetchUserProgress() {
    return this.deduplicatedRequest('user-progress', async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', data.user.id)
        .limit(10);
      
      return sessions;
    });
  }

  private async fetchGlobalLeaderboard() {
    return this.deduplicatedRequest('global-leaderboard', async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, xp, level')
        .eq('is_bot', false)
        .order('xp', { ascending: false })
        .limit(100);
      
      return data;
    });
  }

  private async fetchWeeklyLeaderboard() {
    return this.deduplicatedRequest('weekly-leaderboard', async () => {
      const { data } = await supabase
        .from('weekly_leaderboards')
        .select('*, profiles(nickname, avatar_url)')
        .order('weekly_xp', { ascending: false })
        .limit(50);
      
      return data;
    });
  }

  private getCriticalQueryFn(queryKey: string) {
    const fnMap: Record<string, () => Promise<any>> = {
      'dashboard-super': () => this.fetchDashboardSuper(),
      'user-profile': () => this.fetchUserProfile(),
      'daily-missions': () => this.fetchDailyMissions()
    };
    
    return fnMap[queryKey] || (() => Promise.resolve(null));
  }

  // FASE 3.7: Public API
  getConfig(routeName: string) {
    return SUPER_QUERY_CONFIG[routeName] || SUPER_QUERY_CONFIG.dashboard;
  }

  invalidateRouteQueries(routeName: string) {
    const routeQueries = this.getRouteQueries(routeName);
    routeQueries.forEach(query => {
      this.queryClient.invalidateQueries({ queryKey: [query] });
    });
  }

  private getRouteQueries(routeName: string): string[] {
    const queryMap: Record<string, string[]> = {
      dashboard: ['dashboard-super', 'user-profile', 'daily-missions'],
      profile: ['user-profile', 'user-stats', 'user-achievements'],
      social: ['social-feed', 'user-friends', 'online-users'],
      quiz: ['quiz-categories', 'user-progress'],
      leaderboard: ['global-leaderboard', 'weekly-leaderboard']
    };
    
    return queryMap[routeName] || [];
  }
}

// Export singleton
let ultraQueryOptimizer: UltraQueryOptimizer | null = null;

export const initUltraQueryOptimizer = (queryClient: QueryClient) => {
  if (!ultraQueryOptimizer) {
    ultraQueryOptimizer = new UltraQueryOptimizer(queryClient);
  }
  return ultraQueryOptimizer;
};

export const useUltraQueryOptimizer = () => {
  const queryClient = useQueryClient();
  
  if (!ultraQueryOptimizer) {
    ultraQueryOptimizer = new UltraQueryOptimizer(queryClient);
  }
  
  return ultraQueryOptimizer;
};

export default UltraQueryOptimizer;