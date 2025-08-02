import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

interface DuelInvite {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_topic: string;
  status: string;
  created_at: string;
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

interface GlobalDuelInviteContextType {
  currentInvite: DuelInvite | null;
  queueCount: number;
  isOnline: boolean;
  dismissCurrentInvite: () => void;
}

const GlobalDuelInviteContext = createContext<GlobalDuelInviteContextType>({
  currentInvite: null,
  queueCount: 0,
  isOnline: false,
  dismissCurrentInvite: () => {},
});

export const useGlobalDuelInvites = () => useContext(GlobalDuelInviteContext);

interface GlobalDuelInviteProviderProps {
  children: ReactNode;
}

export function GlobalDuelInviteProvider({ children }: GlobalDuelInviteProviderProps) {
  const { user } = useAuth();
  const [currentInvite, setCurrentInvite] = useState<DuelInvite | null>(null);
  const [inviteQueue, setInviteQueue] = useState<DuelInvite[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (currentInvite) {
      const timer = setTimeout(() => {
        console.log('🕒 Auto-dismissing invite after 30 seconds:', currentInvite.id);
        dismissCurrentInvite();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [currentInvite?.id]);

  const dismissCurrentInvite = () => {
    console.log('👋 Dismissing current invite:', currentInvite?.id);
    setCurrentInvite(null);
    
    if (inviteQueue.length > 0) {
      const nextInvite = inviteQueue[0];
      setInviteQueue(prev => prev.slice(1));
      setCurrentInvite(nextInvite);
      console.log('📋 Showing next invite from queue:', nextInvite.id);
    }
  };

  const handleNewInvite = async (payload: any) => {
    console.log('🎯 Duel invite received:', payload);
    
    try {
      const { data: inviteData, error } = await supabase
        .from('duel_invites')
        .select(`
          *,
          challenger:profiles!duel_invites_challenger_id_fkey (
            id,
            nickname,
            level,
            xp,
            avatars (
              name,
              image_url
            )
          )
        `)
        .eq('id', payload.new.id)
        .single();

      if (error) {
        console.error('❌ Error fetching invite data:', error);
        return;
      }

      if (!inviteData) {
        console.error('❌ No invite data found');
        return;
      }

      console.log('✅ Complete invite data:', inviteData);

      if (!currentInvite) {
        setCurrentInvite(inviteData);
        console.log('📱 Showing invite immediately:', inviteData.id);
      } else {
        setInviteQueue(prev => [...prev, inviteData]);
        console.log('📋 Added invite to queue. Queue size:', inviteQueue.length + 1);
        
        toast({
          title: t('duelInviteNotification.title'),
          description: t('duelInviteNotification.subtitle', { 
            challenger: inviteData.challenger?.nickname || 'Unknown' 
          }),
        });
      }
    } catch (error) {
      console.error('❌ Error handling new invite:', error);
    }
  };

  const handleInviteStatusUpdate = async (payload: any) => {
    console.log('📊 Invite status updated:', payload);
    
    try {
      const updatedInvite = payload.new;
      
      if (updatedInvite.status === 'accepted') {
        toast({
          title: "✅ Convite Aceito!",
          description: "Seu convite de duelo foi aceito! O duelo começou.",
        });
      } else if (updatedInvite.status === 'rejected') {
        toast({
          title: "❌ Convite Recusado",
          description: "Seu convite de duelo foi recusado.",
        });
      }
    } catch (error) {
      console.error('❌ Error handling invite status update:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      setCurrentInvite(null);
      setInviteQueue([]);
      setIsOnline(false);
      setUserProfileId(null);
      return;
    }

    let channel: any = null;

    const setupSubscription = async () => {
      try {
        console.log('👤 Fetching profile for user:', user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching profile:', error);
          return;
        }

        if (!profile) {
          console.error('❌ No profile found for user');
          return;
        }

        console.log('✅ Profile ID found:', profile.id);
        setUserProfileId(profile.id);

        channel = supabase
          .channel('global-duel-invites')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'duel_invites',
              filter: `challenged_id=eq.${profile.id}`,
            },
            handleNewInvite
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'duel_invites',
              filter: `challenger_id=eq.${profile.id}`,
            },
            handleInviteStatusUpdate
          )
          .subscribe((status) => {
            console.log('📱 Subscription status:', status);
            setIsOnline(status === 'SUBSCRIBED');
          });

        console.log('🔄 Duel invite subscription setup complete');
      } catch (error) {
        console.error('❌ Error setting up subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        console.log('🧹 Cleaning up duel invite subscription');
        supabase.removeChannel(channel);
        setIsOnline(false);
      }
    };
  }, [user]);

  const queueCount = inviteQueue.length;

  return (
    <GlobalDuelInviteContext.Provider 
      value={{ 
        currentInvite, 
        queueCount, 
        isOnline, 
        dismissCurrentInvite 
      }}
    >
      {children}
    </GlobalDuelInviteContext.Provider>
  );
}
