import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';

export interface MatchmakingPreferences {
  preferredTopics: string[];
  allowBots: boolean;
  skillLevelRange: 'similar' | 'any' | 'challenging';
  autoAcceptFromFriends: boolean;
  maxConcurrentInvites: number;
  availabilityStatus: 'available' | 'busy' | 'invisible';
}

const defaultPreferences: MatchmakingPreferences = {
  preferredTopics: ['financas', 'investimentos'],
  allowBots: true,
  skillLevelRange: 'similar',
  autoAcceptFromFriends: false,
  maxConcurrentInvites: 3,
  availabilityStatus: 'available'
};

export function useMatchmakingPreferences() {
  const [preferences, setPreferences] = useState<MatchmakingPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.id) {
      loadPreferences();
    }
  }, [profile?.id]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_matchmaking_preferences' as any)
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          preferredTopics: (data as any).preferred_topics || defaultPreferences.preferredTopics,
          allowBots: (data as any).allow_bots ?? defaultPreferences.allowBots,
          skillLevelRange: (data as any).skill_level_range || defaultPreferences.skillLevelRange,
          autoAcceptFromFriends: (data as any).auto_accept_from_friends ?? defaultPreferences.autoAcceptFromFriends,
          maxConcurrentInvites: (data as any).max_concurrent_invites || defaultPreferences.maxConcurrentInvites,
          availabilityStatus: (data as any).availability_status || defaultPreferences.availabilityStatus
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<MatchmakingPreferences>) => {
    if (!profile?.id) return false;

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('user_matchmaking_preferences' as any)
        .upsert({
          user_id: profile.id,
          preferred_topics: updatedPreferences.preferredTopics,
          allow_bots: updatedPreferences.allowBots,
          skill_level_range: updatedPreferences.skillLevelRange,
          auto_accept_from_friends: updatedPreferences.autoAcceptFromFriends,
          max_concurrent_invites: updatedPreferences.maxConcurrentInvites,
          availability_status: updatedPreferences.availabilityStatus,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences
  };
}