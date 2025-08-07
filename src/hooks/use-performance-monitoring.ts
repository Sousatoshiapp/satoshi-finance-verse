import { useEffect } from 'react';
import { monitorPerformance, advancedMemoryOptimization } from '../utils/bundle-optimizer';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    monitorPerformance();
    
    const interval = setInterval(advancedMemoryOptimization, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
};

export const useMemoryOptimization = (interval: number = 30000) => {
  useEffect(() => {
    const memoryInterval = setInterval(advancedMemoryOptimization, interval);
    
    return () => {
      clearInterval(memoryInterval);
    };
  }, [interval]);
};
