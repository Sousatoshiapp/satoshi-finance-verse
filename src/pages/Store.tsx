import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [showBeetzModal, setShowBeetzModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadStoreData();
    
    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const paymentType = urlParams.get('type');
    
    if (paymentStatus === 'success' && paymentType === 'beetz') {
      processBeetzPayment();
    }
  }, [navigate]);

  const loadStoreData = async () => {
    try {
      // Check localStorage first for user data
      const userData = localStorage.getItem('satoshi_user');
      if (!userData) {
        navigate('/welcome');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Load user profile from Supabase or fallback to localStorage
      let profile = null;
      if (user) {
        const { data: supabaseProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        profile = supabaseProfile;
      }

      // If no Supabase profile, use localStorage data
      if (!profile) {
        const localUser = JSON.parse(userData);
        profile = {
          id: 'local-user',
          level: localUser.level || 1,
          points: localUser.coins || 0,
          nickname: localUser.nickname || 'Usuário',
          xp: localUser.xp || 0,
          streak: localUser.streak || 0,
          completed_lessons: localUser.completedLessons || 0
        };
      }

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

  const processBeetzPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!sessionId) return;

    try {
      const { data, error } = await supabase.functions.invoke('process-beetz-payment', {
        body: { sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "🎉 Compra Realizada!",
        description: "Seus Beetz foram adicionados à sua conta",
      });

      // Reload store data to update points
      loadStoreData();
      
      // Clean URL parameters
      window.history.replaceState({}, document.title, "/store");
    } catch (error) {
      console.error('Error processing Beetz payment:', error);
      toast({
        title: "Erro no Pagamento",
        description: "Não foi possível processar o pagamento de Beetz",
        variant: "destructive"
      });
    }
  };

  const purchaseBeetz = async (amount: number, price: number, packageName: string) => {
    if (!userProfile) return;
    setPurchasing(`beetz-${amount}`);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: `beetz-${amount}`,
          productName: `${packageName} - ${amount} Beetz`,
          amount: price * 100, // Convert to centavos
          type: 'beetz'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error purchasing Beetz:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível processar a compra de Beetz",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
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
        setShowBeetzModal(true);
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
                <div className="text-xl font-bold text-white">{userProfile.points}</div>
              </div>
              <p className="text-sm text-white/70">Pontos Beetz • Nível {userProfile.level}</p>
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
          <TabsContent value="avatars">
            <div className="grid grid-cols-3 gap-3">
              {avatars.map((avatar) => {
                const isOwned = userAvatars.includes(avatar.id);
                const canAfford = userProfile ? userProfile.points >= avatar.price : false;
                const meetsLevel = userProfile ? userProfile.level >= avatar.level_required : false;
                
                return (
                  <Card key={avatar.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-2">
                        <img 
                          src={avatar.image_url} 
                          alt={avatar.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(avatar.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(avatar.rarity)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-2">
                      <div className="mb-2">
                        <h3 className="font-bold text-foreground text-sm truncate">{avatar.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{avatar.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{avatar.price}</span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                        <Badge variant="outline" className="text-xs">Nv {avatar.level_required}</Badge>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ Possui
                        </Button>
                      ) : (
                        <Button
                          onClick={() => purchaseItem(avatar, 'avatar')}
                          disabled={!canAfford || !meetsLevel || purchasing === avatar.id}
                          className="w-full text-xs py-1 h-8"
                          variant={canAfford && meetsLevel ? "default" : "outline"}
                        >
                          {purchasing === avatar.id ? "..." :
                           !meetsLevel ? `Nv ${avatar.level_required}` :
                           !canAfford ? "Sem pontos" : "Comprar"
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Boosts Tab */}
          <TabsContent value="boosts">
            <div className="grid grid-cols-3 gap-3">
              {products.filter(p => p.category === 'boost').map((product) => {
                const isOwned = userProducts.includes(product.id);
                const canAfford = userProfile ? userProfile.points >= product.price : false;
                const meetsLevel = userProfile ? userProfile.level >= product.level_required : false;
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-4">
                        <div className="text-4xl">{getCategoryIcon(product.category)}</div>
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(product.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(product.rarity)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-2">
                      <div className="mb-2">
                        <h3 className="font-bold text-foreground text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{product.price}</span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {product.duration_hours && (
                            <Badge variant="outline" className="text-xs">
                              {product.duration_hours}h
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">Nv {product.level_required}</Badge>
                        </div>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ Possui
                        </Button>
                      ) : (
                        <Button
                          onClick={() => purchaseItem(product, 'product')}
                          disabled={!canAfford || !meetsLevel || purchasing === product.id}
                          className="w-full text-xs py-1 h-8"
                          variant={canAfford && meetsLevel ? "default" : "outline"}
                        >
                          {purchasing === product.id ? "..." :
                           !meetsLevel ? `Nv ${product.level_required}` :
                           !canAfford ? "Sem pontos" : "Comprar"
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Accessories Tab */}
          <TabsContent value="accessories">
            <div className="grid grid-cols-3 gap-3">
              {products.filter(p => p.category === 'accessory').map((product) => {
                const isOwned = userProducts.includes(product.id);
                const canAfford = userProfile ? userProfile.points >= product.price : false;
                const meetsLevel = userProfile ? userProfile.level >= product.level_required : false;
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-4">
                        <div className="text-4xl">{getCategoryIcon(product.category)}</div>
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(product.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(product.rarity)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-2">
                      <div className="mb-2">
                        <h3 className="font-bold text-foreground text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{product.price}</span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                        <Badge variant="outline" className="text-xs">Nv {product.level_required}</Badge>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ Possui
                        </Button>
                      ) : (
                        <Button
                          onClick={() => purchaseItem(product, 'product')}
                          disabled={!canAfford || !meetsLevel || purchasing === product.id}
                          className="w-full text-xs py-1 h-8"
                          variant={canAfford && meetsLevel ? "default" : "outline"}
                        >
                          {purchasing === product.id ? "..." :
                           !meetsLevel ? `Nv ${product.level_required}` :
                           !canAfford ? "Sem pontos" : "Comprar"
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <FloatingNavbar />
      
      {/* Beetz Purchase Modal */}
      <Dialog open={showBeetzModal} onOpenChange={setShowBeetzModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>💎 Comprar Beetz</DialogTitle>
            <DialogDescription>
              Você não tem Beetz suficientes. Escolha um pacote para continuar:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    purchaseBeetz(20, 2, "Pacote Básico");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">20 Beetz</div>
                  <div className="text-sm text-muted-foreground">Pacote Básico</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 2,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-20'}
                  >
                    {purchasing === 'beetz-20' ? '...' : 'Comprar'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    purchaseBeetz(50, 4, "Pacote Popular");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">50 Beetz</div>
                  <div className="text-sm text-muted-foreground">Pacote Popular</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 4,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-50'}
                  >
                    {purchasing === 'beetz-50' ? '...' : 'Comprar'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    purchaseBeetz(100, 7, "Pacote Premium");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">100 Beetz</div>
                  <div className="text-sm text-muted-foreground">Pacote Premium</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 7,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-100'}
                  >
                    {purchasing === 'beetz-100' ? '...' : 'Comprar'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    purchaseBeetz(500, 50, "Pacote Supremo");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">500 Beetz</div>
                  <div className="text-sm text-muted-foreground">Pacote Supremo</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 50,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-500'}
                  >
                    {purchasing === 'beetz-500' ? '...' : 'Comprar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}