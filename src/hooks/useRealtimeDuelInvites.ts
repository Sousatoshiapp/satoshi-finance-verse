import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface DuelInvite {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_topic: string;
  status: string;
  created_at: string;
  expires_at: string;
  challenger?: {
    id: string;
    nickname: string;
    level: number;
    xp: number;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
}

export function useRealtimeDuelInvites() {
  const { user } = useAuth();
  const [currentInvite, setCurrentInvite] = useState<DuelInvite | null>(null);
  const [inviteQueue, setInviteQueue] = useState<DuelInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const processNextInvite = useCallback(() => {
    if (inviteQueue.length > 0 && !currentInvite) {
      const nextInvite = inviteQueue[0];
      setCurrentInvite(nextInvite);
      setInviteQueue(prev => prev.slice(1));
    }
  }, [inviteQueue, currentInvite]);

  const dismissCurrentInvite = useCallback(() => {
    setCurrentInvite(null);
    setTimeout(processNextInvite, 500);
  }, [processNextInvite]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setCurrentInvite(null);
      setInviteQueue([]);
      return;
    }

    const fetchInitialInvites = async () => {
      try {
        const { data: invites, error } = await supabase
          .from('duel_invites')
          .select(`
            *,
            challenger:profiles!challenger_id(
              id,
              nickname,
              level,
              xp,
              user_avatars (
                avatars(name, image_url)
              )
            )
          `)
          .eq('challenged_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (invites && invites.length > 0) {
          setCurrentInvite(invites[0]);
          setInviteQueue(invites.slice(1));
        }
      } catch (error) {
        console.error('Error fetching initial invites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialInvites();

    const channel = supabase
      .channel(`duel-invites-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'duel_invites',
          filter: `challenged_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.status === 'pending') {
            const { data: fullInvite } = await supabase
              .from('duel_invites')
              .select(`
                *,
                challenger:profiles!challenger_id(
                  id,
                  nickname,
                  level,
                  xp,
                  user_avatars (
                    avatars(name, image_url)
                  )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (fullInvite) {
              if (!currentInvite) {
                setCurrentInvite(fullInvite);
              } else {
                setInviteQueue(prev => [...prev, fullInvite]);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentInvite, processNextInvite]);

  useEffect(() => {
    if (currentInvite) {
      const timer = setTimeout(() => {
        dismissCurrentInvite();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [currentInvite, dismissCurrentInvite]);

  return {
    currentInvite,
    queueCount: inviteQueue.length,
    isLoading,
    dismissCurrentInvite,
  };
}
