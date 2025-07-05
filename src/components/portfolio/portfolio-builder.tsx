import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Portfolio {
  id?: string;
  name: string;
  description: string;
  is_public: boolean;
  district_theme?: string;
  initial_balance: number;
  current_balance: number;
  performance_percentage: number;
}

interface Holding {
  id?: string;
  asset_symbol: string;
  asset_name: string;
  asset_type: string;
  quantity: number;
  avg_price: number;
  current_price?: number;
  total_value?: number;
}

const assetTypes = [
  { value: 'stock', label: 'Ações' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'fund', label: 'Fundos' },
  { value: 'bond', label: 'Renda Fixa' }
];

const mockAssets = {
  stock: [
    { symbol: 'PETR4', name: 'Petrobras PN', price: 32.45 },
    { symbol: 'VALE3', name: 'Vale ON', price: 65.20 },
    { symbol: 'ITUB4', name: 'Itaú Unibanco PN', price: 28.90 },
    { symbol: 'BBDC4', name: 'Bradesco PN', price: 15.75 }
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', price: 65000.00 },
    { symbol: 'ETH', name: 'Ethereum', price: 3200.00 },
    { symbol: 'ADA', name: 'Cardano', price: 0.45 },
    { symbol: 'SOL', name: 'Solana', price: 145.00 }
  ],
  fund: [
    { symbol: 'HGLG11', name: 'CSHG Logística FII', price: 145.50 },
    { symbol: 'XPML11', name: 'XP Malls FII', price: 95.20 },
    { symbol: 'KNRI11', name: 'Kinea Renda Imobiliária FII', price: 85.40 }
  ],
  bond: [
    { symbol: 'SELIC', name: 'Tesouro Selic', price: 100.00 },
    { symbol: 'IPCA+', name: 'Tesouro IPCA+', price: 95.50 },
    { symbol: 'PRE', name: 'Tesouro Prefixado', price: 92.30 }
  ]
};

interface PortfolioBuilderProps {
  districtTheme?: string;
  onSave?: (portfolio: Portfolio) => void;
}

