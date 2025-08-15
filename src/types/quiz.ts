// Unified QuizQuestion interface for the entire app
export interface QuizQuestion {
  id: string | number;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  correct_answer: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  [key: string]: any;
}

// Legacy interface for compatibility with existing components
export interface DuelQuestion {
  id: string;
  question: string;
  district_id?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
}