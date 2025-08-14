// ============================================
// PERSONALIZAÇÃO EXTREMA - TEMPORARIAMENTE DESABILITADA  
// ============================================
// Esta funcionalidade foi temporariamente removida para 
// revisão e melhorias futuras. Será reativada em breve.
// ============================================

/*
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Input } from '@/components/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAvatarContext } from '@/contexts/AvatarContext';
import { Loader2, Search } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  price_beetz: number;
  is_owned: boolean;
}

export default function AvatarCollection() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invalidateAvatarCaches } = useAvatarContext();

  useEffect(() => {
    loadAvatars();
  }, []);

  useEffect(() => {
    filterAvatars();
  }, [avatars, searchTerm, rarityFilter]);

  const loadAvatars = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Get user's owned avatars
      const { data: userAvatars, error: userAvatarsError } = await supabase
        .from('user_avatars')
        .select('avatar_id')
        .eq('user_id', user.id);

      if (userAvatarsError) throw userAvatarsError;

      // Get all avatars
      const { data: allAvatars, error: avatarsError } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_active', true);

      if (avatarsError) throw avatarsError;

      // Combine data
      const ownedAvatarIds = new Set(userAvatars?.map(ua => ua.avatar_id) || []);
      
      const avatarsWithOwnership = allAvatars?.map(avatar => ({
        ...avatar,
        is_owned: ownedAvatarIds.has(avatar.id)
      })).filter(avatar => avatar.is_owned) || [];

      setAvatars(avatarsWithOwnership);

    } catch (error: any) {
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

    if (searchTerm) {
      filtered = filtered.filter(avatar =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (rarityFilter !== 'all') {
      filtered = filtered.filter(avatar => avatar.rarity === rarityFilter);
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

      invalidateAvatarCaches();
      
      toast({
        title: "Avatar selecionado!",
        description: "Seu avatar foi alterado com sucesso.",
      });

    } catch (error: any) {
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
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-blue-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'uncommon': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sua coleção...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            ← Voltar ao Perfil
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Minha Coleção de Avatares
          </h1>
          <p className="text-muted-foreground">
            {avatars.length} avatares desbloqueados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar avatares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={rarityFilter} onValueChange={setRarityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por raridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as raridades</SelectItem>
                  <SelectItem value="common">Comum</SelectItem>
                  <SelectItem value="uncommon">Incomum</SelectItem>
                  <SelectItem value="rare">Raro</SelectItem>
                  <SelectItem value="epic">Épico</SelectItem>
                  <SelectItem value="legendary">Lendário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredAvatars.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum avatar encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredAvatars.map((avatar) => (
              <Card key={avatar.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 right-2 text-xs ${getRarityColor(avatar.rarity)}`}
                  >
                    {avatar.rarity}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm mb-2 truncate">
                    {avatar.name}
                  </h3>
                  <Button
                    onClick={() => selectAvatar(avatar.id)}
                    size="sm"
                    className="w-full"
                    variant="outline"
                  >
                    Usar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
*/

// Placeholder component to prevent build errors
export default function AvatarCollection() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-muted-foreground mb-2">
          Coleção de Avatares
        </h1>
        <p className="text-muted-foreground">
          Esta funcionalidade está sendo desenvolvida...
        </p>
      </div>
    </div>
  );
}