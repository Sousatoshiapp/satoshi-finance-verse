import React, { createContext, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface AvatarContextType {
  invalidateAvatarCaches: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Debounced cache invalidation for avatar changes
  const debouncedInvalidate = useCallback(
    debounce(() => {
      console.log('Invalidating avatar caches after image update');
      
      // Invalidate specific caches with exact matching
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['user-profile'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-data'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['avatar-data'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['current-user-avatar'], exact: true });
      
      // Force immediate refetch of dashboard data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['dashboard-data'], exact: true });
      }, 200);
      
      // Dispatch custom event for components not using react-query
      window.dispatchEvent(new CustomEvent('avatar-changed'));
    }, 500),
    [queryClient]
  );

  const invalidateAvatarCaches = useCallback(() => {
    debouncedInvalidate();
  }, [debouncedInvalidate]);

  return (
    <AvatarContext.Provider value={{ invalidateAvatarCaches }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatarContext() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatarContext must be used within an AvatarProvider');
  }
  return context;
}
