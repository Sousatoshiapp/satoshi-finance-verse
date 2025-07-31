import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Trophy, Users, Clock } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

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

export function TournamentCarousel() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();

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
        .order('start_date', { ascending: true })
        .limit(5);

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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % tournaments.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + tournaments.length) % tournaments.length);
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

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">{t('tournaments.epicTournaments')}</h3>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">{t('tournaments.epicTournaments')}</h3>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Nenhum torneio disponível no momento</p>
        </Card>
      </div>
    );
  }

  const currentTournament = tournaments[currentIndex];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">{t('tournaments.epicTournaments')}</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/tournaments')}
          className="text-primary hover:text-primary/80"
        >
          {t('common.viewAll')} →
        </Button>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
          {tournaments.map((tournament, index) => (
            <Card 
              key={tournament.id}
              className="min-w-[280px] max-w-[280px] flex-shrink-0 p-4 border border-border shadow-card overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(`/tournament-quiz/${tournament.id}`)}
            >
              {/* Background Effect */}
              <div 
                className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"
                style={{ 
                  filter: 'blur(100px)',
                  background: `linear-gradient(135deg, ${getDifficultyColor(tournament.difficulty || 'medium')}20, transparent, ${getStatusColor(tournament.status)}20)`
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
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
                    <h4 className="text-base font-bold text-foreground mb-2 truncate">
                      {tournament.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>
                  
                  <div className="ml-3 flex-shrink-0">
                    <img 
                      src={getTrophyImage(tournament.theme)}
                      alt={tournament.trophy_name || 'Trophy'}
                      className="w-12 h-12 object-cover rounded-lg shadow-glow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Trophy className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {(tournament.prize_pool || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Prêmio</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-info mb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {tournament.participants_count || 0}/{tournament.max_participants || 100}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Jogadores</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-warning mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {formatTimeRemaining(tournament.end_date)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Restante</div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-success text-black rounded-full font-semibold text-sm py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tournament-quiz/${tournament.id}`);
                  }}
                >
                  {tournament.status === 'active' ? 'Começar Torneio' : 'Ver Detalhes'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Scroll indicators */}
        <div className="flex justify-center mt-4 gap-1">
          {tournaments.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-muted opacity-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
