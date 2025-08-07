import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Input } from "@/components/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { useAvatarContext } from "@/contexts/AvatarContext";
import { getAvatarImage } from "@/utils/avatar-images";
import { Search, Crown, Lock } from "lucide-react";

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  price: number;
  owned: boolean;
  is_active?: boolean;
}

export default function AvatarCollection() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { invalidateAvatarCaches } = useAvatarContext();

  useEffect(() => {
    loadAvatars();
  }, []);

  useEffect(() => {
    filterAvatars();
  }, [avatars, searchTerm, rarityFilter, ownershipFilter]);

  const loadAvatars = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile with avatar info
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, current_avatar_id')
        .eq('user_id', user.id)
        .single();

      // Get all avatars
      const { data: allAvatars } = await supabase
        .from('avatars')
        .select('*')
        .order('rarity', { ascending: false });

      // Get user's owned avatars
      const { data: ownedAvatars } = await supabase
        .from('user_avatars')
        .select('avatar_id')
        .eq('user_id', profile?.id);

      const ownedIds = ownedAvatars?.map(ua => ua.avatar_id) || [];
      const currentAvatarId = profile?.current_avatar_id;

      const avatarsWithOwnership = allAvatars?.map(avatar => ({
        ...avatar,
        owned: ownedIds.includes(avatar.id),
        is_active: avatar.id === currentAvatarId
      })) || [];

      setAvatars(avatarsWithOwnership);
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avatares",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAvatars = () => {
    let filtered = avatars;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(avatar =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by rarity
    if (rarityFilter !== "all") {
      filtered = filtered.filter(avatar => avatar.rarity === rarityFilter);
    }

    // Filter by ownership
    if (ownershipFilter === "owned") {
      filtered = filtered.filter(avatar => avatar.owned);
    } else if (ownershipFilter === "not-owned") {
      filtered = filtered.filter(avatar => !avatar.owned);
    }

    setFilteredAvatars(filtered);
  };

  const selectAvatar = async (avatarId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ current_avatar_id: avatarId })
        .eq('user_id', user.id);

      if (error) throw error;

      setAvatars(prev => prev.map(avatar => ({
        ...avatar,
        is_active: avatar.id === avatarId
      })));

      invalidateAvatarCaches();

      toast({
        title: "✅ Avatar selecionado!",
        description: "Seu avatar foi atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error selecting avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível selecionar o avatar",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-300';
      case 'rare': return 'text-blue-500 border-blue-300';
      case 'epic': return 'text-purple-500 border-purple-300';
      case 'legendary': return 'text-yellow-500 border-yellow-300';
      default: return 'text-gray-500 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                ← Voltar ao Perfil
              </Button>
              <h1 className="text-xl font-bold">Coleção de Avatares</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar avatares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as raridades</SelectItem>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="epic">Épico</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por posse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="owned">Possuo</SelectItem>
                <SelectItem value="not-owned">Não possuo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredAvatars.map((avatar) => (
            <Card key={avatar.id} className={`group hover:shadow-lg transition-all duration-200 ${avatar.is_active ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-3">
                <div className="relative aspect-square mb-3">
                  <img
                    src={getAvatarImage(avatar.image_url)}
                    alt={avatar.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = getAvatarImage('/avatars/the-satoshi.jpg');
                    }}
                  />
                  
                  {avatar.is_active && (
                    <div className="absolute -top-2 -right-2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                  )}
                  
                  {!avatar.owned && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-center truncate">{avatar.name}</h3>
                  
                  <Badge variant="outline" className={`w-full justify-center text-xs ${getRarityColor(avatar.rarity)}`}>
                    {avatar.rarity}
                  </Badge>
                  
                  {avatar.owned ? (
                    <Button
                      size="sm"
                      variant={avatar.is_active ? "default" : "outline"}
                      className="w-full text-xs h-8"
                      onClick={() => selectAvatar(avatar.id)}
                      disabled={avatar.is_active}
                    >
                      {avatar.is_active ? "Ativo" : "Usar"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8"
                      disabled
                    >
                      {avatar.price} BTZ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAvatars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum avatar encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}