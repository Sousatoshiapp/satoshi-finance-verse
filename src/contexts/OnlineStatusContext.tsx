import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({
  onlineUsers: [],
  isOnline: false,
  updateOnlineStatus: async () => {},
});

export const useOnlineStatus = () => useContext(OnlineStatusContext);

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const updateOnlineStatus = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          last_seen: new Date().toISOString(),
          is_online: true,
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    updateOnlineStatus();

    const interval = setInterval(updateOnlineStatus, 30000);

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
        const { data, error } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            last_seen,
            profiles!inner(username, avatar_url)
          `)
          .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .eq('is_online', true);
        
        if (error) throw error;
        
        const formattedUsers = data?.map(item => ({
          user_id: item.user_id,
          username: item.profiles.username,
          avatar_url: item.profiles.avatar_url,
          last_seen: item.last_seen,
        })) || [];
        
        setOnlineUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    fetchOnlineUsers();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers, isOnline, updateOnlineStatus }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}
