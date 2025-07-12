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
      setPoints(0);
      return;
    }

    // Fetch initial points
    const fetchInitialPoints = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setPoints(profile.points || 0);
        } else if (error) {
          // Create profile if it doesn't exist
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, nickname: 'Usuário', points: 0 })
            .select('points')
            .single();
          
          if (newProfile) {
            setPoints(newProfile.points || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching initial points:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPoints();

    // Set up realtime subscription
    const channel = supabase
      .channel(`profile-points-${user.id}`)
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
          const oldPoints = payload.old.points;
          
          if (typeof newPoints === 'number' && newPoints !== oldPoints) {
            setPoints(newPoints);
            
            // Invalidate related queries
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
  }, [user?.id, queryClient]);

  return { points, isLoading };
}