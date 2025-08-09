// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Este hook foi desabilitado durante a migração para o novo sistema de quiz
// Agora apenas o NewQuizEngine está ativo
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO USE-THEMED-SRS COMENTADO PARA MIGRAÇÃO
Todo o código antigo foi desabilitado - ver git history para código completo
*/

// Hook vazio para não quebrar importações existentes
export function useThemedSRS() {
  console.warn('⚠️ useThemedSRS is LEGACY - use new quiz system');
  return {
    questions: [],
    loading: false,
    themeProgress: null,
    getThemedQuestions: () => Promise.resolve([]),
    submitThemedAnswer: () => Promise.resolve(),
    getUserThemeProgress: () => Promise.resolve(null),
    setQuestions: () => {},
    setLoading: () => {}
  };
}