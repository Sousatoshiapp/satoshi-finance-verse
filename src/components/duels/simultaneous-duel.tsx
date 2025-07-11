import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy, Zap, SkipForward, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";

interface SimultaneousDuelProps {
  duel: any;
  onDuelEnd: (result: { winner: boolean, score: number, opponentScore: number }) => void;
}

export function SimultaneousDuel({ duel, onDuelEnd }: SimultaneousDuelProps) {
  const [timeLeft, setTimeLeft] = useState(30);
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🎯 SimultaneousDuel component mounted');
    loadProfiles();
    
    // Setup real-time subscription for opponent progress
    const channel = supabase
      .channel('duel-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${duel.id}`
        },
        handleDuelUpdate
      )
      .subscribe();

    return () => {
      console.log('🚫 SimultaneousDuel component unmounting - clearing timers and subscriptions');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [duel.id]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestion]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (answeredQuestions.has(currentQuestion)) {
      setTimeLeft(30);
      return;
    }

    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDuelUpdate = (payload: any) => {
    const updatedDuel = payload.new;
    
    if (updatedDuel.status === 'finished') {
      setIsFinished(true);
      const isWinner = updatedDuel.winner_id === currentProfile?.id;
      const finalMyScore = currentProfile?.id === updatedDuel.player1_id ? 
        updatedDuel.player1_score : updatedDuel.player2_score;
      const finalOpponentScore = currentProfile?.id === updatedDuel.player1_id ? 
        updatedDuel.player2_score : updatedDuel.player1_score;
      
      onDuelEnd({
        winner: isWinner,
        score: finalMyScore || 0,
        opponentScore: finalOpponentScore || 0
      });
    } else {
      // Update opponent progress
      if (currentProfile) {
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
      }
    }
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

  const processAnswer = async (answerId: string | null, isTimeout: boolean = false) => {
    if (!currentProfile || answeredQuestions.has(currentQuestion)) return;

    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: duel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: answerId,
        p_is_timeout: isTimeout
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        // Store result for visual feedback
        if (answerId) {
          setAnswerResults(prev => new Map(prev.set(currentQuestion, {
            answerId,
            isCorrect: result.isCorrect
          })));
        }
        
        setAnsweredQuestions(prev => new Set(prev.add(currentQuestion)));
        setMyScore(result.newScore);
        
        if (result.isFinished || result.winnerId) {
          setIsFinished(true);
          const isWinner = result.winnerId === currentProfile.id;
          setTimeout(() => {
            onDuelEnd({
              winner: isWinner,
              score: result.newScore,
              opponentScore: opponentScore
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a resposta",
        variant: "destructive"
      });
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (answeredQuestions.has(currentQuestion)) return;
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || answeredQuestions.has(currentQuestion)) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    processAnswer(selectedAnswer);
    setSelectedAnswer(null);
  };

  const handleSkipQuestion = () => {
    if (answeredQuestions.has(currentQuestion)) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    processAnswer(null, true);
    setSelectedAnswer(null);
  };

  const handleTimeout = () => {
    console.log('⏰ handleTimeout chamado em SimultaneousDuel');
    
    // Guard: Check if user is still on duel screen
    if (!window.location.pathname.includes('/duels') && !window.location.pathname.includes('/duel/')) {
      console.log('🚫 Usuário não está mais na tela de duelos - ignorando timeout');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    if (answeredQuestions.has(currentQuestion)) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    processAnswer(null, true);
    setSelectedAnswer(null);
    
    toast({
      title: "⏰ Tempo esgotado!",
      description: "Pergunta marcada como incorreta",
      variant: "destructive"
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestion < duel.questions.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
    }
  };

  if (!duel.questions || !currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando duelo...</p>
        </div>
      </div>
    );
  }

  const question = duel.questions[currentQuestion - 1];
  const progress = (currentQuestion / duel.questions.length) * 100;
  const isQuestionAnswered = answeredQuestions.has(currentQuestion);
  const answerResult = answerResults.get(currentQuestion);
  
  const getAnswerButtonStyle = (optionId: string) => {
    if (!isQuestionAnswered) {
      return selectedAnswer === optionId ? "default" : "outline";
    }
    
    if (answerResult?.answerId === optionId) {
      return answerResult.isCorrect ? "default" : "destructive";
    }
    
    return "outline";
  };

  const getAnswerButtonClass = (optionId: string) => {
    if (!isQuestionAnswered) {
      return selectedAnswer === optionId ? 
        "border-primary bg-primary text-primary-foreground" : 
        "hover:bg-muted/50";
    }
    
    if (answerResult?.answerId === optionId) {
      return answerResult.isCorrect ? 
        "bg-green-500 text-white border-green-500" : 
        "bg-red-500 text-white border-red-500";
    }
    
    return "opacity-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header com Jogadores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span>Duelo Simultâneo</span>
              </div>
              <Badge variant="secondary">
                Pergunta {currentQuestion} de {duel.questions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 mb-4">
              {/* Meu Perfil */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
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
                  <div className="text-2xl font-bold text-primary">
                    {myScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pergunta {currentQuestion}
                  </div>
                </div>
              </div>

              {/* Oponente */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
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
                  <div className="text-2xl font-bold text-secondary">
                    {opponentScore}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pergunta {opponentProgress + 1}
                  </div>
                </div>
              </div>
            </div>
            
            <Progress value={progress} className="mb-2" />
          </CardContent>
        </Card>

        {/* Timer */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Timer className={`h-6 w-6 ${timeLeft <= 10 ? 'text-red-500' : 'text-primary'}`} />
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'
                }`}>
                  {isQuestionAnswered ? '✓' : `${timeLeft}s`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isQuestionAnswered ? 'Respondida' : 'Tempo restante'}
                </div>
              </div>
              <Zap className={`h-6 w-6 ${timeLeft <= 10 ? 'text-red-500' : 'text-primary'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Navegação entre Perguntas */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestion === 1}
                size="sm"
              >
                ← Anterior
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: duel.questions.length }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentQuestion === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestion(i + 1)}
                    className={`w-8 h-8 p-0 ${answeredQuestions.has(i + 1) ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={goToNextQuestion}
                disabled={currentQuestion === duel.questions.length}
                size="sm"
              >
                Próxima →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pergunta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{question?.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 mb-6">
              {question?.options.map((option: any) => (
                <Button
                  key={option.id}
                  variant={getAnswerButtonStyle(option.id)}
                  className={`justify-start h-auto p-4 text-left transition-all duration-200 ${getAnswerButtonClass(option.id)}`}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={isQuestionAnswered}
                >
                  <span className="font-semibold mr-2">{option.id.toUpperCase()})</span>
                  {option.text}
                </Button>
              ))}
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-3">
              {!isQuestionAnswered && selectedAnswer && (
                <Button
                  onClick={handleAnswerSubmit}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Confirmar Resposta
                </Button>
              )}
              
              {!isQuestionAnswered && (
                <Button
                  onClick={handleSkipQuestion}
                  variant="outline"
                  size="lg"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Pular Pergunta
                </Button>
              )}

              {currentQuestion < duel.questions.length && (
                <Button
                  onClick={goToNextQuestion}
                  variant="secondary"
                  size="lg"
                >
                  Próxima Pergunta →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}