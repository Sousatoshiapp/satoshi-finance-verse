export const YIELD_CAPS = {
  MAX_DAILY_PERCENTAGE: 0.001, // 0,1% do BTZ total
  ABSOLUTE_DAILY_CAP: 5, // 5 BTZ máximo por dia
  BASE_RATE: 0.001 // 0.1% fixo ao dia
};

export function useYieldCaps() {
  const calculateDailyYield = (totalBTZ: number): number => {
    const percentageYield = totalBTZ * YIELD_CAPS.MAX_DAILY_PERCENTAGE;
    return Math.min(percentageYield, YIELD_CAPS.ABSOLUTE_DAILY_CAP);
  };

  const isWithinDailyLimit = (currentYield: number, proposedYield: number): boolean => {
    return (currentYield + proposedYield) <= YIELD_CAPS.ABSOLUTE_DAILY_CAP;
  };

  return {
    YIELD_CAPS,
    calculateDailyYield,
    isWithinDailyLimit
  };
}
