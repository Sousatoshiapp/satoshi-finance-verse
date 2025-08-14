import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedQuizAudio } from "./use-advanced-quiz-audio";
import { useBTZAnalytics } from "./use-btz-analytics";
import { useUnifiedRewards } from "./use-unified-rewards";
import { useRewardAnimationSystem } from "./use-reward-animation-system";
import { useSmartNotifications } from "./use-smart-notifications";
import { useCriticalHitSystem } from "./use-critical-hit-system";
import { useDopamineAudio } from "./use-dopamine-audio";
import { useAdvancedHaptics } from "./use-advanced-haptics";
import { useFOMOFeatures } from "./use-fomo-features";
import { XP_CONFIG } from "@/config/xp-config";
import confetti from 'canvas-confetti';

const MAX_BTZ_PER_HOUR = 10;
const MAX_QUIZZES_PER_DAY = 10;

interface QuizGamificationState {
  streak: number;
  totalBTZ: number;
  currentMultiplier: number;
  showBeetzAnimation: boolean;
  showStreakAnimation: boolean;
  currentQuestion: string;
  currentCorrectAnswer: string;
  currentExplanation?: string;
  isLoaded: boolean;
}

export function useQuizGamification() {
  console.log("🎮 useQuizGamification hook inicializado");
  const { user } = useAuth();
  const { toast } = useToast();
  const { playCorrectSound, playWrongSound, playStreakSound, playCashRegisterSound } = useAdvancedQuizAudio();
  const { checkDailyLimit, logBTZTransaction } = useBTZAnalytics();
  const unifiedRewards = useUnifiedRewards();
  const { 
    showBTZGain, 
    showXPGain, 
    showStreakMilestone, 
    showCorrectAnswer,
    showLevelUp,
    showPerfectQuiz 
  } = useRewardAnimationSystem();
  const { 
    showStreakNotification, 
    showLevelUpNotification 
  } = useSmartNotifications();
  
  const { processCriticalHit, triggerFloatingNumbers } = useCriticalHitSystem();
  const { playHeadshotSound, playCriticalHitSound, playComboSound } = useDopamineAudio();
  const { correctAnswerHaptic, criticalHitHaptic, comboHaptic } = useAdvancedHaptics();
  const { triggerSecretAchievement } = useFOMOFeatures();
  
  const [animationState, setAnimationState] = useState({
    showBeetzAnimation: false,
    showStreakAnimation: false,
    currentQuestion: "",
    currentCorrectAnswer: "",
    currentExplanation: undefined as string | undefined,
    earnedBTZ: 0
  });



  const handleCorrectAnswer = useCallback(async () => {
    console.log("✅ handleCorrectAnswer chamado - UNIFIED REWARDS", {
      user: user?.id,
      isLoaded: unifiedRewards.isLoaded,
      currentStreak: unifiedRewards.currentStreak,
      timestamp: Date.now()
    });
    
    if (!user || !unifiedRewards.isLoaded) {
      console.log("❌ Exiting early - no user or not loaded:", { user: !!user, isLoaded: unifiedRewards.isLoaded });
      return;
    }

    const hourlyCheck = await checkDailyLimit('quiz_hourly', 0.1);
    if (!hourlyCheck) {
      toast({
        title: "⚠️ Limite por Hora Atingido",
        description: `Máximo ${MAX_BTZ_PER_HOUR} BTZ por hora`,
        variant: "destructive"
      });
      return;
    }

    const baseBTZ = 0.1;
    
    // FASE 3: Process critical hit
    const criticalResult = processCriticalHit(baseBTZ);
    const finalBTZ = baseBTZ * unifiedRewards.currentMultiplier * criticalResult.multiplier;
    
    // FASE 3: Dopamine audio effects
    if (criticalResult.isCritical) {
      playCriticalHitSound(criticalResult.multiplier);
      criticalHitHaptic(criticalResult.multiplier);
      
      // Trigger critical hit visual
      window.dispatchEvent(new CustomEvent('showCriticalHit', {
        detail: {
          type: criticalResult.visualEffect,
          position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          multiplier: criticalResult.multiplier
        }
      }));
    } else {
      playHeadshotSound();
      correctAnswerHaptic();
    }
    
    // FASE 3: Combo effects
    if (criticalResult.comboCount > 0) {
      playComboSound(criticalResult.comboCount);
      comboHaptic(criticalResult.comboCount);
    }
    
    showCorrectAnswer({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    await unifiedRewards.earnBTZ(finalBTZ, 'quiz');
    await unifiedRewards.awardXP(XP_CONFIG.QUIZ_CORRECT_ANSWER, 'quiz_correct');
    await unifiedRewards.updateStreak(true);
    
    showBTZGain(finalBTZ, { x: window.innerWidth / 2, y: window.innerHeight / 2 }, criticalResult.multiplier);
    
    showXPGain(XP_CONFIG.QUIZ_CORRECT_ANSWER, false);
    
    setAnimationState(prev => ({
      ...prev,
      showBeetzAnimation: true,
      showStreakAnimation: unifiedRewards.currentStreak > 0,
      earnedBTZ: finalBTZ
    }));

    const currentStreak = unifiedRewards.currentStreak;
    if (currentStreak % 7 === 0 && currentStreak > 0) {
      const newMultiplier = Math.min(1 + Math.floor(currentStreak / 7) * 0.5, 5);
      showStreakMilestone(currentStreak, newMultiplier);
      showStreakNotification(currentStreak, currentStreak + 7);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B']
      });
    }
  }, [unifiedRewards, user, checkDailyLimit, toast, showBTZGain, showXPGain, showStreakMilestone, showCorrectAnswer, showStreakNotification]);

  const handleWrongAnswer = useCallback(async (question?: string, correctAnswer?: string, explanation?: string) => {
    console.log('❌ handleWrongAnswer chamado - UNIFIED REWARDS');
    
    if (!unifiedRewards.isLoaded) return { canUseLife: false };
    
    await unifiedRewards.updateStreak(false);
    
    setAnimationState(prev => ({
      ...prev,
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
      console.log('🚫 Wrong answer sound blocked - user not on quiz screen');
    }

    // Vibration for wrong answer
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    return { canUseLife: false };
  }, [playWrongSound, unifiedRewards]);

  // Sistema de vidas removido - FASE 3 REBALANCEAMENTO

  const hideBeetzAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, showBeetzAnimation: false }));
  }, []);

  const hideStreakAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, showStreakAnimation: false }));
  }, []);


  const resetGamification = useCallback(() => {
    setAnimationState({
      showBeetzAnimation: false,
      showStreakAnimation: false,
      currentQuestion: "",
      currentCorrectAnswer: "",
      currentExplanation: undefined,
      earnedBTZ: 0
    });
  }, []);

  const getQuizCompletion = useCallback(async (score: number, total: number) => {
    if (!user || total !== 7) return;

    const percentage = (score / total) * 100;
    
    let bonusReward = 0;
    if (percentage >= 90) bonusReward = 0.5;
    else if (percentage >= 80) bonusReward = 0.3;
    else if (percentage >= 70) bonusReward = 0.1;
    
    if (bonusReward > 0) {
      await unifiedRewards.earnBTZ(bonusReward, 'quiz_completion');
    }
    
    return {
      totalBTZ: unifiedRewards.currentBTZ,
      streak: unifiedRewards.currentStreak,
      bonusReward,
      percentage
    };
  }, [unifiedRewards, user]);

  return {
    streak: unifiedRewards.currentStreak,
    totalBTZ: unifiedRewards.currentBTZ,
    currentMultiplier: unifiedRewards.currentMultiplier,
    showBeetzAnimation: animationState.showBeetzAnimation,
    showStreakAnimation: animationState.showStreakAnimation,
    currentQuestion: animationState.currentQuestion,
    currentCorrectAnswer: animationState.currentCorrectAnswer,
    currentExplanation: animationState.currentExplanation,
    earnedBTZ: animationState.earnedBTZ,
    isLoaded: unifiedRewards.isLoaded,
    handleCorrectAnswer,
    handleWrongAnswer,
    hideBeetzAnimation,
    hideStreakAnimation,
    resetGamification,
    getQuizCompletion
  };
}
