import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PointsContextType {
  points: number;
  lastUpdate: Date | null;
  refreshPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType>({
  points: 0,
  lastUpdate: null,
  refreshPoints: async () => {},
});

export const usePoints = () => useContext(PointsContext);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshPoints = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data && typeof data.points === 'number') {
        setPoints(data.points);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    refreshPoints();
    
    const channel = supabase
      .channel('points-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newPoints = payload.new.points;
        if (typeof newPoints === 'number' && newPoints !== points) {
          setPoints(newPoints);
          setLastUpdate(new Date());
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, points, refreshPoints]);

  return (
    <PointsContext.Provider value={{ points, lastUpdate, refreshPoints }}>
      {children}
    </PointsContext.Provider>
  );
}
