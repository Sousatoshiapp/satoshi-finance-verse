import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: string;
  mission_type: string;
  target_value: number;
  xp_reward: number;
  beetz_reward: number;
  difficulty: string;
  is_weekend_special: boolean;
  progress?: number;
  completed?: boolean;
  completed_at?: string;
  expires_at?: string;
}

export interface AdaptiveMission extends DailyMission {
  personalizedFor: string;
  difficultyAdjusted: boolean;
  basedOnWeakness: boolean;
  contextualHints: string[];
  adaptiveRewards: {
    baseReward: number;
    bonusMultiplier: number;
    streakBonus: number;
  };
}

export interface UserProfile {
  level: number;
  weakAreas: string[];
  preferredCategories: string[];
  averageSessionTime: number;
  lastActiveDistricts: string[];
  currentStreak: number;
  xp: number;
  points: number;
  completedLessons: number;
}

export interface UserPerformance {
  completionRate: number;
  averageTime: number;
  streakLength: number;
  recentScores: number[];
}

export interface MissionProgress {
  mission_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export function useDailyMissions() {
  // PERFORMANCE: Hook de missões completamente desabilitado para melhorar performance
  // Este hook estava fazendo queries complexas com analytics e atualizações frequentes (5min)
  
  /* CÓDIGO ORIGINAL COMENTADO PARA PERFORMANCE:
  
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [adaptiveMissions, setAdaptiveMissions] = useState<AdaptiveMission[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyMissions();
    const interval = setInterval(loadDailyMissions, 300000);
    return () => clearInterval(interval);
  }, []);

  ... (todo o código de missões, analytics, etc.)
  
  */

  // Retorna dados mock para manter compatibilidade
  const [missions] = useState<DailyMission[]>([]);
  const [adaptiveMissions] = useState<AdaptiveMission[]>([]);
  const [userProfile] = useState<UserProfile | null>(null);
  const [loading] = useState(false); // Não está carregando pois está desabilitado
  const [completedToday] = useState(0);

  // Funções mock para manter compatibilidade
  const mockFunction = () => {};
  const mockAsyncFunction = () => Promise.resolve();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quiz': return '🧠';
      case 'streak': return '🔥';
      case 'social': return '👥';
      case 'shop': return '🛒';
      case 'exploration': return '🗺️';
      default: return '📋';
    }
  };

  const getCompletionRate = () => 0;
  const getTimeUntilReset = () => "24h 0m";

  return {
    missions,
    adaptiveMissions,
    userProfile,
    loading,
    completedToday,
    completionRate: getCompletionRate(),
    timeUntilReset: getTimeUntilReset(),
    updateMissionProgress: mockAsyncFunction,
    refreshMissions: mockAsyncFunction,
    getDifficultyColor,
    getCategoryIcon,
    completeQuizMission: mockFunction,
    markDailyLogin: mockFunction, // Importante manter para dashboard
    completeDuelMission: mockFunction,
    completeSocialMission: mockFunction,
    adjustDifficulty: mockAsyncFunction,
    generatePersonalizedMissions: mockAsyncFunction
  };
}
