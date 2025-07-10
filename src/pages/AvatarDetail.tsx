import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Coins, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Avatar {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  price: number;
  rarity: string;
  level_required: number;
  backstory?: string;
  bonus_effects?: any;
  is_available: boolean;
}

export default function AvatarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [owned, setOwned] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (id) {
      fetchAvatarDetails();
      if (user) {
        checkOwnership();
        fetchUserStats();
      }
    }
  }, [id, user]);

  const fetchAvatarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAvatar(data);
    } catch (error) {
      console.error('Error fetching avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do avatar.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', user.id)
        .eq('avatar_id', id)
        .single();
      
      setOwned(!!data);
    } catch (error) {
      // Not owned
      setOwned(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserPoints(data.points || 0);
        setUserLevel(data.level || 1);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user || !avatar) return;
    
    if (userPoints < avatar.price) {
      toast({
        title: "BTZ Insuficiente",
        description: `Você precisa de ${avatar.price} BTZ para comprar este avatar.`,
        variant: "destructive"
      });
      return;
    }
    
    if (userLevel < avatar.level_required) {
      toast({
        title: "Nível Insuficiente",
        description: `Você precisa estar no nível ${avatar.level_required} para comprar este avatar.`,
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);
    
    try {
      // Purchase avatar
      const { error: purchaseError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: user.id,
          avatar_id: avatar.id,
          purchased_at: new Date().toISOString()
        });
      
      if (purchaseError) throw purchaseError;
      
      // Deduct points
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ points: userPoints - avatar.price })
        .eq('user_id', user.id);
      
      if (pointsError) throw pointsError;
      
      setOwned(true);
      setUserPoints(prev => prev - avatar.price);
      
      toast({
        title: "Avatar Comprado!",
        description: `${avatar.name} foi adicionado à sua coleção.`
      });
      
    } catch (error) {
      console.error('Error purchasing avatar:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível comprar o avatar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Avatar não encontrado</h1>
          <Button onClick={() => navigate('/store')}>
            Voltar à Loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{avatar.name}</h1>
                  <Badge className={getRarityColor(avatar.rarity)}>
                    {avatar.rarity}
                  </Badge>
                </div>
                
                {avatar.description && (
                  <p className="text-muted-foreground mb-4">{avatar.description}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Avatar Details */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  {owned ? 'Você possui este avatar' : 'Comprar Avatar'}
                </CardTitle>
                {!owned && (
                  <CardDescription>
                    Adicione este avatar à sua coleção
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {owned ? (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-lg font-semibold text-primary">Você já possui este avatar!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-lg">
                      <span>Preço:</span>
                      <span className="font-bold">{avatar.price} BTZ</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Nível necessário:</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {avatar.level_required}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Seus BTZ:</span>
                      <span>{userPoints}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Seu nível:</span>
                      <span>{userLevel}</span>
                    </div>
                    
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing || userPoints < avatar.price || userLevel < avatar.level_required}
                      className="w-full"
                    >
                      {purchasing ? (
                        "Comprando..."
                      ) : userPoints < avatar.price ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          BTZ Insuficiente
                        </>
                      ) : userLevel < avatar.level_required ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Nível Insuficiente
                        </>
                      ) : (
                        `Comprar por ${avatar.price} BTZ`
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Backstory */}
            {avatar.backstory && (
              <Card>
                <CardHeader>
                  <CardTitle>História</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {avatar.backstory}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bonus Effects */}
            {avatar.bonus_effects && Object.keys(avatar.bonus_effects).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Efeitos Especiais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(avatar.bonus_effects).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-semibold">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}