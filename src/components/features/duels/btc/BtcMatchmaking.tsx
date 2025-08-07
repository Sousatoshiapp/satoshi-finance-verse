import { useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Loader2, Search, Users, Timer, X } from "lucide-react";
import { useBtcMatchmaking } from "@/hooks/use-btc-matchmaking";

interface BtcMatchmakingProps {
  betAmount: number;
  onOpponentFound: (opponentId: string) => void;
  onCancel: () => void;
}

export function BtcMatchmaking({ betAmount, onOpponentFound, onCancel }: BtcMatchmakingProps) {
  const { 
    isSearching, 
    foundOpponent, 
    opponentId, 
    searchTime, 
    queuePosition,
    startMatchmaking,
    cancelMatchmaking 
  } = useBtcMatchmaking();

  // Start matchmaking when component mounts
  useEffect(() => {
    startMatchmaking(betAmount);
  }, [betAmount, startMatchmaking]);

  // Handle opponent found
  useEffect(() => {
    if (foundOpponent && opponentId) {
      onOpponentFound(opponentId);
    }
  }, [foundOpponent, opponentId, onOpponentFound]);

  const handleCancel = async () => {
    await cancelMatchmaking();
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Animated search header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
            <Search className="h-10 w-10 text-white animate-pulse" />
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground">Procurando Oponente</h2>
          <p className="text-muted-foreground">
            Apostando <span className="font-semibold text-primary">{betAmount} BTZ</span>
          </p>
        </div>
      </div>

      {/* Search status card */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-background to-blue-500/5">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm font-medium">Buscando...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                {formatTime(searchTime)}
              </div>
            </div>

            {/* Queue position */}
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Posição na fila:</span>
              </div>
              <span className="text-sm font-medium text-blue-500">#{queuePosition}</span>
            </div>

            {/* Search tips */}
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                💡 <strong>Dica:</strong> Apostas mais baixas encontram oponentes mais rapidamente
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tempo de busca</span>
                <span>Máx: 2:00</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((searchTime / 120) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Cancel button */}
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="w-full mt-4 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar Busca
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}