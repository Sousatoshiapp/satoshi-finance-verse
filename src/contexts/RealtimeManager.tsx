import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

interface RealtimeManagerContextType {
  subscribeToProfile: (userId: string) => void;
  unsubscribeFromProfile: (userId: string) => void;
  subscribeToLeaderboard: () => void;
  unsubscribeFromLeaderboard: () => void;
}

const RealtimeManagerContext = createContext<RealtimeManagerContextType | null>(null);

export const useRealtimeManager = () => {
  const context = useContext(RealtimeManagerContext);
  if (!context) {
    throw new Error('useRealtimeManager must be used within RealtimeManagerProvider');
  }
  return context;
};

export const RealtimeManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelsRef = useRef<Map<string, any>>(new Map());

  const debouncedInvalidateProfile = debounce((userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    queryClient.invalidateQueries({ queryKey: ['user-avatar', userId] });
  }, 300);

  const debouncedInvalidateLeaderboard = debounce(() => {
    queryClient.invalidateQueries({ queryKey: ['leaderboard-data'] });
  }, 500);

  const subscribeToProfile = (userId: string) => {
    const channelKey = `profile-${userId}`;
    
    if (channelsRef.current.has(channelKey)) {
      return; // Já subscrito
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const relevantFields = ['points', 'xp', 'level', 'current_avatar_id', 'profile_image_url'];
          const hasRelevantChanges = relevantFields.some(
            field => payload.old[field] !== payload.new[field]
          );
          
          if (hasRelevantChanges) {
            debouncedInvalidateProfile(userId);
          }
        }
      )
      .subscribe();

    channelsRef.current.set(channelKey, channel);
  };

  const unsubscribeFromProfile = (userId: string) => {
    const channelKey = `profile-${userId}`;
    const channel = channelsRef.current.get(channelKey);
    
    if (channel) {
      supabase.removeChannel(channel);
      channelsRef.current.delete(channelKey);
    }
  };

  const subscribeToLeaderboard = () => {
    const channelKey = 'leaderboard-global';
    
    if (channelsRef.current.has(channelKey)) {
      return;
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          if (payload.old.points !== payload.new.points || 
              payload.old.xp !== payload.new.xp ||
              payload.old.current_avatar_id !== payload.new.current_avatar_id) {
            debouncedInvalidateLeaderboard();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'weekly_leaderboards',
        },
        () => {
          debouncedInvalidateLeaderboard();
        }
      )
      .subscribe();

    channelsRef.current.set(channelKey, channel);
  };

  const unsubscribeFromLeaderboard = () => {
    const channelKey = 'leaderboard-global';
    const channel = channelsRef.current.get(channelKey);
    
    if (channel) {
      supabase.removeChannel(channel);
      channelsRef.current.delete(channelKey);
    }
  };

  useEffect(() => {
    if (user?.id) {
      subscribeToProfile(user.id);
      subscribeToLeaderboard();
    }

    return () => {
      if (user?.id) {
        unsubscribeFromProfile(user.id);
        unsubscribeFromLeaderboard();
      }
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, []);

  const value = {
    subscribeToProfile,
    unsubscribeFromProfile,
    subscribeToLeaderboard,
    unsubscribeFromLeaderboard,
  };

  return (
    <RealtimeManagerContext.Provider value={value}>
      {children}
    </RealtimeManagerContext.Provider>
  );
};
