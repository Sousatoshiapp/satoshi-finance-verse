import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleRoyaleReal } from '@/hooks/useBattleRoyaleReal';
import { LobbyPhase } from './LobbyPhase';
import { CountdownPhase } from './CountdownPhase';
import { QuestionPhase } from './QuestionPhase';
import { ResultsPhase } from './ResultsPhase';
import { EliminationPhase } from './EliminationPhase';
import { VictoryScreen } from './VictoryScreen';
import { PlayersGrid } from './PlayersGrid';
import { ScoreBoard } from './ScoreBoard';
import { RoundProgress } from './RoundProgress';

interface BattleRoyaleArenaProps {
  sessionId?: string;
  mode: 'solo' | 'squad' | 'chaos';
  topic: string;
  difficulty: string;
}

export function BattleRoyaleArena({ sessionId, mode, topic, difficulty }: BattleRoyaleArenaProps) {
  const battleRoyale = useBattleRoyaleReal();

  useEffect(() => {
    if (sessionId) {
      battleRoyale.joinSession(sessionId);
    } else {
      // Create new session
      battleRoyale.createSession({
        mode,
        topic,
        difficulty,
        entry_fee_amount: 10,
        max_players: mode === 'solo' ? 100 : mode === 'squad' ? 50 : 80
      });
    }
  }, [sessionId, mode, topic, difficulty]);

  if (battleRoyale.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/20 to-warning/20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (battleRoyale.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/20 to-warning/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Erro na Batalha</h2>
          <p className="text-muted-foreground">{battleRoyale.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-sm relative overflow-hidden">
      {/* Battle Arena UI */}
      <div className="relative z-10">
        {/* Top UI - Session Info */}
        {battleRoyale.session && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 casino-card border-purple-500/30 mx-3 mb-3"
          >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-primary ml-1">{battleRoyale.session.session_code}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Modo:</span>
                  <span className="font-semibold ml-1 capitalize">{battleRoyale.session.mode}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Tópico:</span>
                  <span className="font-semibold ml-1">{battleRoyale.session.topic}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-center">
                  <div className="text-lg font-bold text-primary">{battleRoyale.participants.filter(p => p.is_alive).length}</div>
                  <div className="text-[10px] text-muted-foreground">Vivos</div>
                </div>
                
                {battleRoyale.session.status === 'active' && (
                  <RoundProgress 
                    currentRound={battleRoyale.session.current_round}
                    totalRounds={battleRoyale.session.total_rounds}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Game Area */}
        <div className="max-w-4xl mx-auto p-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Left Sidebar - Players Grid */}
            <div className="lg:col-span-1">
              <PlayersGrid 
                participants={battleRoyale.participants}
                myParticipantId={battleRoyale.myParticipant?.id}
                mode={battleRoyale.session?.mode || 'solo'}
              />
            </div>

            {/* Center - Main Game Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {battleRoyale.gamePhase === 'lobby' && (
                  <LobbyPhase
                    key="lobby"
                    session={battleRoyale.session}
                    participants={battleRoyale.participants}
                    onStartGame={() => {}}
                  />
                )}

                {battleRoyale.gamePhase === 'countdown' && (
                  <CountdownPhase
                    key="countdown"
                    onCountdownComplete={() => {}}
                  />
                )}

                {battleRoyale.gamePhase === 'question' && battleRoyale.currentQuestion && (
                  <QuestionPhase
                    key={`question-${battleRoyale.session?.current_round}`}
                    question={battleRoyale.currentQuestion}
                    timeRemaining={battleRoyale.timeRemaining}
                    onAnswer={battleRoyale.submitAnswer}
                    round={battleRoyale.session?.current_round || 1}
                  />
                )}

                {battleRoyale.gamePhase === 'results' && battleRoyale.lastAnswerResult && (
                  <ResultsPhase
                    key={`results-${battleRoyale.session?.current_round}`}
                    result={battleRoyale.lastAnswerResult}
                    myScore={battleRoyale.myParticipant?.total_score || 0}
                    onContinue={() => {}}
                  />
                )}

                {battleRoyale.gamePhase === 'elimination' && (
                  <EliminationPhase
                    key={`elimination-${battleRoyale.session?.current_round}`}
                    eliminatedParticipants={[]} // Will be updated when elimination data is available
                    survivingCount={battleRoyale.participants.filter(p => p.is_alive).length}
                    onContinue={() => {}}
                  />
                )}

                {battleRoyale.gamePhase === 'finished' && (
                  <VictoryScreen
                    key="victory"
                    finalRankings={battleRoyale.participants}
                    myParticipant={battleRoyale.myParticipant}
                    prizePool={battleRoyale.session?.prize_pool || 0}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Right Sidebar - Scoreboard */}
            <div className="lg:col-span-1">
              <ScoreBoard 
                participants={battleRoyale.participants}
                myParticipantId={battleRoyale.myParticipant?.id}
                isLive={battleRoyale.session?.status === 'active'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}