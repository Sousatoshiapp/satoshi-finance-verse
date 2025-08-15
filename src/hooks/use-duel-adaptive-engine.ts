import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

export interface DuelConfig {
  topic: string;
  questionsCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface DuelSession {
  questions: DuelQuestion[];
  currentIndex: number;
  isCompleted: boolean;
}

export function useDuelAdaptiveEngine(config: DuelConfig) {
  const { user } = useAuth();
  const [session, setSession] = useState<DuelSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Mapear tópico para categoria do banco
  const mapTopicToCategory = useCallback((topic: string): string => {
    switch (topic) {
      case 'financas': return 'Finanças do Dia a Dia';
      case 'cripto': return 'Cripto';
      case 'abc_financas': return 'ABC das Finanças';
      case 'investimentos': return 'ABC das Finanças';
      case 'educacao': return 'ABC das Finanças';
      case 'tech': return 'ABC das Finanças';
      case 'imoveis': return 'Finanças do Dia a Dia';
      case 'internacional': return 'ABC das Finanças';
      default: return 'Finanças do Dia a Dia';
    }
  }, []);

  // Buscar questões do banco usando EXATAMENTE a mesma lógica do Quiz Solo
  const fetchDuelQuestions = useCallback(async (): Promise<DuelQuestion[]> => {
    const category = mapTopicToCategory(config.topic);
    const difficulty = config.difficulty || 'medium';
    
    console.log('🎯 [DUEL ADAPTIVE] Buscando questões:', { 
      topic: config.topic, 
      category,
      difficulty,
      count: config.questionsCount 
    });

    try {
      // Usar EXATAMENTE a mesma query do Quiz Solo que funciona
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', category)
        .eq('difficulty', difficulty)
        .eq('is_approved', true)
        .limit(config.questionsCount * 2) // Buscar mais para randomizar
        .order('id', { ascending: false }); // Ordem consistente

      if (error) throw error;

      let finalData = data;

      if (!finalData || finalData.length === 0) {
        // Fallback: buscar qualquer questão da categoria
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('category', category)
          .eq('is_approved', true)
          .limit(config.questionsCount * 2);

        if (fallbackError) throw fallbackError;
        
        if (!fallbackData || fallbackData.length === 0) {
          // Último fallback: qualquer questão
          const { data: anyData, error: anyError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('is_approved', true)
            .limit(config.questionsCount * 2);

          if (anyError) throw anyError;
          finalData = anyData || [];
        } else {
          finalData = fallbackData;
        }
      }

      // Randomizar e pegar apenas a quantidade necessária
      const shuffled = finalData.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, config.questionsCount);

      // Converter para o formato do Duel (EXATAMENTE como no Quiz Solo)
      const duelQuestions: DuelQuestion[] = selectedQuestions.map(q => {
        const optionsData = q.options as any;
        
        return {
          id: q.id as string,
          question: q.question as string,
          options: Array.isArray(optionsData) ? optionsData : [
            optionsData?.a, optionsData?.b, optionsData?.c, optionsData?.d
          ].filter(Boolean),
          correct_answer: q.correct_answer as string,
          explanation: q.explanation as string || '',
          category: q.category as string,
          difficulty: q.difficulty as string
        };
      });

      console.log('✅ [DUEL ADAPTIVE] Questões carregadas:', {
        total: duelQuestions.length,
        sample: duelQuestions[0] ? {
          question: duelQuestions[0].question.substring(0, 50) + '...',
          options: duelQuestions[0].options.length,
          correct_answer: duelQuestions[0].correct_answer
        } : null
      });

      return duelQuestions;

    } catch (error) {
      console.error('❌ [DUEL ADAPTIVE] Erro ao buscar questões:', error);
      throw error;
    }
  }, [config, mapTopicToCategory]);

  // Inicializar sessão de duelo
  const initializeDuelSession = useCallback(async () => {
    console.log('🚀 [DUEL ADAPTIVE] Inicializando sessão:', config);
    
    setLoading(true);
    try {
      const questions = await fetchDuelQuestions();

      if (questions.length === 0) {
        throw new Error('Nenhuma questão encontrada para o duelo');
      }

      const newSession: DuelSession = {
        questions,
        currentIndex: 0,
        isCompleted: false
      };

      setSession(newSession);
      
      console.log('✅ [DUEL ADAPTIVE] Sessão iniciada:', {
        questionsCount: questions.length,
        firstQuestion: questions[0]?.question?.substring(0, 50) + '...',
        firstCorrectAnswer: questions[0]?.correct_answer
      });

    } catch (error) {
      console.error('❌ [DUEL ADAPTIVE] Erro ao inicializar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [config, fetchDuelQuestions]);

  // Processar resposta (simples como o Quiz Solo)
  const processAnswer = useCallback((
    selectedAnswer: string,
    responseTime: number
  ) => {
    if (!session) return null;

    const currentQuestion = session.questions[session.currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    console.log('📊 [DUEL ADAPTIVE] Processando resposta:', {
      selectedAnswer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect,
      responseTime,
      questionIndex: session.currentIndex
    });

    return { isCorrect, currentQuestion };
  }, [session]);

  // Próxima questão
  const nextQuestion = useCallback(() => {
    if (!session) return false;

    if (session.currentIndex < session.questions.length - 1) {
      setSession(prev => prev ? {
        ...prev,
        currentIndex: prev.currentIndex + 1
      } : null);
      return true;
    } else {
      // Duelo completo
      setSession(prev => prev ? {
        ...prev,
        isCompleted: true
      } : null);
      return false;
    }
  }, [session]);

  // Obter questão atual
  const getCurrentQuestion = useCallback((): DuelQuestion | null => {
    if (!session || session.currentIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentIndex];
  }, [session]);

  // Reset da sessão
  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  return {
    // Estado
    session,
    loading,
    
    // Questão atual
    currentQuestion: getCurrentQuestion(),
    
    // Ações
    initializeDuelSession,
    processAnswer,
    nextQuestion,
    resetSession
  };
}