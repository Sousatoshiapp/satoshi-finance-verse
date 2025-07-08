import { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FloatingNavbar } from "@/components/floating-navbar";
import { LazyRoutes } from "@/utils/advanced-lazy-loading";
import { webWorkerManager } from "@/utils/web-workers";

// Streaming Dashboard para carregamento otimizado
import { StreamingDashboard } from "@/components/streaming-dashboard";

function App() {
  useEffect(() => {
    // Inicializar Web Workers
    webWorkerManager.init();
    
    // Cleanup na saída
    return () => {
      webWorkerManager.terminate();
    };
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LazyRoutes.Welcome />} />
            <Route path="/auth" element={<LazyRoutes.Auth />} />
            <Route path="/welcome" element={<LazyRoutes.Welcome />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StreamingDashboard />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <LazyRoutes.Profile />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz" element={
              <ProtectedRoute>
                <LazyRoutes.Quiz />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/solo-quiz" element={
              <ProtectedRoute>
                <LazyRoutes.SoloQuiz />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <LazyRoutes.Leaderboard />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <LazyRoutes.Settings />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/duels" element={
              <ProtectedRoute>
                <LazyRoutes.Duels />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/social" element={
              <ProtectedRoute>
                <LazyRoutes.Social />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/tournaments" element={
              <ProtectedRoute>
                <LazyRoutes.Tournaments />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/store" element={
              <ProtectedRoute>
                <LazyRoutes.Store />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/satoshi-city" element={
              <ProtectedRoute>
                <LazyRoutes.SatoshiCity />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <LazyRoutes.AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<div>404 - Página não encontrada</div>} />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;