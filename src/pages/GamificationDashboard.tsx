import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp,
  Star,
  Medal,
  Crown,
  Flame
} from "lucide-react";

export default function GamificationDashboard() {
  const achievements = [
    { name: "Primeiro Quiz", description: "Complete seu primeiro quiz", progress: 100, icon: Trophy, rarity: "bronze" },
    { name: "Streak Master", description: "Mantenha uma sequência de 7 dias", progress: 60, icon: Flame, rarity: "silver" },
    { name: "Quiz Champion", description: "Vença 10 duelos seguidos", progress: 30, icon: Crown, rarity: "gold" },
  ];

  const powerups = [
    { name: "Tempo Extra", description: "+30 segundos no quiz", quantity: 3, icon: Zap },
    { name: "Dica Inteligente", description: "Elimina 2 alternativas incorretas", quantity: 5, icon: Target },
    { name: "Dobrar Pontos", description: "Dobra os pontos da próxima questão", quantity: 2, icon: Star },
  ];

  const dailyChallenges = [
    { title: "Complete 3 quizzes", progress: 67, reward: "100 Beetz", icon: Target },
    { title: "Vença 1 duelo", progress: 0, reward: "Power-up Aleatório", icon: Trophy },
    { title: "Acerte 15 questões seguidas", progress: 40, reward: "Badge Especial", icon: Medal },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎮 Dashboard de Gamificação</h1>
          <p className="text-muted-foreground">
            Gerencie suas conquistas, power-ups e desafios diários
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">2,340 XP para o próximo</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24/50</div>
              <p className="text-xs text-muted-foreground">48% completado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Liga Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">Ouro</div>
              <p className="text-xs text-muted-foreground">Posição #23</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">🔥 7</div>
              <p className="text-xs text-muted-foreground">dias consecutivos</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="powerups">Power-ups</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
            <TabsTrigger value="leagues">Ligas</TabsTrigger>
          </TabsList>

          {/* Conquistas Tab */}
          <TabsContent value="achievements">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Conquistas Recentes</h3>
              {achievements.map((achievement, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.rarity === 'gold' ? 'bg-yellow-500' :
                          achievement.rarity === 'silver' ? 'bg-gray-400' : 'bg-amber-600'
                        } text-white`}>
                          <achievement.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{achievement.name}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={achievement.progress === 100 ? 'default' : 'secondary'}>
                        {achievement.progress === 100 ? 'Completo' : 'Em progresso'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={achievement.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">{achievement.progress}% completo</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Power-ups Tab */}
          <TabsContent value="powerups">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Seus Power-ups</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {powerups.map((powerup, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary text-white">
                          <powerup.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{powerup.name}</CardTitle>
                          <CardDescription className="text-xs">{powerup.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{powerup.quantity}</span>
                        <Button size="sm" variant="outline">Usar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Desafios Tab */}
          <TabsContent value="challenges">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Desafios Diários</h3>
              {dailyChallenges.map((challenge, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary text-white">
                          <challenge.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{challenge.title}</CardTitle>
                          <CardDescription>Recompensa: {challenge.reward}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={challenge.progress === 100 ? 'default' : 'outline'}>
                        {challenge.progress}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={challenge.progress} className="w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ligas Tab */}
          <TabsContent value="leagues">
            <Card>
              <CardHeader>
                <CardTitle>Liga Ouro</CardTitle>
                <CardDescription>Você está na posição #23 de 100 jogadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold">1º Lugar - João Silva</p>
                        <p className="text-sm text-muted-foreground">15,420 pontos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center">
                        23
                      </div>
                      <div>
                        <p className="font-semibold">Você</p>
                        <p className="text-sm text-muted-foreground">8,950 pontos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button variant="outline">Ver Ranking Completo</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}