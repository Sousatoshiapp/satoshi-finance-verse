import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Calendar, 
  Users, 
  Crown, 
  Zap, 
  Clock,
  Target,
  Gift,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  prize_pool: number;
  status: 'upcoming' | 'active' | 'ended';
  category: string;
  difficulty: string;
  user_registered?: boolean;
  user_rank?: number;
}

export function WeeklyTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTournaments, setActiveTournaments] = useState(0);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      // Mock tournaments data - in real app would come from database
      const mockTournaments: Tournament[] = [
        {
          id: '1',
          name: 'Crypto Masters Championship',
          description: 'Desafio semanal de conhecimento em criptomoedas',
          start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          end_date: new Date(Date.now() + 604800000).toISOString(), // Next week
          entry_fee: 500,
          max_participants: 100,
          current_participants: 67,
          prize_pool: 25000,
          status: 'upcoming',
          category: 'Cryptocurrency',
          difficulty: 'Hard',
          user_registered: false
        },
        {
          id: '2',
          name: 'DeFi Speedrun',
          description: 'Quiz rápido sobre protocolos DeFi',
          start_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          end_date: new Date(Date.now() + 432000000).toISOString(), // In 5 days
          entry_fee: 200,
          max_participants: 200,
          current_participants: 156,
          prize_pool: 15000,
          status: 'active',
          category: 'DeFi',
          difficulty: 'Medium',
          user_registered: true,
          user_rank: 23
        },
        {
          id: '3',
          name: 'Trading Psychology Battle',
          description: 'Teste seus conhecimentos em psicologia do trading',
          start_date: new Date(Date.now() + 172800000).toISOString(), // In 2 days
          end_date: new Date(Date.now() + 777600000).toISOString(), // Next week + 2 days
          entry_fee: 300,
          max_participants: 150,
          current_participants: 34,
          prize_pool: 18000,
          status: 'upcoming',
          category: 'Trading',
          difficulty: 'Medium',
          user_registered: false
        }
      ];

      setTournaments(mockTournaments);
      setActiveTournaments(mockTournaments.filter(t => t.status === 'active').length);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentClick = (tournament: Tournament) => {
    if (tournament.status === 'active' && tournament.user_registered) {
      navigate(`/tournament-quiz/${tournament.id}`);
    } else {
      navigate(`/tournament/${tournament.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'upcoming': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'ended': return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTimeStatus = (tournament: Tournament) => {
    const now = new Date();
    const start = new Date(tournament.start_date);
    const end = new Date(tournament.end_date);

    if (tournament.status === 'active') {
      const timeLeft = end.getTime() - now.getTime();
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const daysLeft = Math.floor(hoursLeft / 24);
      return daysLeft > 0 ? `${daysLeft}d ${hoursLeft % 24}h restantes` : `${hoursLeft}h restantes`;
    } else if (tournament.status === 'upcoming') {
      const timeToStart = start.getTime() - now.getTime();
      const hoursToStart = Math.floor(timeToStart / (1000 * 60 * 60));
      const daysToStart = Math.floor(hoursToStart / 24);
      return daysToStart > 0 ? `Inicia em ${daysToStart}d ${hoursToStart % 24}h` : `Inicia em ${hoursToStart}h`;
    }
    return 'Finalizado';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Torneios Semanais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Torneios Semanais
            <Badge variant="secondary" className="ml-2">
              {activeTournaments} ativos
            </Badge>
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/tournaments')}
            className="text-purple-500 border-purple-500/30 hover:bg-purple-500/10"
          >
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            onClick={() => handleTournamentClick(tournament)}
            className={cn(
              "border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
              tournament.status === 'active' && tournament.user_registered
                ? "bg-green-500/10 border-green-500/30"
                : "bg-card border-border hover:border-purple-500/30"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-purple-500">
                  <Crown className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">
                      {tournament.name}
                    </h3>
                    
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(tournament.status))}
                    >
                      {tournament.status === 'active' ? 'ATIVO' : tournament.status === 'upcoming' ? 'EM BREVE' : 'FINALIZADO'}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getDifficultyColor(tournament.difficulty))}
                    >
                      {tournament.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {tournament.description}
                  </p>
                  
                  {tournament.user_registered && tournament.user_rank && (
                    <div className="flex items-center gap-1 text-xs text-green-500 mb-2">
                      <Star className="h-3 w-3" />
                      Posição #{tournament.user_rank}
                    </div>
                  )}
                  
                  {/* Tournament Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                    <div>
                      <div className="text-muted-foreground">Participantes</div>
                      <div className="font-medium">{tournament.current_participants}/{tournament.max_participants}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Taxa</div>
                      <div className="font-medium">{tournament.entry_fee} 🥕</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Prêmio</div>
                      <div className="font-medium text-yellow-500">{tournament.prize_pool.toLocaleString()} 🥕</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className="font-medium">{getTimeStatus(tournament)}</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar for Participants */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Inscrições</span>
                      <span>{Math.round((tournament.current_participants / tournament.max_participants) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(tournament.current_participants / tournament.max_participants) * 100} 
                      className="h-1.5"
                    />
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="ml-2">
                {tournament.user_registered ? (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-purple-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {tournaments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum torneio ativo</p>
            <p className="text-sm">Novos torneios aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}