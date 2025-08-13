import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar';
import { Badge } from '@/components/shared/ui/badge';
import { Trophy, Zap, Star, Target, Award, Coins } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'achievement' | 'level_up' | 'streak' | 'quiz_completion' | 'btz_earned' | 'rank_change';
  user: {
    name: string;
    avatar?: string;
    level: number;
  };
  action: string;
  value?: number;
  timestamp: Date;
  district?: string;
}

interface SocialProofFeedProps {
  maxItems?: number;
  autoRefresh?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  compact?: boolean;
}

const ACTIVITY_ICONS = {
  achievement: Award,
  level_up: Star,
  streak: Zap,
  quiz_completion: Target,
  btz_earned: Coins,
  rank_change: Trophy
};

const ACTIVITY_COLORS = {
  achievement: 'from-yellow-500 to-orange-500',
  level_up: 'from-purple-500 to-pink-500',
  streak: 'from-blue-500 to-cyan-500',
  quiz_completion: 'from-green-500 to-emerald-500',
  btz_earned: 'from-amber-500 to-yellow-500',
  rank_change: 'from-red-500 to-pink-500'
};

// Mock data generator for demonstration
const generateMockActivity = (): ActivityItem => {
  const types: ActivityItem['type'][] = ['achievement', 'level_up', 'streak', 'quiz_completion', 'btz_earned', 'rank_change'];
  const names = ['Alex', 'Maria', 'João', 'Ana', 'Pedro', 'Carla', 'Rafael', 'Julia', 'Lucas', 'Beatriz'];
  const districts = ['Crypto District', 'Finance District', 'Education District'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  
  const actions = {
    achievement: [`unlocked "${['First Steps', 'Quiz Master', 'Streak Warrior', 'BTZ Millionaire'][Math.floor(Math.random() * 4)]}"`, 'earned a rare badge', 'completed a challenge'],
    level_up: [`reached level ${Math.floor(Math.random() * 20) + 5}`, 'leveled up', 'advanced to next tier'],
    streak: [`reached ${Math.floor(Math.random() * 30) + 5} day streak`, 'maintained streak', 'extended learning streak'],
    quiz_completion: [`completed ${district} quiz`, 'aced a perfect quiz', 'finished advanced quiz'],
    btz_earned: [`earned ${Math.floor(Math.random() * 500) + 100} BTZ`, 'hit daily BTZ limit', 'earned bonus BTZ'],
    rank_change: [`climbed to rank #${Math.floor(Math.random() * 100) + 1}`, 'entered top 50', 'reached new rank']
  };
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    user: {
      name,
      level: Math.floor(Math.random() * 50) + 1
    },
    action: actions[type][Math.floor(Math.random() * actions[type].length)],
    value: type === 'btz_earned' ? Math.floor(Math.random() * 500) + 100 : undefined,
    timestamp: new Date(),
    district: type === 'quiz_completion' ? district : undefined
  };
};

export function SocialProofFeed({ 
  maxItems = 5, 
  autoRefresh = true, 
  position = 'top-right',
  compact = false 
}: SocialProofFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initial load
    const initialActivities = Array.from({ length: maxItems }, generateMockActivity);
    setActivities(initialActivities);

    if (!autoRefresh) return;

    // Auto-refresh interval
    const interval = setInterval(() => {
      const newActivity = generateMockActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, maxItems);
        return updated;
      });
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds

    return () => clearInterval(interval);
  }, [maxItems, autoRefresh]);

  const getPositionClasses = () => {
    const base = 'fixed z-50 max-w-sm';
    switch (position) {
      case 'top-right':
        return `${base} top-4 right-4`;
      case 'bottom-right':
        return `${base} bottom-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      case 'top-left':
        return `${base} top-4 left-4`;
      default:
        return `${base} top-4 right-4`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={getPositionClasses()}>
      <motion.div
        initial={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between p-2 bg-card/90 backdrop-blur-sm rounded-lg border"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live Activity</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            ×
          </button>
        </motion.div>

        {/* Activity List */}
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            const colorClass = ACTIVITY_COLORS[activity.type];
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ 
                  opacity: 1 - (index * 0.15), // Fade older items
                  y: 0, 
                  scale: 1 - (index * 0.02) // Slightly shrink older items
                }}
                exit={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
                transition={{ 
                  duration: 0.3,
                  ease: 'easeOut',
                  layout: { duration: 0.2 }
                }}
                layout
                className={`relative p-3 bg-card/80 backdrop-blur-sm rounded-lg border hover:bg-card/90 transition-all duration-200 ${
                  compact ? 'p-2' : ''
                }`}
                whileHover={{ 
                  scale: 1.02,
                  filter: 'brightness(1.1)'
                }}
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colorClass} opacity-20 -z-10`} />
                
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <Avatar className={compact ? 'w-6 h-6' : 'w-8 h-8'}>
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {activity.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
                      <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                        {activity.user.name}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        L{activity.user.level}
                      </Badge>
                    </div>
                    
                    <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} truncate`}>
                      {activity.action}
                    </p>
                    
                    {activity.district && (
                      <p className="text-xs text-muted-foreground/70">
                        in {activity.district}
                      </p>
                    )}
                  </div>
                  
                  {/* Value badge */}
                  {activity.value && (
                    <Badge 
                      variant="outline" 
                      className={`${compact ? 'text-xs px-1' : 'text-sm'} bg-gradient-to-r ${colorClass} text-white border-none`}
                    >
                      +{activity.value}
                    </Badge>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className="absolute top-1 right-1">
                  <span className="text-xs text-muted-foreground/50">
                    {Math.floor((Date.now() - activity.timestamp.getTime()) / 1000)}s
                  </span>
                </div>
                
                {/* Pulse effect for new items */}
                {index === 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary/50"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Footer */}
        <motion.div 
          className="text-center p-2 bg-card/60 backdrop-blur-sm rounded-lg border"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-xs text-muted-foreground">
            {activities.length} recent activities
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}