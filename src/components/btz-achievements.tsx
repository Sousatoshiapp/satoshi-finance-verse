import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Trophy, Star, Target } from 'lucide-react';

export function BTZAchievements() {
  const achievements = [
    {
      id: 1,
      title: 'Primeiro Milhão',
      description: 'Acumule 1.000.000 BTZ',
      icon: Trophy,
      completed: false,
      progress: 45,
    },
    {
      id: 2,
      title: 'Streak Master',
      description: 'Mantenha uma sequência de 30 dias',
      icon: Star,
      completed: true,
      progress: 100,
    },
    {
      id: 3,
      title: 'Quiz Expert',
      description: 'Complete 100 quizzes',
      icon: Target,
      completed: false,
      progress: 78,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Conquistas BTZ</h2>
      <div className="grid gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card key={achievement.id}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Icon className="h-6 w-6 mr-2" />
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                {achievement.completed && (
                  <Badge className="ml-auto">Completo</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{achievement.description}</p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.progress}% completo
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}