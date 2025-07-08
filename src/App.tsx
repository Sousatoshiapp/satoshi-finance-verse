import { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FloatingNavbar } from "@/components/floating-navbar";
import { LazyRoutes } from "@/utils/advanced-lazy-loading";
import { webWorkerManager } from "@/utils/web-workers";

// Streaming Dashboard para carregamento otimizado
import { StreamingDashboard } from "@/components/streaming-dashboard";

// Critical routes - loaded immediately
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Gaming routes - lazy loaded
const Quiz = lazy(() => import("./pages/Quiz"));
const SoloQuiz = lazy(() => import("./pages/SoloQuiz"));
const DuelQuiz = lazy(() => import("./pages/DuelQuiz"));
const TournamentQuiz = lazy(() => import("./pages/TournamentQuiz"));
const TournamentQuizSpecific = lazy(() => import("./pages/TournamentQuizSpecific"));
const GameMode = lazy(() => import("./pages/GameMode"));
const EnhancedQuiz = lazy(() => import("./pages/EnhancedQuiz"));
const Duels = lazy(() => import("./pages/Duels"));
const FindOpponent = lazy(() => import("./pages/FindOpponent"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
const TournamentDetail = lazy(() => import("./pages/TournamentDetail"));
const WeeklyTournaments = lazy(() => import("./pages/WeeklyTournaments"));
const Playground = lazy(() => import("./pages/Playground"));

// Profile & Store routes - lazy loaded
const Profile = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Levels = lazy(() => import("./pages/Levels"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Store = lazy(() => import("./pages/Store"));
const AvatarDetail = lazy(() => import("./pages/AvatarDetail"));
const SkinDetail = lazy(() => import("./pages/SkinDetail"));
const BoostDetail = lazy(() => import("./pages/BoostDetail"));
const AccessoryDetail = lazy(() => import("./pages/AccessoryDetail"));
const BeetzInfo = lazy(() => import("./pages/BeetzInfo"));
const SubscriptionPlans = lazy(() => import("./pages/SubscriptionPlans"));

// Social & Community routes - lazy loaded
const Social = lazy(() => import("./pages/Social"));
const SocialChallenges = lazy(() => import("./pages/SocialChallenges"));
const SocialTrading = lazy(() => import("./pages/SocialTrading"));
const Guilds = lazy(() => import("./pages/Guilds"));
const ChallengeDetail = lazy(() => import("./pages/ChallengeDetail"));

// City & Districts routes - lazy loaded
const SatoshiCity = lazy(() => import("./pages/SatoshiCity"));
const DistrictDetail = lazy(() => import("./pages/DistrictDetail"));
const DistrictQuiz = lazy(() => import("./pages/DistrictQuiz"));

// Premium features - lazy loaded
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const VIPMentorship = lazy(() => import("./pages/VIPMentorship"));

// Learning & Missions - lazy loaded
const Lesson = lazy(() => import("./pages/Lesson"));
const Missions = lazy(() => import("./pages/Missions"));
const LootBoxes = lazy(() => import("./pages/LootBoxes"));
const StreakRewards = lazy(() => import("./pages/StreakRewards"));

// Settings & Utils - lazy loaded
const Settings = lazy(() => import("./pages/Settings"));

// Admin routes - lazy loaded (heavy and rarely used)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminQuestions = lazy(() => import("./pages/AdminQuestions"));
const AdminPasswordReset = lazy(() => import("./pages/AdminPasswordReset"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const BotAdmin = lazy(() => import("./pages/BotAdmin"));
const SponsorAdmin = lazy(() => import("./pages/SponsorAdmin"));
const AdminTournaments = lazy(() => import("./pages/AdminTournaments"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    },
  },
});

const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Critical routes - no lazy loading */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Gaming routes - lazy loaded */}
            <Route path="/quiz" element={<ProtectedRoute><LazyRoute><Quiz /></LazyRoute></ProtectedRoute>} />
            <Route path="/game-mode" element={<ProtectedRoute><LazyRoute><GameMode /></LazyRoute></ProtectedRoute>} />
            <Route path="/solo-quiz" element={<ProtectedRoute><LazyRoute><SoloQuiz /></LazyRoute></ProtectedRoute>} />
            <Route path="/duel-quiz" element={<ProtectedRoute><LazyRoute><DuelQuiz /></LazyRoute></ProtectedRoute>} />
            <Route path="/tournament-quiz" element={<ProtectedRoute><LazyRoute><TournamentQuiz /></LazyRoute></ProtectedRoute>} />
            <Route path="/tournament-quiz/:tournamentId" element={<ProtectedRoute><LazyRoute><TournamentQuizSpecific /></LazyRoute></ProtectedRoute>} />
            <Route path="/enhanced-quiz" element={<ProtectedRoute><LazyRoute><EnhancedQuiz /></LazyRoute></ProtectedRoute>} />
            <Route path="/duels" element={<ProtectedRoute><LazyRoute><Duels /></LazyRoute></ProtectedRoute>} />
            <Route path="/find-opponent" element={<ProtectedRoute><LazyRoute><FindOpponent /></LazyRoute></ProtectedRoute>} />
            <Route path="/tournaments" element={<ProtectedRoute><LazyRoute><Tournaments /></LazyRoute></ProtectedRoute>} />
            <Route path="/tournaments/:id" element={<ProtectedRoute><LazyRoute><TournamentDetail /></LazyRoute></ProtectedRoute>} />
            <Route path="/weekly-tournaments" element={<ProtectedRoute><LazyRoute><WeeklyTournaments /></LazyRoute></ProtectedRoute>} />
            <Route path="/playground" element={<ProtectedRoute><LazyRoute><Playground /></LazyRoute></ProtectedRoute>} />
            
            {/* Profile & Store routes - lazy loaded */}
            <Route path="/profile" element={<ProtectedRoute><LazyRoute><Profile /></LazyRoute></ProtectedRoute>} />
            <Route path="/user/:userId" element={<ProtectedRoute><LazyRoute><UserProfile /></LazyRoute></ProtectedRoute>} />
            <Route path="/levels" element={<ProtectedRoute><LazyRoute><Levels /></LazyRoute></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LazyRoute><Leaderboard /></LazyRoute></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><LazyRoute><Store /></LazyRoute></ProtectedRoute>} />
            <Route path="/avatar/:id" element={<ProtectedRoute><LazyRoute><AvatarDetail /></LazyRoute></ProtectedRoute>} />
            <Route path="/skin/:id" element={<ProtectedRoute><LazyRoute><SkinDetail /></LazyRoute></ProtectedRoute>} />
            <Route path="/boost/:id" element={<ProtectedRoute><LazyRoute><BoostDetail /></LazyRoute></ProtectedRoute>} />
            <Route path="/accessory/:id" element={<ProtectedRoute><LazyRoute><AccessoryDetail /></LazyRoute></ProtectedRoute>} />
            <Route path="/beetz-info" element={<ProtectedRoute><LazyRoute><BeetzInfo /></LazyRoute></ProtectedRoute>} />
            <Route path="/subscription-plans" element={<ProtectedRoute><LazyRoute><SubscriptionPlans /></LazyRoute></ProtectedRoute>} />
            
            {/* Social & Community routes - lazy loaded */}
            <Route path="/social" element={<ProtectedRoute><LazyRoute><Social /></LazyRoute></ProtectedRoute>} />
            <Route path="/social-challenges" element={<ProtectedRoute><LazyRoute><SocialChallenges /></LazyRoute></ProtectedRoute>} />
            <Route path="/social-trading" element={<ProtectedRoute><LazyRoute><SocialTrading /></LazyRoute></ProtectedRoute>} />
            <Route path="/guilds" element={<ProtectedRoute><LazyRoute><Guilds /></LazyRoute></ProtectedRoute>} />
            <Route path="/challenge/:challengeId" element={<ProtectedRoute><LazyRoute><ChallengeDetail /></LazyRoute></ProtectedRoute>} />
            
            {/* City & Districts routes - lazy loaded */}
            <Route path="/satoshi-city" element={<ProtectedRoute><LazyRoute><SatoshiCity /></LazyRoute></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId" element={<ProtectedRoute><LazyRoute><DistrictDetail /></LazyRoute></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId/quiz" element={<ProtectedRoute><LazyRoute><DistrictQuiz /></LazyRoute></ProtectedRoute>} />
            
            {/* Premium features - lazy loaded */}
            <Route path="/ai-assistant" element={<ProtectedRoute><LazyRoute><AIAssistant /></LazyRoute></ProtectedRoute>} />
            <Route path="/advanced-analytics" element={<ProtectedRoute><LazyRoute><AdvancedAnalytics /></LazyRoute></ProtectedRoute>} />
            <Route path="/vip-mentorship" element={<ProtectedRoute><LazyRoute><VIPMentorship /></LazyRoute></ProtectedRoute>} />
            
            {/* Learning & Missions - lazy loaded */}
            <Route path="/lesson/:courseId/:lessonId" element={<ProtectedRoute><LazyRoute><Lesson /></LazyRoute></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><LazyRoute><Missions /></LazyRoute></ProtectedRoute>} />
            <Route path="/loot-boxes" element={<ProtectedRoute><LazyRoute><LootBoxes /></LazyRoute></ProtectedRoute>} />
            <Route path="/streak-rewards" element={<ProtectedRoute><LazyRoute><StreakRewards /></LazyRoute></ProtectedRoute>} />
            
            {/* Settings & Utils - lazy loaded */}
            <Route path="/settings" element={<ProtectedRoute><LazyRoute><Settings /></LazyRoute></ProtectedRoute>} />
            
            {/* Admin routes - lazy loaded (heaviest components) */}
            <Route path="/admin" element={<ProtectedRoute><LazyRoute><AdminDashboard /></LazyRoute></ProtectedRoute>} />
            <Route path="/admin/reset-password" element={<LazyRoute><AdminPasswordReset /></LazyRoute>} />
            <Route path="/admin/bots" element={<ProtectedRoute><LazyRoute><BotAdmin /></LazyRoute></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><LazyRoute><AdminUsers /></LazyRoute></ProtectedRoute>} />
            <Route path="/admin/quiz/questions" element={<ProtectedRoute><LazyRoute><AdminQuestions /></LazyRoute></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><LazyRoute><AdminSettings /></LazyRoute></ProtectedRoute>} />
            <Route path="/admin/sponsors" element={<ProtectedRoute><LazyRoute><SponsorAdmin /></LazyRoute></ProtectedRoute>} />
            <Route path="/admin/tournaments" element={<ProtectedRoute><LazyRoute><AdminTournaments /></LazyRoute></ProtectedRoute>} />
            
            {/* 404 - no lazy loading */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
