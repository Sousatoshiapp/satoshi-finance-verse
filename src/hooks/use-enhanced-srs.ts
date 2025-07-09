import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedSRSQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  // New enhanced fields
  feedback_wrong_answers: Record<string, string>;
  difficulty_level: number;
  learning_objectives: string[];
  estimated_time_seconds: number;
  question_type: string;
  cognitive_level: string;
  learning_module_id?: string;
  // Concept associations
  concepts: Array<{
    id: string;
    name: string;
    relevance_weight: number;
  }>;
}

interface UserQuestionProgress {
  question_id: string;
  easiness_factor: number;
  repetition_count: number;
  interval_days: number;
  next_review_date: string;
  concept_mastery: number;
  learning_velocity: number;
  consecutive_correct: number;
  difficulty_preference: number;
}

export function useEnhancedSRS() {
  const [questions, setQuestions] = useState<EnhancedSRSQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Enhanced SM2 Algorithm with concept tracking
  const calculateNextReview = (
    quality: number,
    easiness: number,
    repetition: number,
    interval: number,
    responseTime: number,
    conceptMastery: number = 0
  ) => {
    let newEasiness = easiness;
    let newRepetition = repetition;
    let newInterval = interval;

    // Adjust quality based on response time and concept mastery
    const timeAdjustment = responseTime < 5 ? 0.2 : responseTime > 30 ? -0.2 : 0;
    const masteryAdjustment = conceptMastery > 0.8 ? 0.1 : conceptMastery < 0.3 ? -0.1 : 0;
    const adjustedQuality = Math.max(1, Math.min(5, quality + timeAdjustment + masteryAdjustment));

    if (adjustedQuality >= 3) {
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

    newEasiness = easiness + (0.1 - (5 - adjustedQuality) * (0.08 + (5 - adjustedQuality) * 0.02));
    if (newEasiness < 1.3) newEasiness = 1.3;

    return { newEasiness, newRepetition, newInterval };
  };

  const getDueQuestions = async (
    difficulty?: string,
    moduleId?: string,
    limit = 10,
    conceptFocus?: string[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return await getFallbackQuestions(difficulty, limit);
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      let query = supabase
        .from('quiz_questions')
        .select(`
          *,
          user_question_progress!left(
            easiness_factor,
            repetition_count,
            interval_days,
            next_review_date,
            concept_mastery,
            learning_velocity,
            consecutive_correct,
            difficulty_preference
          ),
          question_concepts!left(
            relevance_weight,
            educational_concepts!inner(
              id,
              name
            )
          )
        `)
        .eq('user_question_progress.user_id', profile.id)
        .lte('user_question_progress.next_review_date', new Date().toISOString());

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      if (moduleId) {
        query = query.eq('learning_module_id', moduleId);
      }

      const { data: dueQuestions } = await query.limit(limit);

      // If not enough due questions, get new ones prioritizing concepts
      if (!dueQuestions || dueQuestions.length < limit) {
        const newQuery = supabase
          .from('quiz_questions')
          .select(`
            *,
            question_concepts!left(
              relevance_weight,
              educational_concepts!inner(
                id,
                name
              )
            )
          `);

        if (difficulty) newQuery.eq('difficulty', difficulty);
        if (moduleId) newQuery.eq('learning_module_id', moduleId);

        const { data: newQuestions } = await newQuery.limit(limit - (dueQuestions?.length || 0));

        const combined = [...(dueQuestions || []), ...(newQuestions || [])];
        return formatQuestions(combined);
      }

      return formatQuestions(dueQuestions);
    } catch (error) {
      console.error('Error getting due questions:', error);
      return [];
    }
  };

  const getFallbackQuestions = async (difficulty?: string, limit = 10) => {
    const { data: randomQuestions } = await supabase
      .from('quiz_questions')
      .select(`
        *,
        question_concepts!left(
          relevance_weight,
          educational_concepts!inner(
            id,
            name
          )
        )
      `)
      .eq('difficulty', difficulty || 'easy')
      .limit(limit);

    return formatQuestions(randomQuestions || []);
  };

  const formatQuestions = (data: any[]): EnhancedSRSQuestion[] => {
    return data.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      feedback_wrong_answers: q.feedback_wrong_answers || {},
      learning_objectives: q.learning_objectives || [],
      concepts: q.question_concepts?.map((qc: any) => ({
        id: qc.educational_concepts?.id,
        name: qc.educational_concepts?.name,
        relevance_weight: qc.relevance_weight
      })).filter((c: any) => c.id) || []
    }));
  };

  const submitEnhancedAnswer = async (
    questionId: string,
    isCorrect: boolean,
    responseTime: number,
    selectedAnswer: string
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

      const quality = calculateQuality(isCorrect, responseTime);

      // Get current progress
      const { data: currentProgress } = await supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('question_id', questionId)
        .single();

      const easiness = currentProgress?.easiness_factor || 2.5;
      const repetition = currentProgress?.repetition_count || 0;
      const interval = currentProgress?.interval_days || 1;
      const conceptMastery = currentProgress?.concept_mastery || 0;

      const { newEasiness, newRepetition, newInterval } = calculateNextReview(
        quality, easiness, repetition, interval, responseTime, conceptMastery
      );

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      // Update question progress with enhanced tracking
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
          streak: isCorrect ? (currentProgress?.streak || 0) + 1 : 0,
          last_response_time_ms: responseTime * 1000,
          consecutive_correct: isCorrect ? (currentProgress?.consecutive_correct || 0) + 1 : 0
        });

      // Update concept mastery using the new function
      const { data: conceptUpdate } = await supabase.rpc('update_srs_with_concepts', {
        p_user_id: profile.id,
        p_question_id: questionId,
        p_is_correct: isCorrect,
        p_response_time_ms: responseTime * 1000
      });

      // Show feedback for incorrect answers
      if (!isCorrect) {
        const question = questions.find(q => q.id === questionId);
        const feedback = question?.feedback_wrong_answers?.[selectedAnswer];
        if (feedback) {
          toast({
            title: "💡 Dica de Aprendizado",
            description: feedback,
            duration: 5000,
          });
        }
      }

      return conceptUpdate;

    } catch (error) {
      console.error('Error submitting enhanced answer:', error);
    }
  };

  const calculateQuality = (isCorrect: boolean, responseTime: number): number => {
    if (!isCorrect) {
      return responseTime < 30 ? 2 : 1; // Quick wrong vs slow wrong
    }
    
    // Correct answers with time bonus
    if (responseTime < 5) return 5;  // Very fast
    if (responseTime < 10) return 4; // Fast
    return 3; // Normal speed
  };

  const getPersonalizedQuestions = async (
    userId: string,
    weakConcepts?: string[],
    preferredDifficulty?: number
  ) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profile) return [];

      // Get user's weak concepts if not provided
      if (!weakConcepts) {
        const { data: masteryData } = await supabase
          .from('user_concept_mastery')
          .select('concept_id, mastery_level')
          .eq('user_id', profile.id)
          .lt('mastery_level', 0.7)
          .order('mastery_level', { ascending: true })
          .limit(5);

        weakConcepts = masteryData?.map(m => m.concept_id) || [];
      }

      if (weakConcepts.length === 0) {
        return getDueQuestions();
      }

      // Get questions targeting weak concepts
      const { data: targetedQuestions } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          question_concepts!inner(
            concept_id,
            relevance_weight
          )
        `)
        .in('question_concepts.concept_id', weakConcepts)
        .limit(10);

      return formatQuestions(targetedQuestions || []);

    } catch (error) {
      console.error('Error getting personalized questions:', error);
      return [];
    }
  };

  return {
    questions,
    loading,
    getDueQuestions,
    submitEnhancedAnswer,
    calculateNextReview,
    getPersonalizedQuestions,
    setQuestions,
    setLoading
  };
}