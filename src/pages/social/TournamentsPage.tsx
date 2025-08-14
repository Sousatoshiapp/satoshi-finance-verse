import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Clock, Users } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { WeeklyTournament } from '@/components/features/tournaments/WeeklyTournament';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useIsMobile } from '@/hooks/use-mobile';

export default function TournamentsPage() {
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
              rotateZ: [0, 5, -5, 0],
              y: [0, -2, 2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy className="w-6 h-6 text-warning" />
            <h1 className={`font-bold text-gradient ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Tournaments
            </h1>
          </motion.div>
          
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Tournament Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <motion.div 
            className="text-center p-3 bg-muted/50 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Clock className="w-5 h-5 text-info mx-auto mb-1" />
            <div className="text-sm font-semibold">Weekly</div>
            <div className="text-xs text-muted-foreground">7 days left</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-muted/50 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-sm font-semibold">1,234</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-muted/50 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trophy className="w-5 h-5 text-warning mx-auto mb-1" />
            <div className="text-sm font-semibold">10,000</div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center max-w-md mx-auto mb-8"
        >
          Compete in weekly tournaments! Climb the leaderboard and win amazing prizes. New tournaments start every Monday.
        </motion.p>
      </motion.div>

      {/* Full-screen Tournament Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4"
      >
        <WeeklyTournament />
      </motion.div>

      {/* Bottom Navigation */}
      <FloatingNavbar />
    </div>
  );
}