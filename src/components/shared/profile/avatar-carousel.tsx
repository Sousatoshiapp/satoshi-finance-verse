
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/shared/ui/carousel";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { supabase } from "@/integrations/supabase/client";
import { useAvatarContext } from "@/contexts/AvatarContext";
import { ArrowRight, Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  rarity: string;
  price: number;
  level_required: number;
  is_owned?: boolean;
  is_active?: boolean;
}

interface AvatarCarouselProps {
  userProfileId: string;
  currentAvatarId?: string;
  onAvatarChanged?: (avatarId: string) => void;
}

export function AvatarCarousel({ userProfileId, currentAvatarId, onAvatarChanged }: AvatarCarouselProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { invalidateAvatarCaches } = useAvatarContext();

  useEffect(() => {
    loadAvatars();
  }, [userProfileId]);

  const loadAvatars = async () => {
    try {
      console.log('🔍 Loading avatars for profile:', userProfileId);
      
      const { data: availableAvatars, error } = await supabase
        .from('avatars')
        .select('*')
        .order('rarity', { ascending: false })
        .limit(6);

      if (error) throw error;
      console.log('📋 Available avatars:', availableAvatars);

      const { data: userAvatars, error: userAvatarsError } = await supabase
        .from('user_avatars')
        .select('avatar_id')
        .eq('user_id', userProfileId);

      if (userAvatarsError) {
        console.error('❌ Error loading user avatars:', userAvatarsError);
      }

      console.log('👤 User owned avatars:', userAvatars);
      const ownedAvatarIds = userAvatars?.map(ua => ua.avatar_id) || [];
      console.log('🎯 Owned avatar IDs:', ownedAvatarIds);

      const avatarsWithOwnership = availableAvatars?.map(avatar => ({
        ...avatar,
        is_owned: ownedAvatarIds.includes(avatar.id),
        is_active: avatar.id === currentAvatarId
      })) || [];

      console.log('✨ Avatars with ownership:', avatarsWithOwnership);

      // Sort to show active first, then owned, then others
      const sortedAvatars = avatarsWithOwnership.sort((a, b) => {
        if (a.is_active) return -1;
        if (b.is_active) return 1;
        if (a.is_owned && !b.is_owned) return -1;
        if (!a.is_owned && b.is_owned) return 1;
        return 0;
      });

      setAvatars(sortedAvatars);
    } catch (error) {
      console.error('Error loading avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = async (avatarId: string) => {
    try {
      // CORREÇÃO 3: Limpar profile_image_url quando avatar é selecionado
      const { error } = await supabase
        .from('profiles')
        .update({ 
          current_avatar_id: avatarId,
          profile_image_url: null // Limpar foto para mostrar avatar
        })
        .eq('id', userProfileId);

      if (error) throw error;
      
      // Invalidate all avatar-related caches
      invalidateAvatarCaches();
      
      onAvatarChanged?.(avatarId);
      loadAvatars();
    } catch (error) {
      console.error('Error selecting avatar:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Meus Avatares</h3>
            <div className="animate-pulse h-4 w-16 bg-muted rounded"></div>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-32 bg-muted rounded-lg animate-pulse"></div>
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
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Meus Avatares</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/avatar-collection')}
            className="text-primary hover:text-primary/80"
          >
            Ver Todos <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {avatars.map((avatar) => (
              <CarouselItem key={avatar.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="relative">
                  <Card className={`cursor-pointer transition-all ${
                    avatar.is_active ? 'border-primary bg-primary/5' : 
                    avatar.is_owned ? 'border-green-500/50 bg-green-500/5' : 
                    'opacity-60'
                  }`}>
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <AvatarDisplayUniversal
                            avatarName={avatar.name}
                            avatarUrl={avatar.image_url}
                            nickname={avatar.name}
                            size="md"
                          />
                          {avatar.is_active && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Crown className="w-2 h-2 text-primary-foreground" />
                            </div>
                          )}
                          {!avatar.is_owned && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs font-medium truncate w-full">{avatar.name}</p>
                        </div>
                        
                        {avatar.is_owned && !avatar.is_active && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => selectAvatar(avatar.id)}
                            className="w-full text-xs"
                          >
                            Usar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
