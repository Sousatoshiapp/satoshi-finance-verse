import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuizStreak {
  id: string;
  user_id: string;
  category: string;
  current_streak: number;
  longest_streak: number;
  last_quiz_date?: string;
  total_quizzes_completed: number;
  created_at: string;
  updated_at: string;
}

export function useQuizStreak() {
  const [loading, setLoading] = useState(false);
  const [streaks, setStreaks] = useState<QuizStreak[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar streaks do usuário
  const fetchStreaks = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('quiz_streaks')
        .select('*')
        .eq('user_id', profile.id);

      if (error) {
        console.error('❌ Erro ao buscar streaks:', error);
        return;
      }

      console.log('✅ Streaks carregados:', data?.length || 0);
      setStreaks(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar streaks:', error);
    }
  }, [user]);

  // Buscar streak de uma categoria específica
  const getStreakForCategory = useCallback((category: string): QuizStreak | null => {
    return streaks.find(s => s.category === category) || null;
  }, [streaks]);

  // Atualizar streak após completar quiz
  const updateStreakAfterQuiz = useCallback(async (
    category: string, 
    success: boolean,
    score: number,
    totalQuestions: number
  ): Promise<QuizStreak | null> => {
    if (!user) return null;

    console.log('🎯 Atualizando streak:', { category, success, score, totalQuestions });

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      const today = new Date().toISOString().split('T')[0];
      const existingStreak = getStreakForCategory(category);
      
      // Determinar se mantém ou quebra streak
      let newCurrentStreak = 1;
      let streakBroken = false;

      if (existingStreak && existingStreak.last_quiz_date) {
        const lastDate = new Date(existingStreak.last_quiz_date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Mesmo dia, manter streak atual
          newCurrentStreak = existingStreak.current_streak;
        } else if (daysDiff === 1 && success) {
          // Dia consecutivo + sucesso, incrementar
          newCurrentStreak = existingStreak.current_streak + 1;
        } else if (daysDiff > 1) {
          // Streak quebrado, começar novo
          newCurrentStreak = success ? 1 : 0;
          streakBroken = true;
        } else {
          // Falha hoje
          newCurrentStreak = 0;
          streakBroken = true;
        }
      } else {
        // Primeiro quiz desta categoria
        newCurrentStreak = success ? 1 : 0;
      }

      const streakData = {
        user_id: profile.id,
        category,
        current_streak: newCurrentStreak,
        longest_streak: existingStreak 
          ? Math.max(existingStreak.longest_streak, newCurrentStreak)
          : newCurrentStreak,
        last_quiz_date: today,
        total_quizzes_completed: (existingStreak?.total_quizzes_completed || 0) + 1
      };

      console.log('💾 Dados do streak:', streakData);

      // Upsert streak
      const { data: updatedStreak, error } = await supabase
        .from('quiz_streaks')
        .upsert(streakData, {
          onConflict: 'user_id,category',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar streak:', error);
        return null;
      }

      console.log('✅ Streak atualizado:', updatedStreak);

      // Atualizar estado local
      setStreaks(prev => {
        const filtered = prev.filter(s => !(s.user_id === profile.id && s.category === category));
        return [...filtered, updatedStreak];
      });

      // Mostrar notificação de streak
      if (success && newCurrentStreak > 1 && !streakBroken) {
        if (newCurrentStreak % 5 === 0) {
          toast({
            title: `🔥 Streak de ${newCurrentStreak} dias!`,
            description: `Incrível consistência em ${category}!`,
            variant: "default"
          });
        } else if (newCurrentStreak === 3) {
          toast({
            title: `🎯 3 dias seguidos!`,
            description: `Continue assim em ${category}!`,
            variant: "default"
          });
        }
      }

      return updatedStreak;
    } catch (error) {
      console.error('❌ Erro ao processar streak:', error);
      return null;
    }
  }, [user, getStreakForCategory, toast]);

  // Carregar streaks na inicialização
  useEffect(() => {
    if (user) {
      fetchStreaks();
    }
  }, [user, fetchStreaks]);

  return {
    loading,
    streaks,
    getStreakForCategory,
    updateStreakAfterQuiz,
    refetchStreaks: fetchStreaks
  };
}