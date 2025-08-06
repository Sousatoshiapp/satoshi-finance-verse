import { useState, useEffect } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Card, CardContent } from '@/components/shared/ui/card';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/use-profile';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  price: number;
  owned: boolean;
  active?: boolean;
}

type FilterType = 'all' | 'avatars' | 'skins' | 'boosts';

export function AvatarCollection() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { profile } = useProfile();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadAvatars();
  }, [profile]);

  const loadAvatars = async () => {
    try {
      setLoading(true);
      
      // Load available avatars
      const { data: avatarData, error: avatarError } = await supabase
        .from('avatars')
        .select('id, name, image_url, rarity, price')
        .eq('is_available', true);

      if (avatarError) {
        console.error('Error loading avatars:', avatarError);
        return;
      }

      // Load user owned avatars
      let userAvatars: any[] = [];
      if (profile?.id) {
        const { data: userAvatarData, error: userAvatarError } = await supabase
          .from('user_avatars')
          .select('avatar_id')
          .eq('user_id', profile.id);

        if (!userAvatarError) {
          userAvatars = userAvatarData || [];
        }
      }

      // Combine data
      const combinedData: Avatar[] = (avatarData || []).map(avatar => ({
        ...avatar,
        owned: userAvatars.some(ua => ua.avatar_id === avatar.id),
        active: (profile as any)?.current_avatar_id === avatar.id
      }));

      setAvatars(combinedData);
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = async (avatarId: string) => {
    if (!profile?.user_id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_avatar_id: avatarId })
        .eq('user_id', profile.user_id);

      if (error) {
        console.error('Error updating avatar:', error);
        toast.error(t('common.error'));
        return;
      }

      setAvatars(prev => prev.map(avatar => ({
        ...avatar,
        active: avatar.id === avatarId
      })));

      toast.success(t('common.success'));
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error(t('common.error'));
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'epic':
        return 'border-purple-500 bg-purple-500/10';
      case 'rare':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-muted bg-muted/10';
    }
  };

  const filteredAvatars = avatars.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'avatars' && avatar.rarity) ||
      (activeFilter === 'skins' && false) || // Placeholder logic
      (activeFilter === 'boosts' && false); // Placeholder logic
    
    return matchesSearch && matchesFilter;
  });

  const filterButtons = [
    { key: 'all' as const, label: t('avatarCollection.filters.all') },
    { key: 'avatars' as const, label: t('avatarCollection.filters.avatars') },
    { key: 'skins' as const, label: t('avatarCollection.filters.skins') },
    { key: 'boosts' as const, label: t('avatarCollection.filters.boosts') }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
            
            <h1 className="text-xl font-bold text-primary">
              {t('avatarCollection.title')}
            </h1>
            
            <div></div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="aspect-square">
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-xl font-bold text-primary">
            {t('avatarCollection.title')}
          </h1>
          
          <div></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Subtitle */}
        <p className="text-sm text-muted-foreground text-center">
          {t('avatarCollection.subtitle')}
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('avatarCollection.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((button) => (
            <Button
              key={button.key}
              variant={activeFilter === button.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(button.key)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              {button.label}
            </Button>
          ))}
        </div>

        {/* Avatar Grid */}
        {filteredAvatars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('avatarCollection.noResults')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAvatars.map((avatar) => (
              <Card 
                key={avatar.id} 
                className={`relative overflow-hidden transition-all duration-200 hover:scale-105 ${
                  avatar.active ? 'ring-2 ring-primary' : ''
                } ${getRarityColor(avatar.rarity)}`}
              >
                <CardContent className="p-4 aspect-square">
                  <div className="h-full flex flex-col">
                    {/* Avatar Image */}
                    <div className="flex-1 flex items-center justify-center mb-3">
                      <AvatarDisplayUniversal
                        avatarData={{
                          profile_image_url: avatar.image_url,
                          current_avatar_id: avatar.id,
                          avatars: { name: avatar.name, image_url: avatar.image_url }
                        }}
                        nickname={avatar.name}
                        className="w-16 h-16"
                      />
                    </div>
                    
                    {/* Avatar Info */}
                    <div className="text-center space-y-2">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {avatar.name}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          avatar.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-700' :
                          avatar.rarity === 'epic' ? 'bg-purple-500/20 text-purple-700' :
                          avatar.rarity === 'rare' ? 'bg-blue-500/20 text-blue-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {t(`common.rarity.${avatar.rarity.toLowerCase()}`)}
                        </span>
                      </div>

                      {/* Action Button */}
                      {avatar.owned ? (
                        <Button
                          size="sm"
                          variant={avatar.active ? "default" : "outline"}
                          onClick={() => !avatar.active && selectAvatar(avatar.id)}
                          disabled={avatar.active}
                          className="w-full text-xs h-8"
                        >
                          {avatar.active ? t('avatarCollection.active') : t('avatarCollection.use')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled
                          className="w-full text-xs h-8"
                        >
                          {t('avatarCollection.locked')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}