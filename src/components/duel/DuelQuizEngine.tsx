import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularTimer } from "@/components/duels/circular-timer";
import { ArrowLeft, Trophy, Clock, Target, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdaptiveQuizEngine } from '@/hooks/use-adaptive-quiz-engine';
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { useAdvancedQuizAudio } from "@/hooks/use-advanced-quiz-audio";
import { useCustomSounds } from "@/hooks/use-custom-sounds";
import { useI18n } from "@/hooks/use-i18n";
import { useQuizStreak } from "@/hooks/use-quiz-streak";
import { BeetzAnimation } from "../features/quiz/beetz-animation";
import { StreakAnimation } from "../features/quiz/streak-animation";
import { QuizBTZCard } from "../features/quiz/quiz-btz-card";
import { AdaptiveQuizIndicator } from "@/components/quiz/adaptive-quiz-indicator";
import { QuizDebugPanel } from "@/components/quiz/quiz-debug-panel";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shared/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import victoryImage from "@/assets/victory-celebration.png";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { resolveAvatarImage } from "@/lib/avatar-utils";

interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface DuelQuizEngineProps {
  duelId?: string;
  onComplete?: (results: any) => void;
}

interface DuelData {
  id: string;
  status: string;
  topic: string;
  bet_amount: number;
  player1_score: number;
  player2_score: number;
  current_question: number;
  questions: any;
  player1_id: string;
  player2_id: string;
  player1?: {
    id: string;
    nickname: string;
    level: number;
    profile_image_url?: string;
    current_avatar_id?: string;
    avatars?: any;
  };
  player2?: {
    id: string;
    nickname: string;
    level: number;
    profile_image_url?: string;
    current_avatar_id?: string;
    avatars?: any;
  };
}

