import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AnimatedLootBoxProps {
  isAvailable?: boolean;
}

export function AnimatedLootBox({ isAvailable = true }: AnimatedLootBoxProps) {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAvailable) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Card 
        className={cn(
          "border-2 border-gradient-primary bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm shadow-2xl transition-all duration-500 cursor-pointer hover:scale-110",
          isAnimating && "animate-bounce shadow-glow"
        )}
        onClick={() => navigate('/loot-boxes')}
      >
        <CardContent className="p-4 text-center">
          <div className="relative mb-2">
            <div className={cn(
              "text-4xl transition-transform duration-300",
              isAnimating && "animate-pulse scale-110"
            )}>
              🎁
            </div>
            
            {/* Sparkle effects */}
            <div className={cn(
              "absolute -top-1 -right-1 transition-opacity duration-300",
              isAnimating ? "opacity-100" : "opacity-0"
            )}>
              <Sparkles className="h-4 w-4 text-yellow-400 animate-spin" />
            </div>
            
            <div className={cn(
              "absolute -bottom-1 -left-1 transition-opacity duration-300",
              isAnimating ? "opacity-100" : "opacity-0"
            )}>
              <Sparkles className="h-3 w-3 text-pink-400 animate-ping" />
            </div>
          </div>
          
          <div className="text-xs font-bold text-white mb-1">
            Loot Box
          </div>
          <div className="text-xs text-white/80">
            Disponível!
          </div>
          
          <Button 
            size="sm" 
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            <Gift className="h-3 w-3 mr-1" />
            Abrir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}