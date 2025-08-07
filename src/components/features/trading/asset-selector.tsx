import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Input } from "@/components/shared/ui/input";
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
  { symbol: 'SOLUSD', name: 'Solana', price: 98.75, change: 5.23, changePercent: 5.59, type: 'crypto' },
  { symbol: 'DOTUSD', name: 'Polkadot', price: 7.45, change: -0.34, changePercent: -4.37, type: 'crypto' },
  
  // Ações Brasileiras
  { symbol: 'PETR4', name: 'Petrobras', price: 28.45, change: 0.85, changePercent: 3.08, type: 'br-stock' },
  { symbol: 'VALE3', name: 'Vale', price: 65.32, change: -1.23, changePercent: -1.85, type: 'br-stock' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco', price: 24.78, change: 0.45, changePercent: 1.85, type: 'br-stock' },
  { symbol: 'BBDC4', name: 'Bradesco', price: 13.56, change: -0.23, changePercent: -1.67, type: 'br-stock' },
  { symbol: 'WEGE3', name: 'WEG', price: 42.15, change: 1.25, changePercent: 3.05, type: 'br-stock' },
  { symbol: 'MGLU3', name: 'Magazine Luiza', price: 8.97, change: -0.15, changePercent: -1.64, type: 'br-stock' },
  
  // Ações Americanas
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.85, change: 2.45, changePercent: 1.36, type: 'us-stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2845.30, change: -15.25, changePercent: -0.53, type: 'us-stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.45, change: 4.85, changePercent: 1.30, type: 'us-stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.75, change: -8.45, changePercent: -3.29, type: 'us-stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.60, change: 25.30, changePercent: 2.98, type: 'us-stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 154.25, change: 1.85, changePercent: 1.21, type: 'us-stock' },
  
  // Forex
  { symbol: 'USDBRL', name: 'Dólar/Real', price: 5.2145, change: 0.0234, changePercent: 0.45, type: 'forex' },
  { symbol: 'EURUSD', name: 'Euro/Dólar', price: 1.0856, change: -0.0045, changePercent: -0.41, type: 'forex' },
  { symbol: 'GBPUSD', name: 'Libra/Dólar', price: 1.2456, change: 0.0123, changePercent: 0.99, type: 'forex' },
  { symbol: 'USDJPY', name: 'Dólar/Iene', price: 149.85, change: -0.45, changePercent: -0.30, type: 'forex' },
  { symbol: 'EURBRL', name: 'Euro/Real', price: 5.6525, change: 0.0145, changePercent: 0.26, type: 'forex' },
  { symbol: 'GBPBRL', name: 'Libra/Real', price: 6.4930, change: 0.0523, changePercent: 0.81, type: 'forex' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Ouro', price: 2024.50, change: 15.25, changePercent: 0.76, type: 'commodity' },
  { symbol: 'XAGUSD', name: 'Prata', price: 24.85, change: -0.34, changePercent: -1.35, type: 'commodity' },
  { symbol: 'WTIUSD', name: 'Petróleo WTI', price: 78.45, change: 2.15, changePercent: 2.82, type: 'commodity' },
  { symbol: 'XBRUSD', name: 'Petróleo Brent', price: 82.30, change: 1.85, changePercent: 2.30, type: 'commodity' },
  { symbol: 'XCUUSD', name: 'Cobre', price: 4.15, change: 0.08, changePercent: 1.96, type: 'commodity' },
  { symbol: 'COFFEE', name: 'Café Arábica', price: 1.85, change: -0.05, changePercent: -2.63, type: 'commodity' },
];

export function AssetSelector({ selectedAsset, onAssetChange }: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'crypto' | 'br-stock' | 'us-stock' | 'forex' | 'commodity'>('crypto');

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'crypto':
        return <Bitcoin className="h-4 w-4" />;
      case 'br-stock':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'us-stock':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
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
      case 'br-stock':
        return 'Ações BR';
      case 'us-stock':
        return 'Ações US';
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
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full lg:min-w-[200px] justify-start h-12 text-left"
        >
          <div className="flex items-center gap-3 w-full">
            {getAssetIcon(selectedAsset.type)}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base truncate">{selectedAsset.symbol}</div>
              <div className="text-xs text-muted-foreground truncate">{selectedAsset.name}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">${selectedAsset.price.toFixed(2)}</div>
              <div className={`text-xs ${selectedAsset.changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {selectedAsset.changePercent >= 0 ? '+' : ''}{selectedAsset.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </Button>
      </div>
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
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 text-xs">
              <TabsTrigger value="crypto" className="text-xs">Crypto</TabsTrigger>
              <TabsTrigger value="br-stock" className="text-xs">🇧🇷 Ações</TabsTrigger>
              <TabsTrigger value="us-stock" className="text-xs">🇺🇸 Ações</TabsTrigger>
              <TabsTrigger value="forex" className="text-xs">Forex</TabsTrigger>
              <TabsTrigger value="commodity" className="text-xs">Commodities</TabsTrigger>
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