export function DuelQuizEngine({
  duelId,
  onComplete
}: DuelQuizEngineProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);
  const [debugVisible, setDebugVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { playCountdownSound } = useCustomSounds();
  const isMobile = useIsMobile();

  // Check if this is a test duel ID
  const isTestDuel = duelId?.startsWith('test-') || duelId === 'test-123';

  // Load duel data
  const { data: duelData, isLoading: duelLoading, error: duelError } = useQuery({
    queryKey: ['duel', duelId],
    queryFn: async (): Promise<DuelData> => {
      if (!duelId) throw new Error('Duel ID is required');
      
      // Return mock data for test duels
      if (isTestDuel) {
        console.log('🧪 [DUEL] Using mock data for test duel:', duelId);
        return {
          id: duelId,
          status: 'active',
          topic: 'financas',
          bet_amount: 100,
          player1_score: 0,
          player2_score: 0,
          current_question: 0,
          questions: [],
          player1_id: 'test-player1-id',
          player2_id: 'test-player2-id',
          player1: {
            id: 'test-player1-id',
            nickname: 'Você',
            level: 5,
            profile_image_url: '/avatars/the-satoshi.jpg',
          },
          player2: {
            id: 'test-player2-id', 
            nickname: 'Bot Teste',
            level: 3,
            profile_image_url: '/avatars/bitcoin-wizard.jpg',
          }
        };
      }
      
      // Fetch real data for actual duels
      const { data, error } = await supabase
        .from('casino_duels')
        .select(`
          *,
          player1:profiles!casino_duels_player1_id_fkey (
            id, nickname, level, profile_image_url, current_avatar_id,
            avatars:avatars!current_avatar_id (name, image_url)
          ),
          player2:profiles!casino_duels_player2_id_fkey (
            id, nickname, level, profile_image_url, current_avatar_id,
            avatars:avatars!current_avatar_id (name, image_url)
          )
        `)
        .eq('id', duelId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!duelId
  });

  // Map duel topic to quiz category
  const getQuizCategory = (topic: string) => {
    const topicMap: Record<string, string> = {
      'financas': 'Finanças do Dia a Dia',
      'cripto': 'Cripto',
      'abc_financas': 'ABC das Finanças',
      'investimentos': 'ABC das Finanças',
      'educacao': 'ABC das Finanças',
      'tech': 'ABC das Finanças',
      'imoveis': 'Finanças do Dia a Dia',
      'internacional': 'ABC das Finanças'
    };
    return topicMap[topic] || 'Finanças do Dia a Dia';
  };

  // 🚀 NOVO SISTEMA ADAPTATIVO - Baseado no Quiz Solo
  const adaptiveEngine = useAdaptiveQuizEngine({
    mode: 'duel',
    category: duelData ? getQuizCategory(duelData.topic) : undefined,
    difficulty: 'medio', // Default difficulty for duels
    questionsCount: 5, // Standard duel question count
    enableDifficultyAdjustment: false, // Keep consistent difficulty in duels
    enableRandomization: true // Always randomize
  });
  
  const {
    streak,
    totalBTZ,
    currentMultiplier,
    showBeetzAnimation,
    showStreakAnimation,
    currentQuestion: currentQuestionText,
    currentCorrectAnswer,
    currentExplanation,
    earnedBTZ,
    handleCorrectAnswer,
    handleWrongAnswer,
    hideBeetzAnimation,
    hideStreakAnimation,
    resetGamification,
    getQuizCompletion
  } = useQuizGamification();

  const { } = useAdvancedQuizAudio();
  const { t } = useI18n();
  const { updateStreakAfterQuiz } = useQuizStreak();

  // Aliases for compatibility with existing code
  const questions = adaptiveEngine.session?.questions || [];
  const currentIndex = adaptiveEngine.session?.currentIndex || 0;
  const loading = adaptiveEngine.loading || duelLoading;

  // Initialize quiz when duel data is loaded
  useEffect(() => {
    if (duelData && user && !adaptiveEngine.session) {
      console.log('🚀 [DUEL] Inicializando duelo adaptativo:', {
        duelId: duelData.id,
        topic: duelData.topic,
        category: getQuizCategory(duelData.topic)
      });
      initializeDuel();
    }
  }, [duelData, user, adaptiveEngine.session]);

  // Set scores from duel data
  useEffect(() => {
    if (duelData && user) {
      const isPlayer1 = duelData.player1_id === user.id;
      setPlayerScore(isPlayer1 ? duelData.player1_score : duelData.player2_score);
      setOpponentScore(isPlayer1 ? duelData.player2_score : duelData.player1_score);
    }
  }, [duelData, user]);

  const initializeDuel = async () => {
    try {
      await adaptiveEngine.initializeQuizSession();
      console.log('✅ Duelo adaptativo inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar duelo:', error);
      toast({
        title: t('common.error'),
        description: 'Não foi possível carregar as questões do duelo.',
        variant: "destructive"
      });
    }
  };

  const handleContinue = () => {
    console.log('🔄 handleContinue called');
    const hasNext = adaptiveEngine.nextQuestion();
    
    if (hasNext) {
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(30);
    } else {
      handleDuelComplete();
    }
  };

  const handleTimeUp = async () => {
    const question = adaptiveEngine.currentQuestion;
    if (!question) return;
    
    setShowAnswer(true);
    setShowTimeoutModal(true);
    
    const answeredQuestion = {
      questionId: question.id,
      selectedAnswer: selectedAnswer || 'timeout',
      isCorrect: false,
      timeSpent: 30
    };
    
    setAnsweredQuestions(prev => [...prev, answeredQuestion]);
    
    // Process with adaptive system
    await adaptiveEngine.processAnswer(selectedAnswer || 'timeout', 30);
    await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
  };

  const handleOptionSelect = (option: string) => {
    if (showAnswer || isSubmitting) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || showAnswer || isSubmitting || !duelData) return;

    const question = adaptiveEngine.currentQuestion;
    if (!question) return;

    setIsSubmitting(true);
    const isCorrect = selectedAnswer === question.correct_answer;
    const responseTime = 30 - timeLeft;
    
    console.log("🎯 Duel Submit:", { isCorrect, selectedAnswer, correctAnswer: question.correct_answer });
    
    setShowAnswer(true);
    
    // Process with adaptive system
    await adaptiveEngine.processAnswer(selectedAnswer, responseTime * 1000);
    
    // Update scores locally and in database
    try {
      if (isTestDuel) {
        // For test duels, just update locally
        if (isCorrect) {
          setPlayerScore(prev => prev + 1);
          await handleCorrectAnswer();
        } else {
          await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
        }
      } else {
        // For real duels, update in database
        const isPlayer1 = duelData.player1_id === user?.id;
        const newScore = isCorrect ? (isPlayer1 ? duelData.player1_score + 1 : duelData.player2_score + 1) : (isPlayer1 ? duelData.player1_score : duelData.player2_score);
        
        // Update duel in database
        const updateData = isPlayer1 
          ? { player1_score: newScore, current_question: currentIndex + 1 }
          : { player2_score: newScore, current_question: currentIndex + 1 };

        const { error } = await supabase
          .from('casino_duels')
          .update(updateData)
          .eq('id', duelData.id);

        if (error) {
          console.error('❌ Erro ao atualizar duelo:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar duelo. Tente novamente.",
            variant: "destructive"
          });
        } else {
          // Update local scores
          if (isCorrect) {
            setPlayerScore(newScore);
            await handleCorrectAnswer();
          } else {
            await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
          }
        }
      }

      const answeredQuestion = {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        timeSpent: responseTime
      };

      setAnsweredQuestions(prev => [...prev, answeredQuestion]);
      
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar resposta. Tente novamente.",
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
    
    // Continue automatically after correct answer, or wait for manual continue after wrong answer
    if (isCorrect) {
      setTimeout(() => {
        handleContinue();
      }, 1500);
    }
  };

  const handleDuelComplete = async () => {
    try {
      console.log('🏁 [DUEL] Finalizando duelo:', { playerScore, opponentScore });
      
      if (!isTestDuel && duelData) {
        // Complete real duel using the working edge function
        const { error } = await supabase.functions.invoke('complete-casino-duel', {
          body: { duelId: duelData.id }
        });

        if (error) {
          console.error('❌ Erro ao finalizar duelo:', error);
        }
      }

      const results = await getQuizCompletion(playerScore, questions.length);
      const percentage = Math.round((playerScore / questions.length) * 100);
      const playerWon = playerScore > opponentScore;
      const isDraw = playerScore === opponentScore;
      
      setShowResults(true);
      
      if (onComplete) {
        onComplete({
          playerScore,
          opponentScore,
          totalQuestions: questions.length,
          percentage,
          playerWon,
          isDraw,
          mode: 'duel',
          ...results
        });
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar duelo:', error);
      navigate('/dashboard');
    }
  };

  const handleTimeoutContinue = () => {
    setShowTimeoutModal(false);
    handleContinue();
  };

  const handleQuitDuel = async () => {
    if (!duelData) return;
    
    try {
      if (isTestDuel) {
        console.log('🧪 [DUEL] Simulando abandono de duelo teste');
        toast({
          title: "Duelo Abandonado (Teste)",
          description: `Você abandonou o duelo de teste`,
          variant: "destructive"
        });
      } else {
        // Real duel abandonment would need an edge function
        toast({
          title: "Duelo Abandonado",
          description: `Você abandonou o duelo e perdeu ${duelData.bet_amount} BTZ`,
          variant: "destructive"
        });
      }
      
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      console.error('❌ Erro ao abandonar duelo:', error);
      toast({
        title: "Erro ao Abandonar",
        description: "Não foi possível abandonar o duelo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Resolve avatar URLs using the centralized avatar system
  const getAvatarUrl = (profile: any) => {
    if (!profile) return '/avatars/the-satoshi.jpg';
    
    const avatarData = {
      profile_image_url: profile?.profile_image_url || null,
      current_avatar_id: profile?.current_avatar_id || null,
      avatars: profile?.avatars || null
    };
    
    const resolved = resolveAvatarImage(avatarData, profile?.nickname || 'User');
    return resolved.imageUrl;
  };

  if (duelError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Erro no Duelo</h1>
          <p className="text-muted-foreground mb-6">
            Não foi possível carregar os dados do duelo.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (loading || !duelData || !adaptiveEngine.session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">Carregando duelo...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((playerScore / questions.length) * 100);
    const playerWon = playerScore > opponentScore;
    const isDraw = playerScore === opponentScore;
    
    // Trigger confetti for victory
    if (playerWon) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          {/* Victory/Defeat Animation */}
          <div className="mb-6">
            <img 
              src={playerWon ? victoryImage : "/src/assets/failure-animation.png"}
              alt={playerWon ? "Vitória" : "Derrota"}
              className="h-32 w-32 mx-auto mb-4 object-contain rounded-full"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {playerWon ? '🏆 Vitória!' : isDraw ? '🤝 Empate!' : '😔 Derrota'}
          </h1>
          
          <div className="mb-6">
            <div className="flex justify-center items-center gap-4 text-2xl font-bold mb-2">
              <span className="text-primary">{playerScore}</span>
              <span className="text-muted-foreground">×</span>
              <span className="text-muted-foreground">{opponentScore}</span>
            </div>
            <p className="text-muted-foreground">
              {percentage}% de precisão
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full" 
              size="lg"
            >
              Voltar ao Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/duels')} 
              className="w-full"
            >
              Novo Duelo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sem questões disponíveis</h1>
          <p className="text-muted-foreground mb-6">
            Não conseguimos carregar questões para este duelo.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isPlayer1 = duelData?.player1_id === user?.id;
  const currentUserProfile = isPlayer1 ? duelData.player1 : duelData.player2;
  const opponentProfile = isPlayer1 ? duelData.player2 : duelData.player1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      {/* Header com informações do duelo */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* Esquerda: Botão Voltar */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuitDuel}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            
            {/* Centro: Informações do Duelo */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm sm:text-lg font-bold text-primary mb-1">
                <Users className="h-4 w-4" />
                Duelo {currentIndex + 1}/{questions.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {duelData.bet_amount} BTZ em jogo
              </div>
            </div>
            
            {/* Direita: Placar */}
            <div className="flex justify-end">
              <div className="text-center">
                <div className="text-sm font-bold">
                  <span className="text-primary">{playerScore}</span>
                  <span className="text-muted-foreground mx-1">×</span>
                  <span className="text-muted-foreground">{opponentScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Display */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          {/* Player */}
          <div className="flex items-center gap-3">
            <AvatarDisplayUniversal 
              src={getAvatarUrl(currentUserProfile)}
              nickname={currentUserProfile?.nickname || 'Você'}
              size="md"
            />
            <div>
              <div className="font-semibold text-sm">{currentUserProfile?.nickname || 'Você'}</div>
              <div className="text-xs text-primary font-bold">{playerScore} pontos</div>
            </div>
          </div>

          {/* VS */}
          <div className="text-2xl font-bold text-muted-foreground">VS</div>

          {/* Opponent */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-sm">{opponentProfile?.nickname || 'Oponente'}</div>
              <div className="text-xs text-muted-foreground font-bold">{opponentScore} pontos</div>
            </div>
            <AvatarDisplayUniversal 
              src={getAvatarUrl(opponentProfile)}
              nickname={opponentProfile?.nickname || 'Oponente'}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Main Quiz Content */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Timer and Progress */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
              <CircularTimer
                key={currentIndex}
                duration={30}
                isActive={!showAnswer && !loading && !isSubmitting}
                onTimeUp={handleTimeUp}
                onTick={(newTimeLeft) => setTimeLeft(newTimeLeft)}
                onCountdown={playCountdownSound}
                enableCountdownSound={true}
              />
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = showAnswer && option === currentQuestion.correct_answer;
                  const isWrong = showAnswer && isSelected && option !== currentQuestion.correct_answer;
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full text-left justify-start h-auto p-4 text-wrap whitespace-normal",
                        isCorrect && "bg-green-500 text-white border-green-500 hover:bg-green-600",
                        isWrong && "bg-red-500 text-white border-red-500 hover:bg-red-600",
                        !showAnswer && isSelected && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showAnswer || isSubmitting}
                    >
                      <span className="text-sm sm:text-base">{option}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!showAnswer ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
                className="flex-1 h-12"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Confirmar Resposta
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleContinue}
                className="flex-1 h-12"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
                Próxima Questão
              </Button>
            )}
          </div>

          {/* Answer Explanation */}
          {showAnswer && currentQuestion.explanation && (
            <Card className="mt-4 border-muted">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-sm">💡 Explicação:</h3>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Timeout Modal */}
      <AlertDialog open={showTimeoutModal} onOpenChange={setShowTimeoutModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Tempo Esgotado!
            </AlertDialogTitle>
            <AlertDialogDescription>
              O tempo para esta questão acabou. A resposta correta era: <strong>{currentQuestion?.correct_answer}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleTimeoutContinue}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Animations */}
      {showBeetzAnimation && (
        <BeetzAnimation 
          amount={earnedBTZ} 
          onComplete={hideBeetzAnimation} 
        />
      )}
      {showStreakAnimation && (
        <StreakAnimation 
          streak={streak} 
          onComplete={hideStreakAnimation} 
        />
      )}
    </div>
  );
}