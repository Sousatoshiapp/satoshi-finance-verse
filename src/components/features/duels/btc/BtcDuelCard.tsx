import { memo, useState } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Bitcoin, TrendingUp, TrendingDown, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBtcPrice } from "@/hooks/use-btc-price";

const BtcDuelCard = memo(function BtcDuelCard() {
  // PERFORMANCE: Componente desabilitado temporariamente para melhorar performance
  // O WebSocket do BTC estava causando overhead significativo
  
  /* CÓDIGO ORIGINAL COMENTADO:
  const navigate = useNavigate();
  const { price, priceChange } = useBtcPrice();
  const [isGlowing, setIsGlowing] = useState(false);

  const handleStartDuel = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 200);
    navigate('/btc-duel');
  };
  */

  return (
    <Card className="relative h-20 overflow-hidden border border-muted bg-muted/50">
      <CardContent className="p-3 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-sm">BTC Duel</p>
          <p className="text-xs opacity-70">Temporariamente indisponível</p>
          <p className="text-xs opacity-50">Otimizando performance...</p>
        </div>
      </CardContent>
    </Card>
  );
});

export { BtcDuelCard };