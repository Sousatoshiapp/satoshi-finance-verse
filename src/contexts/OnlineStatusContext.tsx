import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineUser {
  user_id: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
}

interface OnlineStatusContextType {
  onlineUsers: OnlineUser[];
  isOnline: boolean;
  updateOnlineStatus: () => Promise<void>;
  markOffline: () => Promise<void>;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({
  onlineUsers: [],
  isOnline: false,
  updateOnlineStatus: async () => {},
  markOffline: async () => {},
});

export const useOnlineStatus = () => useContext(OnlineStatusContext);

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  const updateOnlineStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      let profileId = userProfileId;
      
      // Cache profile ID to avoid repeated queries
      if (!profileId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching profile for online status:', profileError);
          return;
        }
        
        profileId = profile.id;
        setUserProfileId(profileId);
      }

      // Primeiro tenta atualizar um registro existente
      const { error: updateError } = await supabase
        .from('user_presence')
        .update({
          last_seen: new Date().toISOString(),
          is_online: true,
        })
        .eq('user_id', profileId);

      // Se não houver erro no update, significa que o registro foi atualizado
      if (!updateError) {
        return;
      }

      // Se o update falhou (provavelmente porque não existe registro), tenta inserir
      const { error: insertError } = await supabase
        .from('user_presence')
        .insert({
          user_id: profileId,
          last_seen: new Date().toISOString(),
          is_online: true,
        });

      // Se o insert também falhar (porque outro processo criou o registro), 
      // tenta update novamente
      if (insertError && insertError.code === '23505') {
        const { error: secondUpdateError } = await supabase
          .from('user_presence')
          .update({
            last_seen: new Date().toISOString(),
            is_online: true,
          })
          .eq('user_id', profileId);
          
        if (secondUpdateError) throw secondUpdateError;
      } else if (insertError) {
        throw insertError;
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, [user, userProfileId]);

  const markOffline = useCallback(async () => {
    if (!user || !userProfileId) return;
    
    try {
      console.log('🔴 Marking user offline:', userProfileId);
      
      const { error } = await supabase.rpc('mark_user_offline', {
        target_user_id: userProfileId
      });
      
      if (error) {
        console.error('Error marking user offline:', error);
      }
    } catch (error) {
      console.error('Error in markOffline:', error);
    }
  }, [user, userProfileId]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleBeforeUnload = () => {
      console.log('⚠️ Browser closing, marking offline');
      markOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [markOffline]);

  useEffect(() => {
    if (!user) return;

    updateOnlineStatus();

    // Heartbeat mais frequente para presença real (30s)
    const interval = setInterval(updateOnlineStatus, 30000);
    
    // Limpeza automática a cada minuto
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_inactive_users');
      } catch (error) {
        console.error('Error in automatic cleanup:', error);
      }
    }, 60000);

    const channel = supabase
      .channel('online-users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
      }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    const fetchOnlineUsers = async () => {
      try {
        // Critério mais rigoroso: usuários com last_seen < 2 minutos
        const { data, error } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            last_seen,
            profiles!inner(nickname, profile_image_url)
          `)
          .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString())
          .eq('is_online', true);
        
        if (error) throw error;
        
        const formattedUsers = data?.map(item => ({
          user_id: item.user_id,
          username: item.profiles?.nickname || 'Anonymous',
          avatar_url: item.profiles?.profile_image_url || null,
          last_seen: item.last_seen,
        })) || [];
        
        console.log(`✅ Found ${formattedUsers.length} truly online users`);
        setOnlineUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    fetchOnlineUsers();

    return () => {
      console.log('🧹 Cleaning up OnlineStatus effect');
      clearInterval(interval);
      clearInterval(cleanupInterval);
      markOffline(); // Mark offline when component unmounts
      supabase.removeChannel(channel);
    };
  }, [user, updateOnlineStatus, markOffline]);

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers, isOnline, updateOnlineStatus, markOffline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}
