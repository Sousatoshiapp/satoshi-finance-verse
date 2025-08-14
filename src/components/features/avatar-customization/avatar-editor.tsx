import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { ArrowLeft, Save, Palette, Shirt, Glasses, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { toast } from '@/hooks/use-toast';

interface AvatarItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image_url: string;
  rarity: string;
  is_owned: boolean;
  price_beetz?: number;
}

interface AvatarCustomization {
  hair: string | null;
  clothing: string | null;
  accessories: string | null;
  skin: string | null;
  eyes: string | null;
}

export function AvatarEditor() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarItems, setAvatarItems] = useState<AvatarItem[]>([]);
  const [currentCustomization, setCurrentCustomization] = useState<AvatarCustomization>({
    hair: null,
    clothing: null,
    accessories: null,
    skin: null,
    eyes: null
  });

  useEffect(() => {
    loadAvatarItems();
    loadCurrentCustomization();
  }, [profile]);

  const loadAvatarItems = async () => {
    try {
      if (!profile) return;

      // Buscar todos os itens de avatar
      const { data: items } = await supabase
        .from('avatar_items')
        .select('*')
        .eq('is_active', true);

      // Buscar itens que o usuário possui
      const { data: userItems } = await supabase
        .from('user_avatar_items')
        .select('item_id')
        .eq('user_id', profile.id);

      const ownedItemIds = userItems?.map(ui => ui.item_id) || [];

      const itemsWithOwnership = items?.map(item => ({
        ...item,
        is_owned: ownedItemIds.includes(item.id) || item.unlock_requirement?.type === 'default'
      })) || [];

      setAvatarItems(itemsWithOwnership);
    } catch (error) {
      console.error('Error loading avatar items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentCustomization = async () => {
    try {
      if (!profile) return;

      const { data: customization } = await supabase
        .from('avatar_customizations')
        .select('avatar_data')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .single();

      if (customization?.avatar_data) {
        setCurrentCustomization(customization.avatar_data as AvatarCustomization);
      }
    } catch (error) {
      console.error('Error loading customization:', error);
    }
  };

  const handleItemSelect = (item: AvatarItem) => {
    if (!item.is_owned) {
      if (item.price_beetz && item.price_beetz > 0) {
        purchaseItem(item);
      } else {
        toast({
          title: "Item bloqueado",
          description: "Você precisa desbloquear este item primeiro!",
          variant: "destructive"
        });
      }
      return;
    }

    setCurrentCustomization(prev => ({
      ...prev,
      [item.category]: item.id
    }));
  };

  const purchaseItem = async (item: AvatarItem) => {
    if (!profile || !item.price_beetz) return;

    if (profile.points < item.price_beetz) {
      toast({
        title: "BTZ insuficientes",
        description: `Você precisa de ${item.price_beetz} BTZ para comprar este item!`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduzir pontos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: profile.points - item.price_beetz })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Adicionar item ao usuário
      const { error: insertError } = await supabase
        .from('user_avatar_items')
        .insert({
          user_id: profile.id,
          item_id: item.id,
          unlock_method: 'purchase'
        });

      if (insertError) throw insertError;

      toast({
        title: "Item comprado!",
        description: `${item.name} foi adicionado ao seu inventário!`
      });

      loadAvatarItems();
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Erro ao comprar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const saveCustomization = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Desativar customização anterior
      await supabase
        .from('avatar_customizations')
        .update({ is_active: false })
        .eq('user_id', profile.id);

      // Salvar nova customização
      const { error } = await supabase
        .from('avatar_customizations')
        .insert({
          user_id: profile.id,
          avatar_data: currentCustomization,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Avatar salvo!",
        description: "Suas personalizações foram aplicadas com sucesso!"
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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

  const getItemsByCategory = (category: string) => {
    return avatarItems.filter(item => item.category === category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando editor de avatar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Editor de Avatar</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              BTZ: <span className="font-bold text-primary">{profile?.points || 0}</span>
            </div>
            <Button
              onClick={saveCustomization}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Avatar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Preview do Avatar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🧑‍💻</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Cabelo:</strong> {currentCustomization.hair ? 'Selecionado' : 'Padrão'}</p>
                <p><strong>Roupa:</strong> {currentCustomization.clothing ? 'Selecionado' : 'Padrão'}</p>
                <p><strong>Acessórios:</strong> {currentCustomization.accessories ? 'Selecionado' : 'Nenhum'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customization Tabs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personalize seu Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="clothing" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="clothing" className="gap-2">
                    <Shirt className="h-4 w-4" />
                    Roupas
                  </TabsTrigger>
                  <TabsTrigger value="accessories" className="gap-2">
                    <Glasses className="h-4 w-4" />
                    Acessórios
                  </TabsTrigger>
                  <TabsTrigger value="hair" className="gap-2">
                    <Palette className="h-4 w-4" />
                    Cabelo
                  </TabsTrigger>
                  <TabsTrigger value="skin" className="gap-2">
                    <Palette className="h-4 w-4" />
                    Pele
                  </TabsTrigger>
                </TabsList>

                {['clothing', 'accessories', 'hair', 'skin'].map(category => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {getItemsByCategory(category).map(item => (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            currentCustomization[category as keyof AvatarCustomization] === item.id
                              ? 'ring-2 ring-primary'
                              : ''
                          }`}
                          onClick={() => handleItemSelect(item)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                              <span className="text-2xl">🎨</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getRarityColor(item.rarity)} text-white`}
                              >
                                {item.rarity}
                              </Badge>
                              {!item.is_owned && (
                                <div className="text-xs text-muted-foreground">
                                  {item.price_beetz ? `${item.price_beetz} BTZ` : 'Bloqueado'}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}