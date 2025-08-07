import { memo, useState } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Bitcoin, TrendingUp, TrendingDown, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBtcPrice } from "@/hooks/use-btc-price";

const BtcDuelCard = memo(function BtcDuelCard() {
  const navigate = useNavigate();
  const { price, priceChange } = useBtcPrice();
  const [isGlowing, setIsGlowing] = useState(false);

  const handleStartDuel = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 200);
    navigate('/btc-duel');
  };

  return (
    <Card className={`relative h-20 overflow-hidden border-0 transition-all duration-300 ${
      isGlowing ? 'scale-105' : ''
    }`}>
      {/* Cyber Background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/2 to-purple-500/5" />
      
      {/* Animated border effect */}
      <div className="absolute inset-0 border border-cyan-400/30 rounded-lg" />
      <div className="absolute inset-0 border border-cyan-400/20 rounded-lg animate-pulse" />
      
      {/* Scanning line effect */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      
      {/* Content */}
      <CardContent className="relative z-10 p-3 h-full flex items-center justify-between">
        {/* Left side - Info */}
        <div className="flex items-center gap-3">
          {/* Bitcoin icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-md animate-pulse" />
            <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-full">
              <Bitcoin className="h-4 w-4 text-white" />
            </div>
          </div>
          
          {/* Duel info */}
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">
              Duelo Rápido
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-cyan-300">BTC</span>
              <span className="text-gray-300">${price?.toLocaleString()}</span>
              {priceChange && (
                <span className={`flex items-center gap-1 ${
                  priceChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {priceChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(priceChange).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center - Timer icon */}
        <div className="flex flex-col items-center">
          <Timer className="h-4 w-4 text-purple-400 animate-pulse" />
          <span className="text-xs text-purple-300">5min</span>
        </div>

        {/* Right side - CTA Button */}
        <Button
          onClick={handleStartDuel}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                     text-white border-0 shadow-lg shadow-cyan-500/25 text-xs px-3 py-1 h-auto
                     transition-all duration-200 hover:shadow-cyan-500/40 hover:scale-105
                     relative overflow-hidden group"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 
                         translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          
          <div className="relative">
            ENTRAR
          </div>
        </Button>
      </CardContent>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/50" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/50" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/50" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/50" />
    </Card>
  );
});

export { BtcDuelCard };