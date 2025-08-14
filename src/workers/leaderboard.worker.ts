// Leaderboard Processing Web Worker
// Handles complex leaderboard calculations and sorting

self.onmessage = function(event) {
  const { taskId, type, data } = event.data;
  
  try {
    if (type === 'leaderboard') {
      const result = processLeaderboard(data);
      self.postMessage({ taskId, result });
    } else {
      throw new Error(`Unknown task type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ taskId, error: error.message });
  }
};

function processLeaderboard(data: any) {
  const { 
    users, 
    sortBy = 'xp', 
    limit = 10, 
    filters = {}, 
    calculateScores = false,
    timeframe = 'all'
  } = data;
  
  let processedUsers = [...users];
  
  // Apply filters
  if (filters.minLevel) {
    processedUsers = processedUsers.filter(user => user.level >= filters.minLevel);
  }
  
  if (filters.district) {
    processedUsers = processedUsers.filter(user => user.district === filters.district);
  }
  
  if (filters.subscription) {
    processedUsers = processedUsers.filter(user => user.subscriptionTier === filters.subscription);
  }
  
  // Calculate composite scores if needed
  if (calculateScores) {
    processedUsers = processedUsers.map(user => ({
      ...user,
      compositeScore: calculateCompositeScore(user)
    }));
  }
  
  // Apply timeframe filters
  if (timeframe !== 'all') {
    const cutoffDate = getTimeframeCutoff(timeframe);
    processedUsers = processedUsers.filter(user => 
      new Date(user.lastActivityDate) >= cutoffDate
    );
  }
  
  // Sort with optimized algorithm
  const sortField = calculateScores ? 'compositeScore' : sortBy;
  processedUsers.sort((a, b) => {
    const aValue = a[sortField] || 0;
    const bValue = b[sortField] || 0;
    
    // Primary sort
    if (bValue !== aValue) {
      return bValue - aValue;
    }
    
    // Secondary sort by XP for ties
    if (sortField !== 'xp') {
      return (b.xp || 0) - (a.xp || 0);
    }
    
    // Tertiary sort by level for ties
    return (b.level || 0) - (a.level || 0);
  });
  
  // Limit and add rankings
  const rankedUsers = processedUsers
    .slice(0, limit)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      // Calculate rank movement if previous rankings provided
      rankChange: calculateRankChange(user, data.previousRankings)
    }));
  
  // Calculate additional stats
  const stats = {
    totalUsers: users.length,
    filteredUsers: processedUsers.length,
    averageLevel: processedUsers.length > 0 
      ? processedUsers.reduce((sum, user) => sum + (user.level || 0), 0) / processedUsers.length 
      : 0,
    averageXP: processedUsers.length > 0 
      ? processedUsers.reduce((sum, user) => sum + (user.xp || 0), 0) / processedUsers.length 
      : 0,
    topPerformers: rankedUsers.slice(0, 3)
  };
  
  return {
    leaderboard: rankedUsers,
    stats,
    processedAt: Date.now()
  };
}

function calculateCompositeScore(user: any): number {
  const weights = {
    xp: 0.4,
    level: 0.2,
    points: 0.2,
    streak: 0.1,
    missions: 0.1
  };
  
  const normalizedXP = Math.log(user.xp || 1) / Math.log(100000); // Normalize to 0-1
  const normalizedLevel = (user.level || 1) / 100; // Assuming max level ~100
  const normalizedPoints = Math.log(user.points || 1) / Math.log(10000);
  const normalizedStreak = Math.min((user.streak || 0) / 30, 1); // Max streak bonus at 30 days
  const normalizedMissions = Math.min((user.completedMissions || 0) / 100, 1);
  
  return (
    normalizedXP * weights.xp +
    normalizedLevel * weights.level +
    normalizedPoints * weights.points +
    normalizedStreak * weights.streak +
    normalizedMissions * weights.missions
  ) * 1000; // Scale to meaningful number
}

function getTimeframeCutoff(timeframe: string): Date {
  const now = new Date();
  
  switch (timeframe) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo;
    default:
      return new Date(0); // Beginning of time
  }
}

function calculateRankChange(user: any, previousRankings?: any[]): number {
  if (!previousRankings) return 0;
  
  const previousEntry = previousRankings.find(p => p.id === user.id);
  if (!previousEntry) return 0;
  
  return previousEntry.rank - user.rank; // Positive = moved up, negative = moved down
}

// Export type for TypeScript
export {};