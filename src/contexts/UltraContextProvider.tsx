// FASE 3: Ultra-Aggressive Memory Management - Consolidated subscriptions
import React, { createContext, useContext, ReactNode, useMemo, lazy, Suspense } from 'react';
import { AuthProvider } from './AuthContext';
import { I18nProvider } from './I18nProvider';
import { AvatarProvider } from './AvatarContext';
import { SponsorThemeProvider } from './SponsorThemeProvider';
import { UltraRealtimeProvider } from './UltraOptimizedRealtimeContext';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { ultraMemoryManager } from '@/utils/ultra-memory-manager';

// Ultra-lazy load ONLY truly non-critical contexts (reduced from 6 to 2)
const LazyLoadingProvider = lazy(() => import('./LoadingContext').then(mod => ({ default: mod.LoadingProvider })));
const LazyGlobalDuelInviteProvider = lazy(() => import('./GlobalDuelInviteContext').then(mod => ({ default: mod.GlobalDuelInviteProvider })));

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

// Ultra-optimized critical context provider with consolidated realtime
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
              <UltraRealtimeProvider>
                {children}
              </UltraRealtimeProvider>
            </SponsorThemeProvider>
          </AvatarProvider>
        </AuthProvider>
      </I18nProvider>
    </UltraContext.Provider>
  );
}

// Ultra-minimal lazy providers (reduced from 6 contexts to 2)
export function UltraLazyProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner size="sm" />}>
      <LazyLoadingProvider>
        <LazyGlobalDuelInviteProvider>
          {children}
        </LazyGlobalDuelInviteProvider>
      </LazyLoadingProvider>
    </Suspense>
  );
}

// Ultimate provider that splits critical vs non-critical - simplified with auto-cleanup
export function UltraContextProvider({ children }: { children: ReactNode }) {
  // Ultra-aggressive memory management on mount/unmount
  React.useEffect(() => {
    // Start global memory monitoring
    ultraMemoryManager.startMonitoring();
    
    const cleanup = () => {
      // Perform aggressive cleanup
      ultraMemoryManager.performCleanup('aggressive');
      
      // Clear any orphaned DOM nodes
      const orphanedElements = document.querySelectorAll('[data-context-orphaned="true"]');
      orphanedElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Clear stale localStorage entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('context-temp-') || key.includes('ultra-temp-') || key.includes('cache-')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              // Remove if older than 1 hour or no timestamp
              if (!parsed.timestamp || Date.now() - parsed.timestamp > 3600000) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            localStorage.removeItem(key); // Remove invalid JSON
          }
        }
      });
    };

    cleanup(); // Initial cleanup
    
    return () => {
      cleanup(); // Cleanup on unmount
      ultraMemoryManager.stopMonitoring();
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