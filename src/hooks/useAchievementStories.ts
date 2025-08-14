import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBotPresenceSimulation } from './useBotPresenceSimulation';

interface AchievementStory {
  id: string;
  user_id: string;
  achievement_id: string;
  story_type: 'achievement' | 'streak' | 'level_up' | 'rare_drop';
  media_url?: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  user: {
    nickname: string;
    current_avatar_id?: string;
    avatar?: {
      image_url: string;
    };
  };
  achievement?: {
    name: string;
    rarity: string;
    badge_icon?: string;
  };
}

export function useAchievementStories() {
  const [stories, setStories] = useState<AchievementStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onlineBots } = useBotPresenceSimulation();

  const loadStories = async () => {
    try {
      setIsLoading(true);

      // Get recent user achievements from the last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          user_id,
          achievement_id,
          earned_at,
          achievements (
            id,
            name,
            rarity,
            badge_icon
          )
        `)
        .gte('earned_at', last24Hours)
        .order('earned_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set(userAchievements?.map(ua => ua.user_id) || [])];
      
      if (userIds.length === 0) {
        setStories([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          current_avatar_id,
          avatars (
            image_url
          )
        `)
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Transform to stories format
      const achievementStories: AchievementStory[] = userAchievements
        ?.map(userAchievement => {
          const profile = profiles?.find(p => p.id === userAchievement.user_id);
          if (!profile || !userAchievement.achievements) return null;

          const achievement = userAchievement.achievements as any;
          const earnedAt = new Date(userAchievement.earned_at);
          const expiresAt = new Date(earnedAt.getTime() + 24 * 60 * 60 * 1000);

          return {
            id: userAchievement.id,
            user_id: userAchievement.user_id,
            achievement_id: userAchievement.achievement_id,
            story_type: 'achievement' as const,
            caption: `Just unlocked ${achievement.name}! ${achievement.rarity === 'legendary' ? '🔥' : achievement.rarity === 'epic' ? '⚡' : '⭐'}`,
            created_at: userAchievement.earned_at,
            expires_at: expiresAt.toISOString(),
            views_count: Math.floor(Math.random() * 50) + 5, // Mock views for now
            user: {
              nickname: profile.nickname || 'Player',
              current_avatar_id: profile.current_avatar_id,
              avatar: profile.avatars ? { image_url: (profile.avatars as any).image_url } : undefined
            },
            achievement: {
              name: achievement.name,
              rarity: achievement.rarity,
              badge_icon: achievement.badge_icon
            }
          };
        })
        .filter(Boolean) as AchievementStory[];

      // Add simulated bot stories if we have few real stories
      const botStories = generateBotStories(onlineBots, achievementStories.length);
      const allStories = [...achievementStories, ...botStories];

      setStories(allStories);
    } catch (error) {
      console.error('Error loading achievement stories:', error);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const viewStory = async (storyId: string, profileId: string) => {
    try {
      // For now, just update local state
      // In a full implementation, you'd create a story_views table
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, views_count: story.views_count + 1 }
          : story
      ));
    } catch (error) {
      console.error('Error recording story view:', error);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Generate simulated bot achievement stories
  const generateBotStories = (bots: any[], realStoriesCount: number): AchievementStory[] => {
    if (realStoriesCount >= 8) return []; // Only add if we need more content
    
    const achievements = [
      { name: 'Quiz Master', rarity: 'rare', badge_icon: '🧠' },
      { name: 'Speed Demon', rarity: 'epic', badge_icon: '⚡' },
      { name: 'Knowledge Seeker', rarity: 'common', badge_icon: '📚' },
      { name: 'Perfect Score', rarity: 'legendary', badge_icon: '💯' },
      { name: 'Streak Champion', rarity: 'epic', badge_icon: '🔥' },
      { name: 'Learning Enthusiast', rarity: 'rare', badge_icon: '⭐' }
    ];
    
    return bots.slice(0, Math.min(6, 8 - realStoriesCount)).map((bot, index) => {
      const achievement = achievements[index % achievements.length];
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000); // Within last 12h
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      
      return {
        id: `bot-story-${bot.id}-${index}`,
        user_id: bot.bot_id,
        achievement_id: `achievement-${index}`,
        story_type: 'achievement' as const,
        caption: `Acabei de conquistar ${achievement.name}! ${achievement.rarity === 'legendary' ? '🔥' : achievement.rarity === 'epic' ? '⚡' : '⭐'}`,
        created_at: createdAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        views_count: Math.floor(Math.random() * 30) + 5,
        user: {
          nickname: bot.profile?.nickname || 'Bot Player',
          current_avatar_id: bot.profile?.current_avatar_id,
          avatar: bot.profile?.avatars ? { image_url: bot.profile.avatars.image_url } : undefined
        },
        achievement: {
          name: achievement.name,
          rarity: achievement.rarity,
          badge_icon: achievement.badge_icon
        }
      };
    });
  };

  return {
    stories,
    isLoading,
    viewStory,
    refetch: loadStories
  };
}