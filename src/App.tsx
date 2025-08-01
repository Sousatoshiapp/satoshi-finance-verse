import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { SponsorThemeProvider } from "@/contexts/SponsorThemeProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { I18nProvider } from "@/contexts/I18nProvider";
import { PointsProvider } from "@/contexts/PointsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { OnlineStatusProvider } from "@/contexts/OnlineStatusContext";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { generateRoutes } from "@/components/shared/RouteGenerator";
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
    <div className="min-h-screen bg-background font-sans antialiased">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {generateRoutes()}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <I18nProvider>
        <LoadingProvider>
          <AuthProvider>
            <PointsProvider>
              <NotificationProvider>
                <OnlineStatusProvider>
                  <RealtimeProvider>
                    <SponsorThemeProvider>
                      <AppContent />
                    </SponsorThemeProvider>
                  </RealtimeProvider>
                </OnlineStatusProvider>
              </NotificationProvider>
            </PointsProvider>
          </AuthProvider>
        </LoadingProvider>
      </I18nProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
