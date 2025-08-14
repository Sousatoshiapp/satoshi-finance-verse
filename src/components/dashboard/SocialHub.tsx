import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Card, CardContent } from '@/components/shared/ui/card';
import { 
  Trophy, 
  Zap, 
  Users, 
  Sword,
  Sparkles,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { 
  LazyAchievementStories,
  LazyBattleRoyaleMode,
  LazyRecentWinsFeed,
  LazyWeeklyTournament
} from './SocialHubSections';
import { useIsMobile } from '@/hooks/use-mobile';
import { useI18n } from '@/hooks/use-i18n';

interface SocialHubProps {
  className?: string;
}

export const SocialHub = memo(({ className }: SocialHubProps) => {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('stories');
  const [interactions, setInteractions] = useState({
    likes: 0,
    comments: 0,
    shares: 0
  });

  // Gen Z micro-interactions
  const handleInteraction = (type: 'like' | 'comment' | 'share') => {
    setInteractions(prev => ({
      ...prev,
      [type === 'like' ? 'likes' : type === 'comment' ? 'comments' : 'shares']: 
        prev[type === 'like' ? 'likes' : type === 'comment' ? 'comments' : 'shares'] + 1
    }));
    
    // Haptic feedback for mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative ${className}`}
    >
      {/* Gen Z Header with Sparkle Effect */}
      <div className="relative mb-6">
        <motion.div 
          className="flex items-center gap-3 mb-4"
          whileHover={{ x: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
          <h2 className={`font-bold text-gradient ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Social Hub
          </h2>
          
          {/* Live interaction indicators */}
          <div className="flex items-center gap-3 ml-auto">
            <motion.button
              variants={iconVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleInteraction('like')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart className="w-4 h-4" />
              {interactions.likes}
            </motion.button>
            <motion.button
              variants={iconVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleInteraction('comment')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {interactions.comments}
            </motion.button>
            <motion.button
              variants={iconVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleInteraction('share')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {interactions.shares}
            </motion.button>
          </div>
        </motion.div>
        
        {/* Animated underline */}
        <motion.div 
          className="h-0.5 bg-gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>

      {/* Social Tabs with Gen Z Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-4 mb-6 bg-muted/50 backdrop-blur-sm ${isMobile ? 'h-12' : 'h-14'}`}>
          <TabsTrigger 
            value="stories" 
            className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}
          >
            <motion.div
              animate={activeTab === 'stories' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </motion.div>
            {!isMobile && <span>Stories</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="feed" 
            className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}
          >
            <motion.div
              animate={activeTab === 'feed' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </motion.div>
            {!isMobile && <span>Wins</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="battle" 
            className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}
          >
            <motion.div
              animate={activeTab === 'battle' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Sword className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </motion.div>
            {!isMobile && <span>Battle</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="tournaments" 
            className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}
          >
            <motion.div
              animate={activeTab === 'tournaments' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Trophy className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </motion.div>
            {!isMobile && <span>Tournaments</span>}
          </TabsTrigger>
        </TabsList>

        {/* Animated Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="stories" className="mt-0">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/30 backdrop-blur-sm">
                <CardContent className="p-0">
                  <LazyAchievementStories />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feed" className="mt-0">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/30 backdrop-blur-sm">
                <CardContent className="p-0">
                  <LazyRecentWinsFeed />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="battle" className="mt-0">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/30 backdrop-blur-sm">
                <CardContent className="p-0">
                  <LazyBattleRoyaleMode />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments" className="mt-0">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/30 backdrop-blur-sm">
                <CardContent className="p-0">
                  <LazyWeeklyTournament />
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Floating particles for Gen Z effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4,
              delay: i * 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: `${80}%`
            }}
          />
        ))}
      </div>
    </motion.div>
  );
});

SocialHub.displayName = 'SocialHub';