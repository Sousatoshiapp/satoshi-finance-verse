import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { Trophy, Users, Clock, ArrowLeft, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WeeklyTournament {
  id: string;
  name: string;
  description: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  timeRemaining: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'active' | 'upcoming' | 'finished';
  category: string;
}

export default function WeeklyTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<WeeklyTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    // Mock data
    const mockTournaments: WeeklyTournament[] = [
      {
        id: '1',
        name: 'Torneio dos Mestres',
        description: 'Competição semanal para os melhores traders da plataforma',
        participants: 127,
        maxParticipants: 200,
        prize: '5000 Beetz + Título Lendário',
        timeRemaining: '2d 15h',
        difficulty: 'legendary',
        status: 'active',
        category: 'Elite'
      },
      {
        id: '2',
        name: 'Arena dos Novatos',
        description: 'Torneio especial para jogadores que começaram recentemente',
        participants: 89,
        maxParticipants: 100,
        prize: '1500 Beetz + Avatar Especial',
        timeRemaining: '4d 8h',
        difficulty: 'easy',
        status: 'active',
        category: 'Iniciante'
      },
      {
        id: '3',
        name: 'Campeonato DeFi',
        description: 'Teste seus conhecimentos sobre finanças descentralizadas',
        participants: 0,
        maxParticipants: 150,
        prize: '3000 Beetz + Badge DeFi Master',
        timeRemaining: '6d',
        difficulty: 'hard',
        status: 'upcoming',
        category: 'Especialista'
      }
    ];

    setTimeout(() => {
      setTournaments(mockTournaments);
      setLoading(false);
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'hard': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'legendary': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'upcoming': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'finished': return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Torneios Semanais
              </h1>
              <p className="text-muted-foreground">Compete com outros jogadores e ganhe prêmios épicos</p>
            </div>
          </div>

          {/* Tournaments Grid */}
          <div className="space-y-6">
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="hover:shadow-lg transition-shadow border-2 hover:border-primary/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(tournament.difficulty)}>
                          {tournament.difficulty.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(tournament.status)}>
                          {tournament.status === 'active' ? 'ATIVO' : 
                           tournament.status === 'upcoming' ? 'EM BREVE' : 'FINALIZADO'}
                        </Badge>
                        <Badge variant="outline">{tournament.category}</Badge>
                      </div>
                      
                      <CardTitle className="text-xl mb-2">{tournament.name}</CardTitle>
                      <p className="text-muted-foreground">{tournament.description}</p>
                    </div>
                    
                    <div className="ml-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Progress */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Participantes</span>
                      <span className="font-medium">
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                    </div>
                    <Progress 
                      value={(tournament.participants / tournament.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">Prêmio</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{tournament.prize}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="font-bold">Jogadores</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tournament.participants} participando
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="font-bold">Tempo</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{tournament.timeRemaining}</div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-black font-semibold"
                    onClick={() => navigate(`/tournament-quiz/${tournament.id}`)}
                    disabled={tournament.status === 'finished'}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {tournament.status === 'active' ? 'Participar Agora' : 
                     tournament.status === 'upcoming' ? 'Agendar Participação' : 'Finalizado'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {tournaments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum torneio semanal disponível</p>
              <p className="text-sm">Novos torneios aparecerão em breve!</p>
            </div>
          )}
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}
