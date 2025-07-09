import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Crown } from "lucide-react";

export default function Achievements() {
  const achievements = [
    { name: "Primeiro Quiz", description: "Complete seu primeiro quiz", progress: 100, icon: Trophy, rarity: "bronze" },
    { name: "Streak Master", description: "Mantenha uma sequência de 7 dias", progress: 60, icon: Medal, rarity: "silver" },
    { name: "Quiz Champion", description: "Vença 10 duelos seguidos", progress: 30, icon: Crown, rarity: "gold" },
    { name: "Especialista", description: "Complete 50 quizzes", progress: 75, icon: Star, rarity: "silver" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🏆 Conquistas</h1>
        
        <div className="grid gap-4">
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
                    {achievement.progress === 100 ? 'Completo' : `${achievement.progress}%`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}