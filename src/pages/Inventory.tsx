import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Clock, Shield, Sparkles, ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
    description?: string;
  };
}

export default function Inventory() {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
          products (name, category, effects, image_url, duration_hours, description)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

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
      
      toast({
        title: "Boost ativado! ⚡",
        description: "Seu boost está agora ativo.",
      });
      
      loadInventory();
    } catch (error) {
      console.error('Error activating boost:', error);
      toast({
        title: "Erro ❌",
        description: "Não foi possível ativar o boost.",
        variant: "destructive"
      });
    }
  };

  const getBoostIcon = (category: string) => {
    switch (category) {
      case 'boost': return <Zap className="h-5 w-5" />;
      case 'accessory': return <Sparkles className="h-5 w-5" />;
      case 'protection': return <Shield className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryProducts = (category: string) => {
    return userProducts.filter(p => p.products.category === category);
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: Package },
    { id: 'boost', label: 'Boosts', icon: Zap },
    { id: 'accessory', label: 'Acessórios', icon: Sparkles },
    { id: 'protection', label: 'Proteção', icon: Shield }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen bg-background ${isMobile ? 'pb-24' : 'pb-20'}`} 
           style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
        <div className={`${isMobile ? 'px-6 py-4 pt-18' : 'px-4 py-4'}`}>
          <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Meu Inventário</h1>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-24' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
      <div className={`${isMobile ? 'px-6 py-4 pt-18' : 'px-4 py-4'}`}>
        <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Meu Inventário</h1>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(category.id === 'all' ? userProducts : getCategoryProducts(category.id)).map((userProduct) => {
                    const isExpired = userProduct.expires_at && new Date(userProduct.expires_at) < new Date();
                    const isActive = userProduct.is_active && !isExpired;
                    
                    return (
                      <Card key={userProduct.id} className={`${isActive ? "border-primary bg-primary/5" : ""}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getBoostIcon(userProduct.products.category)}
                              <CardTitle className="text-lg">{userProduct.products.name}</CardTitle>
                            </div>
                            {isActive && (
                              <Badge variant="default" className="bg-green-500">
                                Ativo
                              </Badge>
                            )}
                          </div>
                          {userProduct.products.description && (
                            <p className="text-sm text-muted-foreground">
                              {userProduct.products.description}
                            </p>
                          )}
                        </CardHeader>
                        
                        <CardContent>
                          {userProduct.expires_at && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <Clock className="h-4 w-4" />
                              {isActive ? (
                                `Expira: ${new Date(userProduct.expires_at).toLocaleDateString()}`
                              ) : isExpired ? (
                                "Expirado"
                              ) : (
                                "Não ativado"
                              )}
                            </div>
                          )}
                          
                          {userProduct.products.effects && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Efeitos:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {Object.entries(userProduct.products.effects).map(([key, value]) => (
                                  <li key={key}>• {key}: {String(value)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {!isActive && !isExpired && (
                            <Button 
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
                
                {(category.id === 'all' ? userProducts : getCategoryProducts(category.id)).length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {category.id === 'all' 
                        ? 'Seu inventário está vazio' 
                        : `Você não possui ${category.label.toLowerCase()}`}
                    </p>
                    <Button onClick={() => navigate('/shop')}>
                      Visitar Loja
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
