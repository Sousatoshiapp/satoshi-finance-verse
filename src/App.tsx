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
import GameMode from "./pages/GameMode";
import Profile from "./pages/Profile";
import Levels from "./pages/Levels";
import Leaderboard from "./pages/Leaderboard";
import Store from "./pages/Store";
import Settings from "./pages/Settings";
import Lesson from "./pages/Lesson";
import Duels from "./pages/Duels";
import Tournaments from "./pages/Tournaments";
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
            <Route path="/enhanced-quiz" element={<ProtectedRoute><EnhancedQuiz /></ProtectedRoute>} />
            <Route path="/duels" element={<ProtectedRoute><Duels /></ProtectedRoute>} />
            <Route path="/find-opponent" element={<ProtectedRoute><FindOpponent /></ProtectedRoute>} />
            <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
            <Route path="/satoshi-city" element={<ProtectedRoute><SatoshiCity /></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId" element={<ProtectedRoute><DistrictDetail /></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId/quiz" element={<ProtectedRoute><DistrictQuiz /></ProtectedRoute>} />
            <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/levels" element={<ProtectedRoute><Levels /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            <Route path="/beetz-info" element={<ProtectedRoute><BeetzInfo /></ProtectedRoute>} />
            <Route path="/subscription-plans" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/lesson/:courseId/:lessonId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
