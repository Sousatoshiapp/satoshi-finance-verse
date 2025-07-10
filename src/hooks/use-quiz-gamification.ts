import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    
    // Streak bonus at 7 correct answers
    if (newStreak === 7) {
      multiplier = 2; // Double BTZ
      reward = baseReward * multiplier;
      
      setState(prev => ({ 
        ...prev, 
        streak: newStreak, 
        currentMultiplier: multiplier,
        showStreakAnimation: true 
      }));
      
      // Update database with streak achievement
      try {
        await supabase.from('profiles').update({
          points: state.totalBTZ + reward
        }).eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating points:', error);
      }
      
      return;
    }
    
    // Regular correct answer
    setState(prev => ({ 
      ...prev, 
      streak: newStreak, 
      totalBTZ: prev.totalBTZ + reward,
      showBeetzAnimation: true 
    }));

    // Update database with new points
    try {
      await supabase.from('profiles').update({
        points: state.totalBTZ + reward
      }).eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating points:', error);
    }
    
  }, [state, user]);

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

    // Play notification sound for wrong answer
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // Vibration pattern for wrong answer
    }
  }, []);

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