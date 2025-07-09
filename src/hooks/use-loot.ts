import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThemedLootBox {
  id: string;
  name: string;
  theme: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  contents: any;
  preview_items: any[];
  min_items: number;
  max_items: number;
  pity_timer: number;
  seasonal: boolean;
  available_until?: string;
  image_url?: string;
  animation_url?: string;
}

export interface UserLootHistory {
  id: string;
  user_id: string;
  loot_box_id: string;
  items_received: any;
  pity_count: number;
  was_guaranteed_rare: boolean;
  opened_at: string;
  themed_loot_boxes: ThemedLootBox;
}

export interface LootItem {
  type: 'beetz' | 'xp' | 'powerup' | 'avatar' | 'title' | 'badge';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  amount?: number;
  icon?: string;
  description?: string;
}

export function useLoot() {
  const [availableLootBoxes, setAvailableLootBoxes] = useState<ThemedLootBox[]>([]);
  const [userLootHistory, setUserLootHistory] = useState<UserLootHistory[]>([]);
  const [userLootBoxes, setUserLootBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLootData();
  }, []);

  const loadLootData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Carregar caixas de loot disponíveis
      const { data: lootBoxes } = await supabase
        .from('themed_loot_boxes')
        .select('*')
        .or('available_until.is.null,available_until.gt.now()')
        .order('rarity', { ascending: true });

      // Carregar histórico de loot do usuário
      const { data: history } = await supabase
        .from('user_loot_history')
        .select(`
          *,
          themed_loot_boxes (*)
        `)
        .eq('user_id', profile.id)
        .order('opened_at', { ascending: false });

      // Carregar caixas de loot não abertas do usuário
      const { data: userBoxes } = await supabase
        .from('user_loot_boxes')
        .select(`
          *,
          loot_boxes (*)
        `)
        .eq('user_id', profile.id)
        .eq('opened', false)
        .order('created_at', { ascending: false });

      setAvailableLootBoxes(lootBoxes || []);
      setUserLootHistory(history || []);
      setUserLootBoxes(userBoxes || []);
    } catch (error) {
      console.error('Error loading loot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLootBox = async (lootBoxId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      const lootBox = availableLootBoxes.find(box => box.id === lootBoxId);
      if (!lootBox) return null;

      // Verificar pity timer
      const recentHistory = userLootHistory.filter(h => h.loot_box_id === lootBoxId);
      const pityCount = recentHistory.length > 0 ? recentHistory[0].pity_count + 1 : 1;
      const guaranteedRare = pityCount >= lootBox.pity_timer;

      // Gerar itens
      const itemCount = Math.floor(Math.random() * (lootBox.max_items - lootBox.min_items + 1)) + lootBox.min_items;
      const items = generateLootItems(lootBox, itemCount, guaranteedRare);

      // Salvar no histórico
      const { data: historyEntry } = await supabase
        .from('user_loot_history')
        .insert({
          user_id: profile.id,
          loot_box_id: lootBoxId,
          items_received: items,
          pity_count: guaranteedRare ? 0 : pityCount,
          was_guaranteed_rare: guaranteedRare
        })
        .select()
        .single();

      // Aplicar itens ao usuário
      await applyLootItems(profile.id, items);

      // Remover caixa do inventário se necessário
      const userBox = userLootBoxes.find(box => box.loot_box_id === lootBoxId);
      if (userBox) {
        await supabase
          .from('user_loot_boxes')
          .update({ opened: true, opened_at: new Date().toISOString(), items_received: items })
          .eq('id', userBox.id);
      }

      toast({
        title: "Caixa aberta!",
        description: `Você obteve ${items.length} itens da ${lootBox.name}!`,
      });

      await loadLootData();
      return { items, historyEntry };
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir a caixa de loot.",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateLootItems = (lootBox: ThemedLootBox, itemCount: number, guaranteedRare: boolean): LootItem[] => {
    const items: LootItem[] = [];
    const contents = lootBox.contents;

    for (let i = 0; i < itemCount; i++) {
      const isLastItem = i === itemCount - 1;
      const forceRare = guaranteedRare && isLastItem;

      let selectedItem: LootItem | null = null;
      
      // Selecionar item baseado na chance
      for (const contentItem of contents) {
        const chance = forceRare && contentItem.rarity !== 'common' ? 1.0 : contentItem.chance;
        
        if (Math.random() <= chance) {
          selectedItem = {
            type: contentItem.type,
            name: contentItem.name,
            rarity: contentItem.rarity,
            amount: contentItem.amount,
            icon: contentItem.icon,
            description: contentItem.description
          };
          break;
        }
      }

      // Fallback para item comum se nenhum foi selecionado
      if (!selectedItem) {
        const commonItems = contents.filter((item: any) => item.rarity === 'common');
        const fallbackItem = commonItems[Math.floor(Math.random() * commonItems.length)];
        selectedItem = {
          type: fallbackItem.type,
          name: fallbackItem.name,
          rarity: fallbackItem.rarity,
          amount: fallbackItem.amount,
          icon: fallbackItem.icon,
          description: fallbackItem.description
        };
      }

      items.push(selectedItem);
    }

    return items;
  };

  const applyLootItems = async (userId: string, items: LootItem[]) => {
    for (const item of items) {
      switch (item.type) {
        case 'beetz':
          await supabase
            .from('profiles')
            .update({ points: supabase.raw(`points + ${item.amount || 0}`) })
            .eq('id', userId);
          break;

        case 'xp':
          await supabase.rpc('award_xp', {
            profile_id: userId,
            xp_amount: item.amount || 0,
            activity_type: 'loot_box'
          });
          break;

        case 'powerup':
          // Verificar se o power-up existe
          const { data: powerup } = await supabase
            .from('advanced_powerups')
            .select('id')
            .eq('name', item.name)
            .single();

          if (powerup) {
            await supabase
              .from('user_advanced_powerups')
              .upsert({
                user_id: userId,
                powerup_id: powerup.id,
                quantity: (item.amount || 1)
              }, {
                onConflict: 'user_id,powerup_id'
              });
          }
          break;

        case 'title':
          await supabase
            .from('user_titles')
            .insert({
              user_id: userId,
              title: item.name,
              description: item.description,
              earned_for: 'loot_box',
              rarity: item.rarity
            });
          break;

        case 'badge':
          await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_name: item.name,
              badge_type: 'loot',
              badge_description: item.description,
              badge_data: { rarity: item.rarity }
            });
          break;
      }
    }
  };

  const purchaseLootBox = async (lootBoxId: string, cost: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.points < cost) {
        toast({
          title: "Beetz insuficientes",
          description: "Você não tem Beetz suficientes para comprar esta caixa.",
          variant: "destructive",
        });
        return false;
      }

      // Deduzir Beetz
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ points: profile.points - cost })
        .eq('id', profile.id);

      if (deductError) throw deductError;

      // Adicionar caixa ao inventário
      const { error: addError } = await supabase
        .from('user_loot_boxes')
        .insert({
          user_id: profile.id,
          loot_box_id: lootBoxId,
          source: 'purchase'
        });

      if (addError) throw addError;

      toast({
        title: "Caixa comprada!",
        description: "A caixa foi adicionada ao seu inventário.",
      });

      await loadLootData();
      return true;
    } catch (error) {
      console.error('Error purchasing loot box:', error);
      toast({
        title: "Erro",
        description: "Não foi possível comprar a caixa de loot.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'rare': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'epic': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'legendary': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'crypto': return '₿';
      case 'stocks': return '📈';
      case 'economics': return '💰';
      case 'business': return '💼';
      case 'general': return '📦';
      default: return '🎁';
    }
  };

  return {
    availableLootBoxes,
    userLootHistory,
    userLootBoxes,
    loading,
    openLootBox,
    purchaseLootBox,
    getRarityColor,
    getThemeIcon,
    loadLootData
  };
}