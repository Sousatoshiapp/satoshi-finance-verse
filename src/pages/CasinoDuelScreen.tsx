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
  const { currentDuel, submitAnswer, loadDuelById, loading } = useCasinoDuels();
  const { profile } = useProfile();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  // Transform question to expected format if needed
  const currentQuestion: Question | null = (() => {
    if (!currentDuel?.questions?.[currentQuestionIndex]) {
      console.log('⚠️ CasinoDuelScreen: No question found at index:', currentQuestionIndex);
      return null;
    }
    
    const rawQuestion = currentDuel.questions[currentQuestionIndex];
    console.log('🔄 CasinoDuelScreen: Raw question data:', rawQuestion);
    
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

  // Load duel on component mount
  useEffect(() => {
    const loadDuel = async () => {
      if (duelId && !currentDuel) {
        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: Loading duel from URL:', duelId);
        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: Current profile:', profile?.id);
        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: loadDuelById function available:', !!loadDuelById);
        
        const duel = await loadDuelById(duelId);
        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: Loaded duel data:', !!duel);
        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: Questions in loaded duel:', duel?.questions?.length || 0);
        
        if (!duel) {
          console.log('💥💥💥 ULTRA CRITICAL CasinoDuelScreen: Duel not found, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }

        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: Duel questions array:', JSON.stringify(duel.questions, null, 2));

        // Verify user is part of this duel
        if (profile?.id && duel.player1_id !== profile.id && duel.player2_id !== profile.id) {
          console.log('💥💥💥 ULTRA CRITICAL CasinoDuelScreen: User not part of this duel, redirecting');
          console.log('👤 CasinoDuelScreen: Profile ID:', profile.id);
          console.log('🥊 CasinoDuelScreen: Player1 ID:', duel.player1_id);
          console.log('🥊 CasinoDuelScreen: Player2 ID:', duel.player2_id);
          navigate('/dashboard');
          return;
        }

        console.log('🚨🚨🚨 ULTRA CRITICAL CasinoDuelScreen: Duel loaded successfully and user verified');
      }
    };

    loadDuel();
  }, [duelId, currentDuel, loadDuelById, navigate, profile?.id]);

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

    // Update score if correct
    if (answer === currentQuestion.correct_answer) {
      setPlayerScore(prev => prev + 1);
    }

    // Simulate opponent score (for demo)
    if (Math.random() > 0.3) {
      setOpponentScore(prev => prev + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < (currentDuel?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setAnswered(false);
        setTimeLeft(30);
      } else {
        // Duel completed
        navigate(`/duel-result/${duelId}`);
      }
    }, 2000);
  };

  if (loading || !currentDuel) {
    console.log('🔄 CasinoDuelScreen: Loading state - loading:', loading, 'currentDuel:', !!currentDuel);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">
              {loading ? 'Carregando duelo...' : 'Processando dados do duelo...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
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

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-sm border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-white/20 bg-black/20 backdrop-blur-sm hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-pink-500 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Duelo em Andamento</h1>
              <p className="text-sm text-muted-foreground">
                Pergunta {currentQuestionIndex + 1} de {currentDuel.questions?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-400/30"
          animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
        >
          <Timer className="h-5 w-5 text-red-400" />
          <span className="font-bold text-red-300">{timeLeft}s</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Score Display */}
        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 items-center">
              {/* Player */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="font-bold text-white">Você</span>
                </div>
                <div className="text-3xl font-bold text-primary">{playerScore}</div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-primary to-pink-500 rounded-full inline-block">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">VS</p>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-amber-400" />
                  <span className="font-bold text-white">Oponente</span>
                </div>
                <div className="text-3xl font-bold text-amber-400">{opponentScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-white/10 bg-black/20 backdrop-blur-md">
            <CardContent className="p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(currentQuestion.options).map(([key, option]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: answered ? 1 : 1.02 }}
                      whileTap={{ scale: answered ? 1 : 0.98 }}
                      onClick={() => !answered && handleAnswerSubmit(key)}
                      disabled={answered}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
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
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
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
                        <span className="flex-1">{option}</span>
                        {answered && key === currentQuestion.correct_answer && (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {answered && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl"
                  >
                    <p className="text-blue-300 text-sm">
                      <strong>Explicação:</strong> {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Bar */}
        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="text-sm text-white">
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