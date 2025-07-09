import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock types until migration is applied
interface GameEvent {
  id: string;
  name: string;
  description: string;
  event_type: string;
  status: string;
  start_time: string;
  end_time: string;
  entry_requirements: any;
  rewards: any;
  max_participants?: number;
  current_participants?: number;
}

interface UserEventParticipation {
  id: string;
  user_id: string;
  event_id: string;
  status: string; 
  final_score?: number;
  rank_position?: number;
  participation_data: any;
  rewards_claimed?: boolean;
}

interface EventLeaderboard {
  user_id: string;
  profiles: {
    nickname: string;
  };
  nickname: string;
  final_score: number;
  rank_position: number;
  profile_image_url?: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [participations, setParticipations] = useState<UserEventParticipation[]>([]);
  const [userParticipations, setUserParticipations] = useState<UserEventParticipation[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<string, EventLeaderboard[]>>({});
  const [eventLeaderboards, setEventLeaderboards] = useState<Record<string, EventLeaderboard[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchActiveEvents = async () => {
    if (!user) return;

    setIsLoading(true);
    setLoading(true);
    try {
      // Mock data until migration is applied
      const mockEvents: GameEvent[] = [
        {
          id: '1',
          name: 'Torneio Semanal',
          description: 'Competição semanal de conhecimento financeiro',
          event_type: 'tournament',
          status: 'active',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          entry_requirements: { min_level: 5 },
          rewards: { first: 1000, second: 500, third: 250 },
          max_participants: 100,
          current_participants: 45
        }
      ];

      setEvents(mockEvents);
      setParticipations([]);
      setUserParticipations([]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      toast.success('Inscrição realizada com sucesso!');
      await fetchActiveEvents();
      return true;
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Erro ao se inscrever no evento');
      return false;
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      toast.success('Inscrição cancelada');
      await fetchActiveEvents();
      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Erro ao cancelar inscrição');
      return false;
    }
  };

  const getEventLeaderboard = async (eventId: string) => {
    try {
      // Mock leaderboard data
      const mockLeaderboard: EventLeaderboard[] = [
        {
          user_id: '1',
          profiles: { nickname: 'Player1' },
          nickname: 'Player1',
          final_score: 1500,
          rank_position: 1
        },
        {
          user_id: '2', 
          profiles: { nickname: 'Player2' },
          nickname: 'Player2',
          final_score: 1200,
          rank_position: 2
        }
      ];

      setLeaderboards(prev => ({
        ...prev,
        [eventId]: mockLeaderboard
      }));
      setEventLeaderboards(prev => ({
        ...prev,
        [eventId]: mockLeaderboard
      }));

      return mockLeaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Erro ao carregar ranking');
      return [];
    }
  };

  const submitEventScore = async (eventId: string, score: number, gameData: any) => {
    if (!user) return false;

    try {
      toast.success('Pontuação registrada!');
      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Erro ao registrar pontuação');
      return false;
    }
  };

  const claimEventRewards = async (eventId: string) => {
    if (!user) return false;

    try {
      toast.success('Recompensas coletadas!');
      return true;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Erro ao coletar recompensas');
      return false;
    }
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

  useEffect(() => {
    fetchActiveEvents();
  }, [user]);

  return {
    events,
    participations,
    userParticipations,
    leaderboards,
    eventLeaderboards,
    isLoading,
    loading,
    joinEvent,
    leaveEvent,
    getEventLeaderboard,
    submitEventScore,
    claimEventRewards,
    getEventTypeIcon,
    getEventStatusColor,
    refetch: fetchActiveEvents
  };
};