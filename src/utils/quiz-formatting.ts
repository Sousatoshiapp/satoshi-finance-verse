// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Este arquivo foi desabilitado durante a migração para o novo sistema de duelo unificado
// As questões agora são processadas diretamente sem conversões complexas
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO QUIZ-FORMATTING COMENTADO PARA MIGRAÇÃO

export interface FormattedQuizQuestion {
  id: string;
  question: string;
  options: { [key: string]: string };
  correct_answer: string;
}

export function formatQuizQuestion(question: any): FormattedQuizQuestion {
  ... [todo o código original foi desabilitado - ver git history para código completo]
}

export function convertToInterfaceQuestion(question: FormattedQuizQuestion) {
  ... [todo o código original foi desabilitado - ver git history para código completo]
}

export function isValidQuestionFormat(question: any): boolean {
  ... [todo o código original foi desabilitado - ver git history para código completo]
}
*/

// Interfaces e funções vazias para não quebrar importações existentes
export interface FormattedQuizQuestion {
  id: string;
  question: string;
  options: { [key: string]: string };
  correct_answer: string;
}

export function formatQuizQuestion(question: any): FormattedQuizQuestion {
  console.warn('⚠️ formatQuizQuestion is LEGACY - questions processed directly now');
  return {
    id: question.id || 'legacy',
    question: question.question || '',
    options: {},
    correct_answer: ''
  };
}

export function convertToInterfaceQuestion(question: FormattedQuizQuestion) {
  console.warn('⚠️ convertToInterfaceQuestion is LEGACY - questions processed directly now');
  return {
    id: question.id,
    question: question.question,
    options: []
  };
}

export function isValidQuestionFormat(question: any): boolean {
  console.warn('⚠️ isValidQuestionFormat is LEGACY - validation done directly now');
  return false;
}