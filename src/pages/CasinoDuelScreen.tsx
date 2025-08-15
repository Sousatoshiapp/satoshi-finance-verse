import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Zap, 
  User, 
  Users,
  Crown,
  Timer,
  CheckCircle2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCasinoDuels } from "@/hooks/use-casino-duels";
import { useProfile } from "@/hooks/use-profile";

interface Question {
  id: string;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
}

export default function CasinoDuelScreen() {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const { currentDuel, submitAnswer, loadDuelById, loading, completeDuel } = useCasinoDuels();
  const { profile } = useProfile();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);

  // Transform question to expected format if needed
  const currentQuestion: Question | null = (() => {
    // Early return if essential data is missing
    if (!currentDuel || loading) {
      return null;
    }

    const questions = currentDuel?.questions;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('⚠️ CasinoDuelScreen: No questions array found');
      return null;
    }

    if (!questions[currentQuestionIndex]) {
      console.log('⚠️ CasinoDuelScreen: No question found at index:', currentQuestionIndex);
      return null;
    }
    
    const rawQuestion = questions[currentQuestionIndex];
    
    // Handle both formats: RPC format and expected format
    if (rawQuestion.options && Array.isArray(rawQuestion.options)) {
      // RPC format: options is an array
      const transformedQuestion = {
        id: rawQuestion.id,
        question: rawQuestion.question,
        options: {
          a: rawQuestion.options[0] || '',
          b: rawQuestion.options[1] || '',
          c: rawQuestion.options[2] || '',
          d: rawQuestion.options[3] || ''
        },
        correct_answer: rawQuestion.correct_answer,
        explanation: rawQuestion.explanation
      };
      console.log('✅ CasinoDuelScreen: Transformed question:', transformedQuestion);
      return transformedQuestion;
    } else if (rawQuestion.options && typeof rawQuestion.options === 'object') {
      // Already in expected format
      console.log('✅ CasinoDuelScreen: Question already in correct format');
      return rawQuestion as Question;
    }
    
    console.log('❌ CasinoDuelScreen: Invalid question format:', rawQuestion);
    return null;
  })();

  // Load duel effect - ALWAYS runs when duelId changes
  useEffect(() => {
    console.log('🔥🔥🔥 CasinoDuelScreen: Component mounted/duelId changed');
    console.log('🔥🔥🔥 CasinoDuelScreen: duelId from URL:', duelId);
    console.log('🔥🔥🔥 CasinoDuelScreen: currentDuel exists:', !!currentDuel);
    console.log('🔥🔥🔥 CasinoDuelScreen: currentDuel.id:', currentDuel?.id);
    console.log('🔥🔥🔥 CasinoDuelScreen: loading state:', loading);
    console.log('🔥🔥🔥 CasinoDuelScreen: loadDuelById function available:', !!loadDuelById);
    
    if (!duelId) {
      console.log('❌ CasinoDuelScreen: No duelId in URL, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    if (!loadDuelById) {
      console.log('❌ CasinoDuelScreen: loadDuelById function not available');
      return;
    }

    // ALWAYS load the duel, even if we have one (to ensure fresh data)
    const loadDuel = async () => {
      console.log('🚀 CasinoDuelScreen: CALLING loadDuelById for:', duelId);
      
      try {
        const duel = await loadDuelById(duelId);
        console.log('✅ CasinoDuelScreen: loadDuelById returned:', !!duel);
        console.log('✅ CasinoDuelScreen: Duel questions count:', duel?.questions?.length || 0);
        console.log('✅ CasinoDuelScreen: Duel status:', duel?.status);
        console.log('✅ CasinoDuelScreen: Player1 ID:', duel?.player1_id);
        console.log('✅ CasinoDuelScreen: Player2 ID:', duel?.player2_id);
        
        if (!duel) {
          console.log('❌ CasinoDuelScreen: Duel not found, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }

        console.log('🎉 CasinoDuelScreen: Duel loaded successfully');
      } catch (error) {
        console.error('❌ CasinoDuelScreen: Error loading duel:', error);
        navigate('/dashboard');
      }
    };

    // Always call loadDuel
    loadDuel();
  }, [duelId, loadDuelById, navigate]); // Removed currentDuel from dependencies

  // Separate effect to verify user access and check if duel is already completed
  useEffect(() => {
    // Only run access verification if we have both duel and profile
    if (currentDuel && profile?.id) {
      // Verify user is part of this duel
      if (currentDuel.player1_id !== profile.id && currentDuel.player2_id !== profile.id) {
        console.log('💥💥💥 ULTRA CRITICAL CasinoDuelScreen: User not part of this duel, redirecting');
        console.log('👤 CasinoDuelScreen: Profile ID:', profile.id);
        console.log('🥊 CasinoDuelScreen: Player1 ID:', currentDuel.player1_id);
        console.log('🥊 CasinoDuelScreen: Player2 ID:', currentDuel.player2_id);
        navigate('/dashboard');
        return;
      }
      console.log('✅ CasinoDuelScreen: User access verified');
      
      // Check if duel is already completed
      if (currentDuel.status === 'completed') {
        console.log('🏁 CasinoDuelScreen: Duel already completed, navigating to result screen');
        console.log('🏆 CasinoDuelScreen: Final scores - Player1:', currentDuel.player1_score, 'Player2:', currentDuel.player2_score);
        navigate(`/duel-result/${duelId}`, { replace: true });
        return;
      }
      
      console.log('🎮 CasinoDuelScreen: Duel status:', currentDuel.status);
    } else if (currentDuel && !profile) {
      console.log('⚠️ CasinoDuelScreen: Duel loaded but profile still loading - allowing access temporarily');
      
      // Still check if duel is completed even without profile verification
      if (currentDuel.status === 'completed') {
        console.log('🏁 CasinoDuelScreen: Duel already completed (without profile check)');
        navigate(`/duel-result/${duelId}`, { replace: true });
        return;
      }
    }
  }, [currentDuel, profile?.id, navigate, duelId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleAnswerSubmit(null);
    }
  }, [timeLeft, answered]);

  const handleAnswerSubmit = async (answer: string | null) => {
    if (answered || !currentQuestion || !duelId) return;

    setAnswered(true);
    setSelectedAnswer(answer);

    const responseTime = (30 - timeLeft) * 1000;
    
    if (answer) {
      await submitAnswer(duelId, currentQuestionIndex, answer, responseTime);
    }

    // Move to next question after delay
    setTimeout(async () => {
      if (currentQuestionIndex < (currentDuel?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setAnswered(false);
        setTimeLeft(30);
      } else {
        // Duel completed - finalize and navigate
        await completeDuel(duelId);
        navigate(`/duel-result/${duelId}`);
      }
    }, 2000);
  };

  // Debug logs for loading states
  console.log('🔄 CasinoDuelScreen: Current state check:');
  console.log('  - loading (useCasinoDuels):', loading);
  console.log('  - currentDuel exists:', !!currentDuel);
  console.log('  - currentDuel.id:', currentDuel?.id);
  console.log('  - profile exists:', !!profile);
  console.log('  - profile.id:', profile?.id);
  console.log('  - duelId from URL:', duelId);

  // Identify if current user is player1 or player2 (with fallback for profile loading)
  const isPlayer1 = profile?.id === currentDuel?.player1_id;
  const currentUserScore = isPlayer1 ? currentDuel?.player1_score : currentDuel?.player2_score;
  const opponentScore = isPlayer1 ? currentDuel?.player2_score : currentDuel?.player1_score;
  const opponentProfile = isPlayer1 ? currentDuel?.player2_profile : currentDuel?.player1_profile;

  console.log('👤 CasinoDuelScreen: User role identification:');
  console.log('  - isPlayer1:', isPlayer1);
  console.log('  - currentUserScore:', currentUserScore);
  console.log('  - opponentScore:', opponentScore);
  console.log('  - opponentProfile:', opponentProfile?.nickname);

  // If profile is not loaded yet but we have duel data, continue with fallback
  const shouldShowFallback = !profile && currentDuel;
  if (shouldShowFallback) {
    console.log('⚠️ CasinoDuelScreen: Using fallback display while profile loads');
  }

  // Show loading only if actually loading duels or no duel data
  if (loading) {
    console.log('🔄 CasinoDuelScreen: Showing loading - useCasinoDuels is loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">Carregando duelo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no duel data after loading is complete
  if (!currentDuel) {
    console.log('❌ CasinoDuelScreen: No duel data after loading complete');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md p-8">
          <CardContent className="text-center">
            <p className="text-white mb-4">Duelo não encontrado</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary/80"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Continue rendering even if profile is still loading (with fallback)
  if (!profile) {
    console.log('⚠️ CasinoDuelScreen: Profile still loading, using fallback');
  }

  if (!currentQuestion) {
    console.log('❌ CasinoDuelScreen: No current question available');
    console.log('📋 CasinoDuelScreen: Questions array:', currentDuel?.questions);
    console.log('📍 CasinoDuelScreen: Question index:', currentQuestionIndex);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md p-8">
          <CardContent className="text-center">
            <p className="text-white mb-4">Erro ao carregar pergunta do duelo</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary/80"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

        {/* Header - Mobile Optimized */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-3 md:p-6 backdrop-blur-sm border-b border-white/10"
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-white/20 bg-black/20 backdrop-blur-sm hover:bg-white/10 h-8 w-8 p-0 md:h-10 md:w-auto md:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-br from-primary to-pink-500 rounded-lg md:rounded-xl">
              <Target className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs md:text-sm text-muted-foreground">
                Pergunta {currentQuestionIndex + 1} de {currentDuel.questions?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Timer - Mobile Optimized */}
        <motion.div 
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-400/30"
          animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
        >
          <Timer className="h-3 w-3 md:h-5 md:w-5 text-red-400" />
          <span className="font-bold text-red-300 text-sm md:text-base">{timeLeft}s</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-3 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Score Display - Mobile Optimized */}
        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardContent className="p-3 md:p-6">
            <div className="grid grid-cols-3 gap-3 md:gap-6 items-center">
              {/* Player */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <User className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                  <span className="font-bold text-white text-xs md:text-base">Você</span>
                </div>
                <div className="text-xl md:text-3xl font-bold text-primary">{currentUserScore}</div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="p-2 md:p-3 bg-gradient-to-br from-primary to-pink-500 rounded-full inline-block">
                  <Zap className="h-3 w-3 md:h-6 md:w-6 text-white" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">VS</p>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Users className="h-3 w-3 md:h-5 md:w-5 text-amber-400" />
                  <span className="font-bold text-white text-xs md:text-base">
                    {opponentProfile?.nickname || 'Oponente'}
                  </span>
                </div>
                <div className="text-xl md:text-3xl font-bold text-amber-400">{opponentScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card - Mobile Optimized */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-white/10 bg-black/20 backdrop-blur-md">
            <CardContent className="p-4 md:p-8">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg md:text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>

                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {Object.entries(currentQuestion.options).map(([key, option]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: answered ? 1 : 1.02 }}
                      whileTap={{ scale: answered ? 1 : 0.98 }}
                      onClick={() => !answered && handleAnswerSubmit(key)}
                      disabled={answered}
                      className={`p-3 md:p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                        answered
                          ? key === currentQuestion.correct_answer
                            ? 'border-green-400 bg-green-500/20 text-green-300'
                            : key === selectedAnswer
                            ? 'border-red-400 bg-red-500/20 text-red-300'
                            : 'border-white/10 bg-white/5 text-white/60'
                          : selectedAnswer === key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/20 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm md:text-base ${
                          answered
                            ? key === currentQuestion.correct_answer
                              ? 'border-green-400 bg-green-500/20 text-green-300'
                              : key === selectedAnswer
                              ? 'border-red-400 bg-red-500/20 text-red-300'
                              : 'border-white/30 text-white/60'
                            : 'border-current'
                        }`}>
                          {key.toUpperCase()}
                        </div>
                        <span className="flex-1 text-sm md:text-base">{option}</span>
                        {answered && key === currentQuestion.correct_answer && (
                          <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {answered && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 md:p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl"
                  >
                    <p className="text-blue-300 text-xs md:text-sm">
                      <strong>Explicação:</strong> {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Bar - Mobile Optimized */}
        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm text-muted-foreground">Progresso</span>
              <span className="text-xs md:text-sm text-white">
                {currentQuestionIndex + 1} / {currentDuel.questions?.length || 0}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((currentQuestionIndex + 1) / (currentDuel.questions?.length || 1)) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}