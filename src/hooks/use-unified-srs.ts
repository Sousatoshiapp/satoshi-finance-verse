import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Categorias financeiras válidas
const FINANCE_CATEGORIES = [
  'finance', 'investment', 'cryptocurrency', 'trading', 'economics', 
  'banking', 'portfolio_management', 'Investimentos Básicos', 
  'Educação Financeira', 'Orçamento Pessoal', 'Mercado de Ações',
  'Criptomoedas', 'Planejamento Financeiro', 'Análise Técnica',
  'Fundos de Investimento', 'Renda Fixa', 'Renda Variável'
];

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

  // NOVA LÓGICA: Buscar questões evitando repetições recentes + rotação inteligente
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

      console.log('🔍 NOVA LÓGICA DE QUESTÕES - Evitando repetições recentes');

      // 1. Buscar questões respondidas recentemente (últimas 10 - reduzido de 20)
      const { data: recentAnswers } = await supabase
        .from('user_question_progress')
        .select('question_id, last_reviewed')
        .eq('user_id', profile.id)
        .not('last_reviewed', 'is', null)
        .order('last_reviewed', { ascending: false })
        .limit(10);

      const recentQuestionIds = recentAnswers?.map(r => r.question_id) || [];
      const allExcludeIds = [...excludeIds, ...recentQuestionIds];

      console.log('🚫 Excluindo questões recentes:', { 
        recentCount: recentQuestionIds.length, 
        totalExcluded: allExcludeIds.length 
      });

      // 2. Priorizar questões NUNCA respondidas
      let neverAnsweredQuery = supabase
        .from('quiz_questions')
        .select('*')
        .in('category', FINANCE_CATEGORIES);

      // Só aplicar filtro de exclusão se tiver IDs para excluir
      if (allExcludeIds.length > 0) {
        neverAnsweredQuery = neverAnsweredQuery.not('id', 'in', `(${allExcludeIds.join(',')})`);
      }

      if (difficulty) {
        neverAnsweredQuery = neverAnsweredQuery.eq('difficulty', difficulty);
      }

      // Filtrar questões que NÃO têm progresso registrado
      const { data: allQuestions } = await neverAnsweredQuery;
      const { data: questionsWithProgress } = await supabase
        .from('user_question_progress')
        .select('question_id')
        .eq('user_id', profile.id);

      const questionsWithProgressIds = questionsWithProgress?.map(q => q.question_id) || [];
      const neverAnsweredQuestions = allQuestions?.filter(q => 
        !questionsWithProgressIds.includes(q.id)
      ) || [];

      console.log('✨ Questões nunca respondidas encontradas:', neverAnsweredQuestions.length);

      // 3. Se tem questões suficientes nunca respondidas, usar elas
      if (neverAnsweredQuestions.length >= limit) {
        const selectedQuestions = neverAnsweredQuestions
          .sort(() => Math.random() - 0.5) // Randomizar
          .slice(0, limit);
        
        console.log('✅ Usando questões nunca respondidas:', selectedQuestions.length);
        return formatQuestions(selectedQuestions);
      }

      // 4. Complementar com questões SRS antigas (>7 dias)
      const remainingCount = limit - neverAnsweredQuestions.length;
      
      let oldQuestionsQuery = supabase
        .from('quiz_questions')
        .select(`
          *,
          user_question_progress!inner(
            last_reviewed,
            next_review_date
          )
        `)
        .in('category', FINANCE_CATEGORIES)
        .eq('user_question_progress.user_id', profile.id)
        .lt('user_question_progress.last_reviewed', 
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Só aplicar filtro de exclusão se tiver IDs para excluir
      if (allExcludeIds.length > 0) {
        oldQuestionsQuery = oldQuestionsQuery.not('id', 'in', `(${allExcludeIds.join(',')})`);
      }

      if (difficulty) {
        oldQuestionsQuery = oldQuestionsQuery.eq('difficulty', difficulty);
      }

      const { data: oldQuestions } = await oldQuestionsQuery.limit(remainingCount);

      // 5. Combinar questões nunca respondidas + antigas
      const combinedQuestions = [
        ...neverAnsweredQuestions,
        ...(oldQuestions || [])
      ];

      console.log('📋 Resultado final:', {
        neverAnswered: neverAnsweredQuestions.length,
        oldQuestions: oldQuestions?.length || 0,
        total: combinedQuestions.length
      });

      // 6. Se ainda não tem suficientes, buscar questões completamente aleatórias
      if (combinedQuestions.length < limit) {
        const stillNeeded = limit - combinedQuestions.length;
        const finalExcludeIds = allExcludeIds.concat(combinedQuestions.map(q => q.id));
        
        let randomQuery = supabase
          .from('quiz_questions')
          .select('*')
          .in('category', FINANCE_CATEGORIES)
          .eq('difficulty', difficulty || 'easy');

        // Só aplicar filtro de exclusão se tiver IDs para excluir
        if (finalExcludeIds.length > 0) {
          randomQuery = randomQuery.not('id', 'in', `(${finalExcludeIds.join(',')})`);
        }

        const { data: randomQuestions } = await randomQuery.limit(stillNeeded);
        combinedQuestions.push(...(randomQuestions || []));
      }

      const finalQuestions = combinedQuestions
        .sort(() => Math.random() - 0.5) // Randomizar ordem
        .slice(0, limit);
        
      console.log('✅ QUESTÕES FINAIS SELECIONADAS:', {
        total: finalQuestions.length,
        categories: [...new Set(finalQuestions.map(q => q.category))],
        difficulties: [...new Set(finalQuestions.map(q => q.difficulty))]
      });

      return formatQuestions(finalQuestions);
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
      .in('category', FINANCE_CATEGORIES)
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