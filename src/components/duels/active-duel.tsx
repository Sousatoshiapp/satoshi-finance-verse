import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BotAI } from "./bot-ai";

interface ActiveDuelProps {
  duel: any;
  onDuelEnd: () => void;
}

export function ActiveDuel({ duel, onDuelEnd }: ActiveDuelProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [player1Profile, setPlayer1Profile] = useState<any>(null);
  const [player2Profile, setPlayer2Profile] = useState<any>(null);
  const [duelData, setDuelData] = useState(duel);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
    checkTurn();
    
    // Iniciar IA do bot
    const botChannel = BotAI.startBotAI(duel.id);
    
    // Setup real-time subscription for duel updates
    const channel = supabase
      .channel('duel-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${duel.id}`
        },
        (payload) => {
          setDuelData(payload.new);
          checkTurn();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (botChannel) {
        supabase.removeChannel(botChannel);
      }
    };
  }, [duel.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isMyTurn && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleAnswerSubmit(null);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isMyTurn) {
      // Reset timer when it's not my turn
      setTimeLeft(30);
    }

    return () => clearInterval(timer);
  }, [isMyTurn]);

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

  const checkTurn = () => {
    if (!currentProfile || !duelData) return;
    
    const myTurn = duelData.current_turn === currentProfile.id;
    setIsMyTurn(myTurn);
    
    if (myTurn) {
      setTimeLeft(30);
      setCurrentQuestion(duelData.current_question - 1);
    } else {
      // Se não é minha vez, atualizar a pergunta atual baseada no estado do duelo
      setCurrentQuestion(duelData.current_question - 1);
    }
  };

  const handleAnswerSubmit = async (answerId: string | null) => {
    if (!currentProfile || !isMyTurn) return;

    try {
      const question = duelData.questions[currentQuestion];
      const isCorrect = answerId ? 
        question.options.find((opt: any) => opt.id === answerId)?.isCorrect : false;

      // Update player answers and score
      const isPlayer1 = currentProfile.id === duelData.player1_id;
      const currentAnswers = isPlayer1 ? duelData.player1_answers : duelData.player2_answers;
      const currentScore = isPlayer1 ? duelData.player1_score : duelData.player2_score;

      const newAnswers = [...(currentAnswers || []), {
        questionId: question.id,
        answerId,
        isCorrect,
        timeSpent: 30 - timeLeft
      }];

      const newScore = currentScore + (isCorrect ? 1 : 0);

      // Determine next turn
      const nextTurn = isPlayer1 ? duelData.player2_id : duelData.player1_id;
      const nextQuestion = currentQuestion + 1;
      
      // Check if duel is finished
      const isFinished = nextQuestion >= duelData.questions.length && 
                        (isPlayer1 ? duelData.player2_answers?.length >= duelData.questions.length : 
                         duelData.player1_answers?.length >= duelData.questions.length);

      const updateData: any = {
        current_turn: isFinished ? null : nextTurn,
        current_question: nextQuestion + 1,
        turn_started_at: isFinished ? null : new Date().toISOString()
      };

      if (isPlayer1) {
        updateData.player1_answers = newAnswers;
        updateData.player1_score = newScore;
      } else {
        updateData.player2_answers = newAnswers;
        updateData.player2_score = newScore;
      }

      if (isFinished) {
        updateData.status = 'finished';
        updateData.finished_at = new Date().toISOString();
        
        // Determine winner
        const finalPlayer1Score = isPlayer1 ? newScore : duelData.player1_score;
        const finalPlayer2Score = isPlayer1 ? duelData.player2_score : newScore;
        
        if (finalPlayer1Score > finalPlayer2Score) {
          updateData.winner_id = duelData.player1_id;
        } else if (finalPlayer2Score > finalPlayer1Score) {
          updateData.winner_id = duelData.player2_id;
        }
      }

      const { error } = await supabase
        .from('duels')
        .update(updateData)
        .eq('id', duel.id);

      if (error) throw error;

      if (isFinished) {
        // Show result and end duel
        const winner = updateData.winner_id === currentProfile.id;
        toast({
          title: winner ? "Vitória!" : "Derrota",
          description: winner ? 
            "Parabéns! Você venceu o duelo!" : 
            "Não foi desta vez. Continue praticando!",
        });
        
        setTimeout(() => onDuelEnd(), 2000);
      } else {
        setSelectedAnswer(null);
        setIsMyTurn(false);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta",
        variant: "destructive"
      });
    }
  };

  if (!duelData.questions || !currentProfile) {
    return <div>Carregando duelo...</div>;
  }

  const question = duelData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / duelData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span>Duelo Ativo</span>
              </div>
              <Badge variant={isMyTurn ? "default" : "secondary"}>
                {isMyTurn ? "Sua vez" : "Aguardando oponente"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="font-semibold">{player1Profile?.nickname}</div>
                <div className="text-2xl font-bold text-primary">
                  {duelData.player1_score || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{player2Profile?.nickname}</div>
                <div className="text-2xl font-bold text-primary">
                  {duelData.player2_score || 0}
                </div>
              </div>
            </div>
            <Progress value={progress} className="mb-2" />
            <div className="text-center text-sm text-muted-foreground">
              Pergunta {currentQuestion + 1} de {duelData.questions.length}
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Timer className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className={`text-3xl font-bold ${isMyTurn ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isMyTurn ? `${timeLeft}s` : 'Aguardando...'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isMyTurn ? 'Tempo restante' : 'Vez do oponente'}
                </div>
              </div>
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{question?.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {question?.options.map((option: any) => (
                <Button
                  key={option.id}
                  variant={selectedAnswer === option.id ? "default" : "outline"}
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => {
                    if (isMyTurn) {
                      setSelectedAnswer(option.id);
                    }
                  }}
                  disabled={!isMyTurn}
                >
                  <span className="font-semibold mr-2">{option.id.toUpperCase()})</span>
                  {option.text}
                </Button>
              ))}
            </div>
            
            {isMyTurn && selectedAnswer && (
              <Button
                onClick={() => handleAnswerSubmit(selectedAnswer)}
                className="w-full mt-4"
                size="lg"
              >
                Confirmar Resposta
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}