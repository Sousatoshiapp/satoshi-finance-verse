import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, TrendingUp, Eye, Heart } from "lucide-react";

export default function NFTMarketplace() {
  const nftItems = [
    {
      id: 1,
      name: "Golden Bitcoin",
      description: "Avatar lendário exclusivo",
      price: 2500,
      rarity: "legendary",
      image: "🪙",
      seller: "CryptoMaster",
      likes: 45,
      views: 234
    },
    {
      id: 2,
      name: "Diamond Hands",
      description: "Badge de investidor veterano",
      price: 1800,
      rarity: "epic",
      image: "💎",
      seller: "DiamondTrader",
      likes: 28,
      views: 156
    },
    {
      id: 3,
      name: "Bull Market",
      description: "Frame de perfil exclusivo",
      price: 1200,
      rarity: "rare",
      image: "🐂",
      seller: "BullRunner",
      likes: 67,
      views: 289
    },
    {
      id: 4,
      name: "Satoshi Legacy",
      description: "Colecionável histórico",
      price: 3500,
      rarity: "legendary",
      image: "₿",
      seller: "SatoshiFan",
      likes: 89,
      views: 445
    }
  ];

  const myCollection = [
    {
      id: 1,
      name: "Silver Coin",
      rarity: "rare",
      image: "🥈",
      acquired: "2024-01-15"
    },
    {
      id: 2,
      name: "Trading Badge",
      rarity: "common",
      image: "📈",
      acquired: "2024-01-10"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎨 Marketplace NFT</h1>

        <Tabs defaultValue="marketplace" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="collection">Minha Coleção</TabsTrigger>
          </TabsList>

          {/* Marketplace */}
          <TabsContent value="marketplace">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nftItems.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-6xl">
                    {nft.image}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{nft.name}</CardTitle>
                      <Badge className={`${getRarityColor(nft.rarity)} text-white capitalize`}>
                        {nft.rarity}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{nft.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Por: {nft.seller}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{nft.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{nft.views}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">
                          {nft.price} 🪙
                        </div>
                        <div className="text-xs text-muted-foreground">Beetz</div>
                      </div>
                      
                      <Button className="w-full">
                        <Palette className="w-4 h-4 mr-2" />
                        Comprar NFT
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Minha Coleção */}
          <TabsContent value="collection">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Minha Coleção</h2>
                <div className="text-sm text-muted-foreground">
                  {myCollection.length} itens
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {myCollection.map((nft) => (
                  <Card key={nft.id} className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-6xl">
                      {nft.image}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{nft.name}</CardTitle>
                        <Badge className={`${getRarityColor(nft.rarity)} text-white capitalize`}>
                          {nft.rarity}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        Adquirido em {new Date(nft.acquired).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Vender
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Empty State */}
                {myCollection.length < 4 && (
                  <Card className="border-dashed border-2 flex items-center justify-center aspect-square">
                    <div className="text-center text-muted-foreground">
                      <Palette className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Compre seu primeiro NFT</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}