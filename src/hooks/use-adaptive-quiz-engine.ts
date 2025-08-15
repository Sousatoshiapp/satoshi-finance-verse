import { useState, useCallback, useEffect } from 'react';
import { useAdaptivePerformance } from './use-adaptive-performance';
import { useQuestionRandomizer } from './use-question-randomizer';
import { useQuestionSelector } from './use-question-selector';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface AdaptiveQuizConfig {
  mode: 'solo' | 'duel' | 'tournament' | 'daily_mission' | 'district';
  category?: string;
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  questionsCount: number;
  enableDifficultyAdjustment: boolean;
  enableRandomization: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  difficultyAdjustments: Array<{
    questionIndex: number;
    fromDifficulty: string;
    toDifficulty: string;
    reason: string;
  }>;
}

export function useAdaptiveQuizEngine(config: AdaptiveQuizConfig) {
  const { user } = useAuth();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  // Determinar dificuldade inicial baseada no nível do usuário
  const getInitialDifficulty = useCallback((): 'easy' | 'medium' | 'hard' => {
    if (config.initialDifficulty) return config.initialDifficulty;
    
    if (userLevel >= 20) return 'hard';
    if (userLevel >= 10) return 'medium';
    return 'easy';
  }, [config.initialDifficulty, userLevel]);

  const {
    metrics,
    recordAnswer,
    applyDifficultyAdjustment,
    resetMetrics
  } = useAdaptivePerformance(getInitialDifficulty());

  const {
    getRandomizedQuestions,
    shuffleExistingQuestions,
    resetRandomizer
  } = useQuestionRandomizer({
    avoidRecentRepetition: true,
    cooldownHours: 24,
    maxSequenceCache: 100
  });

  const { selectAdaptiveQuestions } = useQuestionSelector();

  // Carregar nível do usuário
  useEffect(() => {
    if (user) {
      loadUserLevel();
    }
  }, [user]);

  const loadUserLevel = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('level, xp')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      setUserLevel(profile.level || 1);
    }
  };

  // Mapear dificuldade para filtros do banco
  const mapDifficultyToFilter = useCallback((difficulty: 'easy' | 'medium' | 'hard'): string => {
    switch (difficulty) {
      case 'easy': return 'basic';
      case 'medium': return 'intermediate';
      case 'hard': return 'advanced';
      default: return 'basic';
    }
  }, []);

  // Buscar questões adaptativas com randomização
  const fetchAdaptiveQuestions = useCallback(async (
    targetDifficulty: 'easy' | 'medium' | 'hard',
    count: number,
    excludeIds: string[] = []
  ): Promise<QuizQuestion[]> => {
    console.log('🎯 Buscando questões adaptativas:', { 
      targetDifficulty, 
      count, 
      category: config.category,
      randomization: config.enableRandomization 
    });

    try {
      if (config.enableRandomization) {
        // Usar sistema de randomização total
        const bankDifficulty = mapDifficultyToFilter(targetDifficulty);
        const questions = await getRandomizedQuestions(
          config.category,
          bankDifficulty,
          count * 2, // Buscar mais para ter opções
          excludeIds
        );
        
        // Retornar apenas a quantidade solicitada
        return questions.slice(0, count);
      } else {
        // Usar sistema adaptativo tradicional
        if (user) {
          const questions = await selectAdaptiveQuestions(user.id, count);
          return shuffleExistingQuestions(questions);
        }
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar questões adaptativas:', error);
      return [];
    }
  }, [config, user, getRandomizedQuestions, selectAdaptiveQuestions, shuffleExistingQuestions, mapDifficultyToFilter]);

  // Inicializar sessão de quiz
  const initializeQuizSession = useCallback(async () => {
    console.log('🚀 Inicializando sessão adaptativa:', config);
    
    setLoading(true);
    try {
      const initialDifficulty = getInitialDifficulty();
      console.log('🎚️ Dificuldade inicial determinada:', initialDifficulty);

      const questions = await fetchAdaptiveQuestions(
        initialDifficulty,
        config.questionsCount
      );

      if (questions.length === 0) {
        throw new Error('Nenhuma questão encontrada');
      }

      const newSession: QuizSession = {
        questions,
        currentIndex: 0,
        currentDifficulty: initialDifficulty,
        difficultyAdjustments: []
      };

      setSession(newSession);
      resetMetrics();
      
      console.log('✅ Sessão iniciada:', {
        questionsCount: questions.length,
        initialDifficulty,
        firstQuestion: questions[0]?.question?.substring(0, 50) + '...'
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar sessão:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [config, getInitialDifficulty, fetchAdaptiveQuestions, resetMetrics]);

  // Processar resposta e adaptar dificuldade
  const processAnswer = useCallback(async (
    selectedAnswer: string,
    responseTime: number
  ) => {
    if (!session) return;

    const currentQuestion = session.questions[session.currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    console.log('📊 Processando resposta:', {
      isCorrect,
      responseTime,
      currentDifficulty: metrics.currentDifficulty,
      questionIndex: session.currentIndex
    });

    // Registrar performance
    recordAnswer(isCorrect, responseTime);

    // Verificar se precisa ajustar dificuldade
    if (config.enableDifficultyAdjustment && metrics.shouldAdjustDifficulty) {
      const fromDifficulty = metrics.currentDifficulty;
      const toDifficulty = metrics.suggestedDifficulty;

      console.log('🎚️ Ajuste de dificuldade detectado:', {
        from: fromDifficulty,
        to: toDifficulty,
        accuracy: metrics.accuracy,
        consecutive: isCorrect ? metrics.consecutiveCorrect : metrics.consecutiveWrong
      });

      // Aplicar ajuste
      applyDifficultyAdjustment();

      // Registrar ajuste na sessão
      setSession(prev => prev ? {
        ...prev,
        currentDifficulty: toDifficulty,
        difficultyAdjustments: [
          ...prev.difficultyAdjustments,
          {
            questionIndex: prev.currentIndex,
            fromDifficulty,
            toDifficulty,
            reason: `Accuracy: ${Math.round(metrics.accuracy * 100)}%`
          }
        ]
      } : null);

      // Buscar próximas questões com nova dificuldade
      if (session.currentIndex < session.questions.length - 3) {
        console.log('🔄 Buscando questões com nova dificuldade...');
        
        const remainingCount = session.questions.length - session.currentIndex - 1;
        const usedIds = session.questions.map(q => q.id);
        
        const newQuestions = await fetchAdaptiveQuestions(
          toDifficulty,
          Math.min(remainingCount, 3),
          usedIds
        );

        if (newQuestions.length > 0) {
          setSession(prev => prev ? {
            ...prev,
            questions: [
              ...prev.questions.slice(0, prev.currentIndex + 1),
              ...newQuestions,
              ...prev.questions.slice(prev.currentIndex + 1 + newQuestions.length)
            ]
          } : null);
        }
      }
    }

    return { isCorrect, adjustedDifficulty: metrics.shouldAdjustDifficulty };
  }, [session, metrics, recordAnswer, applyDifficultyAdjustment, config.enableDifficultyAdjustment, fetchAdaptiveQuestions]);

  // Avançar para próxima questão
  const nextQuestion = useCallback(() => {
    if (!session) return false;

    if (session.currentIndex < session.questions.length - 1) {
      setSession(prev => prev ? {
        ...prev,
        currentIndex: prev.currentIndex + 1
      } : null);
      return true;
    }

    return false; // Quiz terminado
  }, [session]);

  // Reset completo do engine
  const resetEngine = useCallback(() => {
    setSession(null);
    resetMetrics();
    resetRandomizer();
  }, [resetMetrics, resetRandomizer]);

  // Obter questão atual
  const getCurrentQuestion = useCallback((): QuizQuestion | null => {
    if (!session || session.currentIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentIndex];
  }, [session]);

  // Obter estatísticas da sessão
  const getSessionStats = useCallback(() => {
    if (!session) return null;

    return {
      currentIndex: session.currentIndex,
      totalQuestions: session.questions.length,
      progress: (session.currentIndex / session.questions.length) * 100,
      currentDifficulty: session.currentDifficulty,
      difficultyAdjustments: session.difficultyAdjustments.length,
      performance: metrics
    };
  }, [session, metrics]);

  return {
    // Estado
    session,
    loading,
    metrics,
    
    // Questão atual
    currentQuestion: getCurrentQuestion(),
    sessionStats: getSessionStats(),
    
    // Ações
    initializeQuizSession,
    processAnswer,
    nextQuestion,
    resetEngine
  };
}