/**
 * Configurações centralizadas do sistema de yield BTZ
 * Esta é a única fonte de verdade para todas as configurações de yield
 */

export const YIELD_CONFIG = {
  // Taxa base diária
  BASE_RATE: 0.001, // 0.1% ao dia
  
  // Caps de yield
  MAX_DAILY_PERCENTAGE: 0.001, // 0.1% do BTZ total
  ABSOLUTE_DAILY_CAP: 5, // 5 BTZ máximo por dia
  
  // Bônus de subscription
  SUBSCRIPTION_BONUS: {
    free: 0,
    pro: 0.0005, // +0.05%
    elite: 0.001  // +0.1%
  },
  
  // Bônus de streak
  STREAK_BONUS: {
    DAYS_PER_TIER: 5, // A cada 5 dias
    BONUS_PER_TIER: 0.0001, // +0.01% por tier
    MAX_BONUS: 0.003 // Máximo 0.3%
  },
  
  // Configurações de BTZ protegido
  PROTECTED_BTZ: {
    PERCENTAGE: 0.20, // 20% do total é protegido
    MIN_AMOUNT: 0 // Mínimo protegido
  },
  
  // Penalties por inatividade
  PENALTY: {
    GRACE_PERIOD_DAYS: 1, // 1 dia sem penalty
    RATES: {
      2: 0.01, // 1% nos dias 2-3
      3: 0.01,
      4: 0.02, // 2% nos dias 4-7
      5: 0.02,
      6: 0.02,
      7: 0.02,
      8: 0.05  // 5% a partir do dia 8
    }
  }
} as const;

/**
 * Calcula o yield diário baseado nas configurações
 */
export function calculateDailyYield(
  totalBTZ: number,
  consecutiveDays: number,
  subscriptionTier: 'free' | 'pro' | 'elite' = 'free'
): {
  baseYield: number;
  bonusYield: number;
  totalYield: number;
  appliedYield: number;
  wasCapped: boolean;
  yieldRate: number;
} {
  // Taxa base
  const baseRate = YIELD_CONFIG.BASE_RATE;
  
  // Bônus de subscription
  const subscriptionBonus = YIELD_CONFIG.SUBSCRIPTION_BONUS[subscriptionTier];
  
  // Bônus de streak
  const streakTiers = Math.floor(consecutiveDays / YIELD_CONFIG.STREAK_BONUS.DAYS_PER_TIER);
  const streakBonus = Math.min(
    streakTiers * YIELD_CONFIG.STREAK_BONUS.BONUS_PER_TIER,
    YIELD_CONFIG.STREAK_BONUS.MAX_BONUS
  );
  
  // Taxa total
  const totalRate = baseRate + subscriptionBonus + streakBonus;
  
  // Yield calculado
  const baseYield = Math.floor(totalBTZ * baseRate);
  const bonusYield = Math.floor(totalBTZ * (subscriptionBonus + streakBonus));
  const totalYield = baseYield + bonusYield;
  
  // Aplicar cap
  const appliedYield = Math.min(totalYield, YIELD_CONFIG.ABSOLUTE_DAILY_CAP);
  const wasCapped = appliedYield < totalYield;
  
  return {
    baseYield,
    bonusYield,
    totalYield,
    appliedYield,
    wasCapped,
    yieldRate: totalRate
  };
}

/**
 * Calcula BTZ protegido
 */
export function calculateProtectedBTZ(totalBTZ: number): number {
  return Math.max(
    YIELD_CONFIG.PROTECTED_BTZ.MIN_AMOUNT,
    Math.floor(totalBTZ * YIELD_CONFIG.PROTECTED_BTZ.PERCENTAGE)
  );
}

/**
 * Calcula penalty por inatividade
 */
export function calculateInactivityPenalty(
  totalBTZ: number,
  protectedBTZ: number,
  daysInactive: number
): {
  penaltyAmount: number;
  penaltyRate: number;
  unprotectedBTZ: number;
} {
  if (daysInactive <= YIELD_CONFIG.PENALTY.GRACE_PERIOD_DAYS) {
    return {
      penaltyAmount: 0,
      penaltyRate: 0,
      unprotectedBTZ: totalBTZ - protectedBTZ
    };
  }
  
  // Determinar taxa de penalty
  let penaltyRate = 0;
  if (daysInactive >= 8) {
    penaltyRate = 0.05; // 5%
  } else if (daysInactive >= 4) {
    penaltyRate = 0.02; // 2%
  } else if (daysInactive >= 2) {
    penaltyRate = 0.01; // 1%
  }
  
  const unprotectedBTZ = Math.max(0, totalBTZ - protectedBTZ);
  const penaltyAmount = Math.floor(unprotectedBTZ * penaltyRate);
  
  return {
    penaltyAmount,
    penaltyRate,
    unprotectedBTZ
  };
}