// LEGACY CODE - ISOLADO EM JANEIRO 2025
// Este hook foi substituído pelo novo useQuizSession
// Mantido apenas para referência

// Hook vazio para não quebrar importações existentes
export function useEnhancedQuiz() {
  console.warn('⚠️ useEnhancedQuiz is LEGACY - use new quiz system');
  return {
    quizState: null,
    userPowerUps: [],
    isQuizActive: false,
    startQuiz: () => {},
    usePowerUp: () => {},
    submitAnswer: () => {},
    nextQuestion: () => {},
    finishQuiz: () => {},
    loadUserPowerUps: () => {}
  };
}