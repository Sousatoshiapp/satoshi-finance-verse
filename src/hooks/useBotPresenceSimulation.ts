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

  // Buscar bots reais do banco de dados
  const fetchOnlineBots = useCallback(async () => {
    if (loading) return; // Prevent concurrent calls
    
    setLoading(true);
    try {
      // Buscar perfis de bots reais com avatares
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, 
          nickname, 
          level, 
          profile_image_url, 
          current_avatar_id,
          points,
          avatars:avatars!current_avatar_id (
            name,
            image_url
          )
        `)
        .eq('is_bot', true)
        .order('level', { ascending: false })
        .limit(20);

      if (profileError) throw profileError;

      if (profiles && profiles.length > 0) {
        // Simular presença online para alguns bots
        const activeBotsCount = Math.min(Math.floor(profiles.length * 0.6), 12);
        const shuffledProfiles = [...profiles].sort(() => Math.random() - 0.5);
        const activeBots = shuffledProfiles.slice(0, activeBotsCount);

        // Mapear bots com dados reais
        const botsWithProfiles = activeBots.map((profile, index) => ({
          id: `presence_${profile.id}`,
          bot_id: profile.id,
          personality_type: ['casual', 'competitive', 'strategic', 'social'][index % 4],
          is_online: true,
          online_probability: 0.7 + Math.random() * 0.3,
          peak_hours: [9, 10, 11, 14, 15, 16, 19, 20, 21],
          last_activity_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          bot_profile: {
            nickname: profile.nickname,
            level: profile.level,
            profile_image_url: profile.profile_image_url,
            points: profile.points || (300 + Math.floor(Math.random() * 4700)),
            avatars: profile.avatars ? {
              name: profile.avatars.name,
              image_url: profile.avatars.image_url
            } : undefined
          }
        }));

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