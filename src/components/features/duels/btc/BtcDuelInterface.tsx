import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Bitcoin, TrendingUp, TrendingDown, Timer, Zap, Crown } from "lucide-react";
import { useBtcPrice } from "@/hooks/use-btc-price";
import { useBtcDuel } from "@/hooks/use-btc-duel";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";

interface BtcDuelInterfaceProps {
  duelId: string;
  opponentId: string;
  betAmount: number;
  onDuelComplete: (result: any) => void;
}

export function BtcDuelInterface({ duelId, opponentId, betAmount, onDuelComplete }: BtcDuelInterfaceProps) {
  const { price, priceChange } = useBtcPrice();
  const { 
    currentDuel, 
    phase, 
    timeLeft, 
    myPrediction, 
    opponentPrediction,
    makePrediction 
  } = useBtcDuel();

  const [selectedPrediction, setSelectedPrediction] = useState<'up' | 'down' | null>(null);
  const [initialPrice, setInitialPrice] = useState<number | null>(null);

  // Store initial price when duel starts
  useEffect(() => {
    if (currentDuel && !initialPrice) {
      setInitialPrice(currentDuel.initial_btc_price);
    }
  }, [currentDuel, initialPrice]);

  const handlePrediction = async (prediction: 'up' | 'down') => {
    setSelectedPrediction(prediction);
    await makePrediction(prediction);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriceMovement = () => {
    if (!initialPrice || !price) return 0;
    return ((price - initialPrice) / initialPrice) * 100;
  };

  const renderPhase = () => {
    switch (phase) {
      case 'predicting':
        return (
          <div className="space-y-6">
            {/* Timer */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                <Timer className="h-4 w-4 text-orange-500" />
                <span className="font-mono text-lg font-bold text-orange-500">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Tempo para fazer sua predição
              </p>
            </div>

            {/* Current price */}
            <Card className="border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bitcoin className="h-6 w-6 text-orange-500" />
                  <span className="text-xl font-bold text-foreground">
                    ${price?.toLocaleString() || 'Loading...'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Preço inicial: ${initialPrice?.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Prediction buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handlePrediction('up')}
                disabled={!!myPrediction}
                className={`h-24 flex flex-col gap-2 transition-all duration-200 ${
                  selectedPrediction === 'up' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 shadow-lg shadow-green-500/25'
                    : 'border-green-500/30 hover:bg-green-500/10'
                }`}
                variant={selectedPrediction === 'up' ? 'default' : 'outline'}
              >
                <TrendingUp className="h-8 w-8" />
                <span className="font-bold">SUBIR</span>
                <span className="text-xs opacity-75">UP</span>
              </Button>

              <Button
                onClick={() => handlePrediction('down')}
                disabled={!!myPrediction}
                className={`h-24 flex flex-col gap-2 transition-all duration-200 ${
                  selectedPrediction === 'down' 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-500 shadow-lg shadow-red-500/25'
                    : 'border-red-500/30 hover:bg-red-500/10'
                }`}
                variant={selectedPrediction === 'down' ? 'default' : 'outline'}
              >
                <TrendingDown className="h-8 w-8" />
                <span className="font-bold">DESCER</span>
                <span className="text-xs opacity-75">DOWN</span>
              </Button>
            </div>

            {/* Prediction status */}
            {myPrediction && (
              <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  ✓ Sua predição: {myPrediction === 'up' ? 'SUBIR' : 'DESCER'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Aguardando oponente...
                </p>
              </div>
            )}
          </div>
        );

      case 'active':
        return (
          <div className="space-y-6">
            {/* VS Header */}
            <div className="text-center">
              <div className="text-6xl font-bold text-gradient animate-pulse">VS</div>
              <p className="text-sm text-muted-foreground">Duelo em andamento</p>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-red-500/20 px-6 py-3 rounded-full border border-red-500/30">
                <Timer className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="font-mono text-2xl font-bold text-red-500">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Live price */}
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Bitcoin className="h-8 w-8 text-orange-500" />
                  <span className="text-3xl font-bold text-foreground">
                    ${price?.toLocaleString() || 'Loading...'}
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Inicial: ${initialPrice?.toLocaleString()}
                  </span>
                  <div className={`flex items-center gap-1 font-medium ${
                    getPriceMovement() > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {getPriceMovement() > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(getPriceMovement()).toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictions display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-card rounded-lg border">
                <p className="text-xs text-muted-foreground mb-2">Você</p>
                <div className={`flex items-center justify-center gap-1 font-bold ${
                  myPrediction === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {myPrediction === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {myPrediction?.toUpperCase()}
                </div>
              </div>

              <div className="text-center p-4 bg-card rounded-lg border">
                <p className="text-xs text-muted-foreground mb-2">Oponente</p>
                <div className={`flex items-center justify-center gap-1 font-bold ${
                  opponentPrediction === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {opponentPrediction === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {opponentPrediction?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-6 text-center">
            {/* Result header */}
            <div>
              <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Duelo Finalizado!</h2>
            </div>

            {/* Final results would be shown here */}
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="p-6">
                <p className="text-lg mb-4">Resultado será exibido aqui</p>
                <Button onClick={() => onDuelComplete(currentDuel)} className="w-full">
                  Continuar
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Carregando...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">Duelo BTC</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Aposta: {betAmount} BTZ</span>
          </div>
        </div>

        {renderPhase()}
      </div>
    </div>
  );
}