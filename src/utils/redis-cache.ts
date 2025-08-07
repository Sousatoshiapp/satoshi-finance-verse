let Redis: any = null;

try {
  Redis = require('redis');
} catch (error) {
  console.warn('Redis not available, using memory cache fallback');
}

class RedisCache {
  private client: any = null;
  private isConnected = false;
  private memoryCache = new Map<string, { data: any; expires: number }>();

  async connect() {
    if (!Redis || !this.client && !this.isConnected) {
      try {
        if (Redis) {
          this.client = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
          });
          
          this.client.on('error', (err: any) => {
            console.warn('Redis Client Error:', err);
            this.isConnected = false;
          });

          await this.client.connect();
          this.isConnected = true;
        }
      } catch (error) {
        console.warn('Redis connection failed, falling back to memory cache:', error);
        this.isConnected = false;
      }
    }
  }

  async get(key: string) {
    if (this.isConnected && this.client) {
      try {
        await this.connect();
        const data = await this.client?.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis get error:', error);
      }
    }
    
    const cached = this.memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    if (cached && cached.expires <= Date.now()) {
      this.memoryCache.delete(key);
    }
    
    return null;
  }

  async set(key: string, value: any, ttl: number = 300) {
    if (this.isConnected && this.client) {
      try {
        await this.connect();
        await this.client?.setEx(key, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        console.warn('Redis set error:', error);
      }
    }
    
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  async invalidate(pattern: string) {
    if (this.isConnected && this.client) {
      try {
        await this.connect();
        const keys = await this.client?.keys(pattern);
        if (keys?.length) {
          await this.client?.del(keys);
        }
      } catch (error) {
        console.warn('Redis invalidate error:', error);
      }
    }
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async invalidateQueries(queryKeys: string[]) {
    for (const key of queryKeys) {
      await this.invalidate(`*${key}*`);
    }
  }
}

export const redisCache = new RedisCache();

export const getCachedDashboardData = async (userId: string) => {
  const cacheKey = `dashboard:${userId}`;
  return await redisCache.get(cacheKey);
};

export const setCachedDashboardData = async (userId: string, data: any) => {
  const cacheKey = `dashboard:${userId}`;
  await redisCache.set(cacheKey, data, 120);
};

export const getCachedLeaderboardData = async (type: string, limit: number = 50) => {
  const cacheKey = `leaderboard:${type}:${limit}`;
  return await redisCache.get(cacheKey);
};

export const setCachedLeaderboardData = async (type: string, data: any, limit: number = 50) => {
  const cacheKey = `leaderboard:${type}:${limit}`;
  await redisCache.set(cacheKey, data, 180);
};
