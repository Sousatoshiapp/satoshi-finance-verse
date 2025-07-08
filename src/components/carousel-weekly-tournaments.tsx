import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface WeeklyTournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  entryFee: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'upcoming' | 'active' | 'ended';
  category: string;
}

export function CarouselWeeklyTournaments() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tournaments, setTournaments] = useState<WeeklyTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTournaments: WeeklyTournament[] = [
        {
          id: '1',
          name: 'Copa Crypto Semanal',
          description: 'Torneio de conhecimento em criptomoedas',
          startDate: '2025-01-10',
          endDate: '2025-01-17',
          participants: 156,
          maxParticipants: 500,
          prizePool: 5000,
          entryFee: 50,
          difficulty: 'intermediate',
          status: 'active',
          category: 'crypto'
        },
        {
          id: '2',
          name: 'Desafio Trading Pro',
          description: 'Competição de estratégias de trading',
          startDate: '2025-01-12',
          endDate: '2025-01-19',
          participants: 89,
          maxParticipants: 200,
          prizePool: 3000,
          entryFee: 100,
          difficulty: 'advanced',
          status: 'upcoming',
          category: 'trading'
        },
        {
          id: '3',
          name: 'Liga dos Iniciantes',
          description: 'Torneio especial para novos jogadores',
          startDate: '2025-01-15',
          endDate: '2025-01-22',
          participants: 234,
          maxParticipants: 1000,
          prizePool: 2000,
          entryFee: 0,
          difficulty: 'beginner',
          status: 'upcoming',
          category: 'education'
        }
      ];

      setTournaments(mockTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(tournaments.length, 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(tournaments.length, 3)) % Math.min(tournaments.length, 3));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 border-green-500/30';
      case 'intermediate': return 'text-yellow-500 border-yellow-500/30';
      case 'advanced': return 'text-red-500 border-red-500/30';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 border-green-500/30';
      case 'upcoming': return 'text-blue-500 border-blue-500/30';
      case 'ended': return 'text-gray-500 border-gray-500/30';
      default: return 'text-muted-foreground';
    }
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
          <div className="bg-muted/30 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayTournaments = tournaments.slice(0, 3);

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-500" />
            Torneios Semanais
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/tournaments')}
            className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            Ver Tudo
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Carousel */}
        <div className="relative">
          {displayTournaments.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {displayTournaments.map((tournament) => (
                <div key={tournament.id} className="w-full flex-shrink-0 px-2">
                  <div
                    className="border rounded-lg p-4 hover:border-emerald-500/30 transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-emerald-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{tournament.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getStatusColor(tournament.status))}
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {tournament.description}
                        </p>
                        
                        {/* Tournament Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{tournament.participants}/{tournament.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-yellow-500" />
                            <span>{tournament.prizePool} Beetz</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs justify-center", getDifficultyColor(tournament.difficulty))}
                          >
                            {tournament.difficulty}
                          </Badge>
                        </div>
                        
                        {/* Entry Fee */}
                        <div className="text-xs text-muted-foreground mb-2">
                          Taxa de entrada: {tournament.entryFee === 0 ? 'Gratuito' : `${tournament.entryFee} Beetz`}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={tournament.status === 'ended'}
                    >
                      {tournament.status === 'active' ? 'Participar' : 
                       tournament.status === 'upcoming' ? 'Inscrever-se' : 'Finalizado'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots indicator */}
          {displayTournaments.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {displayTournaments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    currentSlide === index ? "bg-emerald-500" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
        
        {tournaments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum torneio ativo no momento</p>
            <p className="text-sm">Novos torneios aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}