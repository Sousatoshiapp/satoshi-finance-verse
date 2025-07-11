import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Star, ChevronLeft, ChevronRight, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { TrophyIcon } from "@/components/icons/icon-system";

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
}

export function CarouselSocialChallenges() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [loading, setLoading] = useState(true);

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
          description: 'Vença 5 duelos consecutivos',
          type: 'duel',
          participants: 23,
          maxParticipants: 50,
          reward: '1000 XP + Avatar Lendário',
          deadline: '2 dias',
          difficulty: 'hard',
          status: 'active'
        },
        {
          id: '2',
          title: 'Equipe dos Sonhos',
          description: 'Forme uma equipe e complete 10 missões',
          type: 'team',
          participants: 8,
          maxParticipants: 20,
          reward: '500 XP + Boost Team',
          deadline: '5 dias',
          difficulty: 'medium',
          status: 'active'
        },
        {
          id: '3',
          title: 'Mestre da Comunidade',
          description: 'Ajude 20 jogadores novatos',
          type: 'community',
          participants: 156,
          maxParticipants: 200,
          reward: '750 XP + Badge Mentor',
          deadline: '1 semana',
          difficulty: 'easy',
          status: 'active'
        }
      ];

      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(challenges.length, 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(challenges.length, 3)) % Math.min(challenges.length, 3));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duel': return <Swords className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'community': return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desafios Sociais
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

  const displayChallenges = challenges.slice(0, 3);

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Desafios Sociais
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/social-challenges')}
            className="text-purple-500 border-purple-500/30 hover:bg-purple-500/10"
          >
            Ver Tudo
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Carousel */}
        <div className="relative">
          {displayChallenges.length > 1 && (
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
              {displayChallenges.map((challenge) => (
                <div key={challenge.id} className="w-full flex-shrink-0 px-2">
                  <div
                    className="border rounded-lg p-4 hover:border-purple-500/30 transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => navigate(`/challenge/${challenge.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        {getTypeIcon(challenge.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{challenge.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getDifficultyColor(challenge.difficulty))}
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {challenge.description}
                        </p>
                        
                        {/* Progress */}
                        <div className="space-y-1 mb-2">
                          <div className="flex justify-between text-xs">
                            <span>Participantes</span>
                            <span>{challenge.participants}/{challenge.maxParticipants}</span>
                          </div>
                          <Progress 
                            value={(challenge.participants / challenge.maxParticipants) * 100} 
                            className="h-1.5"
                          />
                        </div>
                        
                        {/* Reward and Deadline */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-green-500 font-medium">
                            <span className="flex items-center gap-1">
                              <TrophyIcon size="xs" variant="glow" /> {challenge.reward}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            ⏰ {challenge.deadline}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Participar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots indicator */}
          {displayChallenges.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {displayChallenges.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    currentSlide === index ? "bg-purple-500" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
        
        {challenges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum desafio ativo no momento</p>
            <p className="text-sm">Novos desafios aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}