import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { VirtualStore } from './virtual-store';
import { NFTMarketplace } from './nft-marketplace';
import { AffiliateDashboard } from './affiliate-dashboard';
import { WalletDashboard } from './wallet-dashboard';
import { Store, Palette, Users, Wallet, TrendingUp } from 'lucide-react';

export function MonetizationDashboard() {
  const [activeTab, setActiveTab] = useState('store');

  return (
    <div className="space-y-6">
      {/* Development Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <div className="text-2xl">🚧</div>
          <div>
            <h3 className="font-semibold">Em Desenvolvimento</h3>
            <p className="text-sm">Esta funcionalidade está sendo desenvolvida e estará disponível em breve!</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Sistema de Monetização</h1>
        <p className="text-muted-foreground">
          Gerencie suas compras, colecionáveis, programa de afiliados e carteira digital
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Loja
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Afiliados
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Carteira
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <VirtualStore />
        </TabsContent>

        <TabsContent value="marketplace">
          <NFTMarketplace />
        </TabsContent>

        <TabsContent value="affiliate">
          <AffiliateDashboard />
        </TabsContent>

        <TabsContent value="wallet">
          <WalletDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
