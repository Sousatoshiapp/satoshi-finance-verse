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
  const { toast } = useToast();
  
  // Loot boxes temporariamente desabilitadas
  console.log('[MAINTENANCE] useLootBoxes called - all operations disabled');
  
  const [userLootBoxes] = useState<UserLootBox[]>([]);
  const [availableLootBoxes] = useState<LootBox[]>([]);
  const [loading] = useState(false);
  const [opening] = useState<string | null>(null);

  // Todas as operações de carregamento desabilitadas durante manutenção
  const loadUserLootBoxes = async () => {
    console.log('[MAINTENANCE] loadUserLootBoxes blocked');
  };

  const loadAvailableLootBoxes = async () => {
    console.log('[MAINTENANCE] loadAvailableLootBoxes blocked');
  };

  const openLootBox = async (userLootBoxId: string) => {
    console.log('[MAINTENANCE] openLootBox blocked for ID:', userLootBoxId);
    
    toast({
      title: "Sistema em Manutenção",
      description: "Loot boxes estão temporariamente desabilitadas",
      variant: "destructive"
    });
  };

  const claimDailyLootBox = async () => {
    console.log('[MAINTENANCE] claimDailyLootBox blocked');
    
    toast({
      title: "Sistema em Manutenção", 
      description: "Loot boxes estão temporariamente desabilitadas",
      variant: "destructive"
    });
  };

  const showCelebrationForRarity = (rarity: string) => {
    console.log('[MAINTENANCE] showCelebrationForRarity blocked for rarity:', rarity);
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

  const getUnopened = () => [];
  const getOpened = () => [];
  const canClaimDaily = () => false;

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