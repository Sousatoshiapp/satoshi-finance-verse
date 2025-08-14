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
    avatars?: {
      name: string;
      image_url: string;
    };
  };
}

export function useBotPresenceSimulation() {
  const [onlineBots, setOnlineBots] = useState<BotPresence[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Buscar bots e usuários reais online
  const fetchOnlineBots = useCallback(async () => {
    if (loading) return; // Prevent concurrent calls
    
    setLoading(true);
    try {
      // Buscar apenas bots online sem queries aninhadas
      const { data: botData, error: botError } = await supabase
        .from('bot_presence_simulation')
        .select(`
          id,
          bot_id,
          personality_type,
          is_online,
          online_probability,
          peak_hours,
          last_activity_at
        `)
        .eq('is_online', true)
        .limit(50);

      if (botError) throw botError;

      // Buscar perfis dos bots separadamente com avatares
      if (botData && botData.length > 0) {
        const botIds = botData.map(bot => bot.bot_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select(`
            id, 
            nickname, 
            level, 
            profile_image_url, 
            current_avatar_id,
            points
          `)
          .in('id', botIds)
          .eq('is_bot', true);

        // Buscar avatares dos bots
        const avatarIds = profiles?.map(p => p.current_avatar_id).filter(Boolean) || [];
        const { data: avatars } = avatarIds.length > 0 ? await supabase
          .from('avatars')
          .select('id, name, image_url')
          .in('id', avatarIds) : { data: [] };

        // Mapear bots com perfis e avatares
        const botsWithProfiles = botData.map((bot) => {
          const profile = profiles?.find(p => p.id === bot.bot_id);
          const avatar = avatars?.find(a => a.id === profile?.current_avatar_id);
          
          return {
            ...bot,
            bot_profile: profile ? {
              nickname: profile.nickname,
              level: profile.level,
              profile_image_url: profile.profile_image_url,
              points: profile.points || Math.floor(Math.random() * 3000) + 200,
              avatars: avatar ? {
                name: avatar.name,
                image_url: avatar.image_url
              } : undefined
            } : {
              nickname: `Bot_${Math.floor(Math.random() * 1000)}`,
              level: Math.floor(Math.random() * 45) + 5,
              points: Math.floor(Math.random() * 3000) + 200,
              avatars: undefined
            }
          };
        });

        setOnlineBots(botsWithProfiles as BotPresence[]);
      } else {
        setOnlineBots([]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar usuários online:', error);
      setOnlineBots([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

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

    // Buscar bots online a cada 30 segundos (reduzido para resolver mais rápido)
    const fetchInterval = setInterval(() => {
      fetchOnlineBots();
    }, 30 * 1000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, []); // Dependências removidas para evitar loops

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