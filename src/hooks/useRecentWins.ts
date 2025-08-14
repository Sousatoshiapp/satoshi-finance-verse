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

  // Generate simulated bot wins
  const generateBotWins = (bots: any[], realWinsCount: number, currentFilter: string): RecentWin[] => {
    if (realWinsCount >= 15) return []; // Only add if we need more content
    
    const winTemplates = {
      all: [
        { type: 'duel_victory' as const, data: { opponent_nickname: 'Quiz Bot', score: 850 } },
        { type: 'achievement_unlock' as const, data: { achievement_name: 'Speed Reader', score: 500 } },
        { type: 'streak_milestone' as const, data: { streak_days: 7 } },
        { type: 'quiz_perfect' as const, data: { score: 1000 } },
        { type: 'level_up' as const, data: { level_reached: 15 } }
      ],
      duels: [
        { type: 'duel_victory' as const, data: { opponent_nickname: 'Quiz Bot', score: 850 } },
        { type: 'duel_victory' as const, data: { opponent_nickname: 'Speed Bot', score: 920 } }
      ],
      achievements: [
        { type: 'achievement_unlock' as const, data: { achievement_name: 'Speed Reader', score: 500 } },
        { type: 'level_up' as const, data: { level_reached: 15 } }
      ],
      streaks: [
        { type: 'streak_milestone' as const, data: { streak_days: 7 } },
        { type: 'streak_milestone' as const, data: { streak_days: 14 } }
      ]
    };

    const templates = winTemplates[currentFilter] || winTemplates.all;
    const botsToUse = bots.slice(0, Math.min(8, 15 - realWinsCount));
    
    return botsToUse.map((bot, index) => {
      const template = templates[index % templates.length];
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000); // Within last 6h
      
      return {
        id: `bot-win-${bot.id}-${index}`,
        user_id: bot.bot_id,
        win_type: template.type,
        win_data: template.data,
        created_at: createdAt.toISOString(),
        user: {
          nickname: bot.profile?.nickname || 'Bot Player',
          level: bot.profile?.level || Math.floor(Math.random() * 20) + 1,
          current_avatar_id: bot.profile?.current_avatar_id,
          avatar: bot.profile?.avatars ? { image_url: bot.profile.avatars.image_url } : undefined
        },
        likes: Math.floor(Math.random() * 15) + 1,
        comments: Math.floor(Math.random() * 3) + 1
      };
    });
  };

  return {
    recentWins,
    isLoading,
    refetch: loadRecentWins
  };
}