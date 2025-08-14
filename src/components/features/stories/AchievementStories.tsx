import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { useAchievementStories } from '@/hooks/useAchievementStories';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';

interface AchievementStory {
  id: string;
  user_id: string;
  achievement_id: string;
  story_type: 'achievement' | 'streak' | 'level_up' | 'rare_drop';
  caption?: string;
  created_at: string;
  views_count: number;
  user: {
    nickname: string;
    avatar?: { image_url: string };
  };
  achievement?: {
    name: string;
    rarity: string;
    badge_icon?: string;
  };
}
import { Star, Trophy, Flame, Zap, Share2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export function AchievementStories() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isViewing, setIsViewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { profile } = useProfile();
  const { toast } = useToast();
  const { stories, viewStory } = useAchievementStories();

  useEffect(() => {
    if (isViewing && stories.length > 0) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 5 second stories (100 * 50ms)
      
      return () => clearInterval(timer);
    }
  }, [isViewing, currentStoryIndex]);

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      setIsViewing(false);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  const shareStory = async (story: AchievementStory) => {
    if (navigator.share) {
      await navigator.share({
        title: `🏆 ${story.user.nickname} conquistou: ${story.achievement?.name}`,
        text: story.caption || 'Confira essa conquista incrível!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`🏆 ${story.user.nickname} conquistou: ${story.achievement?.name}`);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência"
      });
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'epic': return <Star className="w-4 h-4 text-purple-500" />;
      case 'rare': return <Zap className="w-4 h-4 text-blue-500" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (stories.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Flame className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma conquista recente</h3>
        <p className="text-muted-foreground">
          As conquistas dos últimos dias aparecerão aqui!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stories Ring/Preview */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {stories.slice(0, 8).map((story, index) => (
          <motion.div
            key={story.id}
            className="flex-shrink-0 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentStoryIndex(index);
              setIsViewing(true);
              setProgress(0);
              if (profile?.id) {
                viewStory(story.id, profile.id);
              }
            }}
          >
            <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${getRarityGradient(story.achievement?.rarity || 'common')} p-0.5`}>
              <div className="w-full h-full rounded-full bg-background p-0.5">
                <img
                  src={story.user.avatar?.image_url || '/placeholder-avatar.png'}
                  alt={story.user.nickname}
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1">
                  {getRarityIcon(story.achievement?.rarity || 'common')}
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-1 truncate w-16">
              {story.user.nickname}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {isViewing && stories[currentStoryIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setIsViewing(false)}
          >
            <div className="relative w-full max-w-md h-full max-h-[90vh] bg-background rounded-lg overflow-hidden">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-10">
                <motion.div
                  className="h-full bg-white"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Story Content */}
              <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-10">
                  <img
                    src={stories[currentStoryIndex].user.avatar?.image_url || '/placeholder-avatar.png'}
                    alt={stories[currentStoryIndex].user.nickname}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {stories[currentStoryIndex].user.nickname}
                    </p>
                    <p className="text-xs text-white/70">
                      {formatDistanceToNow(new Date(stories[currentStoryIndex].created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareStory(stories[currentStoryIndex]);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Achievement Content */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${getRarityGradient(stories[currentStoryIndex].achievement?.rarity || 'common')} flex items-center justify-center`}
                    >
                      <Trophy className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <Badge 
                      variant="secondary" 
                      className={`mb-4 bg-gradient-to-r ${getRarityGradient(stories[currentStoryIndex].achievement?.rarity || 'common')} text-white border-0`}
                    >
                      {stories[currentStoryIndex].achievement?.rarity?.toUpperCase() || 'COMMON'}
                    </Badge>
                    
                    <h3 className="text-xl font-bold mb-2">
                      {stories[currentStoryIndex].achievement?.name}
                    </h3>
                    
                    {stories[currentStoryIndex].caption && (
                      <p className="text-muted-foreground mb-4">
                        {stories[currentStoryIndex].caption}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{stories[currentStoryIndex].views_count} visualizações</span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentStoryIndex > 0) {
                        setCurrentStoryIndex(prev => prev - 1);
                        setProgress(0);
                      }
                    }}
                    disabled={currentStoryIndex === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextStory();
                    }}
                  >
                    {currentStoryIndex === stories.length - 1 ? 'Fechar' : 'Próximo'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}