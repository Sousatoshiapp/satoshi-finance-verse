import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap } from "lucide-react";
import { TradingChart } from "./trading-chart";
import { AssetSelector } from "./asset-selector";
import { TradeExecutor } from "./trade-executor";
import { VirtualBalance } from "./virtual-balance";
import { PositionsPanel } from "./positions-panel";
import { TradeHistory } from "./trade-history";

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'crypto' | 'stock' | 'forex' | 'commodity';
}

export interface Position {
  id: string;
  asset: Asset;
  type: 'BUY' | 'SELL';
  amount: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: Date;
  status: 'OPEN' | 'CLOSED';
}

export interface Trade {
  id: string;
  asset: Asset;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  pnl: number;
  timestamp: Date;
  status: 'WIN' | 'LOSS';
}

export function TradingInterface() {
  const [selectedAsset, setSelectedAsset] = useState<Asset>({
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    price: 45250.30,
    change: 1250.50,
    changePercent: 2.84,
    type: 'crypto'
  });

  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState(10000);
  const [isMarketOpen, setIsMarketOpen] = useState(true);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedAsset(prev => {
        const volatility = 0.001; // 0.1% volatility
        const change = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = prev.price * (1 + change);
        const priceChange = newPrice - prev.price;
        const percentChange = (priceChange / prev.price) * 100;
        
        return {
          ...prev,
          price: newPrice,
          change: priceChange,
          changePercent: percentChange
        };
      });

      // Update positions P&L
      setPositions(prev => prev.map(position => {
        if (position.status === 'OPEN') {
          const currentPrice = selectedAsset.price;
          const pnl = position.type === 'BUY' 
            ? (currentPrice - position.openPrice) * position.amount
            : (position.openPrice - currentPrice) * position.amount;
          
          return { ...position, currentPrice, pnl };
        }
        return position;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsset.price]);

  const executeTrade = (type: 'BUY' | 'SELL', amount: number) => {
    if (amount > balance) {
      return { success: false, message: 'Saldo insuficiente' };
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      asset: selectedAsset,
      type,
      amount,
      openPrice: selectedAsset.price,
      currentPrice: selectedAsset.price,
      pnl: 0,
      timestamp: new Date(),
      status: 'OPEN'
    };

    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - amount);

    return { success: true, message: `Posição ${type} aberta com sucesso!` };
  };

  const closePosition = (positionId: string) => {
    setPositions(prev => prev.map(position => {
      if (position.id === positionId && position.status === 'OPEN') {
        const closedPosition = { ...position, status: 'CLOSED' as const };
        
        // Add to trade history
        const trade: Trade = {
          id: Date.now().toString(),
          asset: position.asset,
          type: position.type,
          amount: position.amount,
          price: position.currentPrice,
          pnl: position.pnl,
          timestamp: new Date(),
          status: position.pnl > 0 ? 'WIN' : 'LOSS'
        };
        
        setTrades(prev => [trade, ...prev]);
        setBalance(prev => prev + position.amount + position.pnl);
        
        return closedPosition;
      }
      return position;
    }));
  };

  const getTotalPnL = () => {
    return positions
      .filter(p => p.status === 'OPEN')
      .reduce((sum, position) => sum + position.pnl, 0);
  };

  const getWinRate = () => {
    if (trades.length === 0) return 0;
    const wins = trades.filter(t => t.status === 'WIN').length;
    return (wins / trades.length) * 100;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Panel - Chart and Asset Selection */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AssetSelector
                  selectedAsset={selectedAsset}
                  onAssetChange={setSelectedAsset}
                />
                <Badge variant={isMarketOpen ? "default" : "secondary"}>
                  {isMarketOpen ? "Mercado Aberto" : "Mercado Fechado"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">
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
                    {selectedAsset.changePercent >= 0 ? '+' : ''}
                    {selectedAsset.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TradingChart asset={selectedAsset} />
          </CardContent>
        </Card>

        {/* Positions and History */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">Posições Abertas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="positions">
            <PositionsPanel
              positions={positions.filter(p => p.status === 'OPEN')}
              onClosePosition={closePosition}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <TradeHistory trades={trades} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Trading Controls */}
      <div className="space-y-6">
        {/* Virtual Balance */}
        <VirtualBalance
          balance={balance}
          totalPnL={getTotalPnL()}
          winRate={getWinRate()}
          totalTrades={trades.length}
        />

        {/* Trading Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Trading Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TradeExecutor
              asset={selectedAsset}
              balance={balance}
              onExecuteTrade={executeTrade}
              isMarketOpen={isMarketOpen}
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posições Abertas</span>
              <span className="font-medium">
                {positions.filter(p => p.status === 'OPEN').length}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">P&L Hoje</span>
              <span className={`font-medium ${
                getTotalPnL() >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                ${getTotalPnL().toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de Acerto</span>
              <span className="font-medium">
                {getWinRate().toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Trades</span>
              <span className="font-medium">{trades.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}