import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  nickname: string;
  level: number;
  xp: number;
  points: number;
  streak: number;
  avatar_id?: string;
  profile_image_url?: string;
  subscription_tier: 'free' | 'pro' | 'elite';
  created_at: string;
  updated_at: string;
  kyc_status?: 'pending' | 'approved' | 'rejected';
  persona_inquiry_id?: string;
  kyc_completed_at?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    loadProfile
  };
}
