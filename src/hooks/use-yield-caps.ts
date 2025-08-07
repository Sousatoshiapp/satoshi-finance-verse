import { YIELD_CONFIG, calculateDailyYield as configCalculateDailyYield } from '@/config/yield-config';

export const YIELD_CAPS = YIELD_CONFIG;

export function useYieldCaps() {
  const calculateDailyYield = (
    totalBTZ: number, 
    consecutiveDays: number = 0, 
    subscriptionTier: 'free' | 'pro' | 'elite' = 'free'
  ): number => {
    const result = configCalculateDailyYield(totalBTZ, consecutiveDays, subscriptionTier);
    return result.appliedYield;
  };

  const isWithinDailyLimit = (currentYield: number, proposedYield: number): boolean => {
    return (currentYield + proposedYield) <= YIELD_CONFIG.ABSOLUTE_DAILY_CAP;
  };

  const calculateYieldWithDetails = (
    totalBTZ: number, 
    consecutiveDays: number = 0, 
    subscriptionTier: 'free' | 'pro' | 'elite' = 'free'
  ) => {
    return configCalculateDailyYield(totalBTZ, consecutiveDays, subscriptionTier);
  };

  return {
    YIELD_CAPS: YIELD_CONFIG,
    calculateDailyYield,
    calculateYieldWithDetails,
    isWithinDailyLimit
  };
}
