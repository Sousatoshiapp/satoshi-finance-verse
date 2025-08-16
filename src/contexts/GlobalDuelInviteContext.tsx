import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';
import { useNavigate } from 'react-router-dom';

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
  inviteQueue: DuelInvite[];
  dismissCurrentInvite: () => void;
  selectInviteFromQueue: (inviteId: string) => void;
  dismissAllInvites: () => void;
}

const GlobalDuelInviteContext = createContext<GlobalDuelInviteContextType>({
  currentInvite: null,
  queueCount: 0,
  isOnline: false,
  inviteQueue: [],
  dismissCurrentInvite: () => {},
  selectInviteFromQueue: () => {},
  dismissAllInvites: () => {},
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
  const navigate = useNavigate();

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

  const selectInviteFromQueue = (inviteId: string) => {
    const selectedInvite = inviteQueue.find(invite => invite.id === inviteId);
    if (selectedInvite) {
      // Move selected invite to current
      setCurrentInvite(selectedInvite);
      // Remove from queue
      setInviteQueue(prev => prev.filter(invite => invite.id !== inviteId));
      console.log('🎯 Selected invite from queue:', inviteId);
    }
  };

  const dismissAllInvites = () => {
    console.log('🧹 Dismissing all invites');
    setCurrentInvite(null);
    setInviteQueue([]);
  };

  const handleNewInvite = async (payload: any) => {
    console.log('🎯 Duel invite received (notification only):', payload);
    
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
            user_avatars (
              avatars (
                name,
                image_url
              )
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
      } else {
        setInviteQueue(prev => [...prev, inviteData]);
      }
    } catch (error) {
      console.error('❌ Error handling new invite:', error);
    }
  };

  const handleInviteStatusUpdate = async (payload: any) => {
    console.log('📊 Invite status updated:', payload);
    
    try {
      const updatedInvite = payload.new;
      const profileId = userProfileId;
      
      if (updatedInvite.status === 'accepted') {
          console.log('✅ Convite aceito, buscando duelo criado...', updatedInvite.id);
          console.log('🔍 Challenger ID:', updatedInvite.challenger_id);
          console.log('🔍 Challenged ID:', updatedInvite.challenged_id);
          
          // Aguardar um pouco para garantir que o duelo foi criado
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Buscar por duelo criado na tabela casino_duels
          const { data: duel, error: duelError } = await supabase
            .from('casino_duels')
            .select('id, status, player1_id, player2_id')
            .eq('player1_id', updatedInvite.challenger_id)
            .eq('player2_id', updatedInvite.challenged_id)
            .eq('status', 'waiting')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (duelError) {
            console.error('❌ Erro ao buscar duelo:', duelError);
          }

          if (duel) {
            console.log('🎮 Casino duelo encontrado:', duel);
            toast({
              title: "🎉 Convite Aceito!",
              description: "Seu convite foi aceito! Entrando no duelo...",
            });

            setTimeout(() => {
              console.log('🚀 Redirecionando para duelo:', duel.id);
              window.location.href = `/duel/${duel.id}`;
            }, 1500);
          } else {
            console.log('⏳ Casino duelo ainda não criado, aguardando...');
            // Tentar buscar novamente após mais tempo
            setTimeout(async () => {
              const { data: retryDuel } = await supabase
                .from('casino_duels')
                .select('id')
                .eq('player1_id', updatedInvite.challenger_id)
                .eq('player2_id', updatedInvite.challenged_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (retryDuel) {
                console.log('🎮 Duelo encontrado na segunda tentativa:', retryDuel.id);
                window.location.href = `/duel/${retryDuel.id}`;
              } else {
                console.log('❌ Duelo ainda não foi criado após segunda tentativa');
              }
            }, 3000);
          }
      } else if (updatedInvite.status === 'rejected') {
        console.log('❌ Convite recusado:', updatedInvite.id);
        
        toast({
          title: "❌ Convite Recusado",
          description: "Seu convite de duelo foi recusado.",
          variant: "destructive"
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

    let channel: any[] = [];

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

        // Subscription para novos convites recebidos
        const inviteChannel = supabase
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
            console.log('📱 Invite subscription status:', status);
            setIsOnline(status === 'SUBSCRIBED');
          });

        // Subscription para criação de casino duels (quando challenger)
        const duelChannel = supabase
          .channel(`casino-duel-status-${user.id}`)
           .on(
             'postgres_changes',
             {
               event: 'INSERT',
               schema: 'public',
               table: 'casino_duels',
               filter: `player1_id=eq.${profile.id}`
             },
             async (payload) => {
               console.log('🎮 Novo casino duelo detectado para challenger (player1):', payload.new);
               console.log('🆔 Duelo ID:', payload.new.id);
               
               toast({
                 title: "🎯 Duelo iniciado!",
                 description: "Entrando no duelo...",
                 duration: 2000
               });
               
               // Redirect to casino duel screen
               setTimeout(() => {
                 console.log('🚀 Navegando para duelo como challenger:', payload.new.id);
                 navigate(`/duel/${payload.new.id}`);
               }, 1000);
             }
           )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'casino_duels',
              filter: `player1_id=eq.${profile.id}`
            },
             async (payload) => {
               if (payload.new.status === 'active') {
                 console.log('🎮 Casino duelo ativado para challenger (player1):', payload.new);
                 console.log('🆔 Duelo ID ativo:', payload.new.id);
                 
                 toast({
                   title: "🎯 Duelo ativo!",
                   description: "Entrando no duelo...",
                   duration: 2000
                 });
                 
                 setTimeout(() => {
                   console.log('🚀 Navegando para duelo ativo como challenger:', payload.new.id);
                   navigate(`/duel/${payload.new.id}`);
                 }, 1000);
               }
             }
          )
          .subscribe();

        channel = [inviteChannel, duelChannel];

        console.log('🔄 Duel invite subscription setup complete');
      } catch (error) {
        console.error('❌ Error setting up subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (channel && channel.length > 0) {
        console.log('🧹 Cleaning up duel invite subscriptions');
        channel.forEach(ch => supabase.removeChannel(ch));
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
        inviteQueue,
        dismissCurrentInvite,
        selectInviteFromQueue,
        dismissAllInvites
      }}
    >
      {children}
    </GlobalDuelInviteContext.Provider>
  );
}
