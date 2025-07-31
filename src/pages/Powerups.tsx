import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Zap, Target, Star, Clock, Shield, Flame, ArrowLeft, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PowerUp {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  effects: any;
  duration_minutes?: number;
  cooldown_minutes?: number;
  max_uses_per_day?: number;
  image_url?: string;
  quantity?: number;
}

export default function Powerups() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [powerups, setPowerups] = useState<PowerUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInventory, setUserInventory] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPowerups();
  }, []);

  const loadPowerups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load available powerups
      const { data: powerupsData } = await supabase
        .from('advanced_powerups')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: false });

      // Load user's powerup inventory (mock data for now)
      const mockInventory = {
        'tempo-extra': 3,
        'dica-inteligente': 5,
        'dobrar-pontos': 2,
        'escudo': 1,
        'raio-saber': 1
      };

      setPowerups(powerupsData || []);
      setUserInventory(mockInventory);
    } catch (error) {
      console.error('Error loading powerups:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os power-ups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const usePowerup = async (powerupId: string) => {
    try {
      const currentQuantity = userInventory[powerupId] || 0;
      if (currentQuantity <= 0) {
        toast({
          title: "Power-up Indisponível",
          description: "Você não possui este power-up",
          variant: "destructive"
        });
        return;
      }

      // Update inventory
      setUserInventory(prev => ({
        ...prev,
        [powerupId]: Math.max(0, currentQuantity - 1)
      }));

      // Store in localStorage for quiz usage
      const activePowerups = JSON.parse(localStorage.getItem('activePowerups') || '[]');
      activePowerups.push({
        id: powerupId,
        activatedAt: Date.now(),
        duration: 30 * 60 * 1000 // 30 minutes
      });
      localStorage.setItem('activePowerups', JSON.stringify(activePowerups));

      toast({
        title: "Power-up Ativado!",
        description: "O power-up foi ativado e estará disponível no próximo quiz",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error using powerup:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o power-up",
        variant: "destructive"
      });
    }
  };

  const buyPowerup = (powerupId: string) => {
    toast({
      title: "Loja em Desenvolvimento",
      description: "A compra de power-ups estará disponível em breve!",
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'common': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'speed': return Clock;
      case 'hint': return Target;
      case 'multiplier': return Star;
      case 'protection': return Shield;
      case 'combo': return Flame;
      default: return Zap;
    }
  };

  // Mock powerups data if none from database
  const mockPowerups = [
    { 
      id: 'tempo-extra', 
      name: "Tempo Extra", 
      description: "+30 segundos no quiz", 
      category: 'speed',
      rarity: "common",
      effects: { timeBonus: 30 },
      duration_minutes: 30
    },
    { 
      id: 'dica-inteligente', 
      name: "Dica Inteligente", 
      description: "Elimina 2 alternativas incorretas", 
      category: 'hint',
      rarity: "common",
      effects: { eliminateOptions: 2 }
    },
    { 
      id: 'dobrar-pontos', 
      name: "Dobrar Pontos", 
      description: "Dobra os pontos da próxima questão", 
      category: 'multiplier',
      rarity: "rare",
      effects: { pointsMultiplier: 2 }
    },
    { 
      id: 'escudo', 
      name: "Escudo", 
      description: "Protege de 1 resposta incorreta", 
      category: 'protection',
      rarity: "epic",
      effects: { protection: 1 }
    },
    { 
      id: 'combo-boost', 
      name: "Combo Boost", 
      description: "Inicia com combo x2", 
      category: 'combo',
      rarity: "legendary",
      effects: { comboStart: 2 }
    },
    { 
      id: 'raio-saber', 
      name: "Raio do Saber", 
      description: "Revela a resposta correta", 
      category: 'hint',
      rarity: "epic",
      effects: { revealAnswer: true }
    },
  ];

  const displayPowerups = powerups.length > 0 ? powerups : mockPowerups;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                ⚡ Power-ups
              </h1>
              <p className="text-muted-foreground">Gerencie e use seus power-ups para melhorar sua performance</p>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Seu Inventário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {Object.values(userInventory).reduce((sum, count) => sum + count, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Power-ups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {Object.keys(userInventory).filter(key => userInventory[key] > 0).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Tipos Diferentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {JSON.parse(localStorage.getItem('activePowerups') || '[]').filter((p: any) => 
                      Date.now() - p.activatedAt < p.duration
                    ).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">3</div>
                  <div className="text-xs text-muted-foreground">Usos Restantes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Powerups Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPowerups.map((powerup) => {
              const IconComponent = getIconForCategory(powerup.category);
              const quantity = userInventory[powerup.id] || 0;
              
              return (
                <Card key={powerup.id} className="relative overflow-hidden hover:shadow-lg transition-all">
                  <div className={cn(
                    "absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full",
                    getRarityColor(powerup.rarity)
                  )} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-3 rounded-lg text-white shadow-lg",
                        getRarityColor(powerup.rarity)
                      )}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {powerup.rarity}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{powerup.name}</CardTitle>
                    <CardDescription className="text-sm">{powerup.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{quantity}</div>
                          <div className="text-xs text-muted-foreground">Disponível</div>
                        </div>
                        {powerup.duration_minutes && (
                          <div className="text-center">
                            <div className="text-lg font-medium text-blue-500">
                              {powerup.duration_minutes}min
                            </div>
                            <div className="text-xs text-muted-foreground">Duração</div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant={quantity > 0 ? "default" : "secondary"}
                          disabled={quantity === 0}
                          onClick={() => usePowerup(powerup.id)}
                        >
                          {quantity > 0 ? "Usar Power-up" : "Indisponível"}
                        </Button>
                        
                        {quantity === 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => buyPowerup(powerup.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Comprar na Loja
                          </Button>
                        )}
                      </div>

                      {/* Effects Info */}
                      {powerup.effects && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          <div className="font-medium mb-1">Efeitos:</div>
                          <div className="space-y-1">
                            {Object.entries(powerup.effects).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {displayPowerups.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum power-up disponível</p>
              <p className="text-sm">Complete missões e desafios para ganhar power-ups!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
