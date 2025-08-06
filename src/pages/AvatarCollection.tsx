import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Input } from "@/components/shared/ui/input";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { supabase } from "@/integrations/supabase/client";
import { useAvatarContext } from "@/contexts/AvatarContext";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";
import { useProfile } from "@/hooks/use-profile";
import { ArrowLeft, Crown, Lock, Search, Filter } from "lucide-react";

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
  category?: string;
}

type FilterType = 'all' | 'avatars' | 'skins' | 'boosts';

export default function AvatarCollection() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const navigate = useNavigate();
  const { t } = useI18n();
  const { profile } = useProfile();
  const { invalidateAvatarCaches } = useAvatarContext();

  useEffect(() => {
    loadAvatars();
  }, [profile?.id]);

  const loadAvatars = async () => {
    if (!profile?.id) return;
    
    try {
      const { data: availableAvatars, error } = await supabase
        .from('avatars')
        .select('*')
        .order('rarity', { ascending: false });

      if (error) throw error;

      const { data: userAvatars, error: userAvatarsError } = await supabase
        .from('user_avatars')
        .select('avatar_id')
        .eq('user_id', profile.id);

      if (userAvatarsError) {
        console.error('Error loading user avatars:', userAvatarsError);
      }

      const ownedAvatarIds = userAvatars?.map(ua => ua.avatar_id) || [];

      const avatarsWithOwnership = availableAvatars?.map(avatar => ({
        ...avatar,
        is_owned: ownedAvatarIds.includes(avatar.id),
        is_active: avatar.id === profile.avatar_id,
        category: avatar.rarity === 'legendary' ? 'avatars' : 
                 avatar.rarity === 'epic' ? 'skins' : 'boosts'
      })) || [];

      setAvatars(avatarsWithOwnership);
    } catch (error) {
      console.error('Error loading avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = async (avatarId: string) => {
    if (!profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          current_avatar_id: avatarId,
          profile_image_url: null
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      invalidateAvatarCaches();
      loadAvatars();
    } catch (error) {
      console.error('Error selecting avatar:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const filteredAvatars = avatars.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || avatar.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filterButtons = [
    { key: 'all' as const, label: t('avatarCollection.filters.all'), count: avatars.length },
    { key: 'avatars' as const, label: t('avatarCollection.filters.avatars'), count: avatars.filter(a => a.category === 'avatars').length },
    { key: 'skins' as const, label: t('avatarCollection.filters.skins'), count: avatars.filter(a => a.category === 'skins').length },
    { key: 'boosts' as const, label: t('avatarCollection.filters.boosts'), count: avatars.filter(a => a.category === 'boosts').length }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('avatarCollection.title')}</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('avatarCollection.title')}</h1>
          <p className="text-muted-foreground">{t('avatarCollection.subtitle')}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('avatarCollection.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className="flex items-center gap-2"
            >
              <Filter className="w-3 h-3" />
              {filter.label}
              <Badge variant="secondary" className="ml-1">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredAvatars.map((avatar) => (
          <Card 
            key={avatar.id} 
            className={`cursor-pointer transition-all hover:scale-105 ${
              avatar.is_active ? 'border-primary bg-primary/5 ring-2 ring-primary' : 
              avatar.is_owned ? 'border-green-500/50 bg-green-500/5' : 
              'opacity-60'
            }`}
          >
            <CardContent className="p-3">
              <div className="space-y-3">
                {/* Avatar Image */}
                <div className="relative aspect-square">
                  <AvatarDisplayUniversal
                    avatarName={avatar.name}
                    avatarUrl={avatar.image_url}
                    nickname={avatar.name}
                    size="lg"
                  />
                  
                  {/* Status Icons */}
                  {avatar.is_active && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  
                  {!avatar.is_owned && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Avatar Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm truncate">{avatar.name}</h3>
                  
                  <Badge 
                    variant="secondary" 
                    className={`text-xs text-white ${getRarityColor(avatar.rarity)}`}
                  >
                    {t(`common.rarity.${avatar.rarity}`)}
                  </Badge>

                  {/* Action Button */}
                  {avatar.is_owned && !avatar.is_active && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => selectAvatar(avatar.id)}
                      className="w-full text-xs"
                    >
                      {t('avatarCollection.use')}
                    </Button>
                  )}

                  {avatar.is_active && (
                    <div className="text-xs text-center text-primary font-medium">
                      {t('avatarCollection.active')}
                    </div>
                  )}

                  {!avatar.is_owned && (
                    <div className="text-xs text-center text-muted-foreground">
                      {avatar.price > 0 ? `${avatar.price} BTZ` : t('avatarCollection.locked')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('avatarCollection.noResults')}</p>
        </div>
      )}
    </div>
  );
}