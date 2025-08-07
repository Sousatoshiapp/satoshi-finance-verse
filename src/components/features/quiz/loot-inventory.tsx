import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Package, Star, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LootItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  lore_text?: string;
  image_url?: string;
}

interface UserLoot {
  id: string;
  acquired_at: string;
  source: string;
  loot_item: LootItem;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  earned_at: string;
}

const rarityColors = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-yellow-500 text-yellow-400'
};

const rarityGlow = {
  common: 'shadow-lg shadow-gray-500/20',
  rare: 'shadow-lg shadow-blue-500/30',
  epic: 'shadow-lg shadow-purple-500/40',
  legendary: 'shadow-lg shadow-yellow-500/50'
};

export function LootInventory() {
  const [userLoot, setUserLoot] = useState<UserLoot[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Load loot items
      const { data: lootData } = await supabase
        .from('user_loot')
        .select(`
          *,
          loot_item:loot_items(*)
        `)
        .eq('user_id', profile.id)
        .order('acquired_at', { ascending: false });

      // Load achievements
      const { data: achievementData } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false });

      setUserLoot(lootData || []);
      setAchievements(achievementData?.map(a => ({
        id: a.achievement.id,
        name: a.achievement.name,
        description: a.achievement.description,
        type: a.achievement.type,
        rarity: a.achievement.rarity,
        earned_at: a.earned_at
      })) || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedLoot = userLoot.reduce((acc, item) => {
    const type = item.loot_item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, UserLoot[]>);

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando inventário cyber...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package className="h-6 w-6 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              CYBER VAULT - INVENTÁRIO
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="loot" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="loot">📦 Data Artifacts ({userLoot.length})</TabsTrigger>
              <TabsTrigger value="achievements">🏆 Conquistas ({achievements.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="loot" className="mt-6">
              {userLoot.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Vault Vazio</h3>
                  <p className="text-muted-foreground">
                    Complete quizzes para encontrar Data Shards e Cyber Artifacts!
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedLoot).map(([type, items]) => (
                    <div key={type}>
                      <h3 className="text-lg font-bold mb-4 text-cyan-400 capitalize">
                        {type.replace('_', ' ')} ({items.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((userItem) => (
                          <Card
                            key={userItem.id}
                            className={cn(
                              "cursor-pointer transition-all duration-300 hover:scale-105",
                              rarityColors[userItem.loot_item.rarity as keyof typeof rarityColors],
                              rarityGlow[userItem.loot_item.rarity as keyof typeof rarityGlow]
                            )}
                            onClick={() => setSelectedItem(userItem.loot_item)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Badge variant="outline" className={rarityColors[userItem.loot_item.rarity as keyof typeof rarityColors]}>
                                  {userItem.loot_item.rarity}
                                </Badge>
                                <Star className="h-4 w-4 text-yellow-400" />
                              </div>
                              
                              <h4 className="font-bold text-sm mb-2">{userItem.loot_item.name}</h4>
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {userItem.loot_item.description}
                              </p>
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(userItem.acquired_at).toLocaleDateString('pt-BR')}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma Conquista</h3>
                  <p className="text-muted-foreground">
                    Continue jogando para desbloquear conquistas épicas!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={cn(
                        "transition-all duration-300",
                        rarityColors[achievement.rarity as keyof typeof rarityColors],
                        rarityGlow[achievement.rarity as keyof typeof rarityGlow]
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className={rarityColors[achievement.rarity as keyof typeof rarityColors]}>
                            {achievement.rarity}
                          </Badge>
                          <div className="text-lg">
                            {achievement.type === 'streak' && '🔥'}
                            {achievement.type === 'performance' && '⚡'}
                            {achievement.type === 'collection' && '📦'}
                            {achievement.type === 'social' && '👥'}
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-sm mb-2">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <Card 
            className={cn(
              "max-w-md w-full",
              rarityColors[selectedItem.rarity as keyof typeof rarityColors],
              rarityGlow[selectedItem.rarity as keyof typeof rarityGlow]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedItem.name}</CardTitle>
                  <Badge variant="outline" className={cn("mt-2", rarityColors[selectedItem.rarity as keyof typeof rarityColors])}>
                    {selectedItem.rarity}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedItem.description}
              </p>
              
              {selectedItem.lore_text && (
                <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-400">LORE DATA</span>
                  </div>
                  <p className="text-xs italic">{selectedItem.lore_text}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
