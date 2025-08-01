import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shared/ui/dialog";
import { Progress } from "@/components/shared/ui/progress";
import { Separator } from "@/components/shared/ui/separator";
import { useLoot } from "@/hooks/use-loot";
import { 
  Package, 
  Gift, 
  Sparkles, 
  History, 
  Coins, 
  Star,
  TrendingUp,
  Clock,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LootBoxOpeningProps {
  lootBox: any;
  onOpen: (lootBoxId: string) => void;
}

function LootBoxOpening({ lootBox, onOpen }: LootBoxOpeningProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = async () => {
    setIsOpening(true);
    await onOpen(lootBox.id);
    setIsOpening(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Gift className="h-4 w-4 mr-2" />
          Abrir Caixa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="text-2xl">{lootBox.theme === 'crypto' ? '₿' : '📦'}</div>
            {lootBox.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">
              {lootBox.theme === 'crypto' ? '₿' : '📦'}
            </div>
            <p className="text-muted-foreground">
              Esta caixa contém de {lootBox.min_items} a {lootBox.max_items} itens
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Itens Possíveis:</div>
            <div className="flex flex-wrap gap-1">
              {lootBox.preview_items.map((item: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item.icon} {item.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleOpen}
            disabled={isOpening}
            className="w-full"
          >
            {isOpening ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Abrir Agora!
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LootBoxPanel() {
  const { 
    availableLootBoxes, 
    userLootHistory, 
    userLootBoxes, 
    loading, 
    openLootBox,
    purchaseLootBox,
    getRarityColor,
    getThemeIcon
  } = useLoot();

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
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Caixas Disponíveis para Abrir */}
      {userLootBoxes.length > 0 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Package className="h-5 w-5" />
              Suas Caixas de Loot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userLootBoxes.map((userBox) => (
                <Card key={userBox.id} className="border-2 border-yellow-300 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-3xl">{getThemeIcon(userBox.loot_boxes.theme)}</div>
                        <div>
                          <div className="font-medium">{userBox.loot_boxes.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {userBox.loot_boxes.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Itens:</span>
                        <span className="font-medium">
                          {userBox.loot_boxes.min_items}-{userBox.loot_boxes.max_items}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tema:</span>
                        <span className="font-medium capitalize">
                          {userBox.loot_boxes.theme}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Obtida:</span>
                        <span className="font-medium">
                          {new Date(userBox.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <LootBoxOpening 
                      lootBox={userBox.loot_boxes} 
                      onOpen={openLootBox}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Principal */}
      <Tabs defaultValue="shop" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shop">Loja</TabsTrigger>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Loja de Caixas de Loot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableLootBoxes.map((lootBox) => (
                  <Card key={lootBox.id} className={cn("border-2", getRarityColor(lootBox.rarity))}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl">{getThemeIcon(lootBox.theme)}</div>
                          <div>
                            <div className="font-medium">{lootBox.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {lootBox.rarity}
                            </Badge>
                          </div>
                        </div>
                        {lootBox.seasonal && (
                          <Badge className="bg-purple-100 text-purple-700">
                            Sazonal
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Itens:</span>
                          <span className="font-medium">
                            {lootBox.min_items}-{lootBox.max_items}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tema:</span>
                          <span className="font-medium capitalize">
                            {lootBox.theme}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pity Timer:</span>
                          <span className="font-medium">
                            {lootBox.pity_timer} caixas
                          </span>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Itens Possíveis:</div>
                        <div className="flex flex-wrap gap-1">
                          {lootBox.preview_items.slice(0, 3).map((item: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item.icon} {item.name}
                            </Badge>
                          ))}
                          {lootBox.preview_items.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{lootBox.preview_items.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-yellow-600" />
                          <span className="font-bold">500 Beetz</span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => purchaseLootBox(lootBox.id, 500)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Comprar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventário de Caixas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userLootBoxes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userLootBoxes.map((userBox) => (
                    <Card key={userBox.id} className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="text-3xl">{getThemeIcon(userBox.loot_boxes.theme)}</div>
                            <div>
                              <div className="font-medium">{userBox.loot_boxes.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {userBox.loot_boxes.rarity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {userBox.source}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Obtida em:</span>
                            <span className="font-medium">
                              {new Date(userBox.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <Badge variant={userBox.opened ? "secondary" : "default"}>
                              {userBox.opened ? "Aberta" : "Fechada"}
                            </Badge>
                          </div>
                        </div>
                        
                        {!userBox.opened && (
                          <LootBoxOpening 
                            lootBox={userBox.loot_boxes} 
                            onOpen={openLootBox}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma caixa no inventário</p>
                  <p className="text-sm">Compre caixas na loja ou ganhe em eventos!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Aberturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userLootHistory.length > 0 ? (
                <div className="space-y-4">
                  {userLootHistory.map((history) => (
                    <Card key={history.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getThemeIcon(history.themed_loot_boxes.theme)}</div>
                            <div>
                              <div className="font-medium">{history.themed_loot_boxes.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(history.opened_at).toLocaleDateString('pt-BR')} às {' '}
                                {new Date(history.opened_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                          {history.was_guaranteed_rare && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Star className="h-3 w-3 mr-1" />
                              Garantido
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Itens Obtidos:</div>
                          <div className="flex flex-wrap gap-1">
                            {history.items_received.map((item: any, index: number) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={cn("text-xs", getRarityColor(item.rarity))}
                              >
                                {item.icon} {item.name}
                                {item.amount && ` (${item.amount})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                          <span>Pity Count:</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(history.pity_count / history.themed_loot_boxes.pity_timer) * 100} 
                              className="w-20 h-2"
                            />
                            <span className="font-medium">
                              {history.pity_count}/{history.themed_loot_boxes.pity_timer}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum histórico de aberturas</p>
                  <p className="text-sm">Suas aberturas de caixas aparecerão aqui!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
