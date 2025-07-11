import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedQuizAudio } from "./use-advanced-quiz-audio";
import { useLivesSystem } from "./use-lives-system";

interface QuizGamificationState {
  streak: number;
  totalBTZ: number;
  currentMultiplier: number;
  showBeetzAnimation: boolean;
  showStreakAnimation: boolean;
  showVideoExplanation: boolean;
  currentVideoUrl: string | null;
  currentQuestion: string;
  currentCorrectAnswer: string;
  currentExplanation?: string;
  hasShownLifeBanner: boolean;
}

export function useQuizGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playCorrectSound, playWrongSound, playStreakSound, playCashRegisterSound } = useAdvancedQuizAudio();
  const { hasLives, useLife } = useLivesSystem();
  
  const [state, setState] = useState<QuizGamificationState>({
    streak: 0,
    totalBTZ: 0,
    currentMultiplier: 1,
    showBeetzAnimation: false,
    showStreakAnimation: false,
    showVideoExplanation: false,
    currentVideoUrl: null,
    currentQuestion: "",
    currentCorrectAnswer: "",
    currentExplanation: undefined,
    hasShownLifeBanner: false
  });

  const handleCorrectAnswer = useCallback(async () => {
    if (!user) return;

    const newStreak = state.streak + 1;
    let newMultiplier = state.currentMultiplier;
    const baseBTZ = 1; // 1 BTZ base por resposta correta
    
    // Sistema de multiplicador progressivo: 1→2→4→8→16...
    // A cada 7 corretas consecutivas, dobra o multiplicador
    if (newStreak % 7 === 0) {
      newMultiplier = newMultiplier * 2;
      
      const earnedBTZ = baseBTZ * newMultiplier;
      
      setState(prev => ({ 
        ...prev, 
        streak: newStreak, 
        totalBTZ: prev.totalBTZ + earnedBTZ,
        currentMultiplier: newMultiplier,
        showStreakAnimation: true,
        showBeetzAnimation: true
      }));
      
      // Play only BTZ sound
      playCashRegisterSound();
      
      toast({
        title: `🔥 Streak de ${newStreak}!`,
        description: `Multiplicador BTZ: ${newMultiplier}x | +${earnedBTZ} BTZ`
      });
      
      // Update database with multiplied points
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          await supabase.from('profiles').update({
            points: profile.points + earnedBTZ
          }).eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Error updating points:', error);
      }
    } else {
      // Regular correct answer com multiplicador atual
      const earnedBTZ = baseBTZ * newMultiplier;
      
      setState(prev => ({ 
        ...prev, 
        streak: newStreak, 
        totalBTZ: prev.totalBTZ + earnedBTZ,
        showBeetzAnimation: true 
      }));
      
      playCashRegisterSound();
      
      // Update database with multiplied points
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          await supabase.from('profiles').update({
            points: profile.points + earnedBTZ
          }).eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Error updating points:', error);
      }
    }
    
  }, [state, user, playCashRegisterSound, toast]);

  const handleWrongAnswer = useCallback(async (question?: string, correctAnswer?: string, explanation?: string) => {
    console.log('❌ handleWrongAnswer chamado no useQuizGamification');
    
    // Só pode usar vida se tem streak >= 7 (primeiro streak real) E tem vidas disponíveis E ainda não mostrou o banner nesta sessão
    if (state.streak >= 7 && hasLives() && !state.hasShownLifeBanner) {
      // Marcar que já mostrou o banner nesta sessão
      setState(prev => ({ ...prev, hasShownLifeBanner: true }));
      
      // Oferecer usar vida para manter streak
      return { 
        canUseLife: true, 
        currentStreak: state.streak,
        currentMultiplier: state.currentMultiplier 
      };
    }

    // Sem streak ou sem vidas - resetar tudo
    const videoUrl = "https://i.imgur.com/9wSK0Dy.mp4";
    
    setState(prev => ({ 
      ...prev, 
      streak: 0, 
      currentMultiplier: 1,
      showVideoExplanation: true,
      currentVideoUrl: videoUrl,
      currentQuestion: question || "",
      currentCorrectAnswer: correctAnswer || "",
      currentExplanation: explanation
    }));

    // Guard: Only play sound if user is on quiz-related screens
    if (window.location.pathname.includes('/quiz') || 
        window.location.pathname.includes('/dashboard') ||
        window.location.pathname.includes('/missions') ||
        window.location.pathname.includes('/tournament') ||
        window.location.pathname.includes('/district')) {
      console.log('🔊 Tocando som de resposta errada');
      playWrongSound();
    } else {
      console.log('🚫 Som de resposta errada bloqueado - usuário não está em tela de quiz');
    }

    // Vibration for wrong answer
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    return { canUseLife: false };
  }, [playWrongSound, state.streak, state.currentMultiplier, hasLives, state.hasShownLifeBanner]);

  const handleUseLife = useCallback(async () => {
    const success = await useLife();
    if (success) {
      toast({
        title: "💖 Streak salvo!",
        description: `Você manteve sua sequência de ${state.streak} e multiplicador ${state.currentMultiplier}x`
      });
      return true;
    }
    return false;
  }, [useLife, state.streak, state.currentMultiplier, toast]);

  const hideBeetzAnimation = useCallback(() => {
    setState(prev => ({ ...prev, showBeetzAnimation: false }));
  }, []);

  const hideStreakAnimation = useCallback(() => {
    setState(prev => ({ ...prev, showStreakAnimation: false }));
  }, []);

  const hideVideoExplanation = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showVideoExplanation: false,
      currentVideoUrl: null,
      currentQuestion: "",
      currentCorrectAnswer: "",
      currentExplanation: undefined
    }));
  }, []);

  const resetGamification = useCallback(() => {
    setState({
      streak: 0,
      totalBTZ: 0,
      currentMultiplier: 1,
      showBeetzAnimation: false,
      showStreakAnimation: false,
      showVideoExplanation: false,
      currentVideoUrl: null,
      currentQuestion: "",
      currentCorrectAnswer: "",
      currentExplanation: undefined,
      hasShownLifeBanner: false
    });
  }, []);

  const getQuizCompletion = useCallback(async (score: number, total: number) => {
    if (!user || total !== 7) return;

    const percentage = (score / total) * 100;
    let bonusReward = 0;
    
    // Bonus for completing all 7 questions with 100% score
    if (percentage === 100) {
      bonusReward = state.totalBTZ; // Double the total earned
      
      try {
        await supabase.from('profiles').update({
          points: state.totalBTZ + bonusReward
        }).eq('user_id', user.id);
        
        toast({
          title: "🏆 Pontuação Perfeita!",
          description: `Você ganhou ${bonusReward} BTZ extras por acertar todas as 7 perguntas!`
        });
      } catch (error) {
        console.error('Error updating bonus points:', error);
      }
    }
    
    return {
      totalBTZ: state.totalBTZ + bonusReward,
      streak: state.streak,
      bonusReward,
      percentage
    };
  }, [state, user, toast]);

  return {
    ...state,
    handleCorrectAnswer,
    handleWrongAnswer,
    handleUseLife,
    hideBeetzAnimation,
    hideStreakAnimation,
    hideVideoExplanation,
    resetGamification,
    getQuizCompletion
  };
}