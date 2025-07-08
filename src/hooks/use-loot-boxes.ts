import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface LootBox {
  id: string;
  name: string;
  description?: string;
  rarity: string;
  image_url?: string;
  animation_url?: string;
}

interface UserLootBox {
  id: string;
  loot_box_id: string;
  opened: boolean;
  opened_at?: string;
  items_received?: any;
  source: string;
  created_at: string;
  loot_boxes: LootBox;
}

interface LootItem {
  type: string;
  amount?: number;
  value?: number;
  duration?: number;
  rarity?: string;
}

export function useLootBoxes() {
  const [userLootBoxes, setUserLootBoxes] = useState<UserLootBox[]>([]);
  const [availableLootBoxes, setAvailableLootBoxes] = useState<LootBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserLootBoxes();
    loadAvailableLootBoxes();
  }, []);

  const loadUserLootBoxes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_loot_boxes')
        .select(`
          *,
          loot_boxes (*)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserLootBoxes(data || []);
    } catch (error) {
      console.error('Error loading user loot boxes:', error);
    }
  };

  const loadAvailableLootBoxes = async () => {
    try {
      const { data, error } = await supabase
        .from('loot_boxes')
        .select('*')
        .order('rarity');

      if (error) throw error;
      setAvailableLootBoxes(data || []);
    } catch (error) {
      console.error('Error loading available loot boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLootBox = async (userLootBoxId: string) => {
    if (opening) return;

    try {
      setOpening(userLootBoxId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Call the open loot box function
      const { data, error } = await supabase.rpc('open_loot_box', {
        profile_id: profile.id,
        user_loot_box_id: userLootBoxId
      });

      if (error) throw error;

      const items = data?.[0]?.items || [];
      
      // Show celebration animation based on rarity
      const lootBox = userLootBoxes.find(ulb => ulb.id === userLootBoxId);
      const rarity = lootBox?.loot_boxes.rarity || 'common';
      
      showCelebrationForRarity(rarity);

      // Show items received
      if (Array.isArray(items) && items.length > 0) {
        const itemsText = items.map((item: any) => {
          if (item.type === 'beetz') return `${item.amount} Beetz`;
          if (item.type === 'xp') return `${item.amount} XP`;
          if (item.type === 'xp_multiplier') return `${item.value}x XP (${item.duration}h)`;
          return item.type;
        }).join(', ');

        toast({
          title: "🎁 Loot Box Aberta!",
          description: `Você recebeu: ${itemsText}`,
          duration: 5000,
        });
      }

      // Reload loot boxes
      await loadUserLootBoxes();
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir a loot box",
        variant: "destructive"
      });
    } finally {
      setOpening(null);
    }
  };

  const claimDailyLootBox = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('award_daily_loot_box', {
        profile_id: profile.id
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "🎁 Loot Box Diária!",
          description: "Você recebeu uma loot box por fazer login hoje!",
          duration: 3000,
        });

        await loadUserLootBoxes();
        return true;
      }
      
      return false; // Already claimed today
    } catch (error) {
      console.error('Error claiming daily loot box:', error);
      return false;
    }
  };

  const showCelebrationForRarity = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B', '#9B59B6']
        });
        break;
      case 'epic':
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#9B59B6', '#8E44AD', '#FFD700']
        });
        break;
      case 'rare':
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#3498DB', '#2980B9', '#1ABC9C']
        });
        break;
      default:
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#95A5A6', '#BDC3C7']
        });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'epic': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'rare': return 'text-blue-400 border-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-br from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-br from-blue-400 to-cyan-500';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-500';
    }
  };

  const getUnopened = () => userLootBoxes.filter(ulb => !ulb.opened);
  const getOpened = () => userLootBoxes.filter(ulb => ulb.opened);

  const canClaimDaily = () => {
    const today = new Date().toDateString();
    return !userLootBoxes.some(ulb => 
      ulb.source === 'daily_reward' && 
      new Date(ulb.created_at).toDateString() === today
    );
  };

  return {
    userLootBoxes,
    availableLootBoxes,
    unopenedBoxes: getUnopened(),
    openedBoxes: getOpened(),
    loading,
    opening,
    openLootBox,
    claimDailyLootBox,
    canClaimDaily: canClaimDaily(),
    getRarityColor,
    getRarityGradient,
    refreshLootBoxes: loadUserLootBoxes
  };
}