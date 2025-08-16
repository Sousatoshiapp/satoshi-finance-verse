import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularTimer } from "@/components/duels/circular-timer";
import { ArrowLeft, Trophy, Clock, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { resolveAvatarImage } from "@/lib/avatar-utils";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shared/ui/alert-dialog";

interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface SimpleDuelQuizEngineProps {
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
  questions: DuelQuestion[];
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

export function SimpleDuelQuizEngine({
  duelId,
  onComplete
}: SimpleDuelQuizEngineProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
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
        console.log('🧪 [SIMPLE DUEL] Using mock data for test duel:', duelId);
        
        // Generate mock questions
        const mockQuestions: DuelQuestion[] = [
          {
            id: 'q1',
            question: 'Qual é a taxa básica de juros do Brasil (Selic)?',
            options: ['10,75%', '11,25%', '12,00%', '9,50%'],
            correct_answer: '10,75%',
            explanation: 'A Selic é a taxa básica de juros da economia brasileira.',
            category: 'Finanças do Dia a Dia',
            difficulty: 'medio'
          },
          {
            id: 'q2',
            question: 'O que significa IPO no mercado financeiro?',
            options: ['Initial Public Offering', 'Investment Portfolio Overview', 'International Price Option', 'Individual Purchase Order'],
            correct_answer: 'Initial Public Offering',
            explanation: 'IPO significa Oferta Pública Inicial, quando uma empresa abre capital na bolsa.',
            category: 'ABC das Finanças',
            difficulty: 'medio'
          },
          {
            id: 'q3',
            question: 'Qual é o prazo mínimo para resgatar um CDB com liquidez diária?',
            options: ['1 dia', '30 dias', '90 dias', '180 dias'],
            correct_answer: '1 dia',
            explanation: 'CDBs com liquidez diária podem ser resgatados a qualquer momento.',
            category: 'ABC das Finanças',
            difficulty: 'facil'
          }
        ];

        return {
          id: duelId,
          status: 'active',
          topic: 'financas',
          bet_amount: 100,
          player1_score: 0,
          player2_score: 0,
          current_question: 0,
          questions: mockQuestions,
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
      
      // Parse questions if they are stored as JSON string or array
      let parsedQuestions: DuelQuestion[] = [];
      if (data && data.questions) {
        if (typeof data.questions === 'string') {
          parsedQuestions = JSON.parse(data.questions);
        } else if (Array.isArray(data.questions)) {
          parsedQuestions = data.questions as unknown as DuelQuestion[];
        }
      }
      
      return {
        ...data,
        questions: parsedQuestions
      } as DuelData;
    },
    enabled: !!duelId
  });

  // Initialize questions when duel data is loaded
  useEffect(() => {
    if (duelData && duelData.questions && Array.isArray(duelData.questions)) {
      console.log('📚 [SIMPLE DUEL] Loading questions:', duelData.questions.length);
      setQuestions(duelData.questions);
    }
  }, [duelData]);

  // Set scores from duel data
  useEffect(() => {
    if (duelData && user) {
      const isPlayer1 = duelData.player1_id === user.id;
      setPlayerScore(isPlayer1 ? duelData.player1_score : duelData.player2_score);
      setOpponentScore(isPlayer1 ? duelData.player2_score : duelData.player1_score);
      setCurrentIndex(duelData.current_question || 0);
    }
  }, [duelData, user]);

  const handleContinue = () => {
    console.log('🔄 [SIMPLE DUEL] handleContinue called');
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(30);
    } else {
      handleDuelComplete();
    }
  };

  const handleTimeUp = async () => {
    console.log('⏰ [SIMPLE DUEL] Time up!');
    setShowAnswer(true);
    setShowTimeoutModal(true);
  };

  const handleOptionSelect = (option: string) => {
    if (showAnswer || isSubmitting) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || showAnswer || isSubmitting || !duelData) return;

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setIsSubmitting(true);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const responseTime = 30 - timeLeft;
    
    console.log("🎯 [SIMPLE DUEL] Submit:", { isCorrect, selectedAnswer, correctAnswer: currentQuestion.correct_answer });
    
    setShowAnswer(true);
    
    // Update scores locally
    try {
      if (isTestDuel) {
        // For test duels, just update locally
        if (isCorrect) {
          setPlayerScore(prev => prev + 1);
          toast({
            title: "Correto! ✅",
            description: "Você ganhou 1 ponto!",
            variant: "default"
          });
        } else {
          toast({
            title: "Incorreto ❌",
            description: `A resposta correta era: ${currentQuestion.correct_answer}`,
            variant: "destructive"
          });
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
            toast({
              title: "Correto! ✅",
              description: "Você ganhou 1 ponto!",
              variant: "default"
            });
          } else {
            toast({
              title: "Incorreto ❌",
              description: `A resposta correta era: ${currentQuestion.correct_answer}`,
              variant: "destructive"
            });
          }
        }
      }
      
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
      console.log('🏁 [SIMPLE DUEL] Finalizando duelo:', { playerScore, opponentScore });
      
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
          mode: 'duel'
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
      toast({
        title: "Duelo Abandonado",
        description: `Você abandonou o duelo`,
        variant: "destructive"
      });
      
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

  if (duelLoading || !duelData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">Carregando duelo simples...</p>
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
                Duelo Simples {currentIndex + 1}/{questions.length}
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
              avatarUrl={getAvatarUrl(currentUserProfile)}
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
              avatarUrl={getAvatarUrl(opponentProfile)}
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
                isActive={!showAnswer && !duelLoading && !isSubmitting}
                onTimeUp={handleTimeUp}
                onTick={(newTimeLeft) => setTimeLeft(newTimeLeft)}
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
    </div>
  );
}