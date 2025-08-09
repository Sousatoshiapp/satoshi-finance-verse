// FASE 1: Context Splitting Radical - Contextos consolidados e lazy
import React, { createContext, useContext, ReactNode, useMemo, lazy, Suspense, useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { I18nProvider } from './I18nProvider';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { AppLoader } from '@/components/shared/ui/AppLoader';

// Lazy load non-critical contexts
const LazyRealtimeProvider = lazy(() => import('./RealtimeContext').then(mod => ({ default: mod.RealtimeProvider })));
const LazyLoadingProvider = lazy(() => import('./LoadingContext').then(mod => ({ default: mod.LoadingProvider })));
const LazySponsorThemeProvider = lazy(() => import('./SponsorThemeProvider').then(mod => ({ default: mod.SponsorThemeProvider })));
const LazyAvatarProvider = lazy(() => import('./AvatarContext').then(mod => ({ default: mod.AvatarProvider })));
const LazyGlobalDuelInviteProvider = lazy(() => import('./GlobalDuelInviteContext').then(mod => ({ default: mod.GlobalDuelInviteProvider })));
const LazyOnlineStatusProvider = lazy(() => import('./OnlineStatusContext').then(mod => ({ default: mod.OnlineStatusProvider })));

// Consolidated Points & Notifications Context
interface UltraContextType {
  points: number;
  isOnline: boolean;
  notifications: any[];
  lastUpdate: Date | null;
}

const UltraContext = createContext<UltraContextType>({
  points: 0,
  isOnline: true,
  notifications: [],
  lastUpdate: null,
});

export const useUltraContext = () => useContext(UltraContext);

// Ultra-fast critical context provider
export function UltraCriticalProvider({ children }: { children: ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const contextValue = useMemo(() => ({
    points: 0,
    isOnline: true,
    notifications: [],
    lastUpdate: null,
  }), []);

  // Simular carregamento inicial dos contextos críticos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // 1.5s para loading inicial

    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <AppLoader />;
  }

  return (
    <UltraContext.Provider value={contextValue}>
      <I18nProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </UltraContext.Provider>
  );
}

// Lazy non-critical providers
export function UltraLazyProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyLoadingProvider>
        <LazyOnlineStatusProvider>
          <LazyRealtimeProvider>
            <LazyAvatarProvider>
              <LazyGlobalDuelInviteProvider>
                <LazySponsorThemeProvider>
                  {children}
                </LazySponsorThemeProvider>
              </LazyGlobalDuelInviteProvider>
            </LazyAvatarProvider>
          </LazyRealtimeProvider>
        </LazyOnlineStatusProvider>
      </LazyLoadingProvider>
    </Suspense>
  );
}

// Ultimate provider that splits critical vs non-critical
export function UltraContextProvider({ children }: { children: ReactNode }) {
  return (
    <UltraCriticalProvider>
      <UltraLazyProvider>
        {children}
      </UltraLazyProvider>
    </UltraCriticalProvider>
  );
}