// FASE 2: ULTRA APP - Contextos otimizados e lazy loading inteligente
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { UltraContextProvider } from "@/contexts/UltraContextProvider";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { generateRoutes } from "@/components/shared/RouteGenerator";
import { GlobalNotifications } from "@/components/shared/GlobalNotifications";
import { EnhancedErrorBoundary } from "@/lib/enhanced-error-boundary";
import { useI18n } from "@/hooks/use-i18n";
import { useSplashScreen } from "@/hooks/use-splash-screen";
import { usePhase5Production } from "@/hooks/use-phase5-production";
import "@/utils/duel-system-debug"; // Load debug utilities

function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">404</h1>
        <p>{t('errors.pageNotFound')}</p>
      </div>
    </div>
  );
}

function AppContent() {
  useSplashScreen();
  
  // PHASE 5: Production Hardening Integration
  const productionStatus = usePhase5Production();
  
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {generateRoutes()}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <GlobalNotifications />
      </Suspense>
    </div>
  );
}

// FASE 2.1: Ultra App com Context Provider consolidado e otimizações de performance
function App() {
  // Performance mark para App com cleanup seletivo
  React.useEffect(() => {
    try {
      performance.mark('ultra-app-context-start');
    } catch (e) {
      console.debug('Failed to create app context start mark:', e);
    }
    
    // Cleanup seletivo que preserva marcas ativas de rotas
    const cleanupTimeout = setTimeout(() => {
      try {
        // Limpar apenas medidas antigas, preservar marcas ativas
        const measures = performance.getEntriesByType('measure');
        measures.forEach(measure => {
          if (measure.name.startsWith('ultra-') && 
              performance.now() - measure.startTime > 60000) { // 1 minuto
            try {
              performance.clearMeasures(measure.name);
            } catch (e) {
              console.debug(`Failed to clear measure ${measure.name}:`, e);
            }
          }
        });
      } catch (e) {
        console.debug('Performance selective cleanup error:', e);
      }
    }, 60000); // Aumentado para 1 minuto
    
    return () => {
      try {
        performance.mark('ultra-app-context-end');
        const startMarks = performance.getEntriesByName('ultra-app-context-start', 'mark');
        if (startMarks.length > 0) {
          performance.measure('ultra-app-context', 'ultra-app-context-start', 'ultra-app-context-end');
        }
      } catch (e) {
        console.debug('Failed to measure app context performance:', e);
      }
      clearTimeout(cleanupTimeout);
    };
  }, []);

  return (
    <EnhancedErrorBoundary
      maxRetries={3}
      enableAutoRecovery={true}
      onError={(error, errorInfo) => {
        console.error('Production Error Boundary:', error, errorInfo);
      }}
    >
      <UltraContextProvider>
        <AppContent />
      </UltraContextProvider>
    </EnhancedErrorBoundary>
  );
}

export default App;
