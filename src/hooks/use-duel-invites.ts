import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';

export interface DuelInvite {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_topic: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
  challenger_profile?: {
    nickname: string;
    avatar_url?: string;
  };
}

export function useDuelInvites() {
  const [invites, setInvites] = useState<DuelInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();

  // Load received invites
  const loadInvites = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('duel_invites')
        .select(`
          *,
          challenger_profile:profiles!challenger_id (
            nickname,
            avatar_url:profile_image_url
          )
        `)
        .eq('challenged_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvites((data as any[])?.map(invite => ({
        ...invite,
        challenger_profile: invite.challenger_profile?.[0]
      })) || []);
    } catch (error) {
      console.error('Error loading invites:', error);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time invite updates
  useEffect(() => {
    if (!profile?.id) return;

    const subscription = supabase
      .channel('duel_invites_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duel_invites',
          filter: `challenged_id=eq.${profile.id}`
        },
        () => {
          loadInvites();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id]);

  // Load invites on mount
  useEffect(() => {
    if (profile?.id) {
      loadInvites();
    }
  }, [profile?.id]);

  return {
    invites,
    loading,
    loadInvites
  };
}