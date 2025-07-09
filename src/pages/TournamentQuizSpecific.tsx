import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Clock, Trophy, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  tournament_type: string;
  max_participants: number;
  entry_cost: number;
  prize_pool: any;
  questions_per_match: number;
}

export default function TournamentQuizSpecific() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
      checkParticipation();
    }
  }, [tournamentId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      handleAnswerSubmit();
    }
  }, [timeLeft, quizStarted, quizFinished]);

  const loadTournament = async () => {
    try {
      // Primeiro, tenta buscar de torneios automáticos
      const { data: autoTournament } = await supabase
        .from('automated_tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (autoTournament) {
        setTournament({
          ...autoTournament,
          entry_cost: autoTournament.entry_cost || 0,
          tournament_type: autoTournament.tournament_type || 'daily',
          questions_per_match: autoTournament.questions_per_match || 10
        });
      } else {
        // Fallback para torneios normais - criar estrutura compatível
        const mockTournament: Tournament = {
          id: tournamentId!,
          name: 'Torneio Especial',
          description: 'Desafio de finanças e trading',
          tournament_type: 'special',
          max_participants: 32,
          entry_cost: 100,
          prize_pool: { first: 1000, second: 500, third: 250 },
          questions_per_match: 10
        };
        setTournament(mockTournament);
      }

      // Carregar perguntas
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('id, question, options, correct_answer, explanation')
        .eq('category', 'trading')
        .limit(10);

      if (questionsData) {
        const formattedQuestions: Question[] = questionsData.map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }));
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o torneio.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkParticipation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: participation } = await supabase
          .from('tournament_participations')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('user_id', profile.id)
          .single();

        setIsJoined(!!participation);
      }
    } catch (error) {
      console.error('Error checking participation:', error);
    }
  };

  const joinTournament = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Verificar se tem beetz suficientes
      if (tournament && tournament.entry_cost > 0 && profile.points < tournament.entry_cost) {
        toast({
          title: "Beetz insuficientes",
          description: `Você precisa de ${tournament.entry_cost} Beetz para participar.`,
          variant: "destructive"
        });
        return;
      }

      // Deduzir beetz e participar
      if (tournament && tournament.entry_cost > 0) {
        await supabase
          .from('profiles')
          .update({ points: profile.points - tournament.entry_cost })
          .eq('id', profile.id);
      }

      // Adicionar à participação
      const { error } = await supabase
        .from('tournament_participations')
        .insert({
          tournament_id: tournamentId,
          user_id: profile.id
        });

      if (error) throw error;

      setIsJoined(true);
      toast({
        title: "Sucesso!",
        description: "Você se inscreveu no torneio!",
      });
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Erro",
        description: "Não foi possível participar do torneio.",
        variant: "destructive"
      });
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(30);
  };

  const handleAnswerSubmit = () => {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    
    if (isCorrect) {
      setScore(score + 10);
    }

    setAnswers([...answers, selectedAnswer]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Atualizar participação com score
        await supabase
          .from('tournament_participations')
          .update({ 
            total_score: score + (selectedAnswer === questions[currentQuestion]?.correct_answer ? 10 : 0)
          })
          .eq('tournament_id', tournamentId)
          .eq('user_id', profile.id);

        // Dar XP e beetz como recompensa
        const finalScore = score + (selectedAnswer === questions[currentQuestion]?.correct_answer ? 10 : 0);
        const xpReward = finalScore * 2;
        const beetzReward = Math.floor(finalScore / 2);

        await supabase.rpc('award_xp', {
          profile_id: profile.id,
          xp_amount: xpReward,
          activity_type: 'tournament'
        });

        // Atualizar pontos separadamente
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', profile.id)
          .single();
          
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              points: (currentProfile.points || 0) + beetzReward
            })
            .eq('id', profile.id);
        }
      }

      toast({
        title: "Quiz finalizado!",
        description: `Pontuação: ${score + (selectedAnswer === questions[currentQuestion]?.correct_answer ? 10 : 0)}`,
      });
    } catch (error) {
      console.error('Error finishing quiz:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#adff2f] mx-auto mb-4"></div>
          <p className="text-white">Carregando torneio...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <Card className="bg-black/20 border-red-500/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Torneio não encontrado</h2>
            <Button onClick={() => navigate('/tournaments')}>
              Voltar aos Torneios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 pb-20">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(173, 255, 47, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(173, 255, 47, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tournaments')}
            className="text-[#adff2f] hover:bg-[#adff2f]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#adff2f] via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {tournament.name}
          </h1>
          <div className="w-20"></div>
        </div>

        {!quizStarted ? (
          /* Tournament Info */
          <Card className="bg-black/20 border-[#adff2f]/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#adff2f]" />
                {tournament.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">{tournament.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#adff2f]" />
                  <span className="text-white">Max: {tournament.max_participants}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-white">{tournament.entry_cost} Beetz</span>
                </div>
              </div>

              <div className="flex gap-4">
                {!isJoined ? (
                  <Button
                    onClick={joinTournament}
                    className="bg-[#adff2f] hover:bg-[#adff2f]/80 text-black font-semibold"
                  >
                    Participar ({tournament.entry_cost} Beetz)
                  </Button>
                ) : (
                  <Button
                    onClick={startQuiz}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  >
                    Iniciar Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : quizFinished ? (
          /* Results */
          <Card className="bg-black/20 border-[#adff2f]/20">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 text-[#adff2f] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Quiz Finalizado!</h2>
              <p className="text-4xl font-bold text-[#adff2f] mb-4">{score} pontos</p>
              <p className="text-white/80 mb-6">
                {score >= 70 ? "Excelente performance!" : score >= 50 ? "Boa performance!" : "Continue praticando!"}
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/tournaments')}
                  className="bg-[#adff2f] hover:bg-[#adff2f]/80 text-black"
                >
                  Ver Torneios
                </Button>
                <Button
                  onClick={() => navigate('/leaderboard')}
                  variant="outline"
                  className="border-[#adff2f]/30 text-[#adff2f]"
                >
                  Ranking
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Quiz Interface */
          <div className="space-y-6">
            {/* Progress & Timer */}
            <Card className="bg-black/20 border-[#adff2f]/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white">
                    Pergunta {currentQuestion + 1} de {questions.length}
                  </span>
                  <div className="flex items-center gap-2 text-[#adff2f]">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono text-lg">{timeLeft}s</span>
                  </div>
                </div>
                <Progress 
                  value={(currentQuestion / questions.length) * 100} 
                  className="mb-2"
                />
                <Progress 
                  value={(timeLeft / 30) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Question */}
            {questions[currentQuestion] && (
              <Card className="bg-black/20 border-[#adff2f]/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {questions[currentQuestion].question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      className={`w-full text-left justify-start h-auto p-4 ${
                        selectedAnswer === option
                          ? "bg-[#adff2f] text-black"
                          : "border-[#adff2f]/30 text-white hover:bg-[#adff2f]/10"
                      }`}
                      onClick={() => setSelectedAnswer(option)}
                    >
                      <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold mt-6"
                  >
                    {currentQuestion === questions.length - 1 ? "Finalizar Quiz" : "Próxima Pergunta"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Score */}
            <Card className="bg-black/20 border-[#adff2f]/20">
              <CardContent className="p-4 text-center">
                <p className="text-[#adff2f] font-semibold">
                  Pontuação Atual: {score} pontos
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <FloatingNavbar />
    </div>
  );
}