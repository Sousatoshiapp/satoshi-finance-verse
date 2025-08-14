import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { BattleRoyaleArena } from '@/components/features/battle-royale/BattleRoyaleArena';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function BattleRoyaleArenaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const mode = (searchParams.get('mode') as 'solo' | 'squad' | 'chaos') || 'solo';
  const topic = searchParams.get('topic') || 'geral';
  const difficulty = searchParams.get('difficulty') || 'medio';
  const sessionId = searchParams.get('sessionId') || undefined;

  return (
    <div className="min-h-screen casino-futuristic">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`casino-card border-purple-500/30 ${isMobile ? 'px-3 pt-16 pb-4' : 'px-4 pt-6 pb-4'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/battle-royale')}
            className="casino-button flex items-center gap-1 p-2"
          >
            <ArrowLeft className="w-3 h-3" />
            {!isMobile && 'Voltar'}
          </Button>
          
          <div className="text-center">
            <h1 className={`font-bold text-gradient ${isMobile ? 'text-sm' : 'text-base'}`}>
              Arena Battle Royale
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {mode} • {topic}
            </p>
          </div>
          
          <div className="casino-button px-2 py-1">
            <span className="text-xs text-warning">1000 BTZ</span>
          </div>
        </div>
      </motion.div>

      {/* Arena */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="px-3"
      >
        <BattleRoyaleArena 
          sessionId={sessionId}
          mode={mode}
          topic={topic}
          difficulty={difficulty}
        />
      </motion.div>

      {/* Bottom Navigation */}
      <FloatingNavbar />
    </div>
  );
}