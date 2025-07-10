import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface UserProgress {
  question_id: string;
  easiness_factor: number;
  repetition_count: number;
  interval_days: number;
  next_review_date: string;
  consecutive_correct: number;
}

/**
 * Hook SRS/SM2 unificado para todo o sistema de Quiz
 * Consolidação dos hooks use-srs-system e use-enhanced-srs
 */
export function useUnifiedSRS() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // Implementação do algoritmo SM2 otimizada
  const calculateNextReview = (quality: number, easiness: number, repetition: number, interval: number) => {
    let newEasiness = easiness;
    let newRepetition = repetition;
    let newInterval = interval;

    if (quality >= 3) {
      if (repetition === 0) {
        newInterval = 1;
      } else if (repetition === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easiness);
      }
      newRepetition = repetition + 1;
    } else {
      newRepetition = 0;
      newInterval = 1;
    }

    newEasiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEasiness < 1.3) newEasiness = 1.3;

    return { newEasiness, newRepetition, newInterval };
  };

  // Buscar questões due + questões novas (evitando repetições)
  const getDueQuestions = async (
    difficulty?: string, 
    limit = 7, 
    excludeIds: string[] = []
  ): Promise<Question[]> => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return await getFallbackQuestions(difficulty, limit, excludeIds);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      // 1. Buscar questões que precisam revisão (SRS)
      let dueQuery = supabase
        .from('quiz_questions')
        .select(`
          *,
          user_question_progress!left(
            easiness_factor,
            repetition_count,
            interval_days,
            next_review_date,
            consecutive_correct
          )
        `)
        .eq('user_question_progress.user_id', profile.id)
        .lte('user_question_progress.next_review_date', new Date().toISOString());

      if (difficulty) {
        dueQuery = dueQuery.eq('difficulty', difficulty);
      }

      if (excludeIds.length > 0) {
        dueQuery = dueQuery.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data: dueQuestions } = await dueQuery.limit(limit);

      // 2. Se não tem questões suficientes, buscar novas questões
      if (!dueQuestions || dueQuestions.length < limit) {
        const remainingCount = limit - (dueQuestions?.length || 0);
        
        // Buscar questões que nunca foram respondidas ou há muito tempo
        let newQuery = supabase
          .from('quiz_questions')
          .select(`
            *,
            user_question_progress!left(
              last_reviewed
            )
          `)
          .eq('user_question_progress.user_id', profile.id)
          .or('user_question_progress.last_reviewed.is.null,user_question_progress.last_reviewed.lt.' + 
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 dias atrás

        if (difficulty) {
          newQuery = newQuery.eq('difficulty', difficulty);
        }

        if (excludeIds.length > 0) {
          newQuery = newQuery.not('id', 'in', `(${excludeIds.join(',')})`);
        }

        const { data: newQuestions } = await newQuery.limit(remainingCount);

        // 3. Se ainda não tem o suficiente, buscar questões aleatórias
        if ((!newQuestions || newQuestions.length < remainingCount)) {
          const stillNeeded = remainingCount - (newQuestions?.length || 0);
          const { data: randomQuestions } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('difficulty', difficulty || 'easy')
            .not('id', 'in', `(${[...excludeIds, ...(dueQuestions?.map(q => q.id) || []), ...(newQuestions?.map(q => q.id) || [])].join(',')})`)
            .limit(stillNeeded);

          const combined = [
            ...(dueQuestions || []), 
            ...(newQuestions || []), 
            ...(randomQuestions || [])
          ];
          
          return formatQuestions(combined);
        }

        const combined = [...(dueQuestions || []), ...(newQuestions || [])];
        return formatQuestions(combined);
      }

      return formatQuestions(dueQuestions);
    } catch (error) {
      console.error('Error getting due questions:', error);
      return await getFallbackQuestions(difficulty, limit, excludeIds);
    } finally {
      setLoading(false);
    }
  };

  // Fallback para usuários não logados
  const getFallbackQuestions = async (
    difficulty?: string, 
    limit = 7, 
    excludeIds: string[] = []
  ): Promise<Question[]> => {
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('difficulty', difficulty || 'easy');

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: randomQuestions } = await query.limit(limit);
    return formatQuestions(randomQuestions || []);
  };

  // Formatar questões (converter options de JSON para array)
  const formatQuestions = (data: any[]): Question[] => {
    return data.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  };

  // Submeter resposta e atualizar SRS
  const submitAnswer = async (
    questionId: string,
    isCorrect: boolean,
    responseTime: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Calcular qualidade baseada na correção e tempo
      const quality = isCorrect ? (responseTime < 10 ? 5 : 4) : 2;

      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('question_id', questionId)
        .single();

      const easiness = currentProgress?.easiness_factor || 2.5;
      const repetition = currentProgress?.repetition_count || 0;
      const interval = currentProgress?.interval_days || 1;

      const { newEasiness, newRepetition, newInterval } = calculateNextReview(
        quality, easiness, repetition, interval
      );

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      // Atualizar progresso no banco
      await supabase
        .from('user_question_progress')
        .upsert({
          user_id: profile.id,
          question_id: questionId,
          easiness_factor: newEasiness,
          repetition_count: newRepetition,
          interval_days: newInterval,
          next_review_date: nextReviewDate.toISOString(),
          last_reviewed: new Date().toISOString(),
          total_reviews: (currentProgress?.total_reviews || 0) + 1,
          streak: isCorrect ? (currentProgress?.streak || 0) + 1 : 0,
          last_response_time_ms: responseTime * 1000,
          consecutive_correct: isCorrect ? (currentProgress?.consecutive_correct || 0) + 1 : 0,
          is_correct: isCorrect
        });

      // Atualizar conceitos usando a função do banco (se disponível)
      try {
        await supabase.rpc('update_srs_with_concepts', {
          p_user_id: profile.id,
          p_question_id: questionId,
          p_is_correct: isCorrect,
          p_response_time_ms: responseTime * 1000
        });
      } catch (rpcError) {
        // Se a função não existir, continua normalmente
        console.log('Concept tracking not available:', rpcError);
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return {
    questions,
    loading,
    getDueQuestions,
    submitAnswer,
    calculateNextReview,
    setQuestions,
    setLoading
  };
}