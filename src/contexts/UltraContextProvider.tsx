// FASE 1: Context Splitting Radical - Contextos consolidados e lazy
import React, { createContext, useContext, ReactNode, useMemo, lazy, Suspense } from 'react';
import { AuthProvider } from './AuthContext';
import { I18nProvider } from './I18nProvider';
import { AvatarProvider } from './AvatarContext';
import { SponsorThemeProvider } from './SponsorThemeProvider';
import { OnlineStatusProvider } from './OnlineStatusContext';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';

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
  const contextValue = useMemo(() => ({
    points: 0,
    isOnline: true,
    notifications: [],
    lastUpdate: null,
  }), []);

  return (
    <UltraContext.Provider value={contextValue}>
      <I18nProvider>
        <AuthProvider>
          <AvatarProvider>
            <SponsorThemeProvider>
              <OnlineStatusProvider>
                {children}
              </OnlineStatusProvider>
            </SponsorThemeProvider>
          </AvatarProvider>
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

// Ultimate provider that splits critical vs non-critical - simplified with auto-cleanup
export function UltraContextProvider({ children }: { children: ReactNode }) {
  // Auto cleanup on mount/unmount to prevent memory leaks
  React.useEffect(() => {
    const cleanup = () => {
      // Clear any orphaned DOM nodes
      const orphanedElements = document.querySelectorAll('[data-context-orphaned="true"]');
      orphanedElements.forEach(el => el.remove());
      
      // Clear stale localStorage entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('context-temp-') || key.includes('ultra-temp-')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.debug('Error removing temp storage:', key);
          }
        }
      });
    };

    cleanup(); // Initial cleanup
    
    return () => {
      cleanup(); // Cleanup on unmount
    };
  }, []);

  return (
    <UltraCriticalProvider>
      <UltraLazyProvider>
        {children}
      </UltraLazyProvider>
    </UltraCriticalProvider>
  );
}