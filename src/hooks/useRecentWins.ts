import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBotPresenceSimulation } from './useBotPresenceSimulation';

interface RecentWin {
  id: string;
  user_id: string;
  win_type: 'duel_victory' | 'quiz_perfect' | 'streak_milestone' | 'tournament_win' | 'achievement_unlock' | 'level_up';
  win_data: {
    opponent_nickname?: string;
    streak_days?: number;
    level_reached?: number;
    achievement_name?: string;
    score?: number;
    tournament_name?: string;
    prize_amount?: number;
  };
  created_at: string;
  user: {
    nickname: string;
    level: number;
    current_avatar_id?: string;
    avatar?: {
      image_url: string;
    };
  };
  likes: number;
  comments: number;
}

export function useRecentWins(filter: 'all' | 'duels' | 'achievements' | 'streaks' = 'all') {
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onlineBots } = useBotPresenceSimulation();

  const loadRecentWins = async () => {
    try {
      setIsLoading(true);
      
      // Query activity_feed for recent community activities
      const { data: activities, error } = await supabase
        .from('activity_feed')
        .select(`
          id,
          user_id,
          activity_type,
          activity_data,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get user profiles for activities
      const userIds = [...new Set(activities?.map(a => a.user_id) || [])];
      
      let profiles = [];
      let wins: RecentWin[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            nickname,
            level,
            current_avatar_id,
            avatars (
              image_url
            )
          `)
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profiles = profilesData || [];

        // Transform activities to RecentWin format
        wins = activities
          ?.map(activity => {
            const profile = profiles?.find(p => p.id === activity.user_id);
            if (!profile) return null;

            let winType: RecentWin['win_type'];
            let winData: RecentWin['win_data'] = {};

            // Map activity types to win types
            const activityData = activity.activity_data as any;
            switch (activity.activity_type) {
              case 'debug_mission_completed':
                if (activityData?.mission_type === 'daily_login') {
                  winType = 'streak_milestone';
                  winData = { streak_days: 1 };
                } else {
                  winType = 'achievement_unlock';
                  winData = { 
                    achievement_name: activityData?.mission_name || 'Mission Completed',
                    score: activityData?.awarded_xp || 0 
                  };
                }
                break;
              case 'xp_earned':
                winType = 'quiz_perfect';
                winData = { score: activityData?.amount || 0 };
                break;
              case 'duel_invite_sent':
                winType = 'duel_victory';
                winData = { opponent_nickname: 'Bot Player' };
                break;
              default:
                winType = 'achievement_unlock';
                winData = { achievement_name: 'Community Activity' };
            }

            return {
              id: activity.id,
              user_id: activity.user_id,
              win_type: winType,
              win_data: winData,
              created_at: activity.created_at,
              user: {
                nickname: profile.nickname || 'Player',
                level: profile.level || 1,
                current_avatar_id: profile.current_avatar_id,
                avatar: profile.avatars ? { image_url: (profile.avatars as any).image_url } : undefined
              },
              likes: Math.floor(Math.random() * 20) + 1, // Mock likes for now
              comments: Math.floor(Math.random() * 5) + 1 // Mock comments for now
            };
          })
          .filter(Boolean) as RecentWin[];
      }

      // Apply filter
      let filteredWins = wins;
      if (filter !== 'all') {
        switch (filter) {
          case 'duels':
            filteredWins = wins.filter(win => win.win_type === 'duel_victory');
            break;
          case 'achievements':
            filteredWins = wins.filter(win => ['achievement_unlock', 'level_up'].includes(win.win_type));
            break;
          case 'streaks':
            filteredWins = wins.filter(win => win.win_type === 'streak_milestone');
            break;
        }
      }

      // Add simulated bot wins if we have few real wins
      const botWins = generateBotWins(onlineBots, filteredWins.length, filter);
      const allWins = [...filteredWins, ...botWins];

      setRecentWins(allWins.slice(0, 20));
    } catch (error) {
      console.error('Error loading recent wins:', error);
      setRecentWins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentWins();
  }, [filter]);

  // Generate simulated bot wins com fallback robusto
  const generateBotWins = (bots: any[], realWinsCount: number, currentFilter: string): RecentWin[] => {
    const winTemplates = {
      all: [
        { type: 'duel_victory' as const, data: { opponent_nickname: 'CryptoMaster', score: 850, prize_amount: 150 } },
        { type: 'achievement_unlock' as const, data: { achievement_name: 'Mestre Bitcoin', score: 500, prize_amount: 200 } },
        { type: 'streak_milestone' as const, data: { streak_days: 7, prize_amount: 70 } },
        { type: 'quiz_perfect' as const, data: { score: 1000, prize_amount: 300 } },
        { type: 'level_up' as const, data: { level_reached: 25, prize_amount: 250 } },
        { type: 'tournament_win' as const, data: { tournament_name: 'Copa Bitcoin', prize_amount: 500 } },
        { type: 'duel_victory' as const, data: { opponent_nickname: 'DeFiExpert', score: 920, prize_amount: 180 } },
        { type: 'achievement_unlock' as const, data: { achievement_name: 'Trader Expert', score: 750, prize_amount: 350 } }
      ],
      duels: [
        { type: 'duel_victory' as const, data: { opponent_nickname: 'CryptoNinja', score: 850, prize_amount: 150 } },
        { type: 'duel_victory' as const, data: { opponent_nickname: 'BitcoinPro', score: 920, prize_amount: 180 } },
        { type: 'duel_victory' as const, data: { opponent_nickname: 'SatoshiFan', score: 780, prize_amount: 120 } },
        { type: 'duel_victory' as const, data: { opponent_nickname: 'BlockchainKing', score: 950, prize_amount: 200 } }
      ],
      achievements: [
        { type: 'achievement_unlock' as const, data: { achievement_name: 'Mestre Bitcoin', score: 500, prize_amount: 200 } },
        { type: 'level_up' as const, data: { level_reached: 20, prize_amount: 200 } },
        { type: 'achievement_unlock' as const, data: { achievement_name: 'DeFi Pioneer', score: 750, prize_amount: 350 } },
        { type: 'level_up' as const, data: { level_reached: 35, prize_amount: 350 } }
      ],
      streaks: [
        { type: 'streak_milestone' as const, data: { streak_days: 7, prize_amount: 70 } },
        { type: 'streak_milestone' as const, data: { streak_days: 14, prize_amount: 140 } },
        { type: 'streak_milestone' as const, data: { streak_days: 30, prize_amount: 300 } },
        { type: 'streak_milestone' as const, data: { streak_days: 21, prize_amount: 210 } }
      ]
    };

    const templates = winTemplates[currentFilter] || winTemplates.all;
    
    // SEMPRE gerar pelo menos 8 vitórias, com ou sem bots carregados
    const numWins = Math.max(8, 15 - realWinsCount);
    
    // Se há bots carregados, usar dados reais
    if (bots && bots.length > 0) {
      return Array.from({ length: numWins }, (_, index) => {
        const bot = bots[index % bots.length];
        const template = templates[index % templates.length];
        const now = new Date();
        const createdAt = new Date(now.getTime() - Math.random() * 8 * 60 * 60 * 1000);
        
        return {
          id: `bot-win-${bot.id || index}-${Date.now()}-${index}`,
          user_id: bot.bot_id || `real-bot-${index}`,
          win_type: template.type,
          win_data: template.data,
          created_at: createdAt.toISOString(),
          user: {
            nickname: bot.bot_profile?.nickname || `CryptoExplorer${index + 1}`,
            level: bot.bot_profile?.level || Math.floor(Math.random() * 40) + 10,
            current_avatar_id: bot.bot_profile?.current_avatar_id,
            avatar: bot.bot_profile?.avatars ? { image_url: bot.bot_profile.avatars.image_url } : null
          },
          likes: Math.floor(Math.random() * 25) + 3,
          comments: Math.floor(Math.random() * 8) + 1
        };
      });
    }
    
    // Fallback: Se não há bots carregados, usar dados estáticos com avatares reais
    const fallbackBotData = [
      { nickname: 'CriptoMestre', avatar: '/avatars/code-assassin.jpg', level: 28 },
      { nickname: 'BitcoinNinja', avatar: '/avatars/data-miner.jpg', level: 35 },
      { nickname: 'DataMiner', avatar: '/avatars/finance-hacker.jpg', level: 22 },
      { nickname: 'CodeAssassin', avatar: '/avatars/the-satoshi.jpg', level: 41 },
      { nickname: 'FinanceHacker', avatar: '/avatars/crypto-analyst.jpg', level: 30 },
      { nickname: 'BlockExplorer', avatar: '/avatars/block-explorer.jpg', level: 26 },
      { nickname: 'CryptoAnalyst', avatar: '/avatars/trading-master.jpg', level: 33 },
      { nickname: 'TradingBot', avatar: '/avatars/defi-pioneer.jpg', level: 37 },
    ];
    
    return Array.from({ length: numWins }, (_, index) => {
      const botData = fallbackBotData[index % fallbackBotData.length];
      const template = templates[index % templates.length];
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 8 * 60 * 60 * 1000);
      
      return {
        id: `fallback-win-${index}-${Date.now()}`,
        user_id: `fallback-bot-${index}`,
        win_type: template.type,
        win_data: template.data,
        created_at: createdAt.toISOString(),
        user: {
          nickname: botData.nickname,
          level: botData.level,
          current_avatar_id: undefined,
          avatar: { image_url: botData.avatar }
        },
        likes: Math.floor(Math.random() * 25) + 3,
        comments: Math.floor(Math.random() * 8) + 1
      };
    });
  };

  return {
    recentWins,
    isLoading,
    refetch: loadRecentWins
  };
}