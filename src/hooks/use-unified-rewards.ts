import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBTZAnalytics } from "./use-btz-analytics";
import { useAdvancedQuizAudio } from "./use-advanced-quiz-audio";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  requirement_data: any;
  reward_data: any;
  rarity: string;
  badge_icon?: string;
  unlocked: boolean;
  progress: number;
}

interface UnifiedRewardSystem {
  currentBTZ: number;
  earnBTZ: (amount: number, source: string) => Promise<void>;
  
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  awardXP: (amount: number, source: string) => Promise<void>;
  
  currentStreak: number;
  longestStreak: number;
  updateStreak: (correct: boolean) => Promise<void>;
  
  achievements: Achievement[];
  checkAchievements: () => Promise<void>;
  
  showRewardAnimation: (type: 'btz' | 'xp' | 'achievement', amount: number) => void;
  
  isLoaded: boolean;
  
  currentMultiplier: number;
  getStreakMultiplier: (streak: number) => number;
  
  hasStreakProtection: boolean;
  useStreakProtection: () => Promise<boolean>;
}

export function useUnifiedRewards(): UnifiedRewardSystem {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkDailyLimit, logBTZTransaction } = useBTZAnalytics();
  const { playCashRegisterSound, playStreakSound } = useAdvancedQuizAudio();
  
  const [state, setState] = useState({
    currentBTZ: 0,
    currentXP: 0,
    currentLevel: 1,
    nextLevelXP: 100,
    currentStreak: 0,
    longestStreak: 0,
    currentMultiplier: 1,
    achievements: [] as Achievement[],
    isLoaded: false,
    hasStreakProtection: false
  });

  const getStreakMultiplier = useCallback((streak: number): number => {
    if (streak >= 30) return 3.0;
    if (streak >= 14) return 2.0;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  }, []);

  useEffect(() => {
    const loadUnifiedState = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select(`
              *,
              achievements (*)
            `)
            .eq('user_id', profile.id);

          const { data: streakProtection } = await supabase
            .from('user_advanced_powerups')
            .select(`
              *,
              advanced_powerups!inner (*)
            `)
            .eq('user_id', profile.id)
            .eq('advanced_powerups.category', 'streak_protection')
            .gt('quantity', 0)
            .limit(1);

          setState(prev => ({
            ...prev,
            currentBTZ: profile.points || 0,
            currentXP: profile.xp || 0,
            currentLevel: profile.level || 1,
            currentStreak: profile.streak || 0,
            longestStreak: profile.streak || 0,
            currentMultiplier: getStreakMultiplier(profile.streak || 0),
            achievements: userAchievements?.map(ua => ({
              ...ua.achievements,
              unlocked: true,
              progress: 100
            })) || [],
            hasStreakProtection: (streakProtection?.length || 0) > 0,
            isLoaded: true
          }));
        }
      } catch (error) {
        console.error('Error loading unified rewards state:', error);
        setState(prev => ({ ...prev, isLoaded: true }));
      }
    };

    loadUnifiedState();
  }, [user, getStreakMultiplier]);

  const earnBTZ = useCallback(async (amount: number, source: string) => {
    if (!user || !state.isLoaded) return;

    const canEarn = await checkDailyLimit(source, amount);
    if (!canEarn) {
      toast({
        title: "⚠️ Limite Diário Atingido",
        description: "Você já atingiu o limite de BTZ por dia",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const newTotal = profile.points + amount;
        
        const { error } = await supabase
          .from('profiles')
          .update({ points: newTotal })
          .eq('user_id', user.id);

        if (!error) {
          setState(prev => ({ ...prev, currentBTZ: newTotal }));
          await logBTZTransaction(source as any, amount, { streak: state.currentStreak });
          playCashRegisterSound();
          
          toast({
            title: `+${amount} BTZ`,
            description: `Fonte: ${source}`,
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error('Error earning BTZ:', error);
    }
  }, [user, state.isLoaded, state.currentStreak, checkDailyLimit, logBTZTransaction, playCashRegisterSound, toast]);

  const awardXP = useCallback(async (amount: number, source: string) => {
    if (!user || !state.isLoaded) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data, error } = await supabase.rpc('award_xp', {
          profile_id: profile.id,
          xp_amount: amount,
          activity_type: source
        });

        if (!error && data?.[0]) {
          const result = data[0];
          setState(prev => ({
            ...prev,
            currentXP: result.new_xp,
            currentLevel: result.new_level,
            nextLevelXP: prev.nextLevelXP
          }));

          if (result.level_up) {
            toast({
              title: "🎉 Level Up!",
              description: `Parabéns! Você alcançou o nível ${result.new_level}!`,
              duration: 5000,
            });
          } else {
            toast({
              title: `+${amount} XP`,
              description: `Atividade: ${source}`,
              duration: 2000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [user, state.isLoaded, toast]);

  const updateStreak = useCallback(async (correct: boolean) => {
    if (!user || !state.isLoaded) return;

    try {
      let newStreak = correct ? state.currentStreak + 1 : 0;
      let newLongestStreak = Math.max(state.longestStreak, newStreak);
      
      if (!correct && state.hasStreakProtection && state.currentStreak > 0) {
        const protectionUsed = await useStreakProtection();
        if (protectionUsed) {
          newStreak = state.currentStreak;
          toast({
            title: "🛡️ Streak Protegido!",
            description: "Sua proteção de streak foi ativada!",
            duration: 3000,
          });
        }
      }

      const newMultiplier = getStreakMultiplier(newStreak);

      const { error } = await supabase
        .from('profiles')
        .update({
          streak: newStreak,
          longest_streak: newLongestStreak,
          current_streak_multiplier: newMultiplier
        })
        .eq('user_id', user.id);

      if (!error) {
        setState(prev => ({
          ...prev,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          currentMultiplier: newMultiplier
        }));

        if (correct && newStreak > state.currentStreak) {
          if (playStreakSound) {
            playStreakSound(newStreak);
          }
          toast({
            title: `🔥 Streak de ${newStreak}!`,
            description: `Multiplicador: ${newMultiplier}x`,
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user, state.isLoaded, state.currentStreak, state.longestStreak, state.hasStreakProtection, getStreakMultiplier, playStreakSound, toast]);

  const useStreakProtection = useCallback(async (): Promise<boolean> => {
    if (!user || !state.hasStreakProtection) return false;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: protectionData } = await supabase
          .from('user_advanced_powerups')
          .select(`
            *,
            advanced_powerups!inner (*)
          `)
          .eq('user_id', profile.id)
          .eq('advanced_powerups.category', 'streak_protection')
          .gt('quantity', 0)
          .limit(1);

        const protection = protectionData?.[0];

        if (protection && protection.quantity > 0) {
          const { error } = await supabase
            .from('user_advanced_powerups')
            .update({ quantity: protection.quantity - 1 })
            .eq('id', protection.id);

          if (!error) {
            setState(prev => ({
              ...prev,
              hasStreakProtection: protection.quantity > 1
            }));
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error using streak protection:', error);
    }
    
    return false;
  }, [user, state.hasStreakProtection]);

  const checkAchievements = useCallback(async () => {
    if (!user || !state.isLoaded) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: newAchievements } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (*)
          `)
          .eq('user_id', profile.id)
          .order('earned_at', { ascending: false });

        if (newAchievements) {
          setState(prev => ({
            ...prev,
            achievements: newAchievements.map(ua => ({
              ...ua.achievements,
              unlocked: true,
              progress: 100
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user, state.isLoaded]);

  const showRewardAnimation = useCallback((type: 'btz' | 'xp' | 'achievement', amount: number) => {
    const icons = { btz: '💰', xp: '⭐', achievement: '🏆' };
    toast({
      title: `${icons[type]} +${amount}`,
      description: `${type.toUpperCase()} ganho!`,
      duration: 2000,
    });
  }, [toast]);

  return {
    currentBTZ: state.currentBTZ,
    earnBTZ,
    currentXP: state.currentXP,
    currentLevel: state.currentLevel,
    nextLevelXP: state.nextLevelXP,
    awardXP,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    updateStreak,
    achievements: state.achievements,
    checkAchievements,
    showRewardAnimation,
    isLoaded: state.isLoaded,
    currentMultiplier: state.currentMultiplier,
    getStreakMultiplier,
    hasStreakProtection: state.hasStreakProtection,
    useStreakProtection
  };
}
