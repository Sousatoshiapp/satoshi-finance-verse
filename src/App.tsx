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
import Leaderboard from "./pages/Leaderboard";
import Store from "./pages/Store";
import Settings from "./pages/Settings";
import Lesson from "./pages/Lesson";
import Duels from "./pages/Duels";
import SatoshiCity from "./pages/SatoshiCity";
import DistrictDetail from "./pages/DistrictDetail";
import DistrictQuiz from "./pages/DistrictQuiz";
import Auth from "./pages/Auth";
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
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/game-mode" element={<ProtectedRoute><GameMode /></ProtectedRoute>} />
            <Route path="/solo-quiz" element={<ProtectedRoute><SoloQuiz /></ProtectedRoute>} />
            <Route path="/duel-quiz" element={<ProtectedRoute><DuelQuiz /></ProtectedRoute>} />
            <Route path="/tournament-quiz" element={<ProtectedRoute><TournamentQuiz /></ProtectedRoute>} />
            <Route path="/duels" element={<ProtectedRoute><Duels /></ProtectedRoute>} />
            <Route path="/satoshi-city" element={<ProtectedRoute><SatoshiCity /></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId" element={<ProtectedRoute><DistrictDetail /></ProtectedRoute>} />
            <Route path="/satoshi-city/district/:districtId/quiz" element={<ProtectedRoute><DistrictQuiz /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
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
