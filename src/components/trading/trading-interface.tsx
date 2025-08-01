import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Badge } from '@/components/shared/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function TradingInterface() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');

  const stocks: Stock[] = [
    { symbol: 'PETR4', name: 'Petrobras', price: 35.42, change: 1.25, changePercent: 3.65 },
    { symbol: 'VALE3', name: 'Vale', price: 62.18, change: -0.85, changePercent: -1.35 },
    { symbol: 'ITUB4', name: 'Itaú', price: 28.90, change: 0.45, changePercent: 1.58 },
    { symbol: 'BBDC4', name: 'Bradesco', price: 15.75, change: -0.12, changePercent: -0.76 }
  ];

  const portfolio = [
    { symbol: 'PETR4', quantity: 100, avgPrice: 32.50, currentPrice: 35.42 },
    { symbol: 'ITUB4', quantity: 200, avgPrice: 27.80, currentPrice: 28.90 }
  ];

  const handleTrade = () => {
    if (!selectedStock) return;
    
    const total = selectedStock.price * quantity;
    console.log(`${orderType.toUpperCase()}: ${quantity} shares of ${selectedStock.symbol} at R$ ${selectedStock.price} = R$ ${total.toFixed(2)}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Simulador de Trading</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ações Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stocks.map((stock) => (
              <div 
                key={stock.symbol}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStock?.symbol === stock.symbol 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{stock.symbol}</h4>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {stock.price.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Painel de Trading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Executar Ordem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedStock ? (
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold">{selectedStock.symbol}</h4>
                  <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
                  <p className="text-lg font-bold">R$ {selectedStock.price.toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant={orderType === 'buy' ? 'default' : 'outline'}
                    onClick={() => setOrderType('buy')}
                    className="flex-1"
                  >
                    Comprar
                  </Button>
                  <Button 
                    variant={orderType === 'sell' ? 'default' : 'outline'}
                    onClick={() => setOrderType('sell')}
                    className="flex-1"
                  >
                    Vender
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">
                    R$ {(selectedStock.price * quantity).toFixed(2)}
                  </p>
                </div>

                <Button onClick={handleTrade} className="w-full">
                  Executar {orderType === 'buy' ? 'Compra' : 'Venda'}
                </Button>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Selecione uma ação para começar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Portfólio */}
        <Card>
          <CardHeader>
            <CardTitle>Meu Portfólio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolio.map((holding) => {
              const gain = (holding.currentPrice - holding.avgPrice) * holding.quantity;
              const gainPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
              
              return (
                <div key={holding.symbol} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{holding.symbol}</h4>
                    <Badge variant={gain >= 0 ? 'default' : 'destructive'}>
                      {gain >= 0 ? '+' : ''}R$ {gain.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Quantidade: {holding.quantity}</p>
                    <p>Preço médio: R$ {holding.avgPrice.toFixed(2)}</p>
                    <p>Preço atual: R$ {holding.currentPrice.toFixed(2)}</p>
                    <p className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}