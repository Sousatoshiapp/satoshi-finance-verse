import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeContextType {
  points: number;
  isOnline: boolean;
  lastUpdate: Date | null;
}

const RealtimeContext = createContext<RealtimeContextType>({
  points: 0,
  isOnline: false,
  lastUpdate: null,
});

export const useRealtime = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setPoints(0);
      setIsOnline(false);
      return;
    }

    // Fetch initial points
    const fetchInitialData = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setPoints(profile.points || 0);
        }
      } catch (error) {
        console.error('Error fetching initial points:', error);
      }
    };

    fetchInitialData();

    // Set up realtime subscription for comprehensive updates
    const channel = supabase
      .channel('global-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Realtime points update:', payload);
          
          const newPoints = payload.new.points;
          if (typeof newPoints === 'number' && newPoints !== points) {
            setPoints(newPoints);
            setLastUpdate(new Date());
            
            // Invalidate all related queries for comprehensive updates
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['store-data'] });
            
            // Show visual feedback for large point changes
            if (Math.abs(newPoints - points) >= 100) {
              console.log(`💰 Large point change detected: ${points} → ${newPoints}`);
            }
          }
        }
      )
      .on('system', {}, (status) => {
        console.log('🌐 Realtime connection status:', status);
        setIsOnline(status === 'ONLINE');
      })
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        setIsOnline(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 Disconnecting realtime subscription');
      supabase.removeChannel(channel);
      setIsOnline(false);
    };
  }, [user, queryClient]);

  return (
    <RealtimeContext.Provider value={{ points, isOnline, lastUpdate }}>
      {children}
    </RealtimeContext.Provider>
  );
}