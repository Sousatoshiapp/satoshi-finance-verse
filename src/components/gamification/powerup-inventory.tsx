import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { usePowerups } from "@/hooks/use-powerups";
import { Package, Zap, Shield, Wrench, Sparkles, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PowerupInventory() {
  const { 
    availablePowerups, 
    userPowerups, 
    activePowerups, 
    loading, 
    activatePowerup,
    getRarityColor,
    getCategoryIcon 
  } = usePowerups();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Power-ups Ativos */}
      {activePowerups.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5" />
              Power-ups Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePowerups.map((powerup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryIcon(powerup.trigger)}</div>
                    <div>
                      <div className="font-medium">{powerup.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {powerup.value}x multiplicador
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {powerup.remaining}/{powerup.duration}
                    </div>
                    <div className="text-sm text-muted-foreground">restante</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventário de Power-ups */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="shop">Loja</TabsTrigger>
          <TabsTrigger value="crafting">Crafting</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Seus Power-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userPowerups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPowerups.map((userPowerup) => (
                    <Card key={userPowerup.id} className={cn("border-2", getRarityColor(userPowerup.advanced_powerups.rarity))}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl">{getCategoryIcon(userPowerup.advanced_powerups.category)}</div>
                            <div>
                              <div className="font-medium">{userPowerup.advanced_powerups.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {userPowerup.advanced_powerups.rarity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl">
                              {userPowerup.quantity}
                            </div>
                            <div className="text-xs text-muted-foreground">un.</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {userPowerup.advanced_powerups.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Efeito:</span>
                            <span className="font-medium">
                              {userPowerup.advanced_powerups.effect_data.value}x por {userPowerup.advanced_powerups.effect_data.duration}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tipo:</span>
                            <span className="font-medium capitalize">
                              {userPowerup.advanced_powerups.effect_data.type}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => activatePowerup(userPowerup.powerup_id)}
                          disabled={userPowerup.quantity <= 0}
                          className="w-full mt-3"
                          size="sm"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Ativar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum power-up no inventário</p>
                  <p className="text-sm">Abra caixas de loot ou participe de eventos para obter power-ups!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Loja de Power-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePowerups.map((powerup) => (
                  <Card key={powerup.id} className={cn("border-2", getRarityColor(powerup.rarity))}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{getCategoryIcon(powerup.category)}</div>
                          <div>
                            <div className="font-medium">{powerup.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {powerup.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {powerup.description}
                      </p>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Efeito:</span>
                          <span className="font-medium">
                            {powerup.effect_data.value}x por {powerup.effect_data.duration}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Categoria:</span>
                          <span className="font-medium capitalize">
                            {powerup.category}
                          </span>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">
                          Disponível em:
                        </div>
                        <div className="text-xs">
                          🎁 Caixas de Loot • 🏆 Eventos • 🎯 Missões
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crafting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Sistema de Crafting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sistema de Crafting</h3>
                <p className="mb-4">
                  Combine power-ups para criar versões mais poderosas!
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>🔥 Fire Streak</span>
                    <Plus className="h-4 w-4" />
                    <span>⚡ Lightning</span>
                    <span>=</span>
                    <span>💎 Ultimate Power</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>🛡️ Shield</span>
                    <Plus className="h-4 w-4" />
                    <span>🎯 Focus</span>
                    <span>=</span>
                    <span>🚀 Super Shield</span>
                  </div>
                </div>
                <Button className="mt-4" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}