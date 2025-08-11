import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineUser {
  user_id: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
  available_for_duel?: boolean;
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
      // Usar a nova função do banco que gerencia heartbeat automaticamente
      const { error } = await supabase.rpc('update_user_heartbeat');
      
      if (error) {
        console.error('Error updating heartbeat:', error);
      }
    } catch (error) {
      console.error('Error in heartbeat update:', error);
    }
  }, [user]);

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

    // Heartbeat mais frequente para presença real (15s)
    const interval = setInterval(updateOnlineStatus, 15000);
    
    // Limpeza automática a cada 2 minutos usando nova função
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_inactive_presence');
      } catch (error) {
        console.error('Error in automatic cleanup:', error);
      }
    }, 120000);

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
        // Agora com nova política RLS que permite ver usuários disponíveis para duelo
        const { data, error } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            last_seen,
            available_for_duel,
            profiles!inner(nickname, profile_image_url)
          `)
          .eq('is_online', true)
          .eq('available_for_duel', true)
          .gte('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutos
        
        if (error) throw error;
        
        const formattedUsers = data?.map(item => ({
          user_id: item.user_id,
          username: item.profiles?.nickname || 'Anonymous',
          avatar_url: item.profiles?.profile_image_url || null,
          last_seen: item.last_seen,
          available_for_duel: item.available_for_duel,
        })) || [];
        
        console.log(`✅ Found ${formattedUsers.length} users available for duel`);
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
