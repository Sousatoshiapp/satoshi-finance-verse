import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FSRSConfig {
  requestRetention: number;
  maximumInterval: number;
  easyBonus: number;
  hardFactor: number;
}

const defaultConfig: FSRSConfig = {
  requestRetention: 0.8,
  maximumInterval: 36500,
  easyBonus: 1.3,
  hardFactor: 1.2
};

export function useFSRS(config: FSRSConfig = defaultConfig) {
  const [loading, setLoading] = useState(false);

  const updateProgress = useCallback(async (
    userId: string,
    questionId: string,
    isCorrect: boolean,
    responseTime: number
  ) => {
    setLoading(true);
    try {
      // Buscar progresso atual
      const { data: existingProgress } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

      let newDifficulty = existingProgress?.difficulty_preference || 5.0;
      let newStability = existingProgress?.interval_days || 1.0;
      let newRetrievability = 1.0;
      let consecutiveCorrect = existingProgress?.consecutive_correct || 0;

      if (isCorrect) {
        consecutiveCorrect += 1;
        newStability = Math.min(newStability * config.easyBonus, config.maximumInterval);
        newDifficulty = Math.max(1.0, newDifficulty - 0.2);
        newRetrievability = 1.0;
      } else {
        consecutiveCorrect = 0;
        newStability = Math.max(1.0, newStability * config.hardFactor);
        newDifficulty = Math.min(10.0, newDifficulty + 0.5);
        newRetrievability = 0.0;
      }

      // Calcular próxima revisão
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + Math.round(newStability));

      // Atualizar ou inserir progresso
      const updateData = {
        user_id: userId,
        question_id: questionId,
        consecutive_correct: consecutiveCorrect,
        difficulty_preference: newDifficulty,
        interval_days: Math.round(newStability),
        next_review_date: nextReviewDate.toISOString(),
        last_response_time_ms: responseTime,
        updated_at: new Date().toISOString()
      };

      if (existingProgress) {
        await supabase
          .from('user_question_progress')
          .update(updateData)
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_question_progress')
          .insert(updateData);
      }

      return {
        difficulty: newDifficulty,
        stability: newStability,
        retrievability: newRetrievability,
        nextReview: nextReviewDate
      };
    } catch (error) {
      console.error('Erro ao atualizar progresso FSRS:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [config]);

  const getDueQuestions = useCallback(async (userId: string, limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('user_question_progress')
        .select(`
          *,
          question:quiz_questions(*)
        `)
        .eq('user_id', userId)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar questões devidas:', error);
      return [];
    }
  }, []);

  return {
    updateProgress,
    getDueQuestions,
    loading
  };
}