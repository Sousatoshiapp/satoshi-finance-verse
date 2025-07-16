import { useCallback } from 'react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
  [key: string]: any;
}

export const useQuizShuffle = () => {
  // Função para embaralhar as opções de uma questão
  const shuffleOptions = useCallback((question: QuizQuestion): QuizQuestion => {
    const options = [...question.options];
    const correctAnswer = question.correct_answer;
    
    // Fisher-Yates shuffle algorithm
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      ...question,
      options
    };
  }, []);

  // Função para embaralhar uma lista de questões
  const shuffleQuestions = useCallback((questions: QuizQuestion[]): QuizQuestion[] => {
    return questions.map(question => shuffleOptions(question));
  }, [shuffleOptions]);

  return {
    shuffleOptions,
    shuffleQuestions
  };
};