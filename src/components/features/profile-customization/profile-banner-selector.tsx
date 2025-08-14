import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Check, Lock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { toast } from '@/hooks/use-toast';

interface ProfileBanner {
  id: string;
  name: string;
  image_url: string;
  unlock_requirement: any;
  rarity: string;
  price_beetz: number;
  is_owned: boolean;
  is_active: boolean;
}

export function ProfileBannerSelector() {
  const { profile } = useProfile();
  const [banners, setBanners] = useState<ProfileBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState<ProfileBanner | null>(null);

  useEffect(() => {
    loadBanners();
  }, [profile]);

  const loadBanners = async () => {
    try {
      if (!profile) return;

      // Buscar todos os banners
      const { data: allBanners } = await supabase
        .from('profile_banners')
        .select('*')
        .eq('is_active', true);

      // Buscar banners do usuário
      const { data: userBanners } = await supabase
        .from('user_profile_banners')
        .select('banner_id')
        .eq('user_id', profile.id);

      const ownedBannerIds = userBanners?.map(ub => ub.banner_id) || [];

      const bannersWithOwnership = allBanners?.map(banner => ({
        ...banner,
        is_owned: ownedBannerIds.includes(banner.id) || (banner.unlock_requirement && typeof banner.unlock_requirement === 'object' && 'type' in banner.unlock_requirement && (banner.unlock_requirement as any).type === 'default'),
        is_active: false // Will be updated once we add active_banner_id to profiles
      })) || [];

      setBanners(bannersWithOwnership);
      
      const active = bannersWithOwnership.find(b => b.is_active);
      setActiveBanner(active || null);

    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseBanner = async (banner: ProfileBanner) => {
    if (!profile || banner.price_beetz === 0) return;

    if (profile.points < banner.price_beetz) {
      toast({
        title: "BTZ insuficientes",
        description: `Você precisa de ${banner.price_beetz} BTZ para comprar este banner!`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduzir pontos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: profile.points - banner.price_beetz })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Adicionar banner ao usuário
      const { error: insertError } = await supabase
        .from('user_profile_banners')
        .insert({
          user_id: profile.id,
          banner_id: banner.id,
          unlock_method: 'purchase'
        });

      if (insertError) throw insertError;

      toast({
        title: "Banner comprado!",
        description: `${banner.name} foi adicionado à sua coleção!`
      });

      loadBanners();
    } catch (error) {
      console.error('Error purchasing banner:', error);
      toast({
        title: "Erro ao comprar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const activateBanner = async (banner: ProfileBanner) => {
    if (!profile || !banner.is_owned) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active_banner_id: banner.id })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Banner ativado!",
        description: `${banner.name} agora é seu banner de perfil!`
      });

      loadBanners();
    } catch (error) {
      console.error('Error activating banner:', error);
      toast({
        title: "Erro ao ativar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const checkUnlockRequirement = (banner: ProfileBanner) => {
    if (!profile || !banner.unlock_requirement) return false;

    const req = banner.unlock_requirement;
    
    switch (req.type) {
      case 'default':
        return true;
      case 'level':
        return profile.level >= req.value;
      case 'streak':
        return profile.streak >= req.value;
      case 'points':
        return profile.points >= req.value;
      case 'quiz_expertise':
        // TODO: implementar lógica para expertise em quiz
        return false;
      default:
        return false;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getUnlockText = (banner: ProfileBanner) => {
    if (!banner.unlock_requirement) return '';

    const req = banner.unlock_requirement;
    
    switch (req.type) {
      case 'level':
        return `Nível ${req.value}`;
      case 'streak':
        return `${req.value} dias de streak`;
      case 'points':
        return `${req.value} BTZ`;
      case 'quiz_expertise':
        return `${req.value} quizzes perfeitos`;
      default:
        return 'Requisito especial';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando banners...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Banners de Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Banner Ativo */}
        {activeBanner && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Banner Ativo</h3>
            <div className="relative">
              <div 
                className="h-32 rounded-lg bg-cover bg-center flex items-end p-4"
                style={{ backgroundImage: `url(${activeBanner.image_url})` }}
              >
                <div className="bg-black/50 backdrop-blur-sm rounded px-3 py-1">
                  <p className="text-white font-medium">{activeBanner.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Todos os Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map(banner => {
            const canUnlock = checkUnlockRequirement(banner);
            const canPurchase = banner.price_beetz > 0 && profile && profile.points >= banner.price_beetz;

            return (
              <Card
                key={banner.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  banner.is_active ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => banner.is_owned && activateBanner(banner)}
              >
                <CardContent className="p-3">
                  <div 
                    className="h-24 rounded-lg bg-cover bg-center mb-3 relative"
                    style={{ backgroundImage: `url(${banner.image_url})` }}
                  >
                    {banner.is_active && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Ativo
                        </Badge>
                      </div>
                    )}
                    {!banner.is_owned && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{banner.name}</h4>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getRarityColor(banner.rarity)} text-white`}
                      >
                        {banner.rarity}
                      </Badge>
                    </div>

                    {!banner.is_owned && (
                      <div className="text-xs space-y-1">
                        {banner.unlock_requirement?.type !== 'default' && (
                          <p className={`${canUnlock ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {getUnlockText(banner)}
                          </p>
                        )}
                        {banner.price_beetz > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {banner.price_beetz} BTZ
                            </span>
                            {canUnlock && (
                              <Button
                                size="sm"
                                variant={canPurchase ? "default" : "secondary"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  purchaseBanner(banner);
                                }}
                                disabled={!canPurchase}
                              >
                                Comprar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}