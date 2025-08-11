// FASE 3 FIXED: Simplified Context Structure for Stability
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { I18nProvider } from './I18nProvider';
import { AvatarProvider } from './AvatarContext';
import { SponsorThemeProvider } from './SponsorThemeProvider';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { ultraMemoryManager } from '@/utils/ultra-memory-manager';

// Simplified consolidated context
interface UltraContextType {
  points: number;
  isOnline: boolean;
  notifications: any[];
  lastUpdate: Date | null;
  isReady: boolean;
}

const UltraContext = createContext<UltraContextType>({
  points: 0,
  isOnline: true,
  notifications: [],
  lastUpdate: null,
  isReady: false,
});

export const useUltraContext = () => useContext(UltraContext);

// Simplified critical provider - NO LAZY LOADING for critical contexts
export function UltraCriticalProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  
  const contextValue = useMemo(() => ({
    points: 0,
    isOnline: true,
    notifications: [],
    lastUpdate: null,
    isReady,
  }), [isReady]);

  // Ensure all contexts are ready before rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <UltraContext.Provider value={contextValue}>
      <I18nProvider>
        <AuthProvider>
          <AvatarProvider>
            <SponsorThemeProvider>
              {children}
            </SponsorThemeProvider>
          </AvatarProvider>
        </AuthProvider>
      </I18nProvider>
    </UltraContext.Provider>
  );
}

// Simplified main provider - NO complex lazy loading for now
export function UltraContextProvider({ children }: { children: ReactNode }) {
  // Simplified memory management on mount/unmount
  React.useEffect(() => {
    // Start memory monitoring (but simplified)
    if (typeof ultraMemoryManager !== 'undefined') {
      ultraMemoryManager.startMonitoring?.();
    }
    
    return () => {
      if (typeof ultraMemoryManager !== 'undefined') {
        ultraMemoryManager.stopMonitoring?.();
      }
    };
  }, []);

  return (
    <UltraCriticalProvider>
      {children}
    </UltraCriticalProvider>
  );
}