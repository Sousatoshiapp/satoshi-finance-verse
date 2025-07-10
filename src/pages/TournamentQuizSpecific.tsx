import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Trophy, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
      checkParticipation();
    }
  }, [tournamentId]);

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
          questions_per_match: 7
        };
        setTournament(mockTournament);
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
  };

  const handleQuizComplete = (results: any) => {
    toast({
      title: "Quiz finalizado!",
      description: `Pontuação: ${results.score}/${results.totalQuestions} (${results.percentage}%)`,
    });
    setQuizStarted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando torneio...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Torneio não encontrado</h2>
            <Button onClick={() => navigate('/tournaments')}>
              Voltar aos Torneios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizStarted) {
    return (
      <QuizEngine
        mode="tournament"
        tournamentId={tournamentId}
        onComplete={handleQuizComplete}
        questionsCount={tournament.questions_per_match}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tournaments')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-center">
            {tournament.name}
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Tournament Info */}
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {tournament.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{tournament.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Max: {tournament.max_participants}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>{tournament.entry_cost} Beetz</span>
                </div>
              </div>

              <div className="flex gap-4">
                {!isJoined ? (
                  <Button
                    onClick={joinTournament}
                    className="w-full"
                    size="lg"
                  >
                    Participar ({tournament.entry_cost} Beetz)
                  </Button>
                ) : (
                  <Button
                    onClick={startQuiz}
                    className="w-full"
                    size="lg"
                  >
                    Iniciar Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}