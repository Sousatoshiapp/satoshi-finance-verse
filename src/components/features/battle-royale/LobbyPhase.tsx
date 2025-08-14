import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Swords, Clock, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { BattleRoyaleSession, BattleRoyaleParticipant } from '@/hooks/useBattleRoyaleReal';

interface LobbyPhaseProps {
  session: BattleRoyaleSession | null;
  participants: BattleRoyaleParticipant[];
  onStartGame: () => void;
}

const LOBBY_TIMER_SECONDS = 60; // 60 seconds lobby timer

export function LobbyPhase({ session, participants, onStartGame }: LobbyPhaseProps) {
  if (!session) return null;

  const progress = (participants.length / session.max_players) * 100;
  const canStart = participants.length >= 2;
  const isCreator = true; // For now, assume user can start the game

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-6"
    >
      {/* Session Header */}
      <Card className="casino-card border-purple-500/30">
        <CardHeader className="text-center p-3">
          <CardTitle className="flex items-center justify-center gap-1 text-sm">
            <Swords className="w-4 h-4 text-destructive" />
            Arena de Batalha
            <Swords className="w-4 h-4 text-destructive" />
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Aguardando jogadores
          </p>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Jogadores</span>
              <span>{participants.length}/{session.max_players}</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Session Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="text-center p-2 casino-card border-purple-500/20">
              <Crown className="w-3 h-3 text-warning mx-auto mb-1" />
              <div className="font-semibold text-xs capitalize">{session.mode}</div>
              <div className="text-[10px] text-muted-foreground">Modo</div>
            </div>
            
            <div className="text-center p-2 casino-card border-purple-500/20">
              <Trophy className="w-3 h-3 text-primary mx-auto mb-1" />
              <div className="font-semibold text-xs">{session.prize_pool_calculated || session.prize_pool}</div>
              <div className="text-[10px] text-muted-foreground">BTZ</div>
            </div>
            
            <div className="text-center p-2 casino-card border-purple-500/20">
              <Clock className="w-3 h-3 text-info mx-auto mb-1" />
              <div className="font-semibold text-xs">{session.total_rounds}</div>
              <div className="text-[10px] text-muted-foreground">Rodadas</div>
            </div>
            
            <div className="text-center p-2 casino-card border-purple-500/20">
              <Users className="w-3 h-3 text-success mx-auto mb-1" />
              <div className="font-semibold text-xs">{session.difficulty}</div>
              <div className="text-[10px] text-muted-foreground">Dificuldade</div>
            </div>
          </div>

          {/* Topic */}
          <div className="text-center p-2 casino-card border-purple-500/20">
            <Badge variant="secondary" className="text-xs">
              {session.topic}
            </Badge>
          </div>

          {/* Start Button */}
          {isCreator && (
            <motion.div
              className="text-center"
              whileHover={{ scale: canStart ? 1.02 : 1 }}
              whileTap={{ scale: canStart ? 0.98 : 1 }}
            >
              <Button 
                size="sm" 
                className="casino-button px-4 py-2"
                disabled={!canStart}
                onClick={onStartGame}
              >
                {canStart ? (
                  <>
                    <Swords className="w-3 h-3 mr-1" />
                    Iniciar!
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    Aguardando...
                  </>
                )}
              </Button>
              {!canStart && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Mín. 2 jogadores
                </p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Waiting Animation */}
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-flex items-center gap-2 text-muted-foreground"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
          Preparando arena de batalha...
        </motion.div>
      </div>
    </motion.div>
  );
}