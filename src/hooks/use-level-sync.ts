import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLevelSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastKnownLevel = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    // Periodic sync check to ensure levels are correct
    const syncInterval = setInterval(async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('level, xp')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const calculatedLevel = await supabase.rpc('calculate_correct_level', {
            user_xp: profile.xp
          });

          // If level mismatch detected, fix it and refresh cache
          if (calculatedLevel.data && calculatedLevel.data !== profile.level) {
            console.log(`Level sync: Updating level from ${profile.level} to ${calculatedLevel.data}`);
            
            await supabase
              .from('profiles')
              .update({ level: calculatedLevel.data })
              .eq('user_id', user.id);

            // Force cache refresh
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
            queryClient.refetchQueries({ queryKey: ['dashboard-data'] });
          }

          // Track level changes for notifications
          if (lastKnownLevel.current !== null && lastKnownLevel.current < profile.level) {
            console.log(`Level up detected: ${lastKnownLevel.current} → ${profile.level}`);
            // Could trigger level up animation here
          }
          
          lastKnownLevel.current = profile.level;
        }
      } catch (error) {
        console.warn('Level sync check failed:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(syncInterval);
  }, [user, queryClient]);

  return { lastKnownLevel: lastKnownLevel.current };
};