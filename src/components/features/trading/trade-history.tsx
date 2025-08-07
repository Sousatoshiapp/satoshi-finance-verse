import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { TrendingUp, TrendingDown, Clock, Trophy, Target, X } from "lucide-react";
import { Trade } from "./trading-interface";

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStats = () => {
    if (trades.length === 0) return { winRate: 0, totalPnL: 0, bestTrade: 0, worstTrade: 0 };
    
    const wins = trades.filter(t => t.status === 'WIN').length;
    const winRate = (wins / trades.length) * 100;
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const bestTrade = Math.max(...trades.map(t => t.pnl));
    const worstTrade = Math.min(...trades.map(t => t.pnl));
    
    return { winRate, totalPnL, bestTrade, worstTrade };
  };

  const stats = getStats();

  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            Nenhum trade realizado ainda
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Seu histórico de trades aparecerá aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estatísticas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                stats.totalPnL >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">P&L Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                +${stats.bestTrade.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Melhor Trade</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                ${stats.worstTrade.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Pior Trade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Trades Recentes</h3>
        
        {trades.map(trade => (
          <Card key={trade.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={trade.type === 'BUY' ? "default" : "destructive"}>
                    {trade.type === 'BUY' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {trade.type}
                  </Badge>
                  
                  <div>
                    <div className="font-medium">{trade.asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{trade.asset.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${
                    trade.pnl >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                  <Badge variant={trade.status === 'WIN' ? "default" : "destructive"} className="mt-1">
                    {trade.status === 'WIN' ? (
                      <Trophy className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {trade.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Preço</span>
                  <div className="font-medium">${trade.price.toFixed(2)}</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Quantidade</span>
                  <div className="font-medium">{trade.amount.toFixed(2)}</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Retorno</span>
                  <div className={`font-medium ${
                    trade.pnl >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {((trade.pnl / (trade.amount * trade.price)) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(trade.timestamp)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
