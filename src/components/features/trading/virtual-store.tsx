import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { useVirtualStore } from '@/hooks/use-virtual-store';
import { useProfile } from '@/hooks/use-profile';
import { Coins, ShoppingCart, CreditCard, Gift, Zap, Star } from 'lucide-react';

export function VirtualStore() {
  const { products, transactions, loading, purchasing, purchaseWithBeetz, purchaseWithMoney } = useVirtualStore();
  const { profile } = useProfile();
  const [selectedTab, setSelectedTab] = useState('products');

  const formatPrice = (priceCents: number, currency: string) => {
    const price = priceCents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(price);
  };

  const getBeetzPrice = (priceCents: number) => {
    return priceCents / 10; // 1 beetz = 10 centavos
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'beetz_pack':
        return <Coins className="w-6 h-6 text-yellow-500" />;
      case 'powerup':
        return <Zap className="w-6 h-6 text-purple-500" />;
      case 'loot_box':
        return <Gift className="w-6 h-6 text-pink-500" />;
      case 'avatar':
        return <Star className="w-6 h-6 text-blue-500" />;
      default:
        return <ShoppingCart className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic':
        return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'uncommon':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const featuredProducts = products.filter(p => p.featured);
  const regularProducts = products.filter(p => !p.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loja Virtual</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span>{profile?.points || 0} Beetz</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="transactions">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Produtos em destaque */}
          {featuredProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Produtos em Destaque
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-500 text-white">
                        Destaque
                      </Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        {getProductIcon(product.product_type)}
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            {formatPrice(product.price_cents, product.currency)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getBeetzPrice(product.price_cents)} Beetz
                          </span>
                        </div>
                        
                        {product.discount_percentage > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {product.discount_percentage}% OFF
                          </Badge>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => purchaseWithBeetz(product.id)}
                            disabled={purchasing || (profile?.points || 0) < getBeetzPrice(product.price_cents)}
                            className="flex-1"
                            size="sm"
                          >
                            <Coins className="w-4 h-4 mr-2" />
                            Comprar
                          </Button>
                          <Button
                            onClick={() => purchaseWithMoney(product.id)}
                            disabled={purchasing}
                            variant="outline"
                            size="sm"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Produtos regulares */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Todos os Produtos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getProductIcon(product.product_type)}
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          {formatPrice(product.price_cents, product.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getBeetzPrice(product.price_cents)} Beetz
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => purchaseWithBeetz(product.id)}
                          disabled={purchasing || (profile?.points || 0) < getBeetzPrice(product.price_cents)}
                          className="flex-1"
                          size="sm"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Comprar
                        </Button>
                        <Button
                          onClick={() => purchaseWithMoney(product.id)}
                          disabled={purchasing}
                          variant="outline"
                          size="sm"
                        >
                          <CreditCard className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <h3 className="text-lg font-semibold">Histórico de Compras</h3>
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma transação encontrada
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProductIcon(transaction.store_products?.product_type || '')}
                        <div>
                          <p className="font-medium">
                            {transaction.store_products?.name || 'Produto'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(transaction.amount_cents, transaction.currency)}
                        </p>
                        <Badge
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
