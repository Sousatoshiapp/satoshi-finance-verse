import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  tier: 'free' | 'pro' | 'elite';
  isActive: boolean;
  expiresAt?: string;
  dailyDuelsUsed: number;
  dailyDuelsLimit: number;
  xpMultiplier: number;
  monthlyBeetz: number;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'free',
    isActive: false,
    dailyDuelsUsed: 0,
    dailyDuelsLimit: 10,
    xpMultiplier: 1,
    monthlyBeetz: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at, daily_duels_used, daily_duels_reset_date')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const tier = profile.subscription_tier || 'free';
        const isActive = tier !== 'free' && (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
        
        // Reset daily duels if it's a new day
        const today = new Date().toISOString().split('T')[0];
        const resetDate = profile.daily_duels_reset_date;
        const dailyDuelsUsed = resetDate === today ? (profile.daily_duels_used || 0) : 0;

        // Update reset date if needed
        if (resetDate !== today) {
          await supabase
            .from('profiles')
            .update({ 
              daily_duels_used: 0, 
              daily_duels_reset_date: today 
            })
            .eq('user_id', user.id);
        }

        setSubscription({
          tier,
          isActive,
          expiresAt: profile.subscription_expires_at,
          dailyDuelsUsed,
          dailyDuelsLimit: tier === 'free' ? 10 : 999,
          xpMultiplier: tier === 'elite' ? 3 : tier === 'pro' ? 2 : 1,
          monthlyBeetz: tier === 'elite' ? 100 : tier === 'pro' ? 50 : 0
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateDuel = () => {
    return subscription.tier !== 'free' || subscription.dailyDuelsUsed < subscription.dailyDuelsLimit;
  };

  const incrementDuelCount = async () => {
    if (subscription.tier === 'free') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('increment_duel_count', { profile_id: user.id });
        setSubscription(prev => ({
          ...prev,
          dailyDuelsUsed: prev.dailyDuelsUsed + 1
        }));
      }
    }
  };

  const refreshSubscription = () => {
    loadSubscriptionData();
  };

  return {
    subscription,
    loading,
    canCreateDuel,
    incrementDuelCount,
    refreshSubscription
  };
}