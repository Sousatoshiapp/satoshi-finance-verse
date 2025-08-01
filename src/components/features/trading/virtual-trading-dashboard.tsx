import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, Trophy, Activity, BarChart } from "lucide-react";

interface VirtualAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export function VirtualTradingDashboard() {
  const [assets, setAssets] = useState<VirtualAsset[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<VirtualAsset | null>(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: assetsData } = await supabase
        .from('virtual_assets')
        .select('*')
        .limit(10);

      if (assetsData) {
        setAssets(assetsData);
      }

      // Load or create portfolio
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          let { data: portfolioData } = await supabase
            .from('virtual_portfolios')
            .select('*')
            .eq('user_id', profile.id)
            .single();

          if (!portfolioData) {
            const { data: newPortfolio } = await supabase
              .from('virtual_portfolios')
              .insert({ user_id: profile.id })
              .select()
              .single();
            portfolioData = newPortfolio;
          }

          setPortfolio(portfolioData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      {portfolio && (
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Portfolio Virtual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className="text-xl font-bold">{formatCurrency(portfolio.current_balance || 100000)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold">{formatCurrency(portfolio.portfolio_value || 100000)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`text-xl font-bold ${(portfolio.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(portfolio.profit_loss || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Trades</p>
                <p className="text-xl font-bold">{portfolio.trades_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assets.map(asset => (
                <Button
                  key={asset.id}
                  variant={selectedAsset?.id === asset.id ? "default" : "outline"}
                  className="w-full justify-between h-auto p-3"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="text-left">
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(asset.current_price)}</p>
                    <p className={`text-xs flex items-center gap-1 ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {asset.price_change_percentage_24h?.toFixed(2)}%
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trading Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAsset ? (
              <>
                <div>
                  <p className="font-semibold text-lg">{selectedAsset.symbol}</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedAsset.current_price)}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={tradeType === 'buy' ? "default" : "outline"}
                    onClick={() => setTradeType('buy')}
                    className="flex-1"
                  >
                    Comprar
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? "default" : "outline"}
                    onClick={() => setTradeType('sell')}
                    className="flex-1"
                  >
                    Vender
                  </Button>
                </div>

                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                />

                {tradeAmount && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Total: {formatCurrency(parseFloat(tradeAmount || '0') * selectedAsset.current_price)}
                    </p>
                  </div>
                )}

                <Button className="w-full" disabled={!tradeAmount}>
                  {tradeType === 'buy' ? 'Comprar' : 'Vender'} {selectedAsset.symbol}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Selecione um ativo para negociar
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
