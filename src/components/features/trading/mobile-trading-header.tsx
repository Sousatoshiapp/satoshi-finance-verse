import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Asset } from "./trading-interface";

interface MobileTradingHeaderProps {
  selectedAsset: Asset;
  balance: number;
  totalPnL: number;
  isMarketOpen: boolean;
}

export function MobileTradingHeader({ selectedAsset, balance, totalPnL, isMarketOpen }: MobileTradingHeaderProps) {
  return (
    <div className="lg:hidden space-y-4">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Saldo</span>
            </div>
            <Badge variant={isMarketOpen ? "default" : "secondary"} className="text-xs">
              {isMarketOpen ? "Mercado Aberto" : "Mercado Fechado"}
            </Badge>
          </div>
          
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground">Disponível</div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${
                totalPnL >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">P&L</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {selectedAsset.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="font-bold text-lg">{selectedAsset.symbol}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[120px]">
                  {selectedAsset.name}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold">
                ${selectedAsset.price.toFixed(2)}
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                selectedAsset.changePercent >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {selectedAsset.changePercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {selectedAsset.changePercent >= 0 ? '+' : ''}{selectedAsset.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}