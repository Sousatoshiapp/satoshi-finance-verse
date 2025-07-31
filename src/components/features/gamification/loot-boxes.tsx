import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { useLootBoxes } from "@/hooks/use-loot-boxes";
import { Gift, Package, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function LootBoxes() {
  const { 
    unopenedBoxes, 
    loading, 
    opening, 
    openLootBox, 
    claimDailyLootBox,
    canClaimDaily,
    getRarityColor,
    getRarityGradient
  } = useLootBoxes();
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);

  const handleOpenBox = async (boxId: string) => {
    await openLootBox(boxId);
    setShowOpenDialog(false);
    setSelectedBox(null);
  };

  const handleClaimDaily = async () => {
    await claimDailyLootBox();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Loot Boxes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-yellow-500/20 bg-gradient-to-br from-background to-yellow-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-yellow-500" />
              Loot Boxes
              <Badge variant="secondary" className="ml-2">
                {unopenedBoxes.length}
              </Badge>
            </CardTitle>
            
            {canClaimDaily && (
              <Button 
                size="sm" 
                onClick={handleClaimDaily}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
              >
                <Gift className="h-4 w-4 mr-1" />
                Coletar Diária
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {unopenedBoxes.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {unopenedBoxes.map((userBox) => (
                <div
                  key={userBox.id}
                  className={cn(
                    "relative border-2 rounded-lg p-2 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    getRarityColor(userBox.loot_boxes.rarity)
                  )}
                  onClick={() => {
                    setSelectedBox(userBox);
                    setShowOpenDialog(true);
                  }}
                >
                  {/* Rarity Glow Effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-20 animate-pulse",
                    getRarityGradient(userBox.loot_boxes.rarity)
                  )}></div>
                  
                  <div className="relative">
                    {/* Box Icon */}
                    <div className="text-2xl mb-1">
                      <img 
                        src="/src/assets/cyberpunk-loot-box.jpg" 
                        alt="Cyberpunk Loot Box" 
                        className="w-8 h-8 mx-auto object-cover rounded"
                      />
                    </div>
                    
                    {/* Sparkle Effect for Rare+ */}
                    {['rare', 'epic', 'legendary'].includes(userBox.loot_boxes.rarity) && (
                      <Sparkles className="absolute top-0 right-0 h-4 w-4 text-yellow-400 animate-pulse" />
                    )}
                    
                    <h3 className="font-medium text-xs mb-1">
                      {userBox.loot_boxes.name}
                    </h3>
                    
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs capitalize", getRarityColor(userBox.loot_boxes.rarity))}
                    >
                      {userBox.loot_boxes.rarity}
                    </Badge>
                    
                    {/* Source */}
                    <div className="text-xs text-muted-foreground mt-1">
                      {userBox.source === 'daily_reward' && '📅 Recompensa Diária'}
                      {userBox.source === 'daily_combo' && '🔥 Combo Diário'}
                      {userBox.source === 'mission_reward' && '⚡ Missão'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Nenhuma loot box disponível</p>
              <p className="text-sm">Complete missões diárias para ganhar mais!</p>
              
              {!canClaimDaily && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <Clock className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs">Loot box diária já coletada hoje</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Box Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Abrir Loot Box</DialogTitle>
          </DialogHeader>
          
          {selectedBox && (
            <div className="text-center space-y-4">
              <div className={cn(
                "relative border-2 rounded-xl p-8 mx-auto max-w-xs",
                getRarityColor(selectedBox.loot_boxes.rarity)
              )}>
                {/* Rarity Glow Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-30 animate-pulse",
                  getRarityGradient(selectedBox.loot_boxes.rarity)
                )}></div>
                
                <div className="relative">
                  <div className="mb-4">
                    <img 
                      src="/src/assets/cyberpunk-loot-box.jpg" 
                      alt="Cyberpunk Loot Box" 
                      className="w-24 h-24 mx-auto object-cover rounded-lg"
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">
                    {selectedBox.loot_boxes.name}
                  </h3>
                  
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize", getRarityColor(selectedBox.loot_boxes.rarity))}
                  >
                    {selectedBox.loot_boxes.rarity}
                  </Badge>
                  
                  {selectedBox.loot_boxes.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedBox.loot_boxes.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleOpenBox(selectedBox.id)}
                  disabled={opening === selectedBox.id}
                  className={cn(
                    "w-full text-white border-0",
                    getRarityGradient(selectedBox.loot_boxes.rarity)
                  )}
                >
                  {opening === selectedBox.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Abrindo...
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Abrir Agora!
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowOpenDialog(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
