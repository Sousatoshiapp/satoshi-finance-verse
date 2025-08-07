import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { TrendingUp, TrendingDown, X, Clock } from "lucide-react";
import { Position } from "./trading-interface";

interface PositionsPanelProps {
  positions: Position[];
  onClosePosition: (positionId: string) => void;
}

export function PositionsPanel({ positions, onClosePosition }: PositionsPanelProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Nenhuma posição aberta
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Execute um trade para ver suas posições aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map(position => (
        <Card key={position.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={position.type === 'BUY' ? "default" : "destructive"}>
                  {position.type === 'BUY' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {position.type}
                </Badge>
                
                <div>
                  <div className="font-medium">{position.asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{position.asset.name}</div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClosePosition(position.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Position Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Preço Abertura</span>
                <div className="font-medium">${position.openPrice.toFixed(2)}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Preço Atual</span>
                <div className="font-medium">${position.currentPrice.toFixed(2)}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Quantidade</span>
                <div className="font-medium">{position.amount.toFixed(2)}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Valor</span>
                <div className="font-medium">${(position.amount * position.openPrice).toFixed(2)}</div>
              </div>
            </div>
            
            {/* P&L */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">P&L</span>
                <div className={`font-bold ${
                  position.pnl >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">Retorno</span>
                <div className={`font-medium ${
                  position.pnl >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {position.pnl >= 0 ? '+' : ''}
                  {((position.pnl / (position.amount * position.openPrice)) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            
            {/* Time */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Aberto às {formatTime(position.timestamp)}
              </div>
              <div>
                Duração: {formatDuration(position.timestamp)}
              </div>
            </div>
            
            {/* Close Button */}
            <Button
              onClick={() => onClosePosition(position.id)}
              variant="outline"
              className="w-full"
            >
              Fechar Posição
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
