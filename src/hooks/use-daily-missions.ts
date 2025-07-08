import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface DailyMission {
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
}

interface MissionProgress {
  mission_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export function useDailyMissions() {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyMissions();
    // Check for new missions every minute
    const interval = setInterval(loadDailyMissions, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDailyMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for daily missions');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.log('No profile found for daily missions');
        return;
      }

      console.log('Generating daily missions for profile:', profile.id);
      // Generate missions if needed
      const { error: generateError } = await supabase.rpc('generate_daily_missions');
      if (generateError) {
        console.error('Error generating daily missions:', generateError);
        throw generateError;
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

      // Combine missions with progress
      const missionsWithProgress = missionsData?.map(mission => {
        const progress = progressData?.find(p => p.mission_id === mission.id);
        return {
          ...mission,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          completed_at: progress?.completed_at
        };
      }) || [];

      setMissions(missionsWithProgress);
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
    completeSocialMission
  };
}