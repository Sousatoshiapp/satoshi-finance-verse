import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdvancedPowerup {
  id: string;
  name: string;
  description: string;
  category: 'offensive' | 'defensive' | 'utility' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect_data: any;
  crafting_recipe?: any;
  unlock_requirements: any;
  is_tradeable: boolean;
  icon_url?: string;
}

export interface UserPowerup {
  id: string;
  user_id: string;
  powerup_id: string;
  quantity: number;
  obtained_at: string;
  advanced_powerups: AdvancedPowerup;
}

export interface PowerupEffect {
  type: string;
  value: number;
  duration: number;
  trigger: string;
  active?: boolean;
  remaining?: number;
}

export function usePowerups() {
  const [availablePowerups, setAvailablePowerups] = useState<AdvancedPowerup[]>([]);
  const [userPowerups, setUserPowerups] = useState<UserPowerup[]>([]);
  const [activePowerups, setActivePowerups] = useState<PowerupEffect[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPowerups();
  }, []);

  const loadPowerups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Carregar power-ups disponíveis
      const { data: powerups } = await supabase
        .from('advanced_powerups')
        .select('*')
        .order('rarity', { ascending: true });

      // Carregar power-ups do usuário
      const { data: userPowerupsData } = await supabase
        .from('user_advanced_powerups')
        .select(`
          *,
          advanced_powerups (*)
        `)
        .eq('user_id', profile.id)
        .order('obtained_at', { ascending: false });

      setAvailablePowerups(powerups || []);
      setUserPowerups(userPowerupsData || []);
    } catch (error) {
      console.error('Error loading powerups:', error);
    } finally {
      setLoading(false);
    }
  };

  const activatePowerup = async (powerupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      // Verificar se o usuário tem o power-up
      const userPowerup = userPowerups.find(up => up.powerup_id === powerupId);
      if (!userPowerup || userPowerup.quantity <= 0) {
        toast({
          title: "Power-up indisponível",
          description: "Você não possui este power-up.",
          variant: "destructive",
        });
        return false;
      }

      // Consumir power-up
      const { error } = await supabase
        .from('user_advanced_powerups')
        .update({ quantity: userPowerup.quantity - 1 })
        .eq('id', userPowerup.id);

      if (error) throw error;

      // Ativar efeito
      const effect: PowerupEffect = {
        ...userPowerup.advanced_powerups.effect_data,
        active: true,
        remaining: userPowerup.advanced_powerups.effect_data.duration
      };

      setActivePowerups(prev => [...prev, effect]);
      
      toast({
        title: "Power-up ativado!",
        description: `${userPowerup.advanced_powerups.name} está ativo!`,
      });

      // Recarregar dados
      await loadPowerups();
      return true;
    } catch (error) {
      console.error('Error activating powerup:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o power-up.",
        variant: "destructive",
      });
      return false;
    }
  };

  const craftPowerup = async (powerupId: string, ingredients: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      const powerup = availablePowerups.find(p => p.id === powerupId);
      if (!powerup?.crafting_recipe) {
        toast({
          title: "Não é possível craftar",
          description: "Este power-up não pode ser craftado.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se tem os ingredientes necessários
      const hasIngredients = ingredients.every(ingredientId => {
        const userPowerup = userPowerups.find(up => up.powerup_id === ingredientId);
        return userPowerup && userPowerup.quantity > 0;
      });

      if (!hasIngredients) {
        toast({
          title: "Ingredientes insuficientes",
          description: "Você não possui todos os ingredientes necessários.",
          variant: "destructive",
        });
        return false;
      }

      // Consumir ingredientes
      for (const ingredientId of ingredients) {
        const userPowerup = userPowerups.find(up => up.powerup_id === ingredientId);
        if (userPowerup) {
          await supabase
            .from('user_advanced_powerups')
            .update({ quantity: userPowerup.quantity - 1 })
            .eq('id', userPowerup.id);
        }
      }

      // Adicionar novo power-up
      const { error } = await supabase
        .from('user_advanced_powerups')
        .insert({
          user_id: profile.id,
          powerup_id: powerupId,
          quantity: 1
        });

      if (error) throw error;

      toast({
        title: "Power-up craftado!",
        description: `${powerup.name} foi criado com sucesso!`,
      });

      await loadPowerups();
      return true;
    } catch (error) {
      console.error('Error crafting powerup:', error);
      toast({
        title: "Erro",
        description: "Não foi possível craftar o power-up.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePowerupEffect = (effectType: string, value: number) => {
    setActivePowerups(prev => 
      prev.map(effect => 
        effect.type === effectType && effect.active
          ? { ...effect, remaining: Math.max(0, effect.remaining! - value) }
          : effect
      ).filter(effect => effect.remaining! > 0)
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-50';
      case 'rare': return 'text-blue-600 bg-blue-50';
      case 'epic': return 'text-purple-600 bg-purple-50';
      case 'legendary': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'offensive': return '⚔️';
      case 'defensive': return '🛡️';
      case 'utility': return '🔧';
      case 'legendary': return '✨';
      default: return '📦';
    }
  };

  return {
    availablePowerups,
    userPowerups,
    activePowerups,
    loading,
    activatePowerup,
    craftPowerup,
    updatePowerupEffect,
    getRarityColor,
    getCategoryIcon,
    loadPowerups
  };
}