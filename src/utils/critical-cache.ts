import { QueryClient } from '@tanstack/react-query';

// Critical data that should be cached aggressively
const CRITICAL_QUERY_KEYS = [
  'dashboard-data',
  'user-profile', 
  'user-stats',
  'realtime-points'
];

// Non-critical data with longer stale times
const NON_CRITICAL_QUERY_KEYS = [
  'leaderboard',
  'missions',
  'district-data',
  'shop-items'
];

export const getCacheConfig = (queryKey: string[]) => {
  const keyString = queryKey.join('-');
  
  // Critical data - fresh for 15 seconds, cache for 2 minutes
  if (CRITICAL_QUERY_KEYS.some(key => keyString.includes(key))) {
    return {
      staleTime: 1000 * 15, // 15 seconds
      gcTime: 1000 * 60 * 2, // 2 minutes
    };
  }
  
  // Non-critical data - fresh for 5 minutes, cache for 10 minutes  
  if (NON_CRITICAL_QUERY_KEYS.some(key => keyString.includes(key))) {
    return {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    };
  }
  
  // Default - fresh for 30 seconds, cache for 5 minutes
  return {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  };
};

export const optimizeQueryClient = (queryClient: QueryClient) => {
  // Pre-configure common queries with optimized cache settings
  const commonQueries = [
    ...CRITICAL_QUERY_KEYS,
    ...NON_CRITICAL_QUERY_KEYS
  ];
  
  commonQueries.forEach(queryKey => {
    const config = getCacheConfig([queryKey]);
    queryClient.setQueryDefaults([queryKey], config);
  });
  
  // Setup aggressive cleanup for memory optimization
  const cleanupInterval = setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove stale queries with no observers
    queries.forEach(query => {
      if (query.isStale() && query.getObserversCount() === 0) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    // Log cache stats in development
    if (import.meta.env.DEV) {
      console.debug('[Cache] Active queries:', queries.filter(q => q.getObserversCount() > 0).length);
    }
  }, 30000); // Every 30 seconds
  
  // Cleanup on app unload
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
  });
  
  return queryClient;
};