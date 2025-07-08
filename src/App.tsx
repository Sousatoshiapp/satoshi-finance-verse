import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import SoloQuiz from "./pages/SoloQuiz";
import DuelQuiz from "./pages/DuelQuiz";
import TournamentQuiz from "./pages/TournamentQuiz";
import TournamentQuizSpecific from "./pages/TournamentQuizSpecific";
import GameMode from "./pages/GameMode";
import Profile from "./pages/Profile";
import Levels from "./pages/Levels";
import Leaderboard from "./pages/Leaderboard";
import Store from "./pages/Store";
import Settings from "./pages/Settings";
import Lesson from "./pages/Lesson";
import Duels from "./pages/Duels";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import SatoshiCity from "./pages/SatoshiCity";
import DistrictDetail from "./pages/DistrictDetail";
import DistrictQuiz from "./pages/DistrictQuiz";
import Playground from "./pages/Playground";
import Auth from "./pages/Auth";
import Social from "./pages/Social";
import UserProfile from "./pages/UserProfile";
import FindOpponent from "./pages/FindOpponent";
import BeetzInfo from "./pages/BeetzInfo";
import EnhancedQuiz from "./pages/EnhancedQuiz";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import NotFound from "./pages/NotFound";
import AvatarDetail from "./pages/AvatarDetail";
import SkinDetail from "./pages/SkinDetail";
import BoostDetail from "./pages/BoostDetail";
import AccessoryDetail from "./pages/AccessoryDetail";
import Missions from "./pages/Missions";
import LootBoxes from "./pages/LootBoxes";
import SocialChallenges from "./pages/SocialChallenges";
import StreakRewards from "./pages/StreakRewards";
import Guilds from "./pages/Guilds";
import AIAssistant from "./pages/AIAssistant";
import SocialTrading from "./pages/SocialTrading";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import VIPMentorship from "./pages/VIPMentorship";
import WeeklyTournaments from "./pages/WeeklyTournaments";
import ChallengeDetail from "./pages/ChallengeDetail";
import BotAdmin from "./pages/BotAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminQuestions from "./pages/AdminQuestions";
import AdminPasswordReset from "./pages/AdminPasswordReset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
            <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/game-mode" element={<ProtectedRoute><GameMode /></ProtectedRoute>} />
            <Route path="/solo-quiz" element={<ProtectedRoute><SoloQuiz /></ProtectedRoute>} />
            <Route path="/duel-quiz" element={<ProtectedRoute><DuelQuiz /></ProtectedRoute>} />
            <Route path="/tournament-quiz" element={<ProtectedRoute><TournamentQuiz /></ProtectedRoute>} />
            <Route path="/tournament-quiz/:tournamentId" element={<ProtectedRoute><TournamentQuizSpecific /></ProtectedRoute>} />
            <Route path="/enhanced-quiz" element={<ProtectedRoute><EnhancedQuiz /></ProtectedRoute>} />
            <Route path="/duels" element={<ProtectedRoute><Duels /></ProtectedRoute>} />
            <Route path="/find-opponent" element={<ProtectedRoute><FindOpponent /></ProtectedRoute>} />
            <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
            <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
            <Route path="/satoshi-city" element={<ProtectedRoute><SatoshiCity /></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId" element={<ProtectedRoute><DistrictDetail /></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId/quiz" element={<ProtectedRoute><DistrictQuiz /></ProtectedRoute>} />
            <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/levels" element={<ProtectedRoute><Levels /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            <Route path="/avatar/:id" element={<ProtectedRoute><AvatarDetail /></ProtectedRoute>} />
            <Route path="/skin/:id" element={<ProtectedRoute><SkinDetail /></ProtectedRoute>} />
            <Route path="/boost/:id" element={<ProtectedRoute><BoostDetail /></ProtectedRoute>} />
            <Route path="/accessory/:id" element={<ProtectedRoute><AccessoryDetail /></ProtectedRoute>} />
            <Route path="/beetz-info" element={<ProtectedRoute><BeetzInfo /></ProtectedRoute>} />
            <Route path="/subscription-plans" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/lesson/:courseId/:lessonId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
            <Route path="/loot-boxes" element={<ProtectedRoute><LootBoxes /></ProtectedRoute>} />
            <Route path="/social-challenges" element={<ProtectedRoute><SocialChallenges /></ProtectedRoute>} />
            <Route path="/streak-rewards" element={<ProtectedRoute><StreakRewards /></ProtectedRoute>} />
            <Route path="/guilds" element={<ProtectedRoute><Guilds /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/social-trading" element={<ProtectedRoute><SocialTrading /></ProtectedRoute>} />
            <Route path="/advanced-analytics" element={<ProtectedRoute><AdvancedAnalytics /></ProtectedRoute>} />
            <Route path="/vip-mentorship" element={<ProtectedRoute><VIPMentorship /></ProtectedRoute>} />
            <Route path="/weekly-tournaments" element={<ProtectedRoute><WeeklyTournaments /></ProtectedRoute>} />
            <Route path="/challenge/:challengeId" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/reset-password" element={<AdminPasswordReset />} />
            <Route path="/admin/bots" element={<ProtectedRoute><BotAdmin /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/quiz/questions" element={<ProtectedRoute><AdminQuestions /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
