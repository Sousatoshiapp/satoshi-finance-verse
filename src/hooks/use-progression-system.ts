import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgressionResult {
  new_xp: number;
  new_level: number;
  level_up: boolean;
  rewards: any;
}

export function useProgressionSystem() {
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [levelTiers, setLevelTiers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
    loadLevelTiers();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadLevelTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('level_tiers')
        .select('*')
        .order('level');

      if (error) throw error;
      setLevelTiers(data || []);
    } catch (error) {
      console.error('Error loading level tiers:', error);
    }
  };

  const awardXP = useCallback(async (amount: number, activityType: string = 'general') => {
    if (!currentProfile) return null;

    try {
      const { data, error } = await supabase.rpc('award_xp', {
        profile_id: currentProfile.id,
        xp_amount: amount,
        activity_type: activityType
      });

      if (error) throw error;

      const result = data?.[0] as ProgressionResult;
      
      if (result?.level_up) {
        toast({
          title: "🎉 Level Up!",
          description: `Parabéns! Você alcançou o nível ${result.new_level}!`,
          duration: 5000,
        });

        // Show rewards if any
        if (result.rewards?.beetz) {
          toast({
            title: "💰 Recompensa!",
            description: `Você ganhou ${result.rewards.beetz} Beetz!`,
            duration: 3000,
          });
        }
      } else {
        toast({
          title: `+${amount} XP`,
          description: `Atividade: ${activityType}`,
          duration: 2000,
        });
      }

      // Reload profile to get updated data
      await loadUserProfile();
      
      return result;
    } catch (error) {
      console.error('Error awarding XP:', error);
      return null;
    }
  }, [currentProfile, toast]);

  const updateStreak = useCallback(async () => {
    if (!currentProfile) return null;

    try {
      const { data, error } = await supabase.rpc('update_user_streak', {
        profile_id: currentProfile.id
      });

      if (error) throw error;

      const newStreak = data;
      
      if (newStreak > (currentProfile.streak || 0)) {
        toast({
          title: "🔥 Streak Mantido!",
          description: `${newStreak} dias consecutivos!`,
          duration: 3000,
        });
      }

      await loadUserProfile();
      return newStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }, [currentProfile, toast]);

  const getLevelInfo = useCallback((level: number) => {
    return levelTiers.find(tier => tier.level === level) || levelTiers[0];
  }, [levelTiers]);

  const getNextLevelXP = useCallback((currentLevel: number) => {
    const nextLevel = levelTiers.find(tier => tier.level === currentLevel + 1);
    return nextLevel?.xp_required || 0;
  }, [levelTiers]);

  const getProgressToNextLevel = useCallback(() => {
    if (!currentProfile || !levelTiers.length) return 0;
    
    const currentLevelInfo = getLevelInfo(currentProfile.level);
    const nextLevelXP = getNextLevelXP(currentProfile.level);
    
    if (nextLevelXP === 0) return 100; // Max level
    
    const currentLevelXP = currentLevelInfo?.xp_required || 0;
    const xpForThisLevel = nextLevelXP - currentLevelXP;
    const xpEarnedForThisLevel = (currentProfile.xp || 0) - currentLevelXP;
    
    return Math.max(0, Math.min(100, (xpEarnedForThisLevel / xpForThisLevel) * 100));
  }, [currentProfile, levelTiers, getLevelInfo, getNextLevelXP]);

  return {
    currentProfile,
    levelTiers,
    awardXP,
    updateStreak,
    getLevelInfo,
    getNextLevelXP,
    getProgressToNextLevel,
    refreshProfile: loadUserProfile
  };
}