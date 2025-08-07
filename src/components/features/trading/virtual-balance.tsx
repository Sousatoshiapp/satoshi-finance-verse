import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Wallet, TrendingUp, Target, Activity, RotateCcw } from "lucide-react";

interface VirtualBalanceProps {
  balance: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
}

export function VirtualBalance({ balance, totalPnL, winRate, totalTrades }: VirtualBalanceProps) {
  const initialBalance = 10000;
  const totalReturn = ((balance + totalPnL - initialBalance) / initialBalance) * 100;

  const resetBalance = () => {
    // This would be handled by the parent component
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Saldo Virtual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-muted-foreground">
            Saldo disponível
          </div>
        </div>

        {/* P&L */}
        <div className="text-center space-y-2">
          <div className={`text-xl font-bold ${
            totalPnL >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            P&L não realizado
          </div>
        </div>

        {/* Total Return */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Retorno Total</span>
          </div>
          <Badge variant={totalReturn >= 0 ? "default" : "destructive"}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </Badge>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Taxa Acerto</span>
            </div>
            <div className="text-lg font-bold">
              {winRate.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Trades</span>
            </div>
            <div className="text-lg font-bold">
              {totalTrades}
            </div>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Portfolio</div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Saldo Inicial</span>
              <span className="font-medium">${initialBalance.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Saldo Atual</span>
              <span className="font-medium">${balance.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">P&L Não Realizado</span>
              <span className={`font-medium ${
                totalPnL >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </span>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Valor Total</span>
                <span>${(balance + totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetBalance}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetar Saldo
        </Button>
      </CardContent>
    </Card>
  );
}
