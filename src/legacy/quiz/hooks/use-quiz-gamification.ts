// LEGACY CODE - ISOLADO EM JANEIRO 2025
// Este hook foi substituído pelo novo sistema unificado de quiz
// Mantido apenas para referência durante a migração

// Código original comentado para evitar conflitos
/*
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedQuizAudio } from "./use-advanced-quiz-audio";
import { useBTZAnalytics } from "./use-btz-analytics";
import { useUnifiedRewards } from "./use-unified-rewards";
import { useRewardAnimationSystem } from "./use-reward-animation-system";
import { useSmartNotifications } from "./use-smart-notifications";
import { XP_CONFIG } from "@/config/xp-config";
import confetti from 'canvas-confetti';

// ... resto do código original ...
*/

// Hook vazio para não quebrar importações existentes
export function useQuizGamification() {
  console.warn('⚠️ useQuizGamification is LEGACY - use new quiz system');
  return {
    streak: 0,
    totalBTZ: 0,
    currentMultiplier: 1,
    showBeetzAnimation: false,
    showStreakAnimation: false,
    currentQuestion: '',
    currentCorrectAnswer: '',
    currentExplanation: undefined,
    earnedBTZ: 0,
    isLoaded: false,
    handleCorrectAnswer: () => {},
    handleWrongAnswer: () => {},
    hideBeetzAnimation: () => {},
    hideStreakAnimation: () => {},
    resetGamification: () => {},
    getQuizCompletion: () => {}
  };
}