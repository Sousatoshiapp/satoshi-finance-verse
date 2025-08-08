// FASE 2: ULTRA APP - Contextos otimizados e lazy loading inteligente
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { UltraCriticalProvider } from "@/contexts/UltraCriticalProvider";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { generateRoutes } from "@/components/shared/RouteGenerator";
import { GlobalNotifications } from "@/components/shared/GlobalNotifications";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { useI18n } from "@/hooks/use-i18n";

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
  return (
    <div className="ultra-layout">
      <Suspense fallback={<div className="ultra-loading"><div className="ultra-spinner" /></div>}>
        <Routes>
          {generateRoutes()}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <GlobalNotifications />
      </Suspense>
    </div>
  );
}

// FASE 2.1: Ultra App com Context Provider consolidado
function App() {
  // Performance mark para App
  React.useEffect(() => {
    performance.mark('ultra-app-context-start');
    return () => {
      performance.mark('ultra-app-context-end');
      performance.measure('ultra-app-context', 'ultra-app-context-start', 'ultra-app-context-end');
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <UltraCriticalProvider>
        <AppContent />
      </UltraCriticalProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
