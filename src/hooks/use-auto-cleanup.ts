import { useEffect, useRef } from 'react';
import { ultraCleanup } from '@/utils/ultra-performance';

// Ultra-aggressive cleanup hook for critical performance
export const useAutoCleanup = (intervalMs: number = 15000) => {
  const cleanupRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set up periodic cleanup
    cleanupRef.current = setInterval(() => {
      ultraCleanup();
    }, intervalMs);

    // Cleanup on visibility change (when tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        ultraCleanup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      ultraCleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [intervalMs]);
};