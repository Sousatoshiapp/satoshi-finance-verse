import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  event_type: 'tournament' | 'challenge' | 'boss_battle' | 'speedrun' | 'community_goal';
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  start_time: string;
  end_time: string;
  requirements: any;
  rewards: any;
  max_participants?: number;
  current_participants: number;
  event_data: any;
  banner_url?: string;
}

export interface UserEventParticipation {
  id: string;
  user_id: string;
  event_id: string;
  joined_at: string;
  progress: any;
  final_score: number;
  rank_position?: number;
  rewards_claimed: boolean;
}

export interface EventLeaderboard {
  user_id: string;
  nickname: string;
  final_score: number;
  rank_position: number;
  profile_image_url?: string;
}

export function useEvents() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [userParticipations, setUserParticipations] = useState<UserEventParticipation[]>([]);
  const [eventLeaderboards, setEventLeaderboards] = useState<Record<string, EventLeaderboard[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Carregar eventos
      const { data: eventsData } = await supabase
        .from('game_events')
        .select('*')
        .order('start_time', { ascending: true });

      // Carregar participações do usuário
      const { data: participationsData } = await supabase
        .from('user_event_participation')
        .select('*')
        .eq('user_id', profile.id)
        .order('joined_at', { ascending: false });

      setEvents(eventsData || []);
      setUserParticipations(participationsData || []);

      // Carregar leaderboards para eventos ativos
      const activeEvents = eventsData?.filter(event => event.status === 'active') || [];
      for (const event of activeEvents) {
        await loadEventLeaderboard(event.id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventLeaderboard = async (eventId: string) => {
    try {
      const { data: leaderboardData } = await supabase
        .from('user_event_participation')
        .select(`
          user_id,
          final_score,
          rank_position,
          profiles!inner (
            nickname,
            profile_image_url
          )
        `)
        .eq('event_id', eventId)
        .not('final_score', 'is', null)
        .order('final_score', { ascending: false })
        .limit(50);

      if (leaderboardData) {
        const formattedLeaderboard = leaderboardData.map((entry, index) => ({
          user_id: entry.user_id,
          nickname: entry.profiles.nickname,
          final_score: entry.final_score,
          rank_position: entry.rank_position || index + 1,
          profile_image_url: entry.profiles.profile_image_url
        }));

        setEventLeaderboards(prev => ({
          ...prev,
          [eventId]: formattedLeaderboard
        }));
      }
    } catch (error) {
      console.error('Error loading event leaderboard:', error);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      const event = events.find(e => e.id === eventId);
      if (!event) return false;

      // Verificar se já está participando
      const existingParticipation = userParticipations.find(p => p.event_id === eventId);
      if (existingParticipation) {
        toast({
          title: "Já participando",
          description: "Você já está participando deste evento.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se o evento ainda aceita participantes
      if (event.max_participants && event.current_participants >= event.max_participants) {
        toast({
          title: "Evento lotado",
          description: "Este evento já atingiu o número máximo de participantes.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar requisitos
      if (event.requirements && event.requirements.min_level) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('level')
          .eq('id', profile.id)
          .single();

        if (userProfile && userProfile.level < event.requirements.min_level) {
          toast({
            title: "Nível insuficiente",
            description: `Você precisa estar no nível ${event.requirements.min_level} para participar.`,
            variant: "destructive",
          });
          return false;
        }
      }

      // Participar do evento
      const { error } = await supabase
        .from('user_event_participation')
        .insert({
          user_id: profile.id,
          event_id: eventId,
          progress: {},
          final_score: 0
        });

      if (error) throw error;

      // Atualizar contador de participantes
      await supabase
        .from('game_events')
        .update({ current_participants: event.current_participants + 1 })
        .eq('id', eventId);

      toast({
        title: "Participação confirmada!",
        description: `Você se inscreveu no evento "${event.name}".`,
      });

      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Erro",
        description: "Não foi possível participar do evento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateEventProgress = async (eventId: string, progress: any, score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      const { error } = await supabase
        .from('user_event_participation')
        .update({
          progress,
          final_score: score
        })
        .eq('user_id', profile.id)
        .eq('event_id', eventId);

      if (error) throw error;

      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error updating event progress:', error);
      return false;
    }
  };

  const claimEventRewards = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      const participation = userParticipations.find(p => p.event_id === eventId);
      if (!participation || participation.rewards_claimed) {
        toast({
          title: "Recompensas já coletadas",
          description: "Você já coletou as recompensas deste evento.",
          variant: "destructive",
        });
        return false;
      }

      const event = events.find(e => e.id === eventId);
      if (!event || event.status !== 'ended') {
        toast({
          title: "Evento ainda ativo",
          description: "Aguarde o evento terminar para coletar as recompensas.",
          variant: "destructive",
        });
        return false;
      }

      // Marcar recompensas como coletadas
      const { error } = await supabase
        .from('user_event_participation')
        .update({ rewards_claimed: true })
        .eq('id', participation.id);

      if (error) throw error;

      // Aplicar recompensas baseadas na posição
      const rewards = calculateEventRewards(event.rewards, participation.rank_position || 999);
      
      if (rewards.beetz) {
        await supabase
          .from('profiles')
          .update({ 
            points: supabase.raw(`points + ${rewards.beetz}`) 
          })
          .eq('id', profile.id);
      }

      if (rewards.xp) {
        await supabase.rpc('award_xp', {
          profile_id: profile.id,
          xp_amount: rewards.xp,
          activity_type: 'event_completion'
        });
      }

      toast({
        title: "Recompensas coletadas!",
        description: `Você ganhou ${rewards.beetz || 0} Beetz e ${rewards.xp || 0} XP!`,
      });

      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error claiming event rewards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível coletar as recompensas.",
        variant: "destructive",
      });
      return false;
    }
  };

  const calculateEventRewards = (eventRewards: any, position: number) => {
    if (position === 1 && eventRewards.first) {
      return eventRewards.first;
    } else if (position <= 3 && eventRewards.top_3) {
      return eventRewards.top_3;
    } else if (position <= 10 && eventRewards.top_10) {
      return eventRewards.top_10;
    } else if (eventRewards.participation) {
      return eventRewards.participation;
    }
    return { beetz: 0, xp: 0 };
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'tournament': return '🏆';
      case 'challenge': return '🎯';
      case 'boss_battle': return '👹';
      case 'speedrun': return '⚡';
      case 'community_goal': return '🤝';
      default: return '🎮';
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'ended': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return {
    events,
    userParticipations,
    eventLeaderboards,
    loading,
    joinEvent,
    updateEventProgress,
    claimEventRewards,
    getEventTypeIcon,
    getEventStatusColor,
    loadEvents
  };
}