import { redisCache } from './redis-cache';

interface CacheInvalidationRule {
  pattern: string;
  dependencies: string[];
  ttl: number;
}

class IntelligentCacheManager {
  private rules: Map<string, CacheInvalidationRule> = new Map();

  constructor() {
    this.setupDefaultRules();
  }

  private setupDefaultRules() {
    this.addRule('dashboard-data', {
      pattern: 'dashboard:*',
      dependencies: ['user-profile', 'user-stats', 'missions'],
      ttl: 120
    });

    this.addRule('leaderboard-data', {
      pattern: 'leaderboard:*',
      dependencies: ['user-xp', 'user-level', 'user-points'],
      ttl: 180
    });

    this.addRule('user-profile', {
      pattern: 'profile:*',
      dependencies: ['user-avatar', 'user-subscription'],
      ttl: 300
    });
  }

  addRule(key: string, rule: CacheInvalidationRule) {
    this.rules.set(key, rule);
  }

  async invalidateByDependency(dependency: string) {
    const rulesToInvalidate = Array.from(this.rules.entries())
      .filter(([_, rule]) => rule.dependencies.includes(dependency));

    for (const [key, rule] of rulesToInvalidate) {
      await redisCache.invalidate(rule.pattern);
      console.log(`Invalidated cache for ${key} due to ${dependency} change`);
    }
  }

  async invalidateSpecific(keys: string[]) {
    for (const key of keys) {
      const rule = this.rules.get(key);
      if (rule) {
        await redisCache.invalidate(rule.pattern);
        console.log(`Invalidated cache for ${key}`);
      }
    }
  }

  async smartInvalidate(context: {
    userId?: string;
    action: string;
    affectedData: string[];
  }) {
    const { userId, action, affectedData } = context;

    switch (action) {
      case 'user-level-up':
        await this.invalidateByDependency('user-level');
        await this.invalidateByDependency('user-xp');
        break;

      case 'mission-completed':
        await this.invalidateSpecific(['dashboard-data']);
        if (userId) {
          await redisCache.invalidate(`dashboard:${userId}`);
        }
        break;

      case 'quiz-completed':
        await this.invalidateByDependency('user-xp');
        await this.invalidateByDependency('user-stats');
        break;

      case 'profile-updated':
        await this.invalidateByDependency('user-profile');
        if (userId) {
          await redisCache.invalidate(`profile:${userId}`);
        }
        break;

      default:
        for (const data of affectedData) {
          await this.invalidateByDependency(data);
        }
    }
  }
}

export const intelligentCacheManager = new IntelligentCacheManager();

export const useIntelligentCacheInvalidation = () => {
  const invalidateByAction = async (action: string, context: any = {}) => {
    await intelligentCacheManager.smartInvalidate({
      action,
      ...context
    });
  };

  const invalidateUserData = async (userId: string) => {
    await redisCache.invalidate(`*:${userId}`);
    await redisCache.invalidate(`${userId}:*`);
  };

  const invalidateLeaderboards = async () => {
    await redisCache.invalidate('leaderboard:*');
  };

  return {
    invalidateByAction,
    invalidateUserData,
    invalidateLeaderboards
  };
};
