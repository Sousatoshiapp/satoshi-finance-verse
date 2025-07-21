import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Clock, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProduct {
  id: string;
  product_id: string;
  expires_at: string;
  is_active: boolean;
  products: {
    name: string;
    category: string;
    effects: any;
    image_url?: string;
    duration_hours?: number;
  };
}

interface UserBadge {
  id: string;
  badge_name: string;
  badge_type: string;
  badge_description: string;
  earned_at: string;
}

export function UserInventory() {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Load user products
      const { data: products } = await supabase
        .from('user_products')
        .select(`
          *,
          products (name, category, effects, image_url, duration_hours)
        `)
        .eq('user_id', profile.id);

      // Load user badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      setUserProducts(products || []);
      setUserBadges(badges || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateBoost = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('user_products')
        .update({ 
          is_active: true,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .eq('id', productId);

      if (error) throw error;
      
      // Reload inventory
      loadInventory();
    } catch (error) {
      console.error('Error activating boost:', error);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'level': return '⭐';
      case 'streak': return '🔥';
      case 'trading': return '📈';
      case 'social': return '👥';
      case 'achievement': return '🏆';
      default: return '🎖️';
    }
  };

  const getBoostIcon = (category: string) => {
    switch (category) {
      case 'boost': return <Zap className="h-4 w-4" />;
      case 'accessory': return <Sparkles className="h-4 w-4" />;
      case 'protection': return <Shield className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Meu Inventário</h1>
          </div>
          <div className="text-center text-muted-foreground">
            Carregando inventário...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Meu Inventário</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Inventário Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="boosts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="boosts">Boosts & Itens</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
              </TabsList>
              
              <TabsContent value="boosts" className="space-y-4">
                {userProducts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum item encontrado</p>
                    <p className="text-sm">Visite a loja para adquirir boosts e acessórios!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProducts.map((userProduct) => {
                      const isExpired = userProduct.expires_at && new Date(userProduct.expires_at) < new Date();
                      const isActive = userProduct.is_active && !isExpired;
                      
                      return (
                        <Card key={userProduct.id} className={isActive ? "border-primary" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getBoostIcon(userProduct.products.category)}
                                <h4 className="font-semibold">{userProduct.products.name}</h4>
                              </div>
                              {isActive && (
                                <Badge variant="default" className="bg-green-500">
                                  Ativo
                                </Badge>
                              )}
                            </div>
                            
                            {userProduct.products.effects && (
                              <div className="mb-3">
                                <p className="text-sm text-muted-foreground">
                                  Efeitos: {JSON.stringify(userProduct.products.effects)}
                                </p>
                              </div>
                            )}
                            
                            {userProduct.expires_at && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                <Clock className="h-3 w-3" />
                                {isActive ? (
                                  `Expira em: ${new Date(userProduct.expires_at).toLocaleDateString()}`
                                ) : isExpired ? (
                                  "Expirado"
                                ) : (
                                  "Não ativado"
                                )}
                              </div>
                            )}
                            
                            {!isActive && !isExpired && (
                              <Button 
                                size="sm" 
                                onClick={() => activateBoost(userProduct.id)}
                                className="w-full"
                              >
                                Ativar
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="badges" className="space-y-4">
                {userBadges.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma badge conquistada ainda</p>
                    <p className="text-sm">Complete desafios para ganhar badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userBadges.map((badge) => (
                      <Card key={badge.id} className="text-center">
                        <CardContent className="p-4">
                          <div className="text-3xl mb-2">
                            {getBadgeIcon(badge.badge_type)}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">
                            {badge.badge_name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {badge.badge_description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
