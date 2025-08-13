import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
  theme?: string;
}

interface OnboardingQuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    responseTime: number;
  }>;
  loading: boolean;
}

export function useOnboardingQuiz() {
  const [state, setState] = useState<OnboardingQuizState>({
    questions: [],
    currentQuestion: 0,
    answers: [],
    loading: false
  });

  const fetchQuestionsForStep = useCallback(async (step: string, count: number = 3) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      let category = '';
      let difficulty = 'easy';
      
      // Map onboarding steps to quiz criteria
      switch (step) {
        case 'experience':
          category = 'ABC das Finanças';
          difficulty = 'easy';
          break;
        case 'goals':
          // Mix of categories to show variety
          category = '';
          difficulty = 'easy';
          break;
        case 'time':
          category = 'Finanças do Dia a Dia';
          difficulty = 'easy';
          break;
        case 'learning_style':
          category = 'ABC das Finanças';
          difficulty = 'medium';
          break;
        case 'motivation':
          category = '';
          difficulty = 'medium';
          break;
        default:
          category = 'ABC das Finanças';
          difficulty = 'easy';
      }

      let query = supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_approved', true)
        .limit(count);

      if (category) {
        query = query.eq('category', category);
      }
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match QuizQuestion interface
      const transformedQuestions: QuizQuestion[] = (data || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
        correct_answer: q.correct_answer,
        explanation: q.explanation || undefined,
        category: q.category,
        difficulty: q.difficulty,
        theme: q.theme || undefined
      }));

      // If no questions found, fallback to any approved questions
      if (transformedQuestions.length === 0) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('is_approved', true)
          .limit(count);

        if (fallbackError) throw fallbackError;
        
        const fallbackQuestions: QuizQuestion[] = (fallbackData || []).map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
          correct_answer: q.correct_answer,
          explanation: q.explanation || undefined,
          category: q.category,
          difficulty: q.difficulty,
          theme: q.theme || undefined
        }));
        
        setState(prev => ({ 
          ...prev, 
          questions: fallbackQuestions,
          currentQuestion: 0,
          answers: [],
          loading: false 
        }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        questions: transformedQuestions,
        currentQuestion: 0,
        answers: [],
        loading: false 
      }));

    } catch (error) {
      console.error('Error fetching onboarding questions:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const submitAnswer = useCallback((questionId: string, selectedAnswer: string, responseTime: number) => {
    const question = state.questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedAnswer === question.correct_answer;
    
    setState(prev => ({
      ...prev,
      answers: [...prev.answers, {
        questionId,
        selectedAnswer,
        isCorrect,
        responseTime
      }]
    }));

    return {
      isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correct_answer
    };
  }, [state.questions]);

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestion: Math.min(prev.currentQuestion + 1, prev.questions.length - 1)
    }));
  }, []);

  const calculateProfile = useCallback(() => {
    if (state.answers.length === 0) return null;

    const correctAnswers = state.answers.filter(a => a.isCorrect).length;
    const totalAnswers = state.answers.length;
    const accuracy = correctAnswers / totalAnswers;
    const avgResponseTime = state.answers.reduce((sum, a) => sum + a.responseTime, 0) / state.answers.length;

    // Auto-determine profile based on performance
    let experience_level = 'beginner';
    let preferred_difficulty = 'easy';
    let learning_style = 'practical';

    // Experience level based on accuracy
    if (accuracy >= 0.8) {
      experience_level = 'advanced';
      preferred_difficulty = 'medium';
    } else if (accuracy >= 0.6) {
      experience_level = 'intermediate';
      preferred_difficulty = 'easy';
    }

    // Learning style based on response time and pattern
    if (avgResponseTime < 5000) {
      learning_style = 'practical';  // Quick decisions
    } else if (avgResponseTime > 15000) {
      learning_style = 'theoretical'; // Thoughtful analysis
    } else {
      learning_style = 'mixed';
    }

    return {
      experience_level,
      preferred_difficulty,
      learning_style,
      accuracy,
      avgResponseTime,
      totalQuestions: totalAnswers
    };
  }, [state.answers]);

  const resetQuiz = useCallback(() => {
    setState({
      questions: [],
      currentQuestion: 0,
      answers: [],
      loading: false
    });
  }, []);

  return {
    ...state,
    fetchQuestionsForStep,
    submitAnswer,
    nextQuestion,
    calculateProfile,
    resetQuiz
  };
}