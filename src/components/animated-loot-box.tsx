import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { Gift, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AnimatedLootBoxProps {
  isAvailable: boolean;
}

interface Prize {
  type: 'xp' | 'beetz' | 'avatar' | 'boost' | 'badge';
  value: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function AnimatedLootBox({ isAvailable }: AnimatedLootBoxProps) {
  const { toast } = useToast();
  const [isOpening, setIsOpening] = useState(false);
  const [showPrize, setShowPrize] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [isVisible, setIsVisible] = useState(isAvailable);

  if (!isVisible) {
    return null;
  }

  const generateRandomPrize = (): Prize => {
    const prizes = [
      { type: 'xp' as const, value: 500, name: '500 XP', rarity: 'common' as const },
      { type: 'beetz' as const, value: 1000, name: '1000 Beetz', rarity: 'common' as const },
      { type: 'xp' as const, value: 1500, name: '1500 XP', rarity: 'rare' as const },
      { type: 'beetz' as const, value: 2500, name: '2500 Beetz', rarity: 'rare' as const },
      { type: 'boost' as const, value: 1, name: 'XP Multiplier 2x', rarity: 'epic' as const },
      { type: 'avatar' as const, value: 1, name: 'Avatar Raro', rarity: 'epic' as const },
      { type: 'badge' as const, value: 1, name: 'Badge Lendário', rarity: 'legendary' as const }
    ];

    const random = Math.random();
    if (random < 0.5) return prizes[Math.floor(Math.random() * 2)]; // Common
    if (random < 0.8) return prizes[2 + Math.floor(Math.random() * 2)]; // Rare
    if (random < 0.95) return prizes[4 + Math.floor(Math.random() * 2)]; // Epic
    return prizes[6]; // Legendary
  };

  const handleLootBoxClick = () => {
    if (isOpening || showPrize) return;

    setIsOpening(true);
    
    setTimeout(() => {
      const newPrize = generateRandomPrize();
      setPrize(newPrize);
      setIsOpening(false);
      setShowPrize(true);
      
      toast({
        title: "🎉 Loot Box Aberta!",
        description: `Você ganhou: ${newPrize.name}`,
      });
    }, 2000);
  };

  const handleCollectPrize = () => {
    setShowPrize(false);
    setIsVisible(false);
    
    toast({
      title: "Prêmio Coletado!",
      description: "O prêmio foi adicionado à sua conta.",
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
      case 'rare': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'epic': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      case 'legendary': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-muted-foreground';
    }
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'xp': return '⚡';
      case 'beetz': return <BeetzIcon size="md" />;
      case 'avatar': return '🤖';
      case 'boost': return '🚀';
      case 'badge': return '🏆';
      default: return '🎁';
    }
  };

  if (showPrize && prize) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className={cn("max-w-sm w-full border-2", getRarityColor(prize.rarity))}>
          <CardHeader className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{getPrizeIcon(prize.type)}</div>
            <CardTitle className="text-2xl">🎉 Parabéns!</CardTitle>
            <p className="text-muted-foreground">Você ganhou um prêmio incrível!</p>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{prize.name}</h3>
              <Badge className={cn("capitalize", getRarityColor(prize.rarity))}>
                {prize.rarity}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCollectPrize} className="flex-1">
                Coletar Prêmio
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPrize(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "fixed bottom-24 right-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-glow cursor-pointer transition-all z-40",
        isOpening ? "animate-spin scale-110" : "hover:scale-110"
      )}
      onClick={handleLootBoxClick}
    >
      <CardContent className="p-0 h-full flex items-center justify-center relative overflow-hidden">
        {/* Opening animation overlay */}
        {isOpening && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"></div>
        )}
        
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        
        {/* Main icon */}
        <Gift className={cn(
          "h-8 w-8 text-white",
          isOpening ? "animate-ping" : "animate-bounce"
        )} />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute top-1 right-1 h-4 w-4 text-yellow-300 animate-pulse" />
        <Sparkles className="absolute bottom-1 left-1 h-3 w-3 text-blue-300 animate-pulse delay-300" />
        
        {/* Opening sparkles */}
        {isOpening && (
          <>
            <Sparkles className="absolute top-0 left-0 h-6 w-6 text-yellow-400 animate-ping" />
            <Sparkles className="absolute bottom-0 right-0 h-6 w-6 text-blue-400 animate-ping delay-150" />
          </>
        )}
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-400/50 to-pink-400/50 blur-md -z-10"></div>
      </CardContent>
    </Card>
  );
}