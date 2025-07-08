import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Gift, Calendar, ArrowLeft, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface StreakReward {
  day: number;
  title: string;
  description: string;
  rewards: string[];
  claimed: boolean;
  type: 'daily' | 'weekly' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function StreakRewards() {
  const navigate = useNavigate();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [longestStreak, setLongestStreak] = useState(23);
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakRewards();
  }, []);

  const loadStreakRewards = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRewards: StreakReward[] = [
        {
          day: 1,
          title: 'Primeiro Dia',
          description: 'Bem-vindo à sua jornada!',
          rewards: ['50 XP', '100 Beetz'],
          claimed: true,
          type: 'daily',
          rarity: 'common'
        },
        {
          day: 3,
          title: 'Consistência',
          description: 'Três dias seguidos!',
          rewards: ['100 XP', '200 Beetz', 'Boost XP 1h'],
          claimed: true,
          type: 'daily',
          rarity: 'common'
        },
        {
          day: 7,
          title: 'Uma Semana Forte',
          description: 'Parabéns pela primeira semana!',
          rewards: ['300 XP', '500 Beetz', 'Loot Box Comum'],
          claimed: true,
          type: 'weekly',
          rarity: 'rare'
        },
        {
          day: 10,
          title: 'Dedicação',
          description: 'Dez dias de pura dedicação!',
          rewards: ['500 XP', '1000 Beetz', 'Loot Box Rara'],
          claimed: false,
          type: 'milestone',
          rarity: 'rare'
        },
        {
          day: 14,
          title: 'Duas Semanas',
          description: 'Fortnight de excelência!',
          rewards: ['750 XP', '1500 Beetz', 'Boost XP 3h', 'Avatar Cosmético'],
          claimed: false,
          type: 'weekly',
          rarity: 'epic'
        },
        {
          day: 21,
          title: 'Três Semanas',
          description: 'Você está se tornando lenda!',
          rewards: ['1000 XP', '2000 Beetz', 'Loot Box Épica', 'Título Especial'],
          claimed: false,
          type: 'weekly',
          rarity: 'epic'
        },
        {
          day: 30,
          title: 'Um Mês Completo',
          description: 'Mestre da Consistência!',
          rewards: ['2000 XP', '5000 Beetz', 'Avatar Lendário', 'Badge Elite'],
          claimed: false,
          type: 'milestone',
          rarity: 'legendary'
        }
      ];

      setRewards(mockRewards);
    } catch (error) {
      console.error('Error loading streak rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-500/30';
      case 'rare': return 'text-blue-500 border-blue-500/30';
      case 'epic': return 'text-purple-500 border-purple-500/30';
      case 'legendary': return 'text-yellow-500 border-yellow-500/30';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Star className="h-4 w-4" />;
      case 'milestone': return <Crown className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const canClaimReward = (reward: StreakReward) => {
    return currentStreak >= reward.day && !reward.claimed;
  };

  const claimReward = async (rewardId: number) => {
    // Implement reward claiming logic
    console.log('Claiming reward:', rewardId);
  };

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
              <h1 className="text-2xl font-bold">Recompensas de Sequência</h1>
              <p className="text-muted-foreground">Continue sua sequência e ganhe recompensas incríveis</p>
            </div>
          </div>

          {/* Current Streak Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-orange-500/20 bg-gradient-to-br from-background to-orange-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Sequência Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {currentStreak} dias
                </div>
                <p className="text-sm text-muted-foreground">
                  Continue assim para desbloquear mais recompensas!
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Melhor Sequência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500 mb-2">
                  {longestStreak} dias
                </div>
                <p className="text-sm text-muted-foreground">
                  Seu recorde pessoal de consistência
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress to Next Reward */}
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Próxima Recompensa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const nextReward = rewards.find(r => r.day > currentStreak);
                if (!nextReward) return <p className="text-muted-foreground">Você desbloqueou todas as recompensas disponíveis!</p>;
                
                const progress = (currentStreak / nextReward.day) * 100;
                const daysLeft = nextReward.day - currentStreak;
                
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{nextReward.title}</span>
                      <Badge className={getRarityColor(nextReward.rarity)}>
                        {nextReward.rarity}
                      </Badge>
                    </div>
                    
                    <Progress value={progress} className="h-3" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
                      </span>
                      <span className="font-medium">
                        Dia {nextReward.day}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {nextReward.description}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Rewards Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Todas as Recompensas</h2>
            
            {rewards.map((reward) => (
              <Card
                key={reward.day}
                className={cn(
                  "border transition-all duration-200",
                  reward.claimed 
                    ? "border-green-500/30 bg-green-500/5" 
                    : canClaimReward(reward)
                    ? "border-orange-500/50 bg-orange-500/10 shadow-lg"
                    : currentStreak >= reward.day
                    ? "border-primary/30"
                    : "border-muted opacity-60"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        reward.claimed 
                          ? "bg-green-500/20" 
                          : canClaimReward(reward)
                          ? "bg-orange-500/20"
                          : "bg-muted/20"
                      )}>
                        <span className="text-xl font-bold">
                          {reward.day}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{reward.title}</h3>
                          {getTypeIcon(reward.type)}
                          <Badge className={cn("text-xs", getRarityColor(reward.rarity))}>
                            {reward.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {reward.claimed ? (
                        <Badge className="bg-green-500 text-white">
                          Resgatado
                        </Badge>
                      ) : canClaimReward(reward) ? (
                        <Button 
                          size="sm"
                          onClick={() => claimReward(reward.day)}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Resgatar
                        </Button>
                      ) : currentStreak >= reward.day ? (
                        <Badge variant="secondary">
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="opacity-60">
                          Bloqueado
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Recompensas:</div>
                    <div className="flex flex-wrap gap-2">
                      {reward.rewards.map((rewardItem, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {rewardItem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Motivation Section */}
          <Card className="mt-8 border-gradient-primary bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-6 text-center">
              <Flame className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Continue Sua Jornada!</h3>
              <p className="text-muted-foreground mb-4">
                Cada dia consecutivo te aproxima de recompensas ainda mais incríveis. 
                Não quebre sua sequência!
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                Continuar Jogando
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}