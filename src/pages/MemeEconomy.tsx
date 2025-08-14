import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Input } from "@/components/shared/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Smile, 
  ShoppingBag, 
  Star, 
  Heart,
  TrendingUp,
  Gift,
  Zap,
  Crown,
  Trophy,
  Sparkles,
  Search,
  Filter
} from "lucide-react";

interface MemeItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price_beetz: number;
  is_animated: boolean;
  is_exclusive: boolean;
  unlock_requirements: any;
  usage_count: number;
  created_by?: string;
  is_active: boolean;
}

interface UserMemeCollection {
  id: string;
  meme_id: string;
  unlocked_at: string;
  usage_count: number;
  is_favorite: boolean;
  meme?: MemeItem;
}

export default function MemeEconomy() {
  const { toast } = useToast();
  const [memeItems, setMemeItems] = useState<MemeItem[]>([]);
  const [userCollection, setUserCollection] = useState<UserMemeCollection[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      // Load meme items
      const { data: memes } = await supabase
        .from('meme_economy_items')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: false });

      setMemeItems(memes || []);

      // Load user collection
      if (profile) {
        const { data: collection } = await supabase
          .from('user_meme_collection')
          .select(`
            *,
            meme_economy_items(*)
          `)
          .eq('user_id', profile.id);

        setUserCollection(collection || []);
      }

    } catch (error) {
      console.error('Error loading meme economy data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da economia de memes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseMeme = async (meme: MemeItem) => {
    if (!userProfile) return;

    if (userProfile.points < meme.price_beetz) {
      toast({
        title: "BTZ insuficiente",
        description: `Você precisa de ${meme.price_beetz} BTZ para comprar este meme`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct BTZ from user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: userProfile.points - meme.price_beetz })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      // Add to user collection
      const { error: collectionError } = await supabase
        .from('user_meme_collection')
        .insert({
          user_id: userProfile.id,
          meme_id: meme.id
        });

      if (collectionError) throw collectionError;

      toast({
        title: "Meme adquirido!",
        description: `${meme.name} foi adicionado à sua coleção`,
      });

      // Reload data
      await loadData();

    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Já possui",
          description: "Você já possui este meme na sua coleção",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao comprar meme",
          variant: "destructive"
        });
      }
    }
  };

  const toggleFavorite = async (collectionId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('user_meme_collection')
        .update({ is_favorite: !isFavorite })
        .eq('id', collectionId);

      if (error) throw error;

      await loadData();

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar favorito",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪';
      case 'rare': return '🔵';
      case 'epic': return '🟣';
      case 'legendary': return '🟡';
      default: return '⚪';
    }
  };

  const isOwned = (memeId: string) => {
    return userCollection.some(c => c.meme_id === memeId);
  };

  const filteredMemes = memeItems.filter(meme => {
    const matchesSearch = meme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || meme.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Smile className="mr-4" />
                Economia de Memes
              </h1>
              <p className="text-xl opacity-90">
                Colecione, troque e use memes exclusivos crypto-themed
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Sua Coleção</p>
                <p className="font-bold text-2xl">{userCollection.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* User BTZ Balance */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Seu Saldo BTZ</p>
                  <p className="text-3xl font-bold">{userProfile?.points || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Memes Favoritos</p>
                <p className="text-2xl font-bold text-red-500">
                  {userCollection.filter(c => c.is_favorite).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="shop" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shop">Loja</TabsTrigger>
            <TabsTrigger value="collection">Minha Coleção</TabsTrigger>
            <TabsTrigger value="contest">Concurso</TabsTrigger>
            <TabsTrigger value="nft">NFT Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar memes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedRarity === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRarity('all')}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={selectedRarity === 'common' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRarity('common')}
                    >
                      ⚪ Comum
                    </Button>
                    <Button
                      variant={selectedRarity === 'rare' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRarity('rare')}
                    >
                      🔵 Raro
                    </Button>
                    <Button
                      variant={selectedRarity === 'epic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRarity('epic')}
                    >
                      🟣 Épico
                    </Button>
                    <Button
                      variant={selectedRarity === 'legendary' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRarity('legendary')}
                    >
                      🟡 Lendário
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meme Shop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemes.map((meme) => {
                const owned = isOwned(meme.id);
                
                return (
                  <Card key={meme.id} className={`relative ${owned ? 'border-green-200 bg-green-50' : ''}`}>
                    {owned && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-green-500 text-white">Possui</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <span className="mr-2">{getRarityIcon(meme.rarity)}</span>
                          {meme.name}
                        </CardTitle>
                        {meme.is_animated && (
                          <Badge variant="outline" className="text-purple-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Animado
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{meme.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Meme Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-6xl">{getRarityIcon(meme.rarity)}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className={`${getRarityColor(meme.rarity)} text-white mr-2`}>
                            {meme.rarity.toUpperCase()}
                          </Badge>
                          {meme.is_exclusive && (
                            <Badge variant="outline" className="text-yellow-600">
                              <Crown className="h-3 w-3 mr-1" />
                              Exclusivo
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Preço</p>
                          <p className="font-bold text-lg">{meme.price_beetz} BTZ</p>
                        </div>
                      </div>

                      <div className="text-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        Usado {meme.usage_count} vezes
                      </div>

                      {!owned ? (
                        <Button 
                          onClick={() => purchaseMeme(meme)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={userProfile?.points < meme.price_beetz}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Comprar por {meme.price_beetz} BTZ
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Badge className="bg-green-500 text-white">
                            ✓ Já possui este meme
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            {userCollection.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Smile className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Coleção vazia</h3>
                  <p className="text-muted-foreground">
                    Compre alguns memes na loja para começar sua coleção!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCollection.map((collection) => {
                  const meme = memeItems.find(m => m.id === collection.meme_id);
                  if (!meme) return null;

                  return (
                    <Card key={collection.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center">
                            <span className="mr-2">{getRarityIcon(meme.rarity)}</span>
                            {meme.name}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(collection.id, collection.is_favorite)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${collection.is_favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-5xl">{getRarityIcon(meme.rarity)}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Adquirido em:</span>
                            <span>{new Date(collection.unlocked_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Vezes usado:</span>
                            <span>{collection.usage_count}</span>
                          </div>
                        </div>

                        <Badge className={`${getRarityColor(meme.rarity)} text-white`}>
                          {meme.rarity.toUpperCase()}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 text-yellow-500" />
                  Meme da Semana
                </CardTitle>
                <CardDescription>
                  Vote no melhor meme crypto da semana e ganhe recompensas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-semibold mb-2">Concurso em breve!</h3>
                  <p className="text-muted-foreground">
                    O primeiro concurso "Meme da Semana" será lançado em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nft" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 text-purple-500" />
                  NFT Marketplace
                </CardTitle>
                <CardDescription>
                  Marketplace para memes vencedores como NFTs exclusivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-lg font-semibold mb-2">Marketplace em desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Em breve você poderá comprar e vender memes NFTs exclusivos!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}