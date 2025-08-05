import React, { createContext, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface AvatarContextType {
  invalidateAvatarCaches: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const invalidateAvatarCaches = useCallback(() => {
    // Invalidate all relevant caches when avatar changes
    queryClient.invalidateQueries({ queryKey: ['leaderboard-data'] });
    queryClient.invalidateQueries({ queryKey: ['avatar-data'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    queryClient.invalidateQueries({ queryKey: ['current-user-avatar'] });
    queryClient.invalidateQueries({ queryKey: ['user-avatar'] });
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
    
    // Dispatch custom event for components not using react-query
    window.dispatchEvent(new CustomEvent('avatar-changed'));
  }, [queryClient]);

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