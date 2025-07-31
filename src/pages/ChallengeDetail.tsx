import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { ArrowLeft, Users, Trophy, Clock, Star, Target, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface Challenge {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  type: 'duel' | 'team' | 'community';
  participants: number;
  maxParticipants: number;
  reward: string;
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'upcoming';
  category: string;
  requirements: string[];
  rules: string[];
  leaderboard: Array<{
    rank: number;
    name: string;
    avatar: string;
    score: number;
  }>;
}

export default function ChallengeDetail() {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    // Mock data based on challengeId
    const mockChallenge: Challenge = {
      id: challengeId || '1',
      title: 'Duelo dos Titãs',
      description: 'Vença 5 duelos consecutivos e prove sua supremacia',
      longDescription: 'Este é um desafio épico onde você precisa demonstrar suas habilidades de trading vencendo 5 duelos consecutivos contra outros jogadores. Cada vitória te aproxima mais do título de Titã do Trading!',
      type: 'duel',
      participants: 23,
      maxParticipants: 50,
      reward: '1000 XP + Avatar Lendário + Título "Titã"',
      deadline: '2 dias',
      difficulty: 'hard',
      status: 'active',
      category: 'competition',
      requirements: ['Nível 10+', 'Win Rate 60%+', 'Pelo menos 20 duelos jogados'],
      rules: [
        'Deve vencer 5 duelos consecutivos',
        'Não pode perder nenhum duelo durante a sequência',
        'Tempo limite de 48 horas para completar',
        'Apenas duelos ranked contam',
        'Em caso de empate, ganha quem completou primeiro'
      ],
      leaderboard: [
        { rank: 1, name: 'CryptoKing', avatar: '', score: 5 },
        { rank: 2, name: 'TradeMaster', avatar: '', score: 4 },
        { rank: 3, name: 'BlockchainPro', avatar: '', score: 3 },
        { rank: 4, name: 'FinanceGuru', avatar: '', score: 3 },
        { rank: 5, name: 'InvestorElite', avatar: '', score: 2 }
      ]
    };

    setTimeout(() => {
      setChallenge(mockChallenge);
      setLoading(false);
    }, 1000);
  };

  const handleParticipate = () => {
    setIsParticipating(true);
    // Navigate to appropriate game mode
    if (challenge?.type === 'duel') {
      navigate('/duels');
    } else {
      navigate('/social');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="bg-muted/30 rounded-lg p-6 h-32"></div>
              <div className="bg-muted/30 rounded-lg p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Desafio não encontrado</h1>
          <Button onClick={() => navigate('/social-challenges')}>
            Voltar aos Desafios
          </Button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'hard': return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/social-challenges')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{challenge.title}</h1>
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Challenge Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{challenge.category}</Badge>
                    <Badge variant="secondary">{challenge.type}</Badge>
                  </div>
                  <CardTitle>Sobre o Desafio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{challenge.longDescription}</p>
                  
                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Participantes</span>
                      <span className="font-medium">
                        {challenge.participants}/{challenge.maxParticipants}
                      </span>
                    </div>
                    <Progress 
                      value={(challenge.participants / challenge.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">Recompensa</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.reward}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-red-500 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Tempo Restante</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.deadline}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Requisitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {challenge.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Regras do Desafio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {challenge.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participate Button */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-semibold"
                    onClick={handleParticipate}
                    disabled={challenge.status === 'completed' || isParticipating}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isParticipating ? 'Participando...' : 'Participar Agora'}
                  </Button>
                  
                  {challenge.status === 'completed' && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Este desafio foi finalizado
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {challenge.leaderboard.map((player) => (
                      <div key={player.rank} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          player.rank === 1 ? 'bg-yellow-500 text-black' :
                          player.rank === 2 ? 'bg-gray-400 text-black' :
                          player.rank === 3 ? 'bg-orange-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {player.rank}
                        </div>
                        
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{player.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {player.score} vitória{player.score !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}
