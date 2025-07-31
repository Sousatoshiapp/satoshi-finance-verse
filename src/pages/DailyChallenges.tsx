import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Target, Trophy, Medal, Gift, Clock } from "lucide-react";

export default function DailyChallenges() {
  const challenges = [
    { 
      title: "Complete 3 quizzes", 
      description: "Responda pelo menos 3 quizzes hoje",
      progress: 67, 
      current: 2,
      target: 3,
      reward: "100 Beetz", 
      icon: Target,
      timeLeft: "14h 32m"
    },
    { 
      title: "Vença 1 duelo", 
      description: "Derrote um oponente em duelo",
      progress: 0, 
      current: 0,
      target: 1,
      reward: "Power-up Aleatório", 
      icon: Trophy,
      timeLeft: "14h 32m"
    },
    { 
      title: "Acerte 15 questões seguidas", 
      description: "Mantenha uma sequência de acertos",
      progress: 40, 
      current: 6,
      target: 15,
      reward: "Badge Especial", 
      icon: Medal,
      timeLeft: "14h 32m"
    },
    { 
      title: "Estude por 30 minutos", 
      description: "Tempo total de estudo hoje",
      progress: 80, 
      current: 24,
      target: 30,
      reward: "50 XP Bônus", 
      icon: Clock,
      timeLeft: "14h 32m"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎯 Desafios Diários</h1>
          <p className="text-muted-foreground">Complete os desafios para ganhar recompensas especiais</p>
        </div>

        {/* Streak Info */}
        <Card className="mb-6 bg-gradient-to-r from-primary to-secondary text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Sequência de Desafios</CardTitle>
                <CardDescription className="text-white/80">
                  Complete todos os desafios para manter sua sequência
                </CardDescription>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-white/80">dias</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Challenges */}
        <div className="grid gap-4">
          {challenges.map((challenge, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary text-white">
                      <challenge.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={challenge.progress === 100 ? 'default' : 'outline'}>
                      {challenge.progress === 100 ? 'Completo' : challenge.timeLeft}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso: {challenge.current}/{challenge.target}</span>
                    <span className="font-medium">{challenge.progress}%</span>
                  </div>
                  
                  <Progress value={challenge.progress} className="w-full" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{challenge.reward}</span>
                    </div>
                    
                    {challenge.progress === 100 ? (
                      <Button size="sm">
                        Resgatar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bonus Challenge */}
        <Card className="mt-6 border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500 text-white">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Desafio Bônus</CardTitle>
                <CardDescription>Complete todos os desafios diários para desbloquear</CardDescription>
              </div>
              <Badge className="ml-auto bg-yellow-500">Especial</Badge>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