export function PortfolioBuilder({ districtTheme, onSave }: PortfolioBuilderProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    name: '',
    description: '',
    is_public: false,
    district_theme: districtTheme,
    initial_balance: 10000,
    current_balance: 10000,
    performance_percentage: 0
  });
  
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [newHolding, setNewHolding] = useState<Partial<Holding>>({
    asset_type: 'stock',
    quantity: 0,
    avg_price: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addHolding = () => {
    if (!newHolding.asset_symbol || !newHolding.quantity || !newHolding.avg_price) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos do ativo",
        variant: "destructive"
      });
      return;
    }

    const selectedAsset = mockAssets[newHolding.asset_type as keyof typeof mockAssets]
      ?.find(asset => asset.symbol === newHolding.asset_symbol);

    if (!selectedAsset) return;

    const holding: Holding = {
      asset_symbol: newHolding.asset_symbol,
      asset_name: selectedAsset.name,
      asset_type: newHolding.asset_type!,
      quantity: newHolding.quantity!,
      avg_price: newHolding.avg_price!,
      current_price: selectedAsset.price,
      total_value: newHolding.quantity! * selectedAsset.price
    };

    setHoldings([...holdings, holding]);
    setNewHolding({
      asset_type: 'stock',
      quantity: 0,
      avg_price: 0
    });

    // Update portfolio balance
    const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0) + 
                         (holding.quantity * holding.avg_price);
    const totalCurrent = holdings.reduce((sum, h) => sum + (h.total_value || 0), 0) + 
                        (holding.total_value || 0);
    
    setPortfolio(prev => ({
      ...prev,
      current_balance: prev.initial_balance - totalInvested + totalCurrent,
      performance_percentage: ((totalCurrent - totalInvested) / totalInvested) * 100 || 0
    }));
  };

  const removeHolding = (index: number) => {
    const updatedHoldings = holdings.filter((_, i) => i !== index);
    setHoldings(updatedHoldings);
    
    // Recalculate portfolio
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0);
    const totalCurrent = updatedHoldings.reduce((sum, h) => sum + (h.total_value || 0), 0);
    
    setPortfolio(prev => ({
      ...prev,
      current_balance: prev.initial_balance - totalInvested + totalCurrent,
      performance_percentage: totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0
    }));
  };

  const savePortfolio = async () => {
    if (!portfolio.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para sua carteira",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // Save portfolio
      const { data: savedPortfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          ...portfolio,
          user_id: profile.id
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Save holdings
      if (holdings.length > 0) {
        const holdingsToSave = holdings.map(holding => ({
          ...holding,
          portfolio_id: savedPortfolio.id
        }));

        const { error: holdingsError } = await supabase
          .from('portfolio_holdings')
          .insert(holdingsToSave);

        if (holdingsError) throw holdingsError;
      }

      // Create activity
      await supabase
        .from('activity_feed')
        .insert({
          user_id: profile.id,
          activity_type: 'create_portfolio',
          activity_data: {
            portfolio_id: savedPortfolio.id,
            portfolio_name: portfolio.name,
            district_theme: districtTheme
          }
        });

      toast({
        title: "Carteira criada!",
        description: `${portfolio.name} foi salva com sucesso`,
      });

      onSave?.(savedPortfolio);
      
      // Reset form
      setPortfolio({
        name: '',
        description: '',
        is_public: false,
        district_theme: districtTheme,
        initial_balance: 10000,
        current_balance: 10000,
        performance_percentage: 0
      });
      setHoldings([]);

    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a carteira",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableAssets = () => {
    return mockAssets[newHolding.asset_type as keyof typeof mockAssets] || [];
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Info */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Carteira de Investimentos</CardTitle>
          <CardDescription>
            Crie uma carteira virtual para praticar suas estratégias de investimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Carteira</Label>
              <Input
                id="name"
                value={portfolio.name}
                onChange={(e) => setPortfolio({...portfolio, name: e.target.value})}
                placeholder="Minha Carteira Diversificada"
              />
            </div>
            <div>
              <Label htmlFor="balance">Saldo Inicial (R$)</Label>
              <Input
                id="balance"
                type="number"
                value={portfolio.initial_balance}
                onChange={(e) => setPortfolio({...portfolio, initial_balance: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={portfolio.description}
              onChange={(e) => setPortfolio({...portfolio, description: e.target.value})}
              placeholder="Estratégia focada em dividendos e crescimento..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={portfolio.is_public}
              onCheckedChange={(checked) => setPortfolio({...portfolio, is_public: checked})}
            />
            <Label htmlFor="public">Carteira pública (outros usuários podem ver e seguir)</Label>
          </div>

          {/* Portfolio Performance */}
          {holdings.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Saldo: R$ {portfolio.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {portfolio.performance_percentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  portfolio.performance_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {portfolio.performance_percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Tipo de Ativo</Label>
              <Select
                value={newHolding.asset_type}
                onValueChange={(value) => setNewHolding({...newHolding, asset_type: value, asset_symbol: ''})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Ativo</Label>
              <Select
                value={newHolding.asset_symbol}
                onValueChange={(value) => {
                  const asset = getAvailableAssets().find(a => a.symbol === value);
                  setNewHolding({
                    ...newHolding,
                    asset_symbol: value,
                    avg_price: asset?.price || 0
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAssets().map(asset => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="0.01"
                value={newHolding.quantity}
                onChange={(e) => setNewHolding({...newHolding, quantity: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <Label>Preço Médio (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={newHolding.avg_price}
                onChange={(e) => setNewHolding({...newHolding, avg_price: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <Button onClick={addHolding} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ativo
          </Button>
        </CardContent>
      </Card>

      {/* Holdings List */}
      {holdings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ativos na Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {holdings.map((holding, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {assetTypes.find(t => t.value === holding.asset_type)?.label}
                      </Badge>
                      <span className="font-medium">{holding.asset_symbol}</span>
                      <span className="text-sm text-muted-foreground">{holding.asset_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {holding.quantity} x R$ {holding.current_price?.toFixed(2)} = 
                      R$ {holding.total_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHolding(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button 
        onClick={savePortfolio} 
        disabled={loading || !portfolio.name.trim()}
        className="w-full"
        size="lg"
      >
        {loading ? 'Salvando...' : 'Criar Carteira'}
      </Button>
    </div>
  );
}