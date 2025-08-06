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
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [adaptiveMissions, setAdaptiveMissions] = useState<AdaptiveMission[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyMissions();
    // Check for new missions every 5 minutes instead of every minute to reduce DB load
    const interval = setInterval(loadDailyMissions, 300000);
    return () => clearInterval(interval);
  }, []);

  const getUserAnalytics = async (profileId: string) => {
    try {
      const { data: quizSessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(20);

      const weakAreas: string[] = [];
      const categoryPerformance: Record<string, { correct: number; total: number }> = {};
      
      quizSessions?.forEach(session => {
        if (session.questions_data) {
          const questions = Array.isArray(session.questions_data) ? session.questions_data : [];
          questions.forEach((q: any) => {
            if (q.category) {
              if (!categoryPerformance[q.category]) {
                categoryPerformance[q.category] = { correct: 0, total: 0 };
              }
              categoryPerformance[q.category].total++;
              if (q.correct) {
                categoryPerformance[q.category].correct++;
              }
            }
          });
        }
      });

      Object.entries(categoryPerformance).forEach(([category, perf]) => {
        const accuracy = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
        if (accuracy < 60 && perf.total >= 3) {
          weakAreas.push(category);
        }
      });

      const avgSessionTime = quizSessions?.length > 0 
        ? quizSessions.reduce((sum, s) => sum + (s.time_spent || 0), 0) / quizSessions.length / 60
        : 15;

      return {
        weakAreas,
        preferredCategories: Object.keys(categoryPerformance).slice(0, 3),
        averageSessionTime: Math.round(avgSessionTime),
        lastActiveDistricts: []
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {
        weakAreas: [],
        preferredCategories: ['quiz'],
        averageSessionTime: 15,
        lastActiveDistricts: []
      };
    }
  };

  const generatePersonalizedMissions = async (profileId: string, userProfile: UserProfile) => {
    try {
      const { error } = await supabase.rpc('generate_daily_missions');
      if (error) throw error;
    } catch (error) {
      console.error('Error generating missions:', error);
    }
  };

  const createAdaptiveMission = (mission: DailyMission, userProfile: UserProfile): AdaptiveMission => {
    const isBasedOnWeakness = userProfile.weakAreas.includes(mission.category);
    const difficultyAdjusted = shouldAdjustDifficulty(mission, userProfile);
    
    const adaptiveRewards = calculateAdaptiveRewards(mission, userProfile, isBasedOnWeakness);
    
    return {
      ...mission,
      personalizedFor: userProfile.level.toString(),
      difficultyAdjusted,
      basedOnWeakness: isBasedOnWeakness,
      contextualHints: isBasedOnWeakness ? [mission.category] : [],
      adaptiveRewards
    };
  };

  const shouldAdjustDifficulty = (mission: DailyMission, userProfile: UserProfile): boolean => {
    if (userProfile.level > 10 && mission.difficulty === 'easy') return true;
    if (userProfile.level < 5 && mission.difficulty === 'hard') return true;
    return false;
  };

  const calculateAdaptiveRewards = (mission: DailyMission, userProfile: UserProfile, basedOnWeakness: boolean) => {
    let baseXP = mission.xp_reward;
    let baseBTZ = mission.beetz_reward;
    
    if (basedOnWeakness) {
      baseXP *= 1.5;
      baseBTZ *= 1.3;
    }
    
    const streakMultiplier = Math.min(1 + (userProfile.currentStreak * 0.1), 2.0);
    
    return {
      baseReward: baseXP,
      bonusMultiplier: basedOnWeakness ? 1.5 : 1.0,
      streakBonus: streakMultiplier
    };
  };

  const adjustDifficulty = async (performance: UserPerformance) => {
    if (!userProfile) return;
    
    let difficultyModifier = 0;
    
    if (performance.completionRate > 0.8 && performance.streakLength > 7) {
      difficultyModifier = 1;
    }
    
    if (performance.completionRate < 0.4 || performance.streakLength < 3) {
      difficultyModifier = -1;
    }
    
    console.log('Difficulty adjustment:', difficultyModifier);
  };

  const loadDailyMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for daily missions');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id, level, xp, points, streak, completed_lessons,
          consecutive_login_days, financial_goal
        `)
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.log('No profile found for daily missions');
        return;
      }

      const userAnalytics = await getUserAnalytics(profile.id);
      const userProfileData: UserProfile = {
        level: profile.level || 1,
        weakAreas: userAnalytics.weakAreas || [],
        preferredCategories: userAnalytics.preferredCategories || ['quiz'],
        averageSessionTime: userAnalytics.averageSessionTime || 15,
        lastActiveDistricts: userAnalytics.lastActiveDistricts || [],
        currentStreak: profile.streak || 0,
        xp: profile.xp || 0,
        points: profile.points || 0,
        completedLessons: profile.completed_lessons || 0
      };
      setUserProfile(userProfileData);

      // First, check if missions already exist for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingMissions } = await supabase
        .from('daily_missions')
        .select('id')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .limit(1);

      if (!existingMissions || existingMissions.length === 0) {
        console.log('Generating personalized missions for profile:', profile.id);
        await generatePersonalizedMissions(profile.id, userProfileData);
      }

      // Get missions with user progress
      const { data: missionsData, error: missionsError } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('category');

      if (missionsError) throw missionsError;

      // Get user progress for these missions
      const { data: progressData, error: progressError } = await supabase
        .from('user_mission_progress')
        .select('*')
        .eq('user_id', profile.id)
        .in('mission_id', missionsData?.map(m => m.id) || []);

      if (progressError) throw progressError;

      // Combine missions with progress and create adaptive missions
      const missionsWithProgress = missionsData?.map(mission => {
        const progress = progressData?.find(p => p.mission_id === mission.id);
        return {
          ...mission,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          completed_at: progress?.completed_at
        };
      }) || [];

      const adaptiveMissionsData = missionsWithProgress.map(mission => 
        createAdaptiveMission(mission, userProfileData)
      );

      setMissions(missionsWithProgress);
      setAdaptiveMissions(adaptiveMissionsData);
      setCompletedToday(missionsWithProgress.filter(m => m.completed).length);
    } catch (error) {
      console.error('Error loading daily missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMissionProgress = async (missionType: string, amount: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('update_mission_progress', {
        profile_id: profile.id,
        mission_type_param: missionType,
        progress_amount: amount
      });

      if (error) throw error;

      // Check if any mission was completed
      if (data && data.length > 0) {
        const completedMission = data[0];
        if (completedMission.mission_completed) {
          const rewards = completedMission.rewards_earned;
          
          // Show celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF6B6B']
          });

          toast({
            title: "🎉 Missão Completada!",
            description: `${(rewards as any)?.mission_name} - +${(rewards as any)?.xp} XP, +${(rewards as any)?.beetz} Beetz`,
            duration: 5000,
          });
        }
      }

      // Reload missions to get updated progress
      await loadDailyMissions();
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  // Function to complete quiz missions
  const completeQuizMission = (correct: boolean) => {
    if (correct) {
      updateMissionProgress('correct_answers', 1);
    }
    updateMissionProgress('quiz_completion', 1);
  };

  // Function to mark daily login
  const markDailyLogin = () => {
    updateMissionProgress('daily_login', 1);
  };

  // Function to complete duel missions
  const completeDuelMission = (won: boolean) => {
    if (won) {
      updateMissionProgress('duel_wins', 1);
    }
  };

  // Function to complete social missions
  const completeSocialMission = (type: 'chat_messages' | 'social_interaction') => {
    updateMissionProgress(type, 1);
  };

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

  const getCompletionRate = () => {
    if (missions.length === 0) return 0;
    return Math.round((completedToday / missions.length) * 100);
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return {
    missions,
    adaptiveMissions,
    userProfile,
    loading,
    completedToday,
    completionRate: getCompletionRate(),
    timeUntilReset: getTimeUntilReset(),
    updateMissionProgress,
    refreshMissions: loadDailyMissions,
    getDifficultyColor,
    getCategoryIcon,
    completeQuizMission,
    markDailyLogin,
    completeDuelMission,
    completeSocialMission,
    adjustDifficulty,
    generatePersonalizedMissions: () => userProfile ? generatePersonalizedMissions(userProfile.level.toString(), userProfile) : Promise.resolve()
  };
}
