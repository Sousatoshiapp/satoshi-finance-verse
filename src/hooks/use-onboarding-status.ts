// TEMPORARILY DISABLED - ONBOARDING REMOVED
/*
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useOnboardingStatus() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First get the user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        setIsOnboardingCompleted(false);
        setLoading(false);
        return;
      }

      // Check if onboarding profile exists
      const { data: onboardingProfile } = await supabase
        .from('user_onboarding_profiles')
        .select('completed_at')
        .eq('user_id', userProfile.id)
        .single();

      setIsOnboardingCompleted(!!onboardingProfile?.completed_at);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isOnboardingCompleted,
    loading,
    checkOnboardingStatus
  };
}
*/