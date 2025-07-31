import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shared/ui/dialog';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useProfile } from '@/hooks/use-profile';
import { Hammer, ShoppingCart, Star, Coins, Package, TrendingUp } from 'lucide-react';

export function NFTMarketplace() {
  const { 
    collectibles, 
    userCollectibles, 
    listings, 
    sales, 
    loading, 
    processing, 
    mintCollectible, 
    listForSale, 
    buyFromMarketplace 
  } = useMarketplace();
  const { profile } = useProfile();
  const [selectedTab, setSelectedTab] = useState('mint');
  const [listingPrice, setListingPrice] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cards':
        return '🃏';
      case 'badges':
        return '🏅';
      case 'districts':
        return '🏛️';
      case 'trophies':
        return '🏆';
      case 'seals':
        return '🔰';
      default:
        return '📦';
    }
  };

  const handleListForSale = async () => {
    if (!selectedItem || !listingPrice) return;

    const price = parseInt(listingPrice);
    if (isNaN(price) || price <= 0) return;

    const success = await listForSale(selectedItem, price);
    if (success) {
      setSelectedItem(null);
      setListingPrice('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Marketplace NFT</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span>{profile?.points || 0} Beetz</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mint">Mintar</TabsTrigger>
          <TabsTrigger value="marketplace">Comprar</TabsTrigger>
          <TabsTrigger value="collection">Minha Coleção</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="space-y-4">
          <h3 className="text-lg font-semibold">Itens Disponíveis para Mintar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectibles.map((item) => (
              <Card key={item.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(item.rarity)}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {item.rarity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.current_supply}/{item.total_supply}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {item.mint_price_beetz}
                      </span>
                      <Button
                        onClick={() => mintCollectible(item.id)}
                        disabled={
                          processing || 
                          (profile?.points || 0) < item.mint_price_beetz ||
                          item.current_supply >= item.total_supply
                        }
                        size="sm"
                      >
                        <Hammer className="w-4 h-4 mr-2" />
                        Mintar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <h3 className="text-lg font-semibold">Itens à Venda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(listing.user_collectibles?.collectible_items?.rarity || 'common')}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {getCategoryIcon(listing.user_collectibles?.collectible_items?.category || '')}
                    </span>
                    <CardTitle className="text-lg">
                      {listing.user_collectibles?.collectible_items?.name}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vendido por {listing.profiles?.nickname}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {listing.user_collectibles?.collectible_items?.rarity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Token #{listing.user_collectibles?.token_id}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {listing.price_beetz}
                      </span>
                      <Button
                        onClick={() => buyFromMarketplace(listing.id)}
                        disabled={
                          processing || 
                          (profile?.points || 0) < listing.price_beetz ||
                          listing.seller_id === profile?.id
                        }
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <h3 className="text-lg font-semibold">Minha Coleção</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCollectibles.map((item) => (
              <Card key={item.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(item.collectible_items?.rarity || 'common')}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {getCategoryIcon(item.collectible_items?.category || '')}
                    </span>
                    <CardTitle className="text-lg">
                      {item.collectible_items?.name}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adquirido em {new Date(item.acquired_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {item.collectible_items?.rarity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Token #{item.token_id}
                      </span>
                    </div>
                    
                    {item.is_listed_for_sale ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">À venda por {item.sale_price_beetz} Beetz</Badge>
                      </div>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedItem(item.id)}
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Vender
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Vender Item</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="price">Preço (Beetz)</Label>
                              <Input
                                id="price"
                                type="number"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(e.target.value)}
                                placeholder="Digite o preço em Beetz"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleListForSale}
                                disabled={processing || !listingPrice}
                                className="flex-1"
                              >
                                Colocar à Venda
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(null);
                                  setListingPrice('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <h3 className="text-lg font-semibold">Histórico de Vendas</h3>
          {sales.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma venda encontrada
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <Card key={sale.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getCategoryIcon(sale.user_collectibles?.collectible_items?.category || '')}
                        </span>
                        <div>
                          <p className="font-medium">
                            {sale.user_collectibles?.collectible_items?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.completed_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {sale.price_beetz}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Taxa: {sale.platform_fee_beetz} Beetz
                        </p>
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
