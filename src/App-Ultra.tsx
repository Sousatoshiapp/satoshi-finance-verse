// FASE 1: Context Splitting Radical + FASE 3: Route-Level Code Splitting Extremo
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { UltraContextProvider } from "@/contexts/UltraContextProvider";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { ProfileStyleLoader } from "@/components/shared/ui/profile-style-loader";

// FASE 3: Micro-Frontend Approach - Dashboard como bundle independente
const UltraOptimizedDashboard = lazy(() => 
  import("@/components/dashboard/UltraOptimizedDashboard")
);

// Lazy load todas as outras rotas
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyQuiz = lazy(() => import("@/pages/Quiz"));
const LazyStore = lazy(() => import("@/pages/Store"));
const LazySubscription = lazy(() => import("@/pages/SubscriptionPlans"));

// Standard loader for dashboard
const StandardLoader = () => (
  <ProfileStyleLoader />
);

// Ultra-fast NotFound
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">404</h1>
        <p>Página não encontrada</p>
      </div>
    </div>
  );
}

// Ultra-minimalist App Content
function AppContent() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        {/* All routes with standardized loading */}
        <Route 
          path="/" 
          element={
            <Suspense fallback={<StandardLoader />}>
              <UltraOptimizedDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<StandardLoader />}>
              <UltraOptimizedDashboard />
            </Suspense>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <Suspense fallback={<StandardLoader />}>
              <LazyProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/quiz" 
          element={
            <Suspense fallback={<StandardLoader />}>
              <LazyQuiz />
            </Suspense>
          } 
        />
        <Route 
          path="/store" 
          element={
            <Suspense fallback={<StandardLoader />}>
              <LazyStore />
            </Suspense>
          } 
        />
        <Route 
          path="/subscription-plans" 
          element={
            <Suspense fallback={<StandardLoader />}>
              <LazySubscription />
            </Suspense>
          } 
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

// Ultra App with radical context splitting
function UltraApp() {
  return (
    <GlobalErrorBoundary>
      <UltraContextProvider>
        <AppContent />
      </UltraContextProvider>
    </GlobalErrorBoundary>
  );
}

export default UltraApp;
