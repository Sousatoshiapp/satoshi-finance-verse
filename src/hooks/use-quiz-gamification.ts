import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuizAudio } from "./use-quiz-audio";

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
}

export function useQuizGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playCorrectSound, playWrongSound, playStreakSound } = useQuizAudio();
  
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
    currentExplanation: undefined
  });

  const handleCorrectAnswer = useCallback(async () => {
    if (!user) return;

    const newStreak = state.streak + 1;
    const baseReward = 1;
    let multiplier = state.currentMultiplier;
    let reward = baseReward * multiplier;
    
    // Streak bonus at 7 correct answers - dobra os BTZ para TODAS as 7 respostas
    if (newStreak === 7) {
      const totalDoubleReward = state.totalBTZ; // Dobra todos os BTZ acumulados
      reward = baseReward + totalDoubleReward; // BTZ normal + bonus duplo
      
      setState(prev => ({ 
        ...prev, 
        streak: newStreak, 
        totalBTZ: prev.totalBTZ + reward,
        currentMultiplier: 2,
        showStreakAnimation: true 
      }));
      
      // Play streak achievement sound
      playStreakSound(newStreak);
      
      // Update database with streak achievement
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          await supabase.from('profiles').update({
            points: profile.points + reward
          }).eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Error updating points:', error);
      }
      
      return;
    }
    
    // Regular correct answer - apenas +1 BTZ
    setState(prev => ({ 
      ...prev, 
      streak: newStreak, 
      totalBTZ: prev.totalBTZ + reward,
      showBeetzAnimation: true 
    }));

    // Play correct answer sound with intensity based on streak
    const intensity = Math.min(newStreak, 10);
    playCorrectSound(intensity);

    // Update database with new points
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
        
      if (profile) {
        await supabase.from('profiles').update({
          points: profile.points + reward
        }).eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating points:', error);
    }
    
  }, [state, user, playCorrectSound, playStreakSound]);

  const handleWrongAnswer = useCallback((question?: string, correctAnswer?: string, explanation?: string) => {
    // Show video explanation for wrong answers
    const videoUrl = "https://i.imgur.com/9wSK0Dy.mp4"; // URL do vídeo explicativo
    
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

    // Play wrong answer sound
    playWrongSound();

    // Vibration for wrong answer
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // Vibration pattern for wrong answer
    }
  }, [playWrongSound]);

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
      currentExplanation: undefined
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
    hideBeetzAnimation,
    hideStreakAnimation,
    hideVideoExplanation,
    resetGamification,
    getQuizCompletion
  };
}