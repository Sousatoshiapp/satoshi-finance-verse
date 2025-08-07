/**
 * Configuração centralizada de XP
 * 
 * Aplica redução de 80% nos ganhos base de XP (multiplicador 0.2)
 * mantendo todas as lógicas de multiplicadores intactas.
 */

// Fator de redução global (80% de redução = multiplicador 0.2)
const XP_REDUCTION_FACTOR = 0.2;

/**
 * Configurações base de XP (valores após redução de 80%)
 */
export const XP_CONFIG = {
  // Quiz e atividades principais
  QUIZ_CORRECT_ANSWER: Math.round(10 * XP_REDUCTION_FACTOR), // 10 → 2 XP
  DISTRICT_QUIZ_CORRECT: Math.round(20 * XP_REDUCTION_FACTOR), // 20 → 4 XP
  
  // Lições e aprendizado
  LESSON_BASIC: Math.round(50 * XP_REDUCTION_FACTOR), // 50 → 10 XP
  LESSON_INTERMEDIATE: Math.round(60 * XP_REDUCTION_FACTOR), // 60 → 12 XP
  LESSON_ADVANCED: Math.round(70 * XP_REDUCTION_FACTOR), // 70 → 14 XP
  
  // Recompensas diárias
  DAILY_REWARD_MIN: Math.round(25 * XP_REDUCTION_FACTOR), // 25 → 5 XP
  DAILY_REWARD_MAX: Math.round(50 * XP_REDUCTION_FACTOR), // 50 → 10 XP
  
  // Missões diárias (valores para atualização no banco)
  DAILY_MISSION_EASY: Math.round(50 * XP_REDUCTION_FACTOR), // 50 → 10 XP
  DAILY_MISSION_MEDIUM: Math.round(75 * XP_REDUCTION_FACTOR), // 75 → 15 XP
  DAILY_MISSION_HARD: Math.round(100 * XP_REDUCTION_FACTOR), // 100 → 20 XP
  DAILY_MISSION_WEEKEND: Math.round(150 * XP_REDUCTION_FACTOR), // 150 → 30 XP
  
  // Desafios diários (valores para atualização no banco)
  DAILY_CHALLENGE_EASY: Math.round(100 * XP_REDUCTION_FACTOR), // 100 → 20 XP
  DAILY_CHALLENGE_MEDIUM: Math.round(150 * XP_REDUCTION_FACTOR), // 150 → 30 XP
  DAILY_CHALLENGE_HARD: Math.round(200 * XP_REDUCTION_FACTOR), // 200 → 40 XP
  DAILY_CHALLENGE_EXTREME: Math.round(300 * XP_REDUCTION_FACTOR), // 300 → 60 XP
  
  // Concept Connections
  CONCEPT_CONNECTION_BASE: Math.round(15 * XP_REDUCTION_FACTOR), // 15 → 3 XP per connection
  
  // Atividades especiais
  STREAK_BONUS_BASE: Math.round(25 * XP_REDUCTION_FACTOR), // 25 → 5 XP
  PERFECT_QUIZ_BONUS: Math.round(50 * XP_REDUCTION_FACTOR), // 50 → 10 XP
} as const;

/**
 * Multiplicadores (mantidos inalterados)
 * Estes multiplicadores são aplicados AOS VALORES JÁ REDUZIDOS
 */
export const XP_MULTIPLIERS = {
  // Streak bonuses (inalterados)
  STREAK_MULTIPLIER_MIN: 1.2,
  STREAK_MULTIPLIER_MAX: 3.0,
  
  // Subscription bonuses (inalterados)
  SUBSCRIPTION_FREE: 1.0,
  SUBSCRIPTION_PREMIUM: 1.5,
  SUBSCRIPTION_VIP: 2.0,
  SUBSCRIPTION_ULTRA: 3.0,
  
  // Difficulty bonuses (inalterados)
  DIFFICULTY_EASY: 1.0,
  DIFFICULTY_MEDIUM: 1.2,
  DIFFICULTY_HARD: 1.5,
  
  // Perfect performance bonus (inalterado)
  PERFECT_PERFORMANCE: 2.0,
} as const;

/**
 * Função utilitária para calcular XP final com multiplicadores
 */
export function calculateFinalXP(
  baseXP: number,
  streakMultiplier: number = 1,
  subscriptionMultiplier: number = 1,
  difficultyMultiplier: number = 1,
  performanceMultiplier: number = 1
): number {
  return Math.round(
    baseXP * 
    streakMultiplier * 
    subscriptionMultiplier * 
    difficultyMultiplier * 
    performanceMultiplier
  );
}

/**
 * Valores para update do banco de dados
 */
export const DATABASE_XP_UPDATES = {
  DAILY_MISSIONS: {
    EASY: XP_CONFIG.DAILY_MISSION_EASY,
    MEDIUM: XP_CONFIG.DAILY_MISSION_MEDIUM,
    HARD: XP_CONFIG.DAILY_MISSION_HARD,
    WEEKEND: XP_CONFIG.DAILY_MISSION_WEEKEND,
  },
  DAILY_CHALLENGES: {
    EASY: XP_CONFIG.DAILY_CHALLENGE_EASY,
    MEDIUM: XP_CONFIG.DAILY_CHALLENGE_MEDIUM,
    HARD: XP_CONFIG.DAILY_CHALLENGE_HARD,
    EXTREME: XP_CONFIG.DAILY_CHALLENGE_EXTREME,
  }
};

// Log da configuração para debug
console.log('🎯 XP Configuration loaded with 80% reduction:', {
  reductionFactor: XP_REDUCTION_FACTOR,
  sampleValues: {
    quizCorrect: `${10} → ${XP_CONFIG.QUIZ_CORRECT_ANSWER} XP`,
    districtQuiz: `${20} → ${XP_CONFIG.DISTRICT_QUIZ_CORRECT} XP`,
    lessonBasic: `${50} → ${XP_CONFIG.LESSON_BASIC} XP`,
  },
  multipliersSampleCalculation: {
    base: XP_CONFIG.QUIZ_CORRECT_ANSWER,
    withStreak: calculateFinalXP(XP_CONFIG.QUIZ_CORRECT_ANSWER, 2.0),
    withStreakAndSub: calculateFinalXP(XP_CONFIG.QUIZ_CORRECT_ANSWER, 2.0, 1.5),
  }
});