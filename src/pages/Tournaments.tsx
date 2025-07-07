import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Clock, ArrowLeft } from "lucide-react";

// Import trophy images
import neuralCrown from "@/assets/trophies/neural-crown.jpg";
import quantumSphere from "@/assets/trophies/quantum-sphere.jpg";
import genesisCrystal from "@/assets/trophies/genesis-crystal.jpg";
import empireThrone from "@/assets/trophies/empire-throne.jpg";
import matrixCore from "@/assets/trophies/matrix-core.jpg";

const trophyImages = {
  'neural-crown': neuralCrown,
  'quantum-sphere': quantumSphere,
  'genesis-crystal': genesisCrystal,
  'empire-throne': empireThrone,
  'matrix-core': matrixCore,
};

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  status: string;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  prize_pool: number | null;
  trophy_image_url: string | null;
  trophy_name: string | null;
  difficulty: string | null;
  category: string;
  participants_count?: number;
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'finished'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(count)
        `)
        .order('start_date', { ascending: true });

      if (tournamentsData) {
        const tournaments = tournamentsData.map(tournament => ({
          ...tournament,
          participants_count: tournament.tournament_participants?.length || 0
        }));
        setTournaments(tournaments);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'hsl(var(--success))';
      case 'medium': return 'hsl(var(--warning))';
      case 'hard': return 'hsl(var(--destructive))';
      case 'legendary': return 'hsl(var(--level))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'hsl(var(--success))';
      case 'upcoming': return 'hsl(var(--warning))';
      case 'finished': return 'hsl(var(--muted))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getTrophyImage = (theme: string) => {
    const key = theme === 'neural' ? 'neural-crown' :
                theme === 'quantum' ? 'quantum-sphere' :
                theme === 'crypto' ? 'genesis-crystal' :
                theme === 'empire' ? 'empire-throne' :
                'matrix-core';
    return trophyImages[key as keyof typeof trophyImages];
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true;
    return tournament.status === filter;
  });

  const filterCounts = {
    all: tournaments.length,
    active: tournaments.filter(t => t.status === 'active').length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    finished: tournaments.filter(t => t.status === 'finished').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 pt-8 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Torneios Épicos</h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {Object.entries(filterCounts).map(([key, count]) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key as any)}
                className="flex-shrink-0"
              >
                {key === 'all' ? 'Todos' :
                 key === 'active' ? 'Ativos' :
                 key === 'upcoming' ? 'Em Breve' :
                 'Finalizados'} ({count})
              </Button>
            ))}
          </div>

          {/* Tournaments Grid */}
          <div className="grid gap-6">
            {filteredTournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="p-6 border border-border shadow-card hover:shadow-elevated transition-all cursor-pointer"
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={getTrophyImage(tournament.theme)}
                      alt={tournament.trophy_name || 'Trophy'}
                      className="w-20 h-20 object-cover rounded-lg shadow-glow"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-2"
                            style={{ 
                              borderColor: getDifficultyColor(tournament.difficulty || 'medium'),
                              color: getDifficultyColor(tournament.difficulty || 'medium')
                            }}
                          >
                            {(tournament.difficulty || 'medium').toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-2"
                            style={{ 
                              borderColor: getStatusColor(tournament.status),
                              color: getStatusColor(tournament.status)
                            }}
                          >
                            {tournament.status === 'active' ? 'ATIVO' : 
                             tournament.status === 'upcoming' ? 'EM BREVE' : 'FINALIZADO'}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {tournament.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {tournament.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Trophy className="w-4 h-4" />
                          <span className="font-bold">
                            {(tournament.prize_pool || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Prêmio Beetz</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-info mb-1">
                          <Users className="w-4 h-4" />
                          <span className="font-bold">
                            {tournament.participants_count || 0}/{tournament.max_participants || 100}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Jogadores</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-warning mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">
                            {formatTimeRemaining(tournament.end_date)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Tempo Restante</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-success text-black rounded-full font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tournaments/${tournament.id}`);
                      }}
                    >
                      {tournament.status === 'active' ? 'Participar Agora' : 
                       tournament.status === 'upcoming' ? 'Ver Detalhes' : 'Ver Resultados'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum torneio encontrado
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Não há torneios disponíveis no momento'
                  : `Não há torneios ${filter === 'active' ? 'ativos' : filter === 'upcoming' ? 'em breve' : 'finalizados'} no momento`
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}