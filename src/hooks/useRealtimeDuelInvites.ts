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

    const setupRealtimeInvites = async () => {
      try {
        // Buscar perfil do usuário primeiro
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!userProfile) {
          console.error('User profile not found');
          setIsLoading(false);
          return;
        }

        // Buscar convites iniciais
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
          .eq('challenged_id', userProfile.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (invites && invites.length > 0) {
          setCurrentInvite(invites[0]);
          setInviteQueue(invites.slice(1));
        }

        // Configurar canal real-time
        const channel = supabase
          .channel(`duel-invites-${userProfile.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'duel_invites',
              filter: `challenged_id=eq.${userProfile.id}`,
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

        return channel;
      } catch (error) {
        console.error('Error setting up realtime invites:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    };

    let cleanup: (() => void) | null = null;
    
    setupRealtimeInvites().then((channel) => {
      if (channel) {
        cleanup = () => supabase.removeChannel(channel);
      }
    });

    return () => {
      if (cleanup) cleanup();
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
