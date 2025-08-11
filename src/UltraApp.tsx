import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// No theme provider needed for ultra performance
import { ErrorBoundary } from 'react-error-boundary';
import { useAutoCleanup } from '@/hooks/use-auto-cleanup';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';

// Ultra-optimized lazy loading with preloading hints
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const SelectOpponentScreen = lazy(() => 
  import('@/pages/SelectOpponentScreen').then(module => {
    // Preload likely next routes
    import('@/pages/BtcDuel');
    import('@/pages/FindOpponent');
    return module;
  })
);

// Other critical routes
const BtcDuel = lazy(() => import('@/pages/BtcDuel'));
const FindOpponent = lazy(() => import('@/pages/FindOpponent'));
const Profile = lazy(() => import('@/pages/Profile'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));

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

export function UltraApp() {
  // Ultra-aggressive cleanup every 15 seconds
  useAutoCleanup(15000);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<UltraLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/select-opponent" element={<SelectOpponentScreen />} />
              <Route path="/btc-duel" element={<BtcDuel />} />
              <Route path="/find-opponent" element={<FindOpponent />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
