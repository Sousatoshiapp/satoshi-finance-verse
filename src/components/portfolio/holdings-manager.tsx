import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  validateAssetQuantity, 
  validateAssetPrice,
  globalRateLimiter
} from "@/lib/validation";
import { Portfolio, Holding, assetTypes, mockAssets } from "./types";

interface HoldingsManagerProps {
  holdings: Holding[];
  portfolio: Portfolio;
  onHoldingsChange: (holdings: Holding[]) => void;
  onPortfolioChange: (portfolio: Portfolio) => void;
}

export function HoldingsManager({ 
  holdings, 
  portfolio, 
  onHoldingsChange, 
  onPortfolioChange 
}: HoldingsManagerProps) {
  const [newHolding, setNewHolding] = useState<Partial<Holding>>({
    asset_type: 'stock',
    quantity: 0,
    avg_price: 0
  });
  const { toast } = useToast();

  const getAvailableAssets = () => {
    return mockAssets[newHolding.asset_type as keyof typeof mockAssets] || [];
  };

  const addHolding = async () => {
    // Rate limiting check
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !globalRateLimiter.canPerformAction(user.id, 'add_holding', 20)) {
      toast({
        title: "Muitas ações",
        description: "Aguarde um momento antes de adicionar mais ativos",
        variant: "destructive"
      });
      return;
    }

    // Validation
    const quantityError = validateAssetQuantity(newHolding.quantity || 0);
    const priceError = validateAssetPrice(newHolding.avg_price || 0);
    
    if (!newHolding.asset_symbol || quantityError || priceError) {
      toast({
        title: "Dados inválidos",
        description: quantityError || priceError || "Selecione um ativo",
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

    const updatedHoldings = [...holdings, holding];
    onHoldingsChange(updatedHoldings);
    
    setNewHolding({
      asset_type: 'stock',
      quantity: 0,
      avg_price: 0
    });

    // Update portfolio balance
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0);
    const totalCurrent = updatedHoldings.reduce((sum, h) => sum + (h.total_value || 0), 0);
    
    onPortfolioChange({
      ...portfolio,
      current_balance: portfolio.initial_balance - totalInvested + totalCurrent,
      performance_percentage: ((totalCurrent - totalInvested) / totalInvested) * 100 || 0
    });
  };

  const removeHolding = (index: number) => {
    const updatedHoldings = holdings.filter((_, i) => i !== index);
    onHoldingsChange(updatedHoldings);
    
    // Recalculate portfolio
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0);
    const totalCurrent = updatedHoldings.reduce((sum, h) => sum + (h.total_value || 0), 0);
    
    onPortfolioChange({
      ...portfolio,
      current_balance: portfolio.initial_balance - totalInvested + totalCurrent,
      performance_percentage: totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0
    });
  };

  return (
    <>
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
                min="0.000001"
                max="1000000"
                value={newHolding.quantity}
                onChange={(e) => setNewHolding({...newHolding, quantity: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <Label>Preço Médio (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="1000000"
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
    </>
  );
}