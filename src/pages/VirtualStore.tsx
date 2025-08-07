import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { ShoppingCart, Zap, Crown, Gift, Star } from "lucide-react";

export default function VirtualStore() {
  const storeItems = [
    {
      id: 1,
      name: "Pacote de Power-ups",
      description: "5 power-ups aleatórios",
      price: 500,
      currency: "beetz",
      category: "powerups",
      icon: Zap,
      popular: false
    },
    {
      id: 2,
      name: "Avatar Premium",
      description: "Desbloqueie um avatar exclusivo",
      price: 1200,
      currency: "beetz",
      category: "avatars",
      icon: Crown,
      popular: true
    },
    {
      id: 3,
      name: "Caixa de Tesouros",
      description: "Itens raros e épicos garantidos",
      price: 1000,
      currency: "beetz",
      category: "lootboxes",
      icon: Gift,
      popular: false
    },
    {
      id: 4,
      name: "Multiplicador XP",
      description: "2x XP por 24 horas",
      price: 800,
      currency: "beetz",
      category: "boosts",
      icon: Star,
      popular: true
    }
  ];

  const premiumPacks = [
    {
      name: "Pacote Iniciante",
      price: 9.99,
      currency: "BRL",
      items: ["2000 Beetz", "5 Power-ups", "1 Avatar"],
      popular: false
    },
    {
      name: "Pacote Pro",
      price: 19.99,
      currency: "BRL",
      items: ["5000 Beetz", "15 Power-ups", "3 Avatars", "Multiplicador XP"],
      popular: true
    },
    {
      name: "Pacote Elite",
      price: 39.99,
      currency: "BRL",
      items: ["12000 Beetz", "40 Power-ups", "8 Avatars", "Itens Exclusivos"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Development Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <div className="text-2xl">🚧</div>
            <div>
              <h3 className="font-semibold">Em Desenvolvimento</h3>
              <p className="text-sm">Esta funcionalidade está sendo desenvolvida e estará disponível em breve!</p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">🛒 Loja Virtual</h1>

        <Tabs defaultValue="beetz" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="beetz">Comprar com Beetz</TabsTrigger>
            <TabsTrigger value="premium">Pacotes Premium</TabsTrigger>
          </TabsList>

          {/* Loja Beetz */}
          <TabsContent value="beetz">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <Card key={item.id} className="relative overflow-hidden">
                  {item.popular && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gradient-to-r from-primary to-secondary">
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary text-white">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="text-sm">{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {item.price} 🪙
                        </div>
                        <div className="text-sm text-muted-foreground">Beetz</div>
                      </div>
                      
                      <Button className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pacotes Premium */}
          <TabsContent value="premium">
            <div className="grid md:grid-cols-3 gap-6">
              {premiumPacks.map((pack, index) => (
                <Card key={index} className={`relative overflow-hidden ${
                  pack.popular ? 'ring-2 ring-primary border-primary' : ''
                }`}>
                  {pack.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-2 text-sm font-medium">
                      🔥 Mais Popular
                    </div>
                  )}
                  
                  <CardHeader className={pack.popular ? 'pt-8' : ''}>
                    <CardTitle className="text-xl text-center">{pack.name}</CardTitle>
                    <div className="text-center">
                      <div className="text-3xl font-bold">R$ {pack.price}</div>
                      <div className="text-sm text-muted-foreground">Pagamento único</div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        {pack.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      
                      <Button className="w-full" variant={pack.popular ? 'default' : 'outline'}>
                        Comprar Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Saldo Atual */}
        <Card className="mt-6 bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Seu Saldo</h3>
                <p className="text-white/80">Beetz disponíveis para compras</p>
              </div>
              <div className="text-3xl font-bold">2,450 🪙</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
