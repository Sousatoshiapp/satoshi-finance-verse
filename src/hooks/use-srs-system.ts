import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SRSQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface UserProgress {
  question_id: string;
  easiness_factor: number;
  repetition_count: number;
  interval_days: number;
  next_review_date: string;
}

export function useSRSSystem() {
  const [questions, setQuestions] = useState<SRSQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // SM2 Algorithm Implementation
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

  const getDueQuestions = async (difficulty?: string, limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback para usuários não autenticados
        const { data: randomQuestions } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('difficulty', difficulty || 'easy')
          .limit(limit);
        
        return randomQuestions?.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        })) || [];
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      // Get questions due for review
      const { data: dueQuestions } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          user_question_progress!left(
            easiness_factor,
            repetition_count,
            interval_days,
            next_review_date
          )
        `)
        .eq('user_question_progress.user_id', profile.id)
        .lte('user_question_progress.next_review_date', new Date().toISOString())
        .limit(limit);

      // If not enough due questions, get new ones
      if (!dueQuestions || dueQuestions.length < limit) {
        const { data: newQuestions } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('difficulty', difficulty || 'easy')
          .limit(limit - (dueQuestions?.length || 0));

        const combined = [...(dueQuestions || []), ...(newQuestions || [])];
        return combined.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        }));
      }

      return dueQuestions.map(q => ({
        ...q,
        options: JSON.parse(q.options as string)
      }));
    } catch (error) {
      console.error('Error getting due questions:', error);
      return [];
    }
  };

  const submitAnswer = async (questionId: string, isCorrect: boolean, responseTime: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const quality = isCorrect ? (responseTime < 10 ? 5 : 4) : (responseTime < 30 ? 2 : 1);

      // Get current progress or create new
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

      // Upsert progress
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
          quality_responses: [...(currentProgress?.quality_responses || []), quality],
          total_reviews: (currentProgress?.total_reviews || 0) + 1,
          streak: isCorrect ? (currentProgress?.streak || 0) + 1 : 0
        });

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return {
    questions,
    loading,
    getDueQuestions,
    submitAnswer,
    calculateNextReview
  };
}