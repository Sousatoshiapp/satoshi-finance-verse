import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FOMOEvent {
  id: string;
  type: 'flash_sale' | 'limited_challenge' | 'exclusive_item' | 'secret_achievement';
  title: string;
  description: string;
  expires_at: string;
  remaining_count?: number;
  max_count?: number;
  reward_btz: number;
  reward_items?: string[];
  difficulty?: number;
  is_active: boolean;
}

interface DailyShopItem {
  id: string;
  name: string;
  description: string;
  price_btz: number;
  original_price?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'avatar' | 'power_up' | 'cosmetic' | 'exclusive';
  expires_at: string;
  remaining_stock?: number;
  is_flash_sale: boolean;
}

export function useFOMOFeatures() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fomoEvents, setFomoEvents] = useState<FOMOEvent[]>([]);
  const [dailyShop, setDailyShop] = useState<DailyShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashSaleActive, setFlashSaleActive] = useState(false);

  // Load FOMO events and daily shop
  const loadFOMOData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load active FOMO events
      const { data: events, error: eventsError } = await supabase
        .from('fomo_events')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (eventsError) throw eventsError;

      // Load daily shop items
      const { data: shop, error: shopError } = await supabase
        .from('daily_shop_items')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('rarity', { ascending: false });

      if (shopError) throw shopError;

      setFomoEvents(events || []);
      setDailyShop(shop || []);

      // Check for flash sales
      const activeFlashSale = shop?.some(item => item.is_flash_sale);
      setFlashSaleActive(!!activeFlashSale);

    } catch (error) {
      console.error('Error loading FOMO data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Generate random flash sale
  const triggerFlashSale = useCallback(async () => {
    if (!user || flashSaleActive) return;

    try {
      // Create 15-minute flash sale
      const flashSaleEnd = new Date();
      flashSaleEnd.setMinutes(flashSaleEnd.getMinutes() + 15);

      const { error } = await supabase
        .from('daily_shop_items')
        .insert({
          name: 'Flash Sale Power-up Pack',
          description: '3x XP Boost + 2x BTZ Multiplier + Streak Protection',
          price_btz: 50, // 75% off
          original_price: 200,
          rarity: 'epic',
          category: 'power_up',
          expires_at: flashSaleEnd.toISOString(),
          remaining_stock: 10,
          is_flash_sale: true
        });

      if (error) throw error;

      setFlashSaleActive(true);
      
      // Show urgent notification
      toast({
        title: "⚡ FLASH SALE ATIVO!",
        description: "Power-up Pack por apenas 50 BTZ! Termina em 15 minutos!",
        duration: 10000,
      });

      // Reload data
      loadFOMOData();

    } catch (error) {
      console.error('Error creating flash sale:', error);
    }
  }, [user, flashSaleActive, toast, loadFOMOData]);

  // Create limited time challenge (6h window)
  const createLimitedChallenge = useCallback(async () => {
    if (!user) return;

    try {
      const challengeEnd = new Date();
      challengeEnd.setHours(challengeEnd.getHours() + 6);

      const challenges = [
        {
          title: "🔥 BREAKING: Speed Challenge",
          description: "Responda 20 questões em menos de 10 minutos!",
          reward_btz: 100,
          difficulty: 8
        },
        {
          title: "⚡ URGENT: Streak Master",
          description: "Mantenha uma sequência de 15 acertos consecutivos!",
          reward_btz: 150,
          difficulty: 9
        },
        {
          title: "💎 EXCLUSIVE: Perfect Score",
          description: "Consiga 100% de acerto em um quiz de 10 questões!",
          reward_btz: 200,
          difficulty: 10
        }
      ];

      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

      const { error } = await supabase
        .from('fomo_events')
        .insert({
          type: 'limited_challenge',
          title: randomChallenge.title,
          description: randomChallenge.description,
          expires_at: challengeEnd.toISOString(),
          reward_btz: randomChallenge.reward_btz,
          difficulty: randomChallenge.difficulty,
          is_active: true
        });

      if (error) throw error;

      // Show breaking news style notification
      toast({
        title: randomChallenge.title,
        description: `${randomChallenge.description} Termina em 6 horas!`,
        duration: 15000,
      });

      loadFOMOData();

    } catch (error) {
      console.error('Error creating limited challenge:', error);
    }
  }, [user, toast, loadFOMOData]);

  // Discover secret achievement
  const triggerSecretAchievement = useCallback(async (trigger: string) => {
    if (!user) return;

    try {
      // Check if this secret achievement was already discovered
      const { data: existing } = await supabase
        .from('user_secret_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('trigger', trigger)
        .single();

      if (existing) return; // Already discovered

      const secretAchievements = {
        'midnight_scholar': {
          title: '🌙 Midnight Scholar',
          description: 'Estudou depois da meia-noite',
          reward_btz: 50
        },
        'speed_demon': {
          title: '⚡ Speed Demon', 
          description: 'Respondeu 5 questões em menos de 30 segundos',
          reward_btz: 75
        },
        'perfectionist': {
          title: '💎 Perfectionist',
          description: 'Conseguiu 100% em 5 quizzes consecutivos',
          reward_btz: 100
        },
        'early_bird': {
          title: '🐦 Early Bird',
          description: 'Estudou antes das 6h da manhã',
          reward_btz: 60
        },
        'combo_master': {
          title: '🔥 Combo Master',
          description: 'Conseguiu 25 acertos consecutivos',
          reward_btz: 120
        }
      };

      const achievement = secretAchievements[trigger as keyof typeof secretAchievements];
      if (!achievement) return;

      // Save secret achievement
      const { error } = await supabase
        .from('user_secret_achievements')
        .insert({
          user_id: user.id,
          trigger,
          title: achievement.title,
          description: achievement.description,
          reward_btz: achievement.reward_btz,
          discovered_at: new Date().toISOString()
        });

      if (error) throw error;

      // Award BTZ
      await supabase.rpc('award_btz', {
        user_id: user.id,
        amount: achievement.reward_btz,
        source: 'secret_achievement'
      });

      // Epic secret achievement notification
      toast({
        title: "🎉 SECRET ACHIEVEMENT UNLOCKED!",
        description: `${achievement.title}: ${achievement.description} (+${achievement.reward_btz} BTZ)`,
        duration: 10000,
      });

    } catch (error) {
      console.error('Error triggering secret achievement:', error);
    }
  }, [user, toast]);

  // Check for time-based triggers
  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const hour = now.getHours();

    // Midnight scholar (00:00 - 06:00)
    if (hour >= 0 && hour < 6) {
      triggerSecretAchievement('midnight_scholar');
    }

    // Early bird (05:00 - 07:00)
    if (hour >= 5 && hour < 7) {
      triggerSecretAchievement('early_bird');
    }

    // Random flash sale trigger (10% chance every 30 minutes)
    const flashSaleTimer = setInterval(() => {
      if (Math.random() < 0.1 && !flashSaleActive) {
        triggerFlashSale();
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Random limited challenge (15% chance every 2 hours)
    const challengeTimer = setInterval(() => {
      if (Math.random() < 0.15) {
        createLimitedChallenge();
      }
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => {
      clearInterval(flashSaleTimer);
      clearInterval(challengeTimer);
    };
  }, [user, flashSaleActive, triggerFlashSale, triggerSecretAchievement, createLimitedChallenge]);

  // Load data on mount
  useEffect(() => {
    loadFOMOData();
  }, [loadFOMOData]);

  // Real-time timer updates
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Filter expired events
      setFomoEvents(prev => prev.filter(event => new Date(event.expires_at) > now));
      setDailyShop(prev => prev.filter(item => new Date(item.expires_at) > now));
      
      // Check if flash sale expired
      setFlashSaleActive(prev => {
        const hasActiveFlashSale = dailyShop.some(item => 
          item.is_flash_sale && new Date(item.expires_at) > now
        );
        return hasActiveFlashSale;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dailyShop]);

  const getTimeRemaining = useCallback((expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, total: diff };
  }, []);

  return {
    fomoEvents,
    dailyShop,
    loading,
    flashSaleActive,
    triggerSecretAchievement,
    createLimitedChallenge,
    triggerFlashSale,
    getTimeRemaining,
    loadFOMOData
  };
}