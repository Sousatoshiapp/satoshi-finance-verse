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
}

export function useQuizGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<QuizGamificationState>({
    streak: 0,
    totalBTZ: 0,
    currentMultiplier: 1,
    showBeetzAnimation: false,
    showStreakAnimation: false
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

  const handleWrongAnswer = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      streak: 0, 
      currentMultiplier: 1 
    }));
  }, []);

  const hideBeetzAnimation = useCallback(() => {
    setState(prev => ({ ...prev, showBeetzAnimation: false }));
  }, []);

  const hideStreakAnimation = useCallback(() => {
    setState(prev => ({ ...prev, showStreakAnimation: false }));
  }, []);

  const resetGamification = useCallback(() => {
    setState({
      streak: 0,
      totalBTZ: 0,
      currentMultiplier: 1,
      showBeetzAnimation: false,
      showStreakAnimation: false
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
    resetGamification,
    getQuizCompletion
  };
}