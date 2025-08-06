import { AdaptiveMission, UserProfile } from "./use-daily-missions";

interface RewardPackage {
  xp: number;
  btz: number;
  bonusItems: string[];
  multiplier: number;
}

interface AdaptiveRewardCalculator {
  calculateMissionReward: (mission: AdaptiveMission, userProfile: UserProfile) => RewardPackage;
  applyStreakBonus: (baseReward: number, streakLength: number) => number;
  calculateDifficultyBonus: (difficulty: string, userLevel: number) => number;
}

export function useAdaptiveRewards(): AdaptiveRewardCalculator {
  const calculateMissionReward = (mission: AdaptiveMission, userProfile: UserProfile): RewardPackage => {
    let baseXP = mission.xp_reward;
    let baseBTZ = mission.beetz_reward;
    
    if (mission.difficultyAdjusted) {
      baseXP *= 1.2;
      baseBTZ *= 1.2;
    }
    
    if (mission.basedOnWeakness) {
      baseXP *= 1.5;
      baseBTZ *= 1.3;
    }
    
    const streakMultiplier = applyStreakBonus(1, userProfile.currentStreak);
    
    const levelBonus = Math.min(1 + (userProfile.level * 0.05), 2.0);
    
    const finalMultiplier = streakMultiplier * levelBonus;
    
    const bonusItems: string[] = [];
    if (mission.difficultyAdjusted) bonusItems.push('streak_protection');
    if (mission.basedOnWeakness) bonusItems.push('focus_boost');
    if (userProfile.currentStreak >= 7) bonusItems.push('streak_master');
    
    return {
      xp: Math.round(baseXP * finalMultiplier),
      btz: Math.round(baseBTZ * finalMultiplier),
      bonusItems,
      multiplier: finalMultiplier
    };
  };

  const applyStreakBonus = (baseReward: number, streakLength: number): number => {
    const streakMultiplier = Math.min(1 + (streakLength * 0.1), 2.0);
    return baseReward * streakMultiplier;
  };

  const calculateDifficultyBonus = (difficulty: string, userLevel: number): number => {
    const difficultyMultipliers = {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5
    };
    
    const baseDifficultyBonus = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0;
    
    if (difficulty === 'hard' && userLevel >= 10) {
      return baseDifficultyBonus * 1.2;
    }
    
    if (difficulty === 'easy' && userLevel >= 15) {
      return baseDifficultyBonus * 0.8;
    }
    
    return baseDifficultyBonus;
  };

  return {
    calculateMissionReward,
    applyStreakBonus,
    calculateDifficultyBonus
  };
}
