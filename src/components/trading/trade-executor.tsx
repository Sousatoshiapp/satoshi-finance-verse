import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Zap, Clock, DollarSign } from "lucide-react";
import { Asset } from "./trading-interface";
import { useToast } from "@/hooks/use-toast";

interface TradeExecutorProps {
  asset: Asset;
  balance: number;
  onExecuteTrade: (type: 'BUY' | 'SELL', amount: number) => { success: boolean; message: string };
  isMarketOpen: boolean;
}

export function TradeExecutor({ asset, balance, onExecuteTrade, isMarketOpen }: TradeExecutorProps) {
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(asset.price);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTradeAmount(Math.min(numValue, balance));
    }
  };

  const setAmountPercentage = (percentage: number) => {
    const amount = (balance * percentage) / 100;
    setTradeAmount(amount);
  };

  const calculatePotentialProfit = () => {
    if (orderType === 'market') {
      const currentPrice = asset.price;
      const quantity = tradeAmount / currentPrice;
      const priceChange = currentPrice * 0.01; // Assume 1% price movement
      return quantity * priceChange;
    }
    return 0;
  };

  const executeTrade = async () => {
    if (!isMarketOpen) {
      toast({
        title: "Mercado Fechado",
        description: "O mercado está fechado no momento",
        variant: "destructive"
      });
      return;
    }

    if (tradeAmount <= 0 || tradeAmount > balance) {
      toast({
        title: "Valor Inválido",
        description: "Insira um valor válido para o trade",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);

    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = onExecuteTrade(tradeType, tradeAmount);
      
      if (result.success) {
        toast({
          title: "Trade Executado!",
          description: result.message,
          variant: "default"
        });
      } else {
        toast({
          title: "Erro no Trade",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Execução",
        description: "Ocorreu um erro ao executar o trade",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trade Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={tradeType === 'BUY' ? "default" : "outline"}
          onClick={() => setTradeType('BUY')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          COMPRAR
        </Button>
        <Button
          variant={tradeType === 'SELL' ? "destructive" : "outline"}
          onClick={() => setTradeType('SELL')}
          className="flex items-center gap-2"
        >
          <TrendingDown className="h-4 w-4" />
          VENDER
        </Button>
      </div>

      {/* Order Type */}
      <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="limit">Limite</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Preço Atual</div>
            <div className="text-lg font-bold">${asset.price.toFixed(2)}</div>
          </div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Preço Limite</label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
              step="0.01"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Trade Amount */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Valor do Trade</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            value={tradeAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="pl-10"
            step="0.01"
            min="0"
            max={balance}
          />
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map(percentage => (
            <Button
              key={percentage}
              variant="outline"
              size="sm"
              onClick={() => setAmountPercentage(percentage)}
            >
              {percentage}%
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Saldo disponível: ${balance.toFixed(2)}
        </div>
      </div>

      {/* Risk Management */}
      <div className="space-y-4">
        <div className="text-sm font-medium">Gerenciamento de Risco</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Stop Loss</label>
            <Input
              type="number"
              placeholder="Opcional"
              value={stopLoss || ''}
              onChange={(e) => setStopLoss(e.target.value ? parseFloat(e.target.value) : null)}
              step="0.01"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Take Profit</label>
            <Input
              type="number"
              placeholder="Opcional"
              value={takeProfit || ''}
              onChange={(e) => setTakeProfit(e.target.value ? parseFloat(e.target.value) : null)}
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Trade Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Resumo do Trade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tipo:</span>
            <Badge variant={tradeType === 'BUY' ? "default" : "destructive"}>
              {tradeType}
            </Badge>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor:</span>
            <span className="font-medium">${tradeAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Preço:</span>
            <span className="font-medium">
              ${orderType === 'market' ? asset.price.toFixed(2) : limitPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantidade:</span>
            <span className="font-medium">
              {(tradeAmount / (orderType === 'market' ? asset.price : limitPrice)).toFixed(4)}
            </span>
          </div>
          
          {orderType === 'market' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lucro Potencial (1%):</span>
              <span className="font-medium text-success">
                ${calculatePotentialProfit().toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execute Button */}
      <Button
        onClick={executeTrade}
        disabled={!isMarketOpen || isExecuting || tradeAmount <= 0 || tradeAmount > balance}
        className={`w-full h-12 text-lg font-bold ${
          tradeType === 'BUY' 
            ? 'bg-success hover:bg-success/90' 
            : 'bg-destructive hover:bg-destructive/90'
        }`}
      >
        {isExecuting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Executando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {tradeType === 'BUY' ? 'COMPRAR' : 'VENDER'} {asset.symbol}
          </div>
        )}
      </Button>

      {!isMarketOpen && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <Clock className="h-4 w-4" />
          Mercado fechado - Trades serão executados na abertura
        </div>
      )}
    </div>
  );
}