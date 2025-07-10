import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimePoints() {
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch initial points
    const fetchInitialPoints = async () => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPoints();

    // Set up realtime subscription for points updates
    const channel = supabase
      .channel('profile-points-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Points updated:', payload);
          const newPoints = payload.new.points;
          if (typeof newPoints === 'number') {
            setPoints(newPoints);
            
            // Invalidate dashboard data to refresh all components
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return { points, isLoading };
}