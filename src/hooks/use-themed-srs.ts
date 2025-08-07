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
  theme: string;
}

interface UserThemeProgress {
  theme: string;
  questions_answered: number;
  questions_correct: number;
  current_difficulty: string;
  difficulty_progression: any;
}

/**
 * Hook SRS especializado para quiz temático com progressão adaptativa
 */
export function useThemedSRS() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [themeProgress, setThemeProgress] = useState<UserThemeProgress | null>(null);

  // Algoritmo SM2 melhorado para temas
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

  // Determinar distribuição de dificuldade baseada no progresso
  const getDifficultyDistribution = (progress: UserThemeProgress) => {
    const { questions_answered, questions_correct } = progress;
    const accuracy = questions_answered > 0 ? questions_correct / questions_answered : 0;
    
    // Progressão adaptativa baseada na performance
    if (accuracy >= 0.85 && questions_answered >= 10) {
      // Performance excelente: mais questões difíceis
      return { easy: 20, medium: 40, hard: 40 };
    } else if (accuracy >= 0.75 && questions_answered >= 5) {
      // Performance boa: mix equilibrado
      return { easy: 30, medium: 50, hard: 20 };
    } else if (accuracy >= 0.60) {
      // Performance média: mais medium, menos hard
      return { easy: 40, medium: 50, hard: 10 };
    } else {
      // Performance baixa: focar no básico
      return { easy: 70, medium: 25, hard: 5 };
    }
  };

  // Buscar progresso do usuário no tema
  const getUserThemeProgress = async (theme: string): Promise<UserThemeProgress> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data: progress } = await supabase
        .from('user_theme_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('theme', theme)
        .single();

      if (progress) {
        return progress;
      } else {
        // Criar progresso inicial para o tema
        const initialProgress = {
          user_id: profile.id,
          theme,
          questions_answered: 0,
          questions_correct: 0,
          current_difficulty: 'easy',
          difficulty_progression: { easy: 0, medium: 0, hard: 0 }
        };

        const { data: newProgress } = await supabase
          .from('user_theme_progress')
          .insert(initialProgress)
          .select()
          .single();

        return newProgress || initialProgress;
      }
    } catch (error) {
      console.error('Error getting theme progress:', error);
      // Retornar progresso padrão em caso de erro
      return {
        theme,
        questions_answered: 0,
        questions_correct: 0,
        current_difficulty: 'easy',
        difficulty_progression: { easy: 0, medium: 0, hard: 0 }
      };
    }
  };

  // Buscar questões do tema com SRS inteligente
  const getThemedQuestions = async (
    theme: string,
    limit = 10,
    excludeIds: string[] = []
  ): Promise<Question[]> => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Buscar progresso do tema
      const progress = await getUserThemeProgress(theme);
      setThemeProgress(progress);

      // Determinar distribuição de dificuldade
      const distribution = getDifficultyDistribution(progress);
      
      console.log('🎯 Distribuição de dificuldade para tema:', {
        theme,
        accuracy: progress.questions_answered > 0 ? progress.questions_correct / progress.questions_answered : 0,
        distribution
      });

      // Buscar questões recentes para evitar repetição
      const { data: recentAnswers } = await supabase
        .from('user_question_progress')
        .select('question_id, last_reviewed')
        .eq('user_id', profile.id)
        .not('last_reviewed', 'is', null)
        .order('last_reviewed', { ascending: false })
        .limit(15);

      const recentQuestionIds = recentAnswers?.map(r => r.question_id) || [];
      const allExcludeIds = [...excludeIds, ...recentQuestionIds];

      // Buscar questões por dificuldade seguindo a distribuição
      const questionsByDifficulty = await Promise.all([
        getQuestionsByDifficulty(theme, 'easy', Math.ceil(limit * distribution.easy / 100), allExcludeIds),
        getQuestionsByDifficulty(theme, 'medium', Math.ceil(limit * distribution.medium / 100), allExcludeIds),
        getQuestionsByDifficulty(theme, 'hard', Math.ceil(limit * distribution.hard / 100), allExcludeIds)
      ]);

      // Combinar questões de todas as dificuldades
      const allQuestions = questionsByDifficulty.flat();
      
      // Randomizar ordem final
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);

      console.log('✅ Questões selecionadas:', {
        total: shuffledQuestions.length,
        byDifficulty: {
          easy: shuffledQuestions.filter(q => q.difficulty === 'easy').length,
          medium: shuffledQuestions.filter(q => q.difficulty === 'medium').length,
          hard: shuffledQuestions.filter(q => q.difficulty === 'hard').length,
        }
      });

      return formatQuestions(shuffledQuestions);
    } catch (error) {
      console.error('Error getting themed questions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar questões por dificuldade específica
  const getQuestionsByDifficulty = async (
    theme: string,
    difficulty: string,
    count: number,
    excludeIds: string[]
  ): Promise<any[]> => {
    if (count <= 0) return [];

    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('theme', theme)
      .eq('difficulty', difficulty);

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: questions } = await query.limit(count * 2); // Buscar mais para ter opções

    if (!questions || questions.length === 0) {
      // Fallback: buscar sem filtro de tema se não houver questões temáticas
      let fallbackQuery = supabase
        .from('quiz_questions')
        .select('*')
        .eq('difficulty', difficulty);

      if (excludeIds.length > 0) {
        fallbackQuery = fallbackQuery.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data: fallbackQuestions } = await fallbackQuery.limit(count);
      return fallbackQuestions?.slice(0, count) || [];
    }

    return questions.slice(0, count);
  };

  // Formatar questões (converter options de JSON para array)
  const formatQuestions = (data: any[]): Question[] => {
    return data.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  };

  // Submeter resposta e atualizar progresso do tema
  const submitThemedAnswer = async (
    questionId: string,
    isCorrect: boolean,
    responseTime: number,
    theme: string
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

      // Atualizar progresso SRS da questão
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

      // Atualizar progresso da questão
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

      // Atualizar progresso do tema
      if (themeProgress) {
        const newQuestionsAnswered = themeProgress.questions_answered + 1;
        const newQuestionsCorrect = themeProgress.questions_correct + (isCorrect ? 1 : 0);
        
        // Buscar a questão para pegar a dificuldade
        const { data: question } = await supabase
          .from('quiz_questions')
          .select('difficulty')
          .eq('id', questionId)
          .single();

        const questionDifficulty = question?.difficulty || 'easy';
        const newDifficultyProgression = {
          ...themeProgress.difficulty_progression,
          [questionDifficulty]: (themeProgress.difficulty_progression[questionDifficulty as keyof typeof themeProgress.difficulty_progression] || 0) + 1
        };

        await supabase
          .from('user_theme_progress')
          .update({
            questions_answered: newQuestionsAnswered,
            questions_correct: newQuestionsCorrect,
            difficulty_progression: newDifficultyProgression,
            last_session_at: new Date().toISOString()
          })
          .eq('user_id', profile.id)
          .eq('theme', theme);

        // Atualizar estado local
        setThemeProgress({
          ...themeProgress,
          questions_answered: newQuestionsAnswered,
          questions_correct: newQuestionsCorrect,
          difficulty_progression: newDifficultyProgression
        });
      }

    } catch (error) {
      console.error('Error submitting themed answer:', error);
    }
  };

  return {
    questions,
    loading,
    themeProgress,
    getThemedQuestions,
    submitThemedAnswer,
    getUserThemeProgress,
    setQuestions,
    setLoading
  };
}