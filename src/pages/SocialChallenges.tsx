import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Users, Trophy, Star, ArrowLeft, Swords, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  type: 'duel' | 'team' | 'community';
  participants: number;
  maxParticipants: number;
  reward: string;
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'upcoming';
  category: string;
  requirements?: string[];
}

export default function SocialChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      // Mock data - replace with actual API call
      const mockChallenges: SocialChallenge[] = [
        {
          id: '1',
          title: 'Duelo dos Titãs',
          description: 'Vença 5 duelos consecutivos e prove sua supremacia',
          type: 'duel',
          participants: 23,
          maxParticipants: 50,
          reward: '1000 XP + Avatar Lendário',
          deadline: '2 dias',
          difficulty: 'hard',
          status: 'active',
          category: 'competition',
          requirements: ['Nível 10+', 'Win Rate 60%+']
        },
        {
          id: '2',
          title: 'Equipe dos Sonhos',
          description: 'Forme uma equipe e complete 10 missões em grupo',
          type: 'team',
          participants: 8,
          maxParticipants: 20,
          reward: '500 XP + Boost Team',
          deadline: '5 dias',
          difficulty: 'medium',
          status: 'active',
          category: 'cooperation',
          requirements: ['3+ membros', 'Atividade diária']
        },
        {
          id: '3',
          title: 'Mestre da Comunidade',
          description: 'Ajude 20 jogadores novatos a completar suas primeiras missões',
          type: 'community',
          participants: 156,
          maxParticipants: 200,
          reward: '750 XP + Badge Mentor',
          deadline: '1 semana',
          difficulty: 'easy',
          status: 'active',
          category: 'mentorship',
          requirements: ['Nível 15+', 'Boa reputação']
        },
        {
          id: '4',
          title: 'Torneio Relâmpago',
          description: 'Participe do torneio surprise que acontece às 20h',
          type: 'duel',
          participants: 0,
          maxParticipants: 100,
          reward: '2000 XP + Título Especial',
          deadline: '6 horas',
          difficulty: 'hard',
          status: 'upcoming',
          category: 'tournament',
          requirements: ['Inscrição obrigatória', 'Nível 8+']
        },
        {
          id: '5',
          title: 'Liga das Lendas',
          description: 'Desafio épico completado com sucesso!',
          type: 'community',
          participants: 50,
          maxParticipants: 50,
          reward: '1500 XP + Skin Exclusiva',
          deadline: 'Finalizado',
          difficulty: 'hard',
          status: 'completed',
          category: 'epic',
          requirements: ['Evento especial']
        }
      ];

      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duel': return <Swords className="h-5 w-5" />;
      case 'team': return <Users className="h-5 w-5" />;
      case 'community': return <Star className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 border-green-500/30';
      case 'medium': return 'text-yellow-500 border-yellow-500/30';
      case 'hard': return 'text-red-500 border-red-500/30';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 border-green-500/30';
      case 'upcoming': return 'text-blue-500 border-blue-500/30';
      case 'completed': return 'text-gray-500 border-gray-500/30';
      default: return 'text-muted-foreground';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
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
              <h1 className="text-2xl font-bold">Desafios Sociais</h1>
              <p className="text-muted-foreground">Participe, compita e colabore com outros jogadores</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos ({challenges.length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Ativos ({challenges.filter(c => c.status === 'active').length})
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Em Breve ({challenges.filter(c => c.status === 'upcoming').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Finalizados ({challenges.filter(c => c.status === 'completed').length})
            </Button>
          </div>

          {/* Challenges List */}
          <div className="space-y-4">
            {filteredChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={cn(
                  "border transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
                  challenge.status === 'completed' 
                    ? "border-gray-500/30 bg-gray-500/5" 
                    : "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50"
                )}
                onClick={() => navigate(`/challenge/${challenge.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      {getTypeIcon(challenge.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base">{challenge.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getStatusColor(challenge.status))}
                        >
                          {challenge.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDifficultyColor(challenge.difficulty))}
                        >
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {challenge.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {challenge.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Participantes</span>
                      <span>{challenge.participants}/{challenge.maxParticipants}</span>
                    </div>
                    <Progress 
                      value={(challenge.participants / challenge.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Requirements */}
                  {challenge.requirements && challenge.requirements.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Requisitos:</div>
                      <div className="flex flex-wrap gap-1">
                        {challenge.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Reward and Deadline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Recompensa</div>
                      <div className="text-green-500 font-medium">🏆 {challenge.reward}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Prazo</div>
                      <div className="font-medium">⏰ {challenge.deadline}</div>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                    disabled={challenge.status === 'completed'}
                  >
                    {challenge.status === 'active' ? 'Participar' : 
                     challenge.status === 'upcoming' ? 'Agendar' : 'Finalizado'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredChallenges.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum desafio encontrado</p>
              <p className="text-sm">
                {filter === 'completed' 
                  ? 'Complete alguns desafios para vê-los aqui!'
                  : 'Novos desafios aparecerão em breve!'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
