import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useRewardAnimationSystem } from './use-reward-animation-system';

export interface DailyLesson {
  id: string;
  title: string;
  content: string;
  category: string;
  quiz_question: string;
  quiz_options: any;
  correct_answer: number;
  xp_reward: number;
  btz_reward: number;
  is_main_lesson: boolean;
  lesson_date: string;
  is_active: boolean;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  viewed_at: string;
  quiz_completed: boolean;
  quiz_correct: boolean | null;
  xp_earned: number;
  btz_earned: number;
}

export interface LessonStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_lesson_date: string | null;
  total_lessons_completed: number;
  weekly_combo_count: number;
  last_weekly_combo: string | null;
}

export function useDailyLessons() {
  const [lessons, setLessons] = useState<DailyLesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserLessonProgress[]>([]);
  const [userStreak, setUserStreak] = useState<LessonStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const { toast } = useToast();
  const rewardSystem = useRewardAnimationSystem();

  // Carregar lições do dia
  const loadTodaysLessons = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('daily_lessons')
        .select('*')
        .eq('lesson_date', today)
        .eq('is_active', true)
        .order('is_main_lesson', { ascending: false });

      if (lessonsError) throw lessonsError;

      const formattedLessons = (lessonsData || []).map(lesson => ({
        ...lesson,
        quiz_options: Array.isArray(lesson.quiz_options) ? lesson.quiz_options : JSON.parse(lesson.quiz_options as string || '[]')
      }));
      setLessons(formattedLessons);
    } catch (error) {
      console.error('Erro ao carregar lições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as lições do dia",
        variant: "destructive"
      });
    }
  };

  // Carregar progresso do usuário
  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Buscar progresso das lições
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', profile.id);

      if (progressError) throw progressError;

      setUserProgress(progressData || []);

      // Buscar streak do usuário
      const { data: streakData, error: streakError } = await supabase
        .from('lesson_streaks')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      setUserStreak(streakData || null);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  // Verificar se deve mostrar modal
  const checkShouldShowModal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: modalData } = await supabase
        .from('user_daily_lesson_modal')
        .select('last_shown_at')
        .eq('user_id', profile.id)
        .single();

      if (!modalData) {
        setShouldShowModal(true);
        return;
      }

      const lastShown = new Date(modalData.last_shown_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60);

      if (hoursDiff >= 24) {
        setShouldShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar modal:', error);
    }
  };

  // Marcar lição como visualizada
  const markLessonViewed = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: profile.id,
          lesson_id: lessonId,
          xp_earned: 1
        });

      if (error) throw error;

      // Atualizar XP do usuário
      await supabase.rpc('award_xp', {
        profile_id: profile.id,
        xp_amount: 1,
        source: 'daily_lesson'
      });

      await loadUserProgress();
      
      toast({
        title: "🎯 Lição visualizada!",
        description: "+1 XP por ler a lição"
      });
    } catch (error) {
      console.error('Erro ao marcar lição como vista:', error);
    }
  };

  // Completar quiz de lição
  const completeLessonQuiz = async (lessonId: string, selectedAnswer: number) => {
    try {
      console.log('🎯 [DEBUG] Iniciando completeLessonQuiz...', { lessonId, selectedAnswer });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ [DEBUG] Usuário não encontrado');
        return { success: false, correct: false };
      }
      
      console.log('✅ [DEBUG] Usuário logado:', user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.log('❌ [DEBUG] Profile não encontrado');
        return { success: false, correct: false };
      }
      
      console.log('✅ [DEBUG] Profile encontrado:', profile.id);

      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) {
        console.log('❌ [DEBUG] Lição não encontrada');
        return { success: false, correct: false };
      }
      
      console.log('✅ [DEBUG] Lição encontrada:', lesson.title);
      console.log('🎯 [DEBUG] Quiz details:', {
        options: lesson.quiz_options,
        selectedAnswer,
        correctAnswer: lesson.correct_answer
      });
      
      const isCorrect = selectedAnswer === lesson.correct_answer;
      const xpEarned = isCorrect ? 10 : 1;
      const btzEarned = isCorrect ? 0.5 : 0;
      
      console.log('🎯 [DEBUG] Resultado:', { isCorrect, xpEarned, btzEarned });

      // Verificar se já existe progresso para esta lição
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('lesson_id', lessonId)
        .single();
      
      console.log('🎯 [DEBUG] Progress existente:', existingProgress);

      // Se já existe, atualizar. Se não existe, inserir.
      if (existingProgress) {
        console.log('🔄 [DEBUG] Atualizando progresso existente...');
        const { error } = await supabase
          .from('user_lesson_progress')
          .update({
            quiz_completed: true,
            quiz_correct: isCorrect,
            xp_earned: xpEarned,
            btz_earned: btzEarned
          })
          .eq('user_id', profile.id)
          .eq('lesson_id', lessonId);

        if (error) {
          console.error('❌ [DEBUG] Erro ao atualizar:', error);
          throw error;
        }
        console.log('✅ [DEBUG] Progresso atualizado com sucesso');
      } else {
        console.log('➕ [DEBUG] Inserindo novo progresso...');
        const { error } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: profile.id,
            lesson_id: lessonId,
            quiz_completed: true,
            quiz_correct: isCorrect,
            xp_earned: xpEarned,
            btz_earned: btzEarned
          });

        if (error) {
          console.error('❌ [DEBUG] Erro ao inserir:', error);
          throw error;
        }
        console.log('✅ [DEBUG] Novo progresso inserido com sucesso');
      }

      // Atualizar XP e BTZ do usuário
      if (isCorrect) {
        await supabase.rpc('award_xp', {
          profile_id: profile.id,
          xp_amount: 10,
          source: 'daily_lesson_quiz'
        });

        const { error: btzError } = await supabase
          .from('profiles')
          .update({ points: (profile.points || 0) + 0.5 })
          .eq('id', profile.id);

        if (btzError) throw btzError;
      }

      // Atualizar streak
      const today = new Date().toISOString().split('T')[0];
      const { data: streakResult } = await supabase.rpc('update_lesson_streak', {
        p_user_id: profile.id,
        p_lesson_date: today
      });

      console.log('🔄 [DEBUG] Recarregando progresso do usuário...');
      await loadUserProgress();
      console.log('✅ [DEBUG] Progresso recarregado');

      // Trigger animations and effects for quiz completion
      if (isCorrect) {
        console.log('🎉 [DEBUG] Resposta correta - iniciando animações');
        // Show XP and BTZ gains with animations with delays for better UX
        setTimeout(() => {
          rewardSystem.showXPGain(10);
        }, 500);
        
        setTimeout(() => {
          if (btzEarned > 0) {
            rewardSystem.showBTZGain(btzEarned, { x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
          }
        }, 1000);
        
        // Trigger confetti
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#EC4899', '#F59E0B']
          });
        }, 200);

        toast({
          title: "🎉 Resposta correta!",
          description: "+10 XP + 0,5 BTZ"
        });

        // Verificar achievements de streak
        if (streakResult && typeof streakResult === 'object' && 'weekly_combo' in streakResult && streakResult.weekly_combo) {
          toast({
            title: "🔥 Combo Semanal!",
            description: "+5 BTZ bônus por 7 dias seguidos!",
            duration: 5000
          });
        }

        if (streakResult && typeof streakResult === 'object' && 'badge_earned' in streakResult && streakResult.badge_earned) {
          const currentStreak = 'current_streak' in streakResult ? streakResult.current_streak : 'N/A';
          toast({
            title: "🏆 Badge Desbloqueado!",
            description: `Streak de ${currentStreak} dias!`,
            duration: 5000
          });
        }
      } else {
        console.log('❌ [DEBUG] Resposta incorreta - mostrando feedback');
        // Show XP gain even for wrong answers and incorrect answer feedback
        setTimeout(() => {
          rewardSystem.showXPGain(1);
          rewardSystem.showIncorrectAnswer("Resposta incorreta");
        }, 300);
        
        toast({
          title: "🤔 Resposta incorreta",
          description: "Mas você ganhou +1 XP por tentar! Tente novamente amanhã.",
          variant: "destructive"
        });
      }

      console.log('🎯 [DEBUG] completeLessonQuiz finalizado com sucesso:', { success: true, correct: isCorrect });
      return { success: true, correct: isCorrect };
    } catch (error) {
      console.error('❌ [DEBUG] ERRO CRÍTICO em completeLessonQuiz:', error);
      toast({
        title: "❌ Erro",
        description: "Houve um problema ao salvar sua resposta. Tente novamente.",
        variant: "destructive"
      });
      return { success: false, correct: false };
    }
  };

  // Marcar modal como visualizado
  const markModalShown = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      await supabase
        .from('user_daily_lesson_modal')
        .upsert({
          user_id: profile.id,
          last_shown_at: new Date().toISOString()
        });

      setShouldShowModal(false);
    } catch (error) {
      console.error('Erro ao marcar modal:', error);
    }
  };

  // Funções de utilidade
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'curiosidades': return '🤯';
      case 'dicas': return '💡';
      case 'historias': return '📚';
      case 'glossario': return '📖';
      default: return '💰';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'curiosidades': return 'Curiosidade';
      case 'dicas': return 'Dica Rápida';
      case 'historias': return 'História Real';
      case 'glossario': return 'Glossário';
      default: return 'Lição';
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.quiz_completed);
  };

  const isLessonViewed = (lessonId: string) => {
    return userProgress.some(p => p.lesson_id === lessonId);
  };

  const getLessonProgress = (lessonId: string) => {
    return userProgress.find(p => p.lesson_id === lessonId);
  };

  const mainLesson = lessons.find(l => l.is_main_lesson);
  const extraLessons = lessons.filter(l => !l.is_main_lesson);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadTodaysLessons(),
        loadUserProgress(),
        checkShouldShowModal()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    lessons,
    mainLesson,
    extraLessons,
    userProgress,
    userStreak,
    loading,
    shouldShowModal,
    markLessonViewed,
    completeLessonQuiz,
    markModalShown,
    getCategoryIcon,
    getCategoryName,
    isLessonCompleted,
    isLessonViewed,
    getLessonProgress,
    refreshData: () => {
      loadTodaysLessons();
      loadUserProgress();
    }
  };
}