import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  beetz_reward: number;
  difficulty: string;
  progress?: number;
  completed?: boolean;
  completed_at?: string;
}

interface ChallengeProgress {
  challenge_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyChallenges();
    // Check for new challenges every 5 minutes
    const interval = setInterval(loadDailyChallenges, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadDailyChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for daily challenges');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        console.log('No profile found for daily challenges');
        return;
      }

      // First, check if challenges already exist for today
      const { data: existingChallenges } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .limit(1);

      // Only generate challenges if none exist for today
      if (!existingChallenges || existingChallenges.length === 0) {
        console.log('Generating daily challenges for profile:', profile.id);
        const { error: generateError } = await supabase.rpc('generate_daily_challenges');
        if (generateError) {
          console.error('Error generating daily challenges:', generateError);
          throw generateError;
        }
      }

      // Get challenges with user progress
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('challenge_type');

      if (challengesError) throw challengesError;

      // Get user progress for these challenges
      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', profile.id)
        .in('challenge_id', challengesData?.map(c => c.id) || []);

      if (progressError) throw progressError;

      // Combine challenges with progress
      const challengesWithProgress = challengesData?.map(challenge => {
        const progress = progressData?.find(p => p.challenge_id === challenge.id);
        return {
          ...challenge,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          completed_at: progress?.completed_at
        };
      }) || [];

      setChallenges(challengesWithProgress);
      setCompletedToday(challengesWithProgress.filter(c => c.completed).length);
    } catch (error) {
      console.error('Error loading daily challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChallengeProgress = async (challengeType: string, amount: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('update_challenge_progress', {
        profile_id: profile.id,
        challenge_type_param: challengeType,
        progress_amount: amount
      });

      if (error) throw error;

      // Check if any challenge was completed
      if (data && data.length > 0) {
        const completedChallenge = data[0];
        if (completedChallenge.challenge_completed) {
          const rewards = completedChallenge.rewards_earned;
          
          // Show celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
          });

          toast({
            title: "⚡ Desafio Completado!",
            description: `${(rewards as any)?.challenge_name} - +${(rewards as any)?.xp} XP, +${(rewards as any)?.beetz} Beetz`,
            duration: 5000,
          });
        }
      }

      // Reload challenges to get updated progress
      await loadDailyChallenges();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  // Challenge completion functions
  const completeSpeedChallenge = (responseTimeMs: number) => {
    if (responseTimeMs < 8000) {
      updateChallengeProgress('speed', 1);
    }
  };

  const completeComboChallenge = (comboCount: number) => {
    if (comboCount >= 8) {
      updateChallengeProgress('combo', comboCount);
    }
  };

  const completeSocialChallenge = () => {
    updateChallengeProgress('social', 1);
  };

  const completeExplorationChallenge = () => {
    updateChallengeProgress('exploration', 1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getChallengeIcon = (challengeType: string) => {
    switch (challengeType) {
      case 'speed': return '⚡';
      case 'combo': return '🔥';
      case 'social': return '👥';
      case 'exploration': return '🗺️';
      default: return '🎯';
    }
  };

  const getChallengeTypeColor = (challengeType: string) => {
    switch (challengeType) {
      case 'speed': return 'border-l-yellow-500';
      case 'combo': return 'border-l-orange-500';
      case 'social': return 'border-l-blue-500';
      case 'exploration': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getCompletionRate = () => {
    if (challenges.length === 0) return 0;
    return Math.round((completedToday / challenges.length) * 100);
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
    challenges,
    loading,
    completedToday,
    completionRate: getCompletionRate(),
    timeUntilReset: getTimeUntilReset(),
    updateChallengeProgress,
    refreshChallenges: loadDailyChallenges,
    getDifficultyColor,
    getChallengeIcon,
    getChallengeTypeColor,
    completeSpeedChallenge,
    completeComboChallenge,
    completeSocialChallenge,
    completeExplorationChallenge
  };
}