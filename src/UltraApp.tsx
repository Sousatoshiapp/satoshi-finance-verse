import { Suspense, lazy, memo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAutoCleanup } from '@/hooks/use-auto-cleanup';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';
import { LazyRoutes } from '@/utils/intelligent-code-splitter';
import { resourceOptimizer } from '@/utils/resource-optimizer';
import { initTreeShaking } from '@/utils/tree-shaking-optimizer';
import { UltraContextProvider } from '@/contexts/UltraContextProvider';

// Route performance optimizer component
const RouteOptimizer = memo(() => {
  const location = useLocation();
  
  useEffect(() => {
    resourceOptimizer.prefetchRoutes(location.pathname);
    initTreeShaking();
  }, [location.pathname]);
  
  return null;
});

// Ultra-fast error fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center p-6">
      <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
      <button 
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
      >
        Recarregar
      </button>
    </div>
  </div>
);

// Ultra-fast loading component
const UltraLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <ProfileStyleLoader size="lg" />
  </div>
);

export const UltraApp = memo(() => {
  // Ultra-aggressive cleanup every 15 seconds
  useAutoCleanup(15000);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <UltraContextProvider>
        <BrowserRouter>
          <RouteOptimizer />
          <div className="min-h-screen bg-background font-satoshi">
            <Suspense fallback={<UltraLoader />}>
              <Routes>
                <Route path="/" element={<LazyRoutes.Dashboard />} />
                <Route path="/dashboard" element={<LazyRoutes.Dashboard />} />
                <Route path="/profile" element={<LazyRoutes.Profile />} />
                <Route path="/quiz" element={<LazyRoutes.SoloQuiz />} />
                <Route path="/social" element={<LazyRoutes.Social />} />
                <Route path="/btc-duel" element={<LazyRoutes.BtcDuel />} />
                <Route path="/leaderboard" element={<LazyRoutes.Leaderboard />} />
                <Route path="/settings" element={<LazyRoutes.Settings />} />
                <Route path="/achievements" element={<LazyRoutes.Achievements />} />
                <Route path="/messages" element={<LazyRoutes.Messages />} />
                <Route path="/direct-chat" element={<LazyRoutes.DirectChat />} />
                <Route path="/store" element={<LazyRoutes.Store />} />
                <Route path="/inventory" element={<LazyRoutes.Inventory />} />
                <Route path="/tournaments" element={<LazyRoutes.Tournaments />} />
                <Route path="/welcome" element={<LazyRoutes.Welcome />} />
                <Route path="/auth" element={<LazyRoutes.Auth />} />
                <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold text-foreground">404 - Page Not Found</h1></div>} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </UltraContextProvider>
    </ErrorBoundary>
  );
});
