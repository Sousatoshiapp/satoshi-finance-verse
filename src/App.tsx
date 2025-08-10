// FASE 2: ULTRA APP - Contextos otimizados e lazy loading inteligente
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { UltraContextProvider } from "@/contexts/UltraContextProvider";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { generateRoutes } from "@/components/shared/RouteGenerator";
import { GlobalNotifications } from "@/components/shared/GlobalNotifications";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { useI18n } from "@/hooks/use-i18n";
import { useSplashScreen } from "@/hooks/use-splash-screen";
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
      <UltraContextProvider>
        <AppContent />
      </UltraContextProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
