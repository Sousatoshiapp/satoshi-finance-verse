import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  category: string;
  stats?: {
    times_shown: number;
    times_correct: number;
    difficulty_rating: number;
  };
}

export interface QuestionFilter {
  category?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  limit?: number;
  excludeIds?: string[];
}

export function useQuestionSelector() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const selectQuestions = useCallback(async (filter: QuestionFilter = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_approved', true);

      if (filter.category) {
        query = query.eq('category', filter.category);
      }

      if (filter.difficulty) {
        query = query.eq('difficulty', filter.difficulty);
      }

      if (filter.excludeIds && filter.excludeIds.length > 0) {
        query = query.not('id', 'in', `(${filter.excludeIds.join(',')})`);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question: q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : Array.isArray(q.options) ? q.options : [],
        correct_answer: q.correct_answer,
        explanation: q.explanation || undefined,
        topic: q.category, // Usar category como topic
        difficulty: q.difficulty as 'basic' | 'intermediate' | 'advanced',
        category: q.category,
        stats: {
          times_shown: 0,
          times_correct: 0,
          difficulty_rating: 0.5
        }
      }));

      setQuestions(formattedQuestions);
      return formattedQuestions;
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAdaptiveQuestions = useCallback(async (userId: string, count: number = 10) => {
    setLoading(true);
    try {
      console.log('🔍 Buscando questões adaptativas para usuário:', userId);
      
      // Buscar progresso do usuário para questões adaptativas
      const { data: progressData, error: progressError } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.warn('⚠️ Erro ao buscar progresso do usuário:', progressError);
      }

      console.log('📊 Progresso encontrado:', progressData?.length || 0, 'questões');

      // Algoritmo simples de seleção adaptativa
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_approved', true)
        .limit(count * 2); // Buscar mais para ter opções

      if (error) {
        console.error('❌ Erro ao buscar questões:', error);
        throw error;
      }

      console.log('📚 Questões encontradas no banco:', data?.length || 0);

      // Filtrar e ordenar por dificuldade adaptativa
      const selectedQuestions = (data || [])
        .map(q => ({
          ...q,
          userProgress: progressData?.find(p => p.question_id === q.id)
        }))
        .sort((a, b) => {
          // Priorizar questões não vistas ou com baixa performance
          const aScore = a.userProgress?.consecutive_correct || 0;
          const bScore = b.userProgress?.consecutive_correct || 0;
          return aScore - bScore;
        })
        .slice(0, count);

      console.log('✅ Questões selecionadas:', selectedQuestions.length);
      
      if (selectedQuestions.length === 0) {
        console.warn('⚠️ Nenhuma questão selecionada! Tentando fallback...');
        // Fallback: usar seleção normal se adaptive falhar
        return await selectQuestions({ limit: count });
      }

      const formattedQuestions: Question[] = selectedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : Array.isArray(q.options) ? q.options : [],
        correct_answer: q.correct_answer,
        explanation: q.explanation || undefined,
        topic: q.category, // Usar category como topic
        difficulty: q.difficulty as 'basic' | 'intermediate' | 'advanced',
        category: q.category,
        stats: {
          times_shown: 0,
          times_correct: 0,
          difficulty_rating: 0.5
        }
      }));

      setQuestions(formattedQuestions);
      return formattedQuestions;
    } catch (error) {
      console.error('Erro ao buscar questões adaptativas:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    questions,
    loading,
    selectQuestions,
    selectAdaptiveQuestions
  };
}