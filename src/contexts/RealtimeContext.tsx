import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

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

  const debouncedInvalidate = useCallback(
    debounce((userId: string) => {
      // Selective invalidation based on user context
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'], refetchType: 'active' });
    }, 300), // Reduced debounce time for faster updates
    [queryClient]
  );

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
          const newPoints = payload.new.points;
          if (typeof newPoints === 'number' && newPoints !== points) {
            setPoints(newPoints);
            setLastUpdate(new Date());
            
            debouncedInvalidate(user.id);
            
            // Show visual feedback for large point changes
            if (Math.abs(newPoints - points) >= 100) {
              setLastUpdate(new Date());
            }
          }
        }
      )
      .subscribe((status) => {
        setIsOnline(status === 'SUBSCRIBED');
      });

    return () => {
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
