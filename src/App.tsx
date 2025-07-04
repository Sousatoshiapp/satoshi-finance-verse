import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/game-mode" element={<GameMode />} />
          <Route path="/solo-quiz" element={<SoloQuiz />} />
          <Route path="/duel-quiz" element={<DuelQuiz />} />
          <Route path="/tournament-quiz" element={<TournamentQuiz />} />
          <Route path="/duels" element={<Duels />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/store" element={<Store />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/lesson/:courseId/:lessonId" element={<Lesson />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
