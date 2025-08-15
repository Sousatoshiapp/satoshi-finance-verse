/**
 * Performance cleanup utilities to reduce memory usage and optimize app performance
 */

import { adaptiveRateLimiter } from './adaptive-rate-limiter';

export const performanceCleanup = {
  // Clear corrupted rate limiter stats that cause spam
  clearRateLimiterStats: () => {
    try {
      adaptiveRateLimiter.clearCorruptedStats();
      console.log('✅ Performance cleanup: Rate limiter stats cleared');
    } catch (error) {
      console.error('❌ Performance cleanup: Error clearing rate limiter stats:', error);
    }
  },

  // Force garbage collection if available
  forceGarbageCollection: () => {
    try {
      if (window.gc) {
        window.gc();
        console.log('✅ Performance cleanup: Forced garbage collection');
      }
    } catch (error) {
      console.error('❌ Performance cleanup: Error forcing GC:', error);
    }
  },

  // Clean up old cached data
  cleanupCaches: () => {
    try {
      // Clear old localStorage entries that might be causing issues
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache_') || key.includes('temp_'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`✅ Performance cleanup: Removed ${keysToRemove.length} cached entries`);
    } catch (error) {
      console.error('❌ Performance cleanup: Error cleaning caches:', error);
    }
  },

  // Full cleanup routine
  performFullCleanup: () => {
    console.log('🧹 Starting full performance cleanup...');
    performanceCleanup.clearRateLimiterStats();
    performanceCleanup.cleanupCaches();
    performanceCleanup.forceGarbageCollection();
    console.log('✅ Full performance cleanup completed');
  }
};

// Auto cleanup on module load to fix current issues
if (typeof window !== 'undefined') {
  // Clear the corrupted rate limiter stats immediately
  performanceCleanup.clearRateLimiterStats();
}