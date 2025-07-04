import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Star, Gem, Zap } from "lucide-react";

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

interface UserProfile {
  id: string;
  level: number;
  points: number;
  xp: number;
}

export default function Store() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('satoshi_user');
    if (!userData) {
      navigate('/welcome');
      return;
    }

    loadStoreData();
  }, [navigate]);

  const loadStoreData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Load avatars
      const { data: avatarsData } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_available', true)
        .order('price', { ascending: true });

      if (avatarsData) {
        setAvatars(avatarsData);
      }

      // Load user's owned avatars
      if (profile) {
        const { data: ownedAvatars } = await supabase
          .from('user_avatars')
          .select('avatar_id')
          .eq('user_id', profile.id);

        if (ownedAvatars) {
          setUserAvatars(ownedAvatars.map(item => item.avatar_id));
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

  const purchaseAvatar = async (avatar: Avatar) => {
    if (!userProfile) return;

    setPurchasing(avatar.id);

    try {
      // Check if user has enough points
      if (userProfile.points < avatar.price) {
        toast({
          title: "Pontos Insuficientes",
          description: `Você precisa de ${avatar.price} pontos para comprar este avatar`,
          variant: "destructive"
        });
        return;
      }

      // Check level requirement
      if (userProfile.level < avatar.level_required) {
        toast({
          title: "Nível Insuficiente",
          description: `Você precisa estar no nível ${avatar.level_required} para comprar este avatar`,
          variant: "destructive"
        });
        return;
      }

      // Purchase avatar
      const { error: purchaseError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: userProfile.id,
          avatar_id: avatar.id
        });

      if (purchaseError) throw purchaseError;

      // Deduct points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: userProfile.points - avatar.price })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      // Update local state
      setUserProfile(prev => prev ? { ...prev, points: prev.points - avatar.price } : null);
      setUserAvatars(prev => [...prev, avatar.id]);

      toast({
        title: "Avatar Comprado!",
        description: `${avatar.name} foi adicionado à sua coleção`,
      });

    } catch (error) {
      console.error('Error purchasing avatar:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível comprar o avatar",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-muted text-muted-foreground';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Gem className="h-4 w-4" />;
      case 'epic': return <Zap className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando loja...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">🛒 Avatar Store</h1>
            <p className="text-muted-foreground text-sm">Customize seu personagem</p>
          </div>
        </div>

        {/* User Points */}
        {userProfile && (
          <Card className="mb-6 bg-gradient-points text-black">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-2xl">💎</div>
                <div className="text-xl font-bold">{userProfile.points}</div>
              </div>
              <p className="text-sm opacity-80">Seus Pontos Disponíveis</p>
            </CardContent>
          </Card>
        )}

        {/* Avatars Grid */}
        <div className="space-y-4 mb-20">
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
                      <span className="text-sm text-muted-foreground">pontos</span>
                    </div>
                    <Badge variant="outline">
                      Nível {avatar.level_required}+
                    </Badge>
                  </div>
                  
                  {isOwned ? (
                    <Button variant="secondary" className="w-full" disabled>
                      ✅ Possui este avatar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => purchaseAvatar(avatar)}
                      disabled={!canAfford || !meetsLevel || purchasing === avatar.id}
                      className="w-full"
                      variant={canAfford && meetsLevel ? "default" : "outline"}
                    >
                      {purchasing === avatar.id ? (
                        "Comprando..."
                      ) : !meetsLevel ? (
                        `Nível ${avatar.level_required} necessário`
                      ) : !canAfford ? (
                        "Pontos insuficientes"
                      ) : (
                        "Comprar Avatar"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}