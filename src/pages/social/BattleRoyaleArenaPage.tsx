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
            onClick={() => navigate('/battle-royale')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && 'Voltar'}
          </Button>
          
          <div className="text-center">
            <h1 className={`font-bold text-gradient ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Arena Battle Royale
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              Modo: {mode} • Tópico: {topic}
            </p>
          </div>
          
          <div className="w-16" /> {/* Spacer */}
        </div>
      </motion.div>

      {/* Arena */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4"
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