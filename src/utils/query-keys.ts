// Centralized query key factory for better cache management
export const queryKeys = {
  // User data
  user: {
    profile: (userId: string) => ['user-profile', userId] as const,
    stats: (userId: string) => ['user-stats', userId] as const,
    achievements: (userId: string) => ['user-achievements', userId] as const,
    badges: (userId: string) => ['user-badges', userId] as const,
  },
  
  // Dashboard
  dashboard: {
    data: (userId: string) => ['dashboard-data', userId] as const,
    cached: (userId: string) => ['dashboard-data-cached', userId] as const,
    overview: (userId: string) => ['dashboard-overview', userId] as const,
  },
  
  // Leaderboards
  leaderboard: {
    weekly: (type: string, limit: number) => ['leaderboard-weekly', type, limit] as const,
    monthly: (type: string, limit: number) => ['leaderboard-monthly', type, limit] as const,
    cached: (type: string, limit: number) => ['leaderboard-data-cached', type, limit] as const,
    district: (districtId: string) => ['leaderboard-district', districtId] as const,
  },
  
  // Quiz data
  quiz: {
    questions: (category?: string, difficulty?: string) => ['quiz-questions', category, difficulty] as const,
    sessions: (userId: string) => ['quiz-sessions', userId] as const,
    progress: (userId: string) => ['quiz-progress', userId] as const,
    results: (sessionId: string) => ['quiz-results', sessionId] as const,
  },
  
  // Duels
  duels: {
    active: (userId: string) => ['duels-active', userId] as const,
    history: (userId: string) => ['duels-history', userId] as const,
    invites: (userId: string) => ['duel-invites', userId] as const,
    queue: () => ['duel-queue'] as const,
  },
  
  // Districts
  districts: {
    list: () => ['districts-list'] as const,
    detail: (districtId: string) => ['district-detail', districtId] as const,
    members: (districtId: string) => ['district-members', districtId] as const,
    teams: (districtId: string) => ['district-teams', districtId] as const,
  },
  
  // Store
  store: {
    items: () => ['store-items'] as const,
    purchases: (userId: string) => ['store-purchases', userId] as const,
    inventory: (userId: string) => ['store-inventory', userId] as const,
  },
  
  // Missions
  missions: {
    daily: () => ['missions-daily'] as const,
    progress: (userId: string) => ['missions-progress', userId] as const,
    completed: (userId: string) => ['missions-completed', userId] as const,
  },
  
  // Learning
  learning: {
    modules: () => ['learning-modules'] as const,
    progress: (userId: string, moduleId?: string) => ['learning-progress', userId, moduleId] as const,
    concepts: (userId: string) => ['learning-concepts', userId] as const,
    analytics: (userId: string) => ['learning-analytics', userId] as const,
  },
  
  // Crisis/Emergency
  crisis: {
    active: () => ['crisis-active'] as const,
    contributions: (userId: string) => ['crisis-contributions', userId] as const,
    district: (districtId: string) => ['crisis-district', districtId] as const,
  },
  
  // Admin queries
  admin: {
    users: (page: number, limit: number) => ['admin-users', page, limit] as const,
    stats: () => ['admin-stats'] as const,
    bots: () => ['admin-bots'] as const,
    questions: (page: number) => ['admin-questions', page] as const,
  },
} as const;

// Helper function to invalidate related queries
export const getRelatedQueryKeys = (baseKey: string, context?: Record<string, any>) => {
  const related: Array<readonly (string | number)[]> = [];
  
  switch (baseKey) {
    case 'user-profile':
      related.push(
        queryKeys.dashboard.data(context?.userId || ''),
        queryKeys.user.stats(context?.userId || ''),
        ['leaderboard', 'weekly']
      );
      break;
      
    case 'dashboard-data':
      related.push(
        queryKeys.user.profile(context?.userId || ''),
        queryKeys.missions.progress(context?.userId || ''),
        queryKeys.quiz.progress(context?.userId || '')
      );
      break;
      
    case 'quiz-completion':
      related.push(
        queryKeys.dashboard.data(context?.userId || ''),
        queryKeys.user.stats(context?.userId || ''),
        ['leaderboard', 'weekly'],
        queryKeys.missions.progress(context?.userId || '')
      );
      break;
      
    case 'duel-completion':
      related.push(
        queryKeys.dashboard.data(context?.userId || ''),
        queryKeys.duels.history(context?.userId || ''),
        ['leaderboard', 'weekly']
      );
      break;
      
    case 'mission-completion':
      related.push(
        queryKeys.dashboard.data(context?.userId || ''),
        queryKeys.user.profile(context?.userId || ''),
        queryKeys.missions.progress(context?.userId || '')
      );
      break;
  }
  
  return related;
};

// Smart invalidation based on data relationships
export const createSmartInvalidator = (queryClient: any) => {
  return {
    invalidateUserData: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.stats(userId) });
    },
    
    invalidateLeaderboards: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    
    invalidateQuizData: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz.progress(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz.sessions(userId) });
    },
    
    invalidateByAction: (action: string, context: Record<string, any>) => {
      const relatedKeys = getRelatedQueryKeys(action, context);
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  };
};