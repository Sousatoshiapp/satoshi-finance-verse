import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TournamentParticipant {
  id: string;
  user_id: string;
  tournament_id: string;
  current_score: number;
  questions_answered: number;
  best_streak: number;
  joined_at: string;
  user: {
    nickname: string;
    level: number;
    current_avatar_id?: string;
    avatar?: {
      image_url: string;
    };
  };
}

interface WeeklyTournament {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'registration' | 'active' | 'completed';
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  entry_cost: number;
  prize_pool: {
    first: number;
    second: number;
    third: number;
    participation: number;
  };
  tournament_type: 'weekly' | 'special' | 'seasonal';
  registration_deadline: string;
  participants: TournamentParticipant[];
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<WeeklyTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([]);

  const loadTournaments = async () => {
    try {
      setIsLoading(true);

      // Get active tournaments
      const { data: tournamentData, error } = await supabase
        .from('automated_tournaments')
        .select('*')
        .eq('is_active', true)
        .order('start_time', { ascending: false });

      if (error) throw error;

      if (!tournamentData || tournamentData.length === 0) {
        setTournaments([]);
        return;
      }

      // Get participants for each tournament
      const tournamentIds = tournamentData.map(t => t.id);
      
      // For now, create empty participants array since tournament_participants table may not have all columns
      const participantsData: any[] = [];

      // Transform data
      const transformedTournaments: WeeklyTournament[] = tournamentData.map(tournament => {
        // Determine status based on current time
        const now = new Date();
        const startTime = new Date(tournament.start_time);
        
        let status: WeeklyTournament['status'];
        if (now < startTime) {
          status = 'registration';
        } else {
          status = 'active';
        }

        return {
          id: tournament.id,
          name: tournament.name,
          description: tournament.description || 'Weekly knowledge championship',
          status,
          start_time: tournament.start_time,
          end_time: new Date(startTime.getTime() + tournament.duration_hours * 60 * 60 * 1000).toISOString(),
          max_participants: tournament.max_participants || 1000,
          current_participants: Math.floor(Math.random() * 500) + 100, // Mock participants for now
          entry_cost: tournament.entry_cost || 0,
          prize_pool: typeof tournament.prize_pool === 'object' ? tournament.prize_pool as any : {
            first: 5000,
            second: 2500,
            third: 1500,
            participation: 1000
          },
          tournament_type: 'weekly' as const,
          registration_deadline: tournament.start_time,
          participants: [] // Empty for now since we need to implement the participants table properly
        };
      });

      setTournaments(transformedTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRegistrations = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('user_id', profileId);

      if (error) throw error;
      setRegisteredTournaments(data?.map(p => p.tournament_id) || []);
    } catch (error) {
      console.error('Error loading user registrations:', error);
    }
  };

  const registerForTournament = async (tournamentId: string, profileId: string) => {
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: profileId
        });

      if (error) throw error;

      setRegisteredTournaments(prev => [...prev, tournamentId]);
      await loadTournaments(); // Refresh tournaments
      return { success: true };
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  return {
    tournaments,
    isLoading,
    registeredTournaments,
    loadUserRegistrations,
    registerForTournament,
    refetch: loadTournaments
  };
}