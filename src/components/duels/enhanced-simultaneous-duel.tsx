import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Trophy, Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { CircularTimer } from "./circular-timer";
import { EnhancedDuelInterface } from "./enhanced-duel-interface";
import { motion } from "framer-motion";
import { IconSystem } from "@/components/icons/icon-system";

interface EnhancedSimultaneousDuelProps {
  duel?: any;
  onDuelEnd?: (result: { 
    winner: boolean, 
    score: number, 
    opponentScore: number,
    playerAnswers?: any[],
    questions?: any[]
  }) => void;
}

function EnhancedSimultaneousDuel({ duel: propDuel, onDuelEnd }: EnhancedSimultaneousDuelProps) {
  const { duelId: paramDuelId } = useParams();
  const navigate = useNavigate();
  const [duel, setDuel] = useState(propDuel);
  const [isLoadingDuel, setIsLoadingDuel] = useState(!propDuel);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [answerResults, setAnswerResults] = useState<Map<number, { answerId: string, isCorrect: boolean }>>(new Map());
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [player1Profile, setPlayer1Profile] = useState<any>(null);
  const [player2Profile, setPlayer2Profile] = useState<any>(null);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gamePhase, setGamePhase] = useState<'playing' | 'finished'>('playing');
  const [isWaitingForOpponent] = useState(false);
  const [playerAnswers] = useState<any[]>([]);
  const subscriptionRef = useRef<any>(null);
  const { toast } = useToast();

  const loadDuelData = async (duelId: string) => {
    try {
      const { data: duelData, error } = await supabase
        .from('duels')
        .select(`
          *,
          player1:profiles!duels_player1_id_fkey(
            id, nickname, level, xp,
            avatars(name, image_url)
          ),
          player2:profiles!duels_player2_id_fkey(
            id, nickname, level, xp,
            avatars(name, image_url)
          )
        `)
        .eq('id', duelId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error loading duel data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o duelo",
          variant: "destructive"
        });
        navigate('/duels');
        return;
      }

      if (duelData) {
        const formattedDuel = {
          ...duelData,
          questions: Array.isArray(duelData.questions) ? 
            duelData.questions : 
            JSON.parse(duelData.questions as string)
        };
        setDuel(formattedDuel);
        setIsLoadingDuel(false);
      }
    } catch (error) {
      console.error('Error in loadDuelData:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do duelo",
        variant: "destructive"
      });
      navigate('/duels');
    }
  };

  useEffect(() => {
    if (!propDuel && paramDuelId) {
      loadDuelData(paramDuelId);
    }
  }, [paramDuelId, propDuel]);

  useEffect(() => {
    if (duel) {
      loadProfiles();
      setupRealtimeSubscription();
    }
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [duel]);

  useEffect(() => {
    // Start timer for current question if not answered
    if (!answeredQuestions.has(currentQuestion) && !isFinished) {
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  }, [currentQuestion, answeredQuestions, isFinished]);

  const setupRealtimeSubscription = () => {
    subscriptionRef.current = supabase
      .channel('duel-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${duel?.id}`
        },
        handleDuelUpdate
      )
      .subscribe();
  };

  const handleDuelUpdate = (payload: any) => {
    const updatedDuel = payload.new;
    
    if (updatedDuel.status === 'finished') {
      handleDuelFinished(updatedDuel);
    } else {
      updateOpponentProgress(updatedDuel);
    }
  };

  const handleDuelFinished = (updatedDuel: any) => {
    setIsFinished(true);
    setIsTimerActive(false);
    
    const isWinner = updatedDuel.winner_id === currentProfile?.id;
    const finalMyScore = currentProfile?.id === updatedDuel.player1_id ? 
      updatedDuel.player1_score : updatedDuel.player2_score;
    const finalOpponentScore = currentProfile?.id === updatedDuel.player1_id ? 
      updatedDuel.player2_score : updatedDuel.player1_score;
    
    setMyScore(finalMyScore || 0);
    setOpponentScore(finalOpponentScore || 0);
    setShowResult(true);
    
    // Show final result and navigate back
    setTimeout(() => {
      if (onDuelEnd) {
        onDuelEnd({
          winner: isWinner,
          score: finalMyScore || 0,
          opponentScore: finalOpponentScore || 0,
          playerAnswers,
          questions: duel?.questions || []
        });
      } else {
        navigate('/duels');
      }
    }, 3000);
  };

  const updateOpponentProgress = (updatedDuel: any) => {
    if (!currentProfile) return;
    
    const isPlayer1 = currentProfile.id === updatedDuel.player1_id;
    const opponentCurrentQuestion = isPlayer1 ? 
      updatedDuel.player2_current_question : updatedDuel.player1_current_question;
    const opponentCurrentScore = isPlayer1 ? 
      updatedDuel.player2_score : updatedDuel.player1_score;
    
    setOpponentProgress(opponentCurrentQuestion - 1);
    setOpponentScore(opponentCurrentScore || 0);
    
    // Update my score if it changed
    const myCurrentScore = isPlayer1 ? 
      updatedDuel.player1_score : updatedDuel.player2_score;
    setMyScore(myCurrentScore || 0);
  };

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: player1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', duel.player1_id)
        .single();

      const { data: player2 } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', duel.player2_id)
        .single();

      setCurrentProfile(currentUserProfile);
      setPlayer1Profile(player1);
      setPlayer2Profile(player2);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (answeredQuestions.has(currentQuestion) || gamePhase !== 'playing') return;
    
    setSelectedAnswer(optionId);
    setIsTimerActive(false);
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: duel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: optionId,
        p_is_timeout: false
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        // Store result for visual feedback
        setAnswerResults(prev => new Map(prev.set(currentQuestion, {
          answerId: optionId,
          isCorrect: result.isCorrect
        })));
        
        setAnsweredQuestions(prev => new Set(prev.add(currentQuestion)));
        setMyScore(result.newScore);
        
        // Avançar imediatamente - sistema simultâneo
        setTimeout(() => {
          if (currentQuestion < duel.questions.length) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setIsTimerActive(true);
          } else {
            setGamePhase('finished');
            setIsFinished(true);
            setShowResult(true);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "❌ Erro ao enviar resposta",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (answeredQuestions.has(currentQuestion) || isFinished) return;
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || answeredQuestions.has(currentQuestion)) return;
    handleAnswer(selectedAnswer);
  };

  const handleSkipQuestion = async () => {
    if (answeredQuestions.has(currentQuestion) || isFinished) return;
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: duel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: null,
        p_is_timeout: true
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        setAnsweredQuestions(prev => new Set(prev.add(currentQuestion)));
        setMyScore(result.newScore);
        
        toast({
          title: "⏭️ Pergunta pulada",
          description: "Você pode pular até 2 perguntas por duelo",
          variant: "default"
        });
        
        // Auto advance after skip
        setTimeout(() => {
          if (currentQuestion < duel.questions.length) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setIsTimerActive(true);
          } else {
            setGamePhase('finished');
            setIsFinished(true);
            setShowResult(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing skip:', error);
    }
  };

  const handleTimeUp = async () => {
    console.log('⏰ handleTimeUp chamado em EnhancedSimultaneousDuel');
    
    // Guard: Check if user is still on duel screen
    if (!window.location.pathname.includes('/duels') && !window.location.pathname.includes('/duel/')) {
      console.log('🚫 User is no longer on duel screen - ignoring timeout');
      return;
    }
    
    if (answeredQuestions.has(currentQuestion)) return;
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: duel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: null,
        p_is_timeout: true
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        setAnsweredQuestions(prev => new Set(prev.add(currentQuestion)));
        setMyScore(result.newScore);
        
        toast({
          title: "⏰ Tempo esgotado!",
          description: "Pergunta marcada como incorreta",
          variant: "destructive"
        });
        
        // Auto advance after timeout
        setTimeout(() => {
          if (currentQuestion < duel.questions.length) {
            setCurrentQuestion(prev => prev + 1);
            setIsTimerActive(true);
          } else {
            setGamePhase('finished');
            setIsFinished(true);
            setShowResult(true);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing timeout:', error);
    }
  };

  // Show enhanced interface during gameplay
  if (gamePhase === 'playing' && duel.questions && currentProfile) {
    return (
      <EnhancedDuelInterface
        questions={duel.questions}
        currentQuestion={currentQuestion}
        onAnswer={handleAnswer}
        playerAvatar={currentProfile?.avatars}
        opponentAvatar={(currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.avatars}
        playerScore={myScore}
        opponentScore={opponentScore}
        playerNickname={currentProfile?.nickname || 'Você'}
        opponentNickname={(currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.nickname || 'Oponente'}
        timeLeft={30}
        isWaitingForOpponent={false}
      />
    );
  }

  if (isLoadingDuel || !duel || !duel.questions || !currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando duelo...</p>
        </div>
      </div>
    );
  }

  const question = duel?.questions?.[currentQuestion - 1];
  const progress = duel?.questions?.length ? (currentQuestion / duel.questions.length) * 100 : 0;
  const isQuestionAnswered = answeredQuestions.has(currentQuestion);
  const answerResult = answerResults.get(currentQuestion);
  
  const getAnswerButtonClass = (optionId: string) => {
    if (!isQuestionAnswered) {
      return selectedAnswer === optionId ? 
        "border-primary bg-primary/20 text-primary scale-105" : 
        "hover:bg-muted/50 hover:scale-102";
    }
    
    if (answerResult?.answerId === optionId) {
      return answerResult.isCorrect ? 
        "bg-green-500/20 text-green-400 border-green-500 scale-105" : 
        "bg-red-500/20 text-red-400 border-red-500 scale-105";
    }
    
    // Show correct answer
    const correctOption = question?.options?.find((opt: any) => opt.isCorrect);
    if (correctOption?.id === optionId) {
      return "bg-green-500/20 text-green-400 border-green-500";
    }
    
    return "opacity-50";
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Trophy className="h-24 w-24 mx-auto text-primary mb-4" />
          </motion.div>
          
          <h1 className="text-4xl font-bold">
            <span className="flex items-center gap-2">
              {myScore > opponentScore ? (
                <>
                  <IconSystem emoji="🎉" size="lg" animated variant="glow" />
                  Vitória!
                </>
              ) : myScore < opponentScore ? (
                <>
                  <IconSystem emoji="😔" size="lg" />
                  Derrota
                </>
              ) : (
                "🤝 Empate!"
              )}
            </span>
          </h1>
          
          <div className="text-6xl font-bold">
            {myScore} x {opponentScore}
          </div>
          
          <p className="text-muted-foreground">
            Retornando à arena de duelos...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header com Jogadores */}
        <Card className="mb-6 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span>Duelo Simultâneo</span>
              </div>
              <Badge variant="secondary" className="animate-pulse">
                {currentQuestion} / {duel?.questions?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 mb-4">
              {/* Meu Perfil */}
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                whileHover={{ scale: 1.02 }}
              >
                <AvatarDisplayUniversal
                  avatarName={currentProfile?.avatar_name}
                  avatarUrl={currentProfile?.avatar_url}
                  profileImageUrl={currentProfile?.profile_image_url}
                  nickname={currentProfile?.nickname || "Você"}
                  size="md"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary">
                    {currentProfile?.nickname || "Você"}
                  </div>
                  <motion.div 
                    key={myScore}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-primary"
                  >
                    {myScore}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    Pergunta {currentQuestion}
                  </div>
                </div>
              </motion.div>

              {/* Oponente */}
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-muted"
                whileHover={{ scale: 1.02 }}
              >
                <AvatarDisplayUniversal
                  avatarName={
                    (currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.avatar_name
                  }
                  avatarUrl={
                    (currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.avatar_url
                  }
                  profileImageUrl={
                    (currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.profile_image_url
                  }
                  nickname={
                    (currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.nickname || "Oponente"
                  }
                  size="md"
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {(currentProfile?.id === duel.player1_id ? player2Profile : player1Profile)?.nickname || "Oponente"}
                  </div>
                  <motion.div 
                    key={opponentScore}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-secondary"
                  >
                    {opponentScore}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    Pergunta {opponentProgress + 1}
                  </div>
                </div>
              </motion.div>
            </div>
            
            <Progress value={progress} className="mb-2" />
          </CardContent>
        </Card>

        {/* Timer Central */}
        <div className="flex justify-center mb-6">
          <CircularTimer
            duration={30}
            isActive={isTimerActive}
            onTimeUp={handleTimeUp}
            enableCountdownSound={false}
            size={120}
            className="shadow-lg"
          />
        </div>

        {/* Pergunta */}
        <Card className="mb-6 border-primary/20 shadow-lg max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-center leading-relaxed">{question?.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 mb-4">
              {question?.options.map((option: any) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: isQuestionAnswered ? 1 : 1.02 }}
                  whileTap={{ scale: isQuestionAnswered ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`justify-start h-auto p-3 text-left transition-all duration-300 w-full text-sm ${getAnswerButtonClass(option.id)}`}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={isQuestionAnswered}
                  >
                    <span className="mr-2 font-mono text-xs">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {answerResult?.answerId === option.id && (
                      <span className="ml-2">
                        {answerResult.isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {/* Botões de Ação */}
            {!isQuestionAnswered && !isFinished && (
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer || isWaitingForOpponent}
                  className="flex-1 bg-primary hover:bg-primary/80"
                  size="sm"
                >
                  {isWaitingForOpponent ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-3 w-3" />
                      Responder
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleSkipQuestion}
                  variant="outline"
                  disabled={isWaitingForOpponent}
                  className="border-muted-foreground/30 hover:bg-muted/50 px-3"
                  size="sm"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {isQuestionAnswered && (
              <div className="text-center text-muted-foreground">
                <Zap className="h-4 w-4 mx-auto mb-2 animate-pulse" />
                <p className="text-xs">Próxima pergunta em instantes...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EnhancedSimultaneousDuel;
