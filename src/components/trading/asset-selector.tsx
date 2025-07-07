import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, Zap, Search } from "lucide-react";
import { Asset } from "./trading-interface";

interface AssetSelectorProps {
  selectedAsset: Asset;
  onAssetChange: (asset: Asset) => void;
}

const MOCK_ASSETS: Asset[] = [
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin', price: 45250.30, change: 1250.50, changePercent: 2.84, type: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', price: 2850.75, change: -125.25, changePercent: -4.21, type: 'crypto' },
  { symbol: 'ADAUSD', name: 'Cardano', price: 0.4521, change: 0.0234, changePercent: 5.46, type: 'crypto' },
  { symbol: 'BNBUSD', name: 'Binance Coin', price: 315.80, change: 12.45, changePercent: 4.10, type: 'crypto' },
  
  // Stocks
  { symbol: 'PETR4', name: 'Petrobras', price: 28.45, change: 0.85, changePercent: 3.08, type: 'stock' },
  { symbol: 'VALE3', name: 'Vale', price: 65.32, change: -1.23, changePercent: -1.85, type: 'stock' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco', price: 24.78, change: 0.45, changePercent: 1.85, type: 'stock' },
  { symbol: 'BBDC4', name: 'Bradesco', price: 13.56, change: -0.23, changePercent: -1.67, type: 'stock' },
  
  // Forex
  { symbol: 'USDBRL', name: 'Dólar/Real', price: 5.2145, change: 0.0234, changePercent: 0.45, type: 'forex' },
  { symbol: 'EURUSD', name: 'Euro/Dólar', price: 1.0856, change: -0.0045, changePercent: -0.41, type: 'forex' },
  { symbol: 'GBPUSD', name: 'Libra/Dólar', price: 1.2456, change: 0.0123, changePercent: 0.99, type: 'forex' },
  { symbol: 'USDJPY', name: 'Dólar/Iene', price: 149.85, change: -0.45, changePercent: -0.30, type: 'forex' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Ouro', price: 2024.50, change: 15.25, changePercent: 0.76, type: 'commodity' },
  { symbol: 'XAGUSD', name: 'Prata', price: 24.85, change: -0.34, changePercent: -1.35, type: 'commodity' },
  { symbol: 'WTIUSD', name: 'Petróleo WTI', price: 78.45, change: 2.15, changePercent: 2.82, type: 'commodity' },
  { symbol: 'XBRUSD', name: 'Petróleo Brent', price: 82.30, change: 1.85, changePercent: 2.30, type: 'commodity' },
];

export function AssetSelector({ selectedAsset, onAssetChange }: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'crypto' | 'stock' | 'forex' | 'commodity'>('crypto');

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'crypto':
        return <Bitcoin className="h-4 w-4" />;
      case 'stock':
        return <TrendingUp className="h-4 w-4" />;
      case 'forex':
        return <DollarSign className="h-4 w-4" />;
      case 'commodity':
        return <Zap className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getAssetTypeLabel = (type: Asset['type']) => {
    switch (type) {
      case 'crypto':
        return 'Crypto';
      case 'stock':
        return 'Ações';
      case 'forex':
        return 'Forex';
      case 'commodity':
        return 'Commodities';
      default:
        return 'Outros';
    }
  };

  const filteredAssets = MOCK_ASSETS
    .filter(asset => asset.type === activeTab)
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAssetSelect = (asset: Asset) => {
    onAssetChange(asset);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 min-w-[180px] justify-start"
      >
        {getAssetIcon(selectedAsset.type)}
        <div className="text-left">
          <div className="font-medium">{selectedAsset.symbol}</div>
          <div className="text-xs text-muted-foreground">{selectedAsset.name}</div>
        </div>
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-lg absolute z-50 top-full left-0 mt-2">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Asset Categories */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="stock">Ações</TabsTrigger>
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="commodity">Commodities</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAssets.map(asset => (
                  <Button
                    key={asset.symbol}
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <div className="flex items-center gap-3">
                      {getAssetIcon(asset.type)}
                      <div className="text-left">
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">${asset.price.toFixed(2)}</div>
                      <div className={`text-xs flex items-center gap-1 ${
                        asset.changePercent >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {asset.changePercent >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}