import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Star, Gem, Zap, Clock, Gift, Shield } from "lucide-react";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rarity: string;
  level_required: number;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rarity: string;
  level_required: number;
  effects: any;
  duration_hours?: number;
}

interface UserProfile {
  id: string;
  level: number;
  points: number;
  xp: number;
}

export default function Store() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadStoreData();
  }, [navigate]);

  const loadStoreData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/welcome');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Load avatars and products
      const [avatarsData, productsData] = await Promise.all([
        supabase.from('avatars').select('*').eq('is_available', true).order('price'),
        supabase.from('products').select('*').eq('is_available', true).order('category').order('price')
      ]);

      if (avatarsData.data) {
        setAvatars(avatarsData.data);
      }
      if (productsData.data) {
        setProducts(productsData.data);
      }

      // Load user's owned items
      if (profile) {
        const [ownedAvatars, ownedProducts] = await Promise.all([
          supabase.from('user_avatars').select('avatar_id').eq('user_id', profile.id),
          supabase.from('user_products').select('product_id').eq('user_id', profile.id)
        ]);

        if (ownedAvatars.data) {
          setUserAvatars(ownedAvatars.data.map(item => item.avatar_id));
        }
        if (ownedProducts.data) {
          setUserProducts(ownedProducts.data.map(item => item.product_id));
        }
      }
    } catch (error) {
      console.error('Error loading store data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a loja",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (item: Avatar | Product, type: 'avatar' | 'product') => {
    if (!userProfile) return;
    setPurchasing(item.id);

    try {
      if (userProfile.level < item.level_required) {
        toast({
          title: "Nível Insuficiente", 
          description: `Nível ${item.level_required} necessário`,
          variant: "destructive"
        });
        return;
      }

      // For products, use Stripe payment
      if (type === 'product') {
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            productId: item.id,
            productName: item.name,
            amount: item.price * 100, // Convert to centavos
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        return;
      }

      // For avatars, use the existing points system
      if (userProfile.points < item.price) {
        toast({
          title: "Pontos Insuficientes",
          description: `Você precisa de ${item.price} pontos`,
          variant: "destructive"
        });
        return;
      }

      await supabase.from('user_avatars').insert({
        user_id: userProfile.id,
        avatar_id: item.id
      });
      setUserAvatars(prev => [...prev, item.id]);

      // Deduct points
      await supabase.from('profiles').update({
        points: userProfile.points - item.price
      }).eq('id', userProfile.id);

      setUserProfile(prev => prev ? { ...prev, points: prev.points - item.price } : null);

      toast({
        title: "🎉 Avatar Comprado!",
        description: `${item.name} foi adicionado à sua coleção`,
      });

    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível processar a compra",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'uncommon': return <Gem className="h-4 w-4" />;
      case 'rare': return <Zap className="h-4 w-4" />;
      case 'epic': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'boost': return '⚡';
      case 'accessory': return '👟';
      case 'cosmetic': return '🎨';
      case 'utility': return '🛠️';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">🛒 Marketplace</h1>
            <p className="text-muted-foreground text-sm">Avatares, boosts e muito mais</p>
          </div>
        </div>

        {/* User Points */}
        {userProfile && (
          <Card className="mb-6 bg-gradient-points">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-2xl">💎</div>
                <div className="text-xl font-bold text-black">{userProfile.points}</div>
              </div>
              <p className="text-sm text-black/70">Pontos Beetz • Nível {userProfile.level}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="avatars" className="mb-20">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="avatars">👤 Avatares</TabsTrigger>
            <TabsTrigger value="boosts">⚡ Boosts</TabsTrigger>
            <TabsTrigger value="accessories">👟 Acessórios</TabsTrigger>
          </TabsList>

          {/* Avatars Tab */}
          <TabsContent value="avatars" className="space-y-4">
            {avatars.map((avatar) => {
              const isOwned = userAvatars.includes(avatar.id);
              const canAfford = userProfile ? userProfile.points >= avatar.price : false;
              const meetsLevel = userProfile ? userProfile.level >= avatar.level_required : false;
              
              return (
                <Card key={avatar.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-4">
                      <img 
                        src={avatar.image_url} 
                        alt={avatar.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getRarityColor(avatar.rarity)} flex items-center gap-1`}>
                        {getRarityIcon(avatar.rarity)}
                        {avatar.rarity}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-foreground">{avatar.name}</h3>
                      <p className="text-sm text-muted-foreground">{avatar.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">{avatar.price}</span>
                         <span className="text-sm text-muted-foreground">Pontos Beetz</span>
                      </div>
                      <Badge variant="outline">Nível {avatar.level_required}+</Badge>
                    </div>
                    
                    {isOwned ? (
                      <Button variant="secondary" className="w-full" disabled>
                        ✅ Possui este avatar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => purchaseItem(avatar, 'avatar')}
                        disabled={!canAfford || !meetsLevel || purchasing === avatar.id}
                        className="w-full"
                        variant={canAfford && meetsLevel ? "default" : "outline"}
                      >
                        {purchasing === avatar.id ? "Comprando..." :
                         !meetsLevel ? `Nível ${avatar.level_required} necessário` :
                         !canAfford ? "Pontos insuficientes" : "Comprar Avatar"
                        }
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Boosts Tab */}
          <TabsContent value="boosts" className="space-y-4">
            {products.filter(p => p.category === 'boost').map((product) => {
              const isOwned = userProducts.includes(product.id);
              const canAfford = userProfile ? userProfile.points >= product.price : false;
              const meetsLevel = userProfile ? userProfile.level >= product.level_required : false;
              
              return (
                <Card key={product.id} className="hover:shadow-elevated transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getCategoryIcon(product.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{product.name}</h3>
                          <Badge className={`${getRarityColor(product.rarity)} flex items-center gap-1`}>
                            {getRarityIcon(product.rarity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">{product.price}</span>
                             <span className="text-sm text-muted-foreground">Pontos Beetz</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {product.duration_hours && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {product.duration_hours}h
                              </Badge>
                            )}
                            <Badge variant="outline">Nível {product.level_required}+</Badge>
                          </div>
                        </div>
                        
                        {isOwned ? (
                          <Button variant="secondary" className="w-full" disabled>
                            ✅ Item adquirido
                          </Button>
                        ) : (
                          <Button
                            onClick={() => purchaseItem(product, 'product')}
                            disabled={!canAfford || !meetsLevel || purchasing === product.id}
                            className="w-full"
                            variant={canAfford && meetsLevel ? "default" : "outline"}
                          >
                            {purchasing === product.id ? "Comprando..." :
                             !meetsLevel ? `Nível ${product.level_required} necessário` :
                             !canAfford ? "Pontos insuficientes" : "Comprar Item"
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Accessories Tab */}
          <TabsContent value="accessories" className="space-y-4">
            {products.filter(p => p.category === 'accessory').map((product) => {
              const isOwned = userProducts.includes(product.id);
              const canAfford = userProfile ? userProfile.points >= product.price : false;
              const meetsLevel = userProfile ? userProfile.level >= product.level_required : false;
              
              return (
                <Card key={product.id} className="hover:shadow-elevated transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getCategoryIcon(product.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{product.name}</h3>
                          <Badge className={`${getRarityColor(product.rarity)} flex items-center gap-1`}>
                            {getRarityIcon(product.rarity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">{product.price}</span>
                            <span className="text-sm text-muted-foreground">Pontos Beetz</span>
                          </div>
                          <Badge variant="outline">Nível {product.level_required}+</Badge>
                        </div>
                        
                        {isOwned ? (
                          <Button variant="secondary" className="w-full" disabled>
                            ✅ Item adquirido
                          </Button>
                        ) : (
                          <Button
                            onClick={() => purchaseItem(product, 'product')}
                            disabled={!canAfford || !meetsLevel || purchasing === product.id}
                            className="w-full"
                            variant={canAfford && meetsLevel ? "default" : "outline"}
                          >
                            {purchasing === product.id ? "Comprando..." :
                             !meetsLevel ? `Nível ${product.level_required} necessário` :
                             !canAfford ? "Pontos insuficientes" : "Comprar Item"
                            }
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}