import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FloatingNavbar } from "@/components/floating-navbar";
// Direct imports for critical pages
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import Social from "@/pages/Social";
import Duels from "@/pages/Duels";
import SatoshiCity from "@/pages/SatoshiCity";
import DistrictDetail from "@/pages/DistrictDetail";
import DistrictQuiz from "@/pages/DistrictQuiz";
import GameMode from "@/pages/GameMode";
import Store from "@/pages/Store";
import SubscriptionPlans from "@/pages/SubscriptionPlans";

// Lazy imports for less critical pages
import { LazyRoutes } from "@/utils/advanced-lazy-loading";
import { RealtimeProvider } from "@/contexts/RealtimeContext";

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LazyRoutes.Welcome />} />
            <Route path="/auth" element={<LazyRoutes.Auth />} />
            <Route path="/welcome" element={<LazyRoutes.Welcome />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/user/:userId" element={
              <ProtectedRoute>
                <UserProfile />
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
                <Duels />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/social" element={
              <ProtectedRoute>
                <Social />
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
                <Store />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <LazyRoutes.Marketplace />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/marketplace/lives" element={
              <ProtectedRoute>
                <LazyRoutes.LivesMarketplace />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/subscription-plans" element={
              <ProtectedRoute>
                <SubscriptionPlans />
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
                <GameMode />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            {/* District Routes */}
            <Route path="/satoshi-city/district/:districtId" element={
              <ProtectedRoute>
                <DistrictDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/satoshi-city/district/:districtId/quiz" element={
              <ProtectedRoute>
                <DistrictQuiz />
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
            
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <LazyRoutes.AdminSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <LazyRoutes.AdminUsersAll />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users/premium" element={
              <ProtectedRoute>
                <LazyRoutes.AdminUsersPremium />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users/moderation" element={
              <ProtectedRoute>
                <LazyRoutes.AdminUsersModeration />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/finance/revenue" element={
              <ProtectedRoute>
                <LazyRoutes.AdminFinanceRevenue />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/finance/beetz" element={
              <ProtectedRoute>
                <LazyRoutes.AdminFinanceBeetz />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/finance/subscriptions" element={
              <ProtectedRoute>
                <LazyRoutes.AdminFinanceSubscriptions />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/finance/reports" element={
              <ProtectedRoute>
                <LazyRoutes.AdminFinanceReports />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/quiz/questions" element={
              <ProtectedRoute>
                <LazyRoutes.AdminQuizQuestions />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/quiz/categories" element={
              <ProtectedRoute>
                <LazyRoutes.AdminQuizCategories />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/social/posts" element={
              <ProtectedRoute>
                <LazyRoutes.AdminSocialPosts />
              </ProtectedRoute>
            } />
            
            
            {/* Testing Hub */}
            <Route path="/testing-hub" element={
              <ProtectedRoute>
                <LazyRoutes.TestingHub />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            {/* Gamification Routes (Phase 3) */}
            <Route path="/gamification" element={
              <ProtectedRoute>
                <LazyRoutes.GamificationDashboard />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/achievements" element={
              <ProtectedRoute>
                <LazyRoutes.Achievements />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/leagues" element={
              <ProtectedRoute>
                <LazyRoutes.Leagues />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/powerups" element={
              <ProtectedRoute>
                <LazyRoutes.Powerups />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/daily-challenges" element={
              <ProtectedRoute>
                <LazyRoutes.DailyChallenges />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            {/* AI & Content Routes (Phase 4) */}
            <Route path="/ai-tutor" element={
              <ProtectedRoute>
                <LazyRoutes.AITutor />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/learning-path" element={
              <ProtectedRoute>
                <LazyRoutes.LearningPath />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/content-generator" element={
              <ProtectedRoute>
                <LazyRoutes.ContentGenerator />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/ai-simulator" element={
              <ProtectedRoute>
                <LazyRoutes.AISimulator />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            {/* Monetization Routes (Phase 5) */}
            <Route path="/monetization" element={
              <ProtectedRoute>
                <LazyRoutes.MonetizationDashboard />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/virtual-store" element={
              <ProtectedRoute>
                <LazyRoutes.VirtualStore />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/nft-marketplace" element={
              <ProtectedRoute>
                <LazyRoutes.NFTMarketplace />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/affiliate-program" element={
              <ProtectedRoute>
                <LazyRoutes.AffiliateProgram />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/wallet" element={
              <ProtectedRoute>
                <LazyRoutes.Wallet />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            {/* Admin Routes for New Features */}
            <Route path="/admin/gamification" element={
              <ProtectedRoute>
                <LazyRoutes.AdminGamification />
              </ProtectedRoute>
            } />

            <Route path="/admin/ai-content" element={
              <ProtectedRoute>
                <LazyRoutes.AdminAIContent />
              </ProtectedRoute>
            } />

            <Route path="/admin/monetization" element={
              <ProtectedRoute>
                <LazyRoutes.AdminMonetization />
              </ProtectedRoute>
            } />

            {/* New Routes - Missing Pages */}
            <Route path="/levels" element={
              <ProtectedRoute>
                <LazyRoutes.Levels />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/beetz-info" element={
              <ProtectedRoute>
                <LazyRoutes.BeetzInfo />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <LazyRoutes.LearningAnalytics />
                <FloatingNavbar />
              </ProtectedRoute>
            } />

            <Route path="/dashboard-new" element={
              <ProtectedRoute>
                <LazyRoutes.DashboardNew />
              </ProtectedRoute>
            } />
            
            <Route path="/find-opponent" element={
              <ProtectedRoute>
                <LazyRoutes.FindOpponent />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/tournament-quiz/:tournamentId" element={
              <ProtectedRoute>
                <LazyRoutes.TournamentQuizSpecific />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            {/* Detail Pages Routes */}
            <Route path="/avatar/:id" element={
              <ProtectedRoute>
                <LazyRoutes.AvatarDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/boost/:id" element={
              <ProtectedRoute>
                <LazyRoutes.BoostDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/skin/:id" element={
              <ProtectedRoute>
                <LazyRoutes.SkinDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/accessory/:id" element={
              <ProtectedRoute>
                <LazyRoutes.AccessoryDetail />
                <FloatingNavbar />
              </ProtectedRoute>
            } />
            
            <Route path="/password-reset" element={<LazyRoutes.PasswordReset />} />
            
            <Route path="*" element={<div>404 - Página não encontrada</div>} />
          </Routes>
        </Suspense>
        </div>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
