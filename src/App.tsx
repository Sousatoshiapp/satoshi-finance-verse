import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FloatingNavbar } from "@/components/floating-navbar";
import { LazyRoutes } from "@/utils/advanced-lazy-loading";
import SatoshiCity from "@/pages/SatoshiCity";

function App() {
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
                <LazyRoutes.Dashboard />
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
                <SatoshiCity />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/game-mode" element={
              <ProtectedRoute>
                <LazyRoutes.GameMode />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            {/* District Routes */}
            <Route path="/satoshi-city/district/:districtId" element={
              <ProtectedRoute>
                <LazyRoutes.DistrictDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/satoshi-city/district/:districtId/quiz" element={
              <ProtectedRoute>
                <LazyRoutes.DistrictQuiz />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            {/* Quiz Routes */}
            <Route path="/enhanced-quiz" element={
              <ProtectedRoute>
                <LazyRoutes.EnhancedQuiz />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/duel-quiz/:opponentId" element={
              <ProtectedRoute>
                <LazyRoutes.DuelQuiz />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            {/* Tournament Routes */}
            <Route path="/tournament/:tournamentId" element={
              <ProtectedRoute>
                <LazyRoutes.TournamentDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/tournament/:tournamentId/quiz" element={
              <ProtectedRoute>
                <LazyRoutes.TournamentQuiz />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            {/* Other Missing Routes */}
            <Route path="/playground" element={
              <ProtectedRoute>
                <LazyRoutes.Playground />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/missions" element={
              <ProtectedRoute>
                <LazyRoutes.Missions />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/loot-boxes" element={
              <ProtectedRoute>
                <LazyRoutes.LootBoxes />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/guilds" element={
              <ProtectedRoute>
                <LazyRoutes.Guilds />
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
