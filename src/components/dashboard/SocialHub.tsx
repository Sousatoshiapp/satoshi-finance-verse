import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Card, CardContent } from '@/components/shared/ui/card';
import { 
  Zap, 
  Users, 
  Sparkles
} from 'lucide-react';
import { 
  LazyAchievementStories,
  LazyRecentWinsFeed
} from './SocialHubSections';
import { useIsMobile } from '@/hooks/use-mobile';
import { useI18n } from '@/hooks/use-i18n';
import { usePrivacySafePresence } from '@/hooks/use-privacy-safe-presence';

interface SocialHubProps {
  className?: string;
}

export const SocialHub = memo(({ className }: SocialHubProps) => {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('stories');
  const { presenceData, loading } = usePrivacySafePresence();

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


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative ${className}`}
    >
      {/* Social Hub Header */}
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
          
          {/* Community stats */}
          <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {loading ? (
                  <span className="animate-pulse">... online</span>
                ) : (
                  `${presenceData.totalOnlineUsers.toLocaleString()} online`
                )}
              </span>
            </div>
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
        <TabsList className={`grid w-full grid-cols-2 mb-6 bg-muted/50 backdrop-blur-sm ${isMobile ? 'h-12' : 'h-14'}`}>
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