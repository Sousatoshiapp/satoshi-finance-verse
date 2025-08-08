// FASE 1: Context Providers Ultra-Otimizados - Apenas críticos no initial render
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { AuthProvider } from './AuthContext';
import { I18nProvider } from './I18nProvider';

// Context consolidado para dados críticos
interface UltraCriticalContextType {
  points: number;
  isOnline: boolean;
  notifications: any[];
  lastUpdate: Date | null;
}

const UltraCriticalContext = createContext<UltraCriticalContextType>({
  points: 0,
  isOnline: true,
  notifications: [],
  lastUpdate: null,
});

export const useUltraCritical = () => useContext(UltraCriticalContext);

// Provider ultra-otimizado apenas com contextos críticos
export function UltraCriticalProvider({ children }: { children: ReactNode }) {
  const contextValue = useMemo(() => ({
    points: 0,
    isOnline: navigator.onLine,
    notifications: [],
    lastUpdate: null,
  }), []);

  return (
    <UltraCriticalContext.Provider value={contextValue}>
      <I18nProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </UltraCriticalContext.Provider>
  );
}

// Provider lazy para contextos não-críticos (carregado após render inicial)
export function LazyContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}