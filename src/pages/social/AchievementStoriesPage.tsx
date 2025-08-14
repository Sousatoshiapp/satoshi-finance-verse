import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { AchievementStories } from '@/components/features/stories/AchievementStories';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AchievementStoriesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isMobile ? 'px-4 pt-16 pb-6' : 'px-6 pt-8 pb-6'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && 'Back'}
          </Button>
          
          <motion.div 
            className="flex items-center gap-3"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className={`font-bold text-gradient ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Achievement Stories
            </h1>
          </motion.div>
          
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-center max-w-md mx-auto mb-8"
        >
          Share your victories and see what the community is achieving! Stories disappear after 24 hours.
        </motion.p>
      </motion.div>

      {/* Full-screen Stories Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4"
      >
        <AchievementStories />
      </motion.div>

      {/* Bottom Navigation */}
      <FloatingNavbar />
    </div>
  );
}