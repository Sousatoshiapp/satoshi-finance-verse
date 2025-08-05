import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BotPresence {
  id: string;
  bot_id: string;
  personality_type: string;
  is_online: boolean;
  online_probability: number;
  peak_hours: number[];
  last_activity_at: string;
  bot_profile?: {
    nickname: string;
    level: number;
    profile_image_url?: string;
    user_avatars?: {
      avatars: {
        name: string;
        image_url: string;
      };
    }[];
  };
}

export function useBotPresenceSimulation() {
  const [onlineBots, setOnlineBots] = useState<BotPresence[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Buscar bots online atuais
  const fetchOnlineBots = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bot_presence_simulation')
        .select(`
          *,
          bot_profile:profiles!bot_id (
            nickname,
            level,
            profile_image_url,
            user_avatars (
              avatars (
                name,
                image_url
              )
            )
          )
        `)
        .eq('is_online', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;

      setOnlineBots(data?.map(bot => ({
        ...bot,
        bot_profile: bot.bot_profile?.[0]
      })) || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar bots online:', error);
      setOnlineBots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar presença dos bots
  const updateBotPresence = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('simulate_bot_presence');
      if (error) throw error;
      
      // Buscar bots atualizados após a simulação
      await fetchOnlineBots();
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar presença dos bots:', error);
      return 0;
    }
  }, [fetchOnlineBots]);

  // Buscar bots online por personalidade
  const getBotsByPersonality = useCallback((personality: string) => {
    return onlineBots.filter(bot => bot.personality_type === personality);
  }, [onlineBots]);

  // Buscar bots online por nível
  const getBotsByLevel = useCallback((minLevel: number, maxLevel: number) => {
    return onlineBots.filter(bot => 
      bot.bot_profile && 
      bot.bot_profile.level >= minLevel && 
      bot.bot_profile.level <= maxLevel
    );
  }, [onlineBots]);

  // Inicializar e configurar atualização automática
  useEffect(() => {
    fetchOnlineBots();

    // Atualizar presença a cada 15 minutos
    const updateInterval = setInterval(() => {
      updateBotPresence();
    }, 15 * 60 * 1000);

    // Buscar bots online a cada 5 minutos
    const fetchInterval = setInterval(() => {
      fetchOnlineBots();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(fetchInterval);
    };
  }, [fetchOnlineBots, updateBotPresence]);

  return {
    onlineBots,
    loading,
    lastUpdate,
    fetchOnlineBots,
    updateBotPresence,
    getBotsByPersonality,
    getBotsByLevel,
    totalOnline: onlineBots.length
  };
}