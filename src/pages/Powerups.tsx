import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Star, Clock, Shield, Flame } from "lucide-react";

export default function Powerups() {
  const powerups = [
    { name: "Tempo Extra", description: "+30 segundos no quiz", quantity: 3, icon: Clock, rarity: "common" },
    { name: "Dica Inteligente", description: "Elimina 2 alternativas incorretas", quantity: 5, icon: Target, rarity: "common" },
    { name: "Dobrar Pontos", description: "Dobra os pontos da próxima questão", quantity: 2, icon: Star, rarity: "rare" },
    { name: "Escudo", description: "Protege de 1 resposta incorreta", quantity: 1, icon: Shield, rarity: "epic" },
    { name: "Combo Boost", description: "Inicia com combo x2", quantity: 0, icon: Flame, rarity: "legendary" },
    { name: "Raio do Saber", description: "Revela a resposta correta", quantity: 1, icon: Zap, rarity: "epic" },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">⚡ Power-ups</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {powerups.map((powerup, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 ${getRarityColor(powerup.rarity)} opacity-10 rounded-bl-full`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${getRarityColor(powerup.rarity)} text-white`}>
                    <powerup.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {powerup.rarity}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{powerup.name}</CardTitle>
                <CardDescription className="text-sm">{powerup.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{powerup.quantity}</div>
                    <div className="text-xs text-muted-foreground">Disponível</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={powerup.quantity > 0 ? "default" : "secondary"}
                    disabled={powerup.quantity === 0}
                  >
                    {powerup.quantity > 0 ? "Usar" : "Esgotado"}
                  </Button>
                </div>
                
                {powerup.quantity === 0 && (
                  <Button variant="outline" size="sm" className="w-full">
                    Comprar na Loja
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}