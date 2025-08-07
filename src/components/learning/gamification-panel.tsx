import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Trophy, Star, Medal, Gift, Zap } from 'lucide-react';

export function GamificationPanel() {
  const achievements = [
    {
      id: 1,
      title: 'Primeiro Quiz',
      description: 'Complete seu primeiro quiz',
      icon: Star,
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Streak Master',
      description: 'Mantenha uma sequência de 7 dias',
      icon: Trophy,
      unlocked: true,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Quiz Expert',
      description: 'Acerte 100 questões seguidas',
      icon: Medal,
      unlocked: false,
      rarity: 'legendary'
    }
  ];

  const dailyRewards = [
    { day: 1, reward: '100 BTZ', claimed: true },
    { day: 2, reward: '150 BTZ', claimed: true },
    { day: 3, reward: '200 BTZ', claimed: false },
    { day: 4, reward: 'XP Boost', claimed: false },
    { day: 5, reward: '500 BTZ', claimed: false }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gamificação</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.unlocked ? 'bg-muted/50' : 'bg-muted/20 opacity-60'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${getRarityColor(achievement.rarity)}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                    {achievement.unlocked ? 'Desbloqueado' : 'Bloqueado'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Daily Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Recompensas Diárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {dailyRewards.map((reward, index) => (
                <div 
                  key={reward.day}
                  className={`text-center p-3 rounded-lg border ${
                    reward.claimed 
                      ? 'bg-green-100 border-green-300' 
                      : index === 2 
                        ? 'bg-yellow-100 border-yellow-300'
                        : 'bg-muted/50'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">Dia {reward.day}</div>
                  <div className="text-xs">{reward.reward}</div>
                  {index === 2 && !reward.claimed && (
                    <Button size="sm" className="mt-2 text-xs h-6">
                      <Zap className="h-3 w-3 mr-1" />
                      Coletar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}