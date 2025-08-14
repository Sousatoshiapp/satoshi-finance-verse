// XP Calculation Web Worker
// Handles heavy XP calculations in background thread

self.onmessage = function(event) {
  const { taskId, type, data } = event.data;
  
  try {
    if (type === 'xp-calculation') {
      const result = calculateXP(data);
      self.postMessage({ taskId, result });
    } else {
      throw new Error(`Unknown task type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ taskId, error: error.message });
  }
};

function calculateXP(data: any) {
  const { currentXP, earnedXP, multiplier = 1, bonuses = [] } = data;
  
  // Apply multiplier
  let totalEarnedXP = earnedXP * multiplier;
  
  // Apply bonus calculations
  bonuses.forEach((bonus: any) => {
    switch (bonus.type) {
      case 'percentage':
        totalEarnedXP *= (1 + bonus.value / 100);
        break;
      case 'flat':
        totalEarnedXP += bonus.value;
        break;
      case 'streak':
        totalEarnedXP *= (1 + Math.min(bonus.streakDays * 0.01, 0.5)); // Max 50% bonus
        break;
    }
  });
  
  const newXP = currentXP + Math.floor(totalEarnedXP);
  
  // Calculate level using optimized formula
  const level = Math.floor(Math.sqrt(newXP / 100)) + 1;
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  
  // Calculate progress percentage
  const progressXP = newXP - currentLevelXP;
  const levelXPRange = nextLevelXP - currentLevelXP;
  const progress = (progressXP / levelXPRange) * 100;
  
  // Check for level up
  const levelUp = level > Math.floor(Math.sqrt(currentXP / 100)) + 1;
  
  return {
    newXP,
    level,
    currentLevelXP,
    nextLevelXP,
    progress: Math.min(100, Math.max(0, progress)),
    earnedXP: Math.floor(totalEarnedXP),
    levelUp,
    bonusesApplied: bonuses.length
  };
}

// Export type for TypeScript
export {};