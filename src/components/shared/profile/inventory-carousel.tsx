
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/shared/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Clock, Shield, Sparkles, ArrowRight } from "lucide-react";
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

export function InventoryCarousel() {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
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

      const { data: products } = await supabase
        .from('user_products')
        .select(`
          *,
          products (name, category, effects, image_url, duration_hours)
        `)
        .eq('user_id', profile.id)
        .limit(5);

      setUserProducts(products || []);
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
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', productId);

      if (error) throw error;
      loadInventory();
    } catch (error) {
      console.error('Error activating boost:', error);
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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Meu Inventário</h3>
            <div className="animate-pulse h-4 w-16 bg-muted rounded"></div>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-32 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Meu Inventário</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/inventory')}
            className="text-primary hover:text-primary/80"
          >
            Ver Todos <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {userProducts.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">Nenhum item encontrado</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
              Visitar Loja
            </Button>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {userProducts.map((userProduct) => {
                const isExpired = userProduct.expires_at && new Date(userProduct.expires_at) < new Date();
                const isActive = userProduct.is_active && !isExpired;
                
                return (
                  <CarouselItem key={userProduct.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className={`h-full ${isActive ? "border-primary bg-primary/5" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getBoostIcon(userProduct.products.category)}
                            <h4 className="font-semibold text-sm">{userProduct.products.name}</h4>
                          </div>
                          {isActive && (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        
                        {userProduct.expires_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <Clock className="h-3 w-3" />
                            {isActive ? (
                              `Expira: ${new Date(userProduct.expires_at).toLocaleDateString()}`
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
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
