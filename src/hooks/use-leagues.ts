import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeagueSeason {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'ended' | 'upcoming';
  rewards: any;
}

export interface UserLeague {
  id: string;
  user_id: string;
  season_id: string;
  current_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
  tier_points: number;
  peak_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
  promotions_count?: number;
  demotions_count?: number;
  demotion_count?: number;
}

export interface LeagueRanking {
  user_id: string;
  nickname: string;
  tier_points: number;
  current_tier: string;
  rank_position: number;
  profile_image_url?: string;
}

export function useLeagues() {
  const [currentSeason, setCurrentSeason] = useState<LeagueSeason | null>(null);
  const [userLeague, setUserLeague] = useState<UserLeague | null>(null);
  const [rankings, setRankings] = useState<LeagueRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeagueData();
  }, []);

  const loadLeagueData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Carregar temporada atual
      const { data: season } = await supabase
        .from('league_seasons')
        .select('*')
        .eq('status', 'active')
        .single();

      if (season) {
        setCurrentSeason(season);

        // Carregar dados da liga do usuário
        const { data: league } = await supabase
          .from('user_leagues')
          .select('*')
          .eq('user_id', profile.id)
          .eq('season_id', season.id)
          .single();

        if (league) {
          setUserLeague({
            ...league,
            promotions_count: (league as any).promotion_count || 0,
            demotions_count: league.demotion_count || 0
          });
        } else {
          // Criar entrada inicial para o usuário
          const { data: newLeague } = await supabase
            .from('user_leagues')
            .insert({
              user_id: profile.id,
              season_id: season.id,
              current_tier: 'bronze',
              tier_points: 0,
              peak_tier: 'bronze'
            })
            .select()
            .single();

          if (newLeague) {
            setUserLeague({
              ...newLeague,
              promotions_count: 0,
              demotions_count: 0
            });
          }
        }

        // Carregar rankings
        await loadRankings(season.id);
      }
    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async (seasonId: string) => {
    try {
      const { data: rankings } = await supabase
        .from('user_leagues')
        .select(`
          user_id,
          tier_points,
          current_tier
        `)
        .eq('season_id', seasonId)
        .order('tier_points', { ascending: false })
        .limit(50);

      if (rankings) {
        const formattedRankings = rankings.map((rank, index) => ({
          user_id: rank.user_id,
          nickname: `Player ${index + 1}`,
          tier_points: rank.tier_points,
          current_tier: rank.current_tier,
          rank_position: index + 1,
          profile_image_url: undefined
        }));

        setRankings(formattedRankings);
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
    }
  };

  const updateLeaguePoints = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('update_user_league', {
        p_user_id: profile.id,
        p_points_gained: points
      });

      if (error) throw error;

      if (data) {
        // Mostrar notificação se houve promoção/rebaixamento
        if (typeof data === 'object' && data !== null) {
          const dataObj = data as any;
          if (dataObj.promoted) {
            toast({
              title: "🎉 Promoção!",
              description: `Você foi promovido para ${dataObj.new_tier}!`,
            });
          } else if (dataObj.demoted) {
            toast({
              title: "📉 Rebaixamento",
              description: `Você foi rebaixado para ${dataObj.new_tier}`,
              variant: "destructive",
            });
          }
        }

        // Recarregar dados
        await loadLeagueData();
      }

      return data;
    } catch (error) {
      console.error('Error updating league points:', error);
      return null;
    }
  };

  const getTierInfo = (tier: string) => {
    const tierInfo = {
      bronze: { color: 'text-amber-700', bg: 'bg-amber-50', icon: '🥉', name: 'Bronze' },
      silver: { color: 'text-gray-600', bg: 'bg-gray-50', icon: '🥈', name: 'Prata' },
      gold: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🥇', name: 'Ouro' },
      platinum: { color: 'text-cyan-600', bg: 'bg-cyan-50', icon: '💎', name: 'Platina' },
      diamond: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '💠', name: 'Diamante' },
      master: { color: 'text-purple-600', bg: 'bg-purple-50', icon: '👑', name: 'Mestre' },
      grandmaster: { color: 'text-red-600', bg: 'bg-red-50', icon: '🏆', name: 'Grão-Mestre' }
    };

    return tierInfo[tier as keyof typeof tierInfo] || tierInfo.bronze;
  };

  const getTierRequirements = (tier: string) => {
    const requirements = {
      bronze: 0,
      silver: 300,
      gold: 700,
      platinum: 1200,
      diamond: 2000,
      master: 3000,
      grandmaster: 5000
    };

    return requirements[tier as keyof typeof requirements] || 0;
  };

  return {
    currentSeason,
    userLeague,
    rankings,
    loading,
    updateLeaguePoints,
    getTierInfo,
    getTierRequirements,
    loadLeagueData
  };
}