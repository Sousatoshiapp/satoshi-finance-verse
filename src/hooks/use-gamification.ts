import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  requirement_data: any;
  reward_data: any;
  rarity: string;
  badge_icon?: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress_data: any;
  achievements: Achievement;
}

interface LearningStreak {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_activity: string;
  streak_type: string;
  module_id?: string;
}

interface UserBadge {
  id: string;
  badge_name: string;
  badge_type: string;
  badge_description?: string;
  earned_at: string;
  badge_data?: any;
}

export function useGamification() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [streaks, setStreaks] = useState<LearningStreak[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Carregar achievements do usuário
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      // Carregar streaks
      const { data: userStreaks } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', profile.id)
        .order('current_streak', { ascending: false });

      // Carregar badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      setAchievements(userAchievements || []);
      setStreaks(userStreaks || []);
      setBadges(userBadges || []);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStreak = () => {
    const globalStreak = streaks.find(s => !s.module_id);
    return globalStreak?.current_streak || 0;
  };

  const getLongestStreak = () => {
    return Math.max(...streaks.map(s => s.longest_streak), 0);
  };

  const updateStreak = async (moduleId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('update_learning_streak', {
        p_user_id: profile.id,
        p_module_id: moduleId || null
      });

      if (error) throw error;

      // Recarregar dados após atualização
      await loadGamificationData();

      return data;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  };

  const getTotalBadges = () => badges.length;
  
  const getBadgesByType = (type: string) => {
    return badges.filter(b => b.badge_type === type);
  };

  const getRecentAchievements = (limit = 5) => {
    return achievements.slice(0, limit);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return {
    achievements,
    streaks,
    badges,
    loading,
    getCurrentStreak,
    getLongestStreak,
    updateStreak,
    getTotalBadges,
    getBadgesByType,
    getRecentAchievements,
    getRarityColor,
    loadGamificationData
  };
}