import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Crown, Lock, Star, Users, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  rarity: string;
  price: number;
  level_required: number;
  is_owned: boolean;
  is_active: boolean;
  avatar_class?: string;
  bonus_effects?: any;
}

export default function AvatarShop() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAvatarsAndProfile();
  }, []);

  const loadAvatarsAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      // Get all avatars
      const { data: allAvatars } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_available', true)
        .order('rarity', { ascending: false });

      // Get user's owned avatars
      const { data: userAvatars } = await supabase
        .from('user_avatars')
        .select('avatar_id')
        .eq('user_id', profile?.id);

      const ownedAvatarIds = userAvatars?.map(ua => ua.avatar_id) || [];

      const avatarsWithOwnership = allAvatars?.map(avatar => ({
        ...avatar,
        is_owned: ownedAvatarIds.includes(avatar.id),
        is_active: avatar.id === profile?.avatar_id
      })) || [];

      setAvatars(avatarsWithOwnership);
    } catch (error) {
      console.error('Error loading avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseAvatar = async (avatar: Avatar) => {
    if (!userProfile) return;

    if (userProfile.points < avatar.price) {
      toast({
        title: "Beetz insuficientes! 💰",
        description: `Você precisa de ${avatar.price} Beetz para comprar este avatar.`,
        variant: "destructive"
      });
      return;
    }

    if (userProfile.level < avatar.level_required) {
      toast({
        title: "Nível insuficiente! 📈",
        description: `Você precisa estar no nível ${avatar.level_required} para comprar este avatar.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct points and add avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: userProfile.points - avatar.price })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: userProfile.id,
          avatar_id: avatar.id
        });

      if (insertError) throw insertError;

      toast({
        title: "Avatar comprado! 🎉",
        description: `${avatar.name} foi adicionado à sua coleção.`,
      });

      loadAvatarsAndProfile();
    } catch (error) {
      console.error('Error purchasing avatar:', error);
      toast({
        title: "Erro na compra ❌",
        description: "Não foi possível comprar este avatar.",
        variant: "destructive"
      });
    }
  };

  const selectAvatar = async (avatarId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_id: avatarId })
        .eq('id', userProfile.id);

      if (error) throw error;
      
      toast({
        title: "Avatar equipado! ✨",
        description: "Seu avatar foi alterado com sucesso.",
      });
      
      loadAvatarsAndProfile();
    } catch (error) {
      console.error('Error selecting avatar:', error);
      toast({
        title: "Erro ❌",
        description: "Não foi possível equipar este avatar.",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRarityAvatars = (rarity: string) => {
    return avatars.filter(avatar => rarity === 'all' || avatar.rarity === rarity);
  };

  const rarities = [
    { id: 'all', label: 'Todos', icon: Users },
    { id: 'common', label: 'Comum', icon: Star },
    { id: 'uncommon', label: 'Incomum', icon: Star },
    { id: 'rare', label: 'Raro', icon: Star },
    { id: 'epic', label: 'Épico', icon: Crown },
    { id: 'legendary', label: 'Lendário', icon: Crown }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Loja de Avatares</h1>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Loja de Avatares</h1>
            </div>
            
            {userProfile && (
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-semibold">{userProfile.points} Beetz</span>
              </div>
            )}
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              {rarities.map((rarity) => (
                <TabsTrigger key={rarity.id} value={rarity.id} className="flex items-center gap-1">
                  <rarity.icon className="w-3 h-3" />
                  {rarity.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {rarities.map((rarity) => (
              <TabsContent key={rarity.id} value={rarity.id}>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {getRarityAvatars(rarity.id).map((avatar) => (
                    <Card key={avatar.id} className={`relative transition-all hover:scale-105 ${
                      avatar.is_active ? 'border-primary bg-primary/5' : 
                      avatar.is_owned ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            <AvatarDisplayUniversal
                              avatarName={avatar.name}
                              avatarUrl={avatar.image_url}
                              nickname={avatar.name}
                              size="lg"
                            />
                            {avatar.is_active && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Crown className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            {!avatar.is_owned && (
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Lock className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <CardTitle className="text-sm">{avatar.name}</CardTitle>
                            <Badge className={`text-xs ${getRarityColor(avatar.rarity)}`}>
                              {avatar.rarity}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {avatar.description && (
                          <p className="text-xs text-muted-foreground mb-2 text-center">
                            {avatar.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          {!avatar.is_owned && (
                            <>
                              <div className="flex items-center justify-center gap-2 text-xs">
                                <Coins className="w-3 h-3" />
                                <span>{avatar.price} Beetz</span>
                              </div>
                              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Star className="w-3 h-3" />
                                <span>Nível {avatar.level_required}</span>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => purchaseAvatar(avatar)}
                                className="w-full"
                                disabled={userProfile?.points < avatar.price || userProfile?.level < avatar.level_required}
                              >
                                Comprar
                              </Button>
                            </>
                          )}
                          
                          {avatar.is_owned && !avatar.is_active && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => selectAvatar(avatar.id)}
                              className="w-full"
                            >
                              Equipar
                            </Button>
                          )}
                          
                          {avatar.is_active && (
                            <Badge variant="default" className="w-full justify-center">
                              Equipado
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {getRarityAvatars(rarity.id).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum avatar encontrado</h3>
                    <p className="text-muted-foreground">
                      Não há avatares {rarity.label.toLowerCase()} disponíveis no momento.
                    </p>
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