import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Users } from "lucide-react";

export default function Leagues() {
  const leagues = [
    { name: "Bronze", color: "bg-amber-600", players: 45, minPoints: 0, maxPoints: 999 },
    { name: "Prata", color: "bg-gray-400", players: 32, minPoints: 1000, maxPoints: 2499 },
    { name: "Ouro", color: "bg-yellow-500", players: 28, minPoints: 2500, maxPoints: 4999 },
    { name: "Platina", color: "bg-blue-500", players: 15, minPoints: 5000, maxPoints: 9999 },
    { name: "Diamante", color: "bg-purple-500", players: 8, minPoints: 10000, maxPoints: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🏅 Sistema de Ligas</h1>
        
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8" />
                <div>
                  <CardTitle>Sua Liga Atual: Ouro</CardTitle>
                  <CardDescription className="text-white/80">
                    Posição #23 | 3,450 pontos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4">
          {leagues.map((league, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${league.color} text-white`}>
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{league.name}</CardTitle>
                      <CardDescription>
                        {league.minPoints} - {league.maxPoints ? `${league.maxPoints} pontos` : '∞ pontos'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{league.players} jogadores</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Recompensas semanais baseadas na posição
                  </span>
                  <Badge variant="outline">Ativa</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}