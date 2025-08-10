import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/shared/ui/dialog';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { Clock, Search, X } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';

interface SearchCandidate {
  id: string;
  nickname: string;
  avatar_url?: string;
  level?: number;
  is_bot?: boolean;
}

interface RandomMatchSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: SearchCandidate[];
  onFoundOpponent?: (opponent: SearchCandidate) => void;
  searchDuration?: number; // in seconds, default 30
}

export function RandomMatchSearchModal({ 
  isOpen, 
  onClose, 
  candidates,
  onFoundOpponent,
  searchDuration = 30 
}: RandomMatchSearchModalProps) {
  const [searchState, setSearchState] = useState<'searching' | 'found' | 'timeout'>('searching');
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(searchDuration);
  const [foundOpponent, setFoundOpponent] = useState<SearchCandidate | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchState('searching');
      setCurrentCandidateIndex(0);
      setTimeRemaining(searchDuration);
      setFoundOpponent(null);
    }
  }, [isOpen, searchDuration]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || searchState !== 'searching') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setSearchState('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, searchState]);

  // Candidate cycling animation
  useEffect(() => {
    if (!isOpen || searchState !== 'searching' || candidates.length === 0) return;

    const cycleInterval = setInterval(() => {
      setCurrentCandidateIndex(prev => (prev + 1) % candidates.length);
    }, 200); // Change candidate every 200ms

    return () => clearInterval(cycleInterval);
  }, [isOpen, searchState, candidates.length]);

  // Simulate finding opponent (random between 3-8 seconds for better UX)
  useEffect(() => {
    if (!isOpen || searchState !== 'searching') return;

    const findTime = Math.random() * 5000 + 3000; // 3-8 seconds
    const findTimer = setTimeout(() => {
      if (candidates.length > 0 && searchState === 'searching') {
        const randomOpponent = candidates[Math.floor(Math.random() * candidates.length)];
        console.log('🎯 Random opponent found:', randomOpponent);
        setFoundOpponent(randomOpponent);
        setSearchState('found');
        
        // Call the callback with more complete data
        onFoundOpponent?.({
          ...randomOpponent,
          id: randomOpponent.id,
          nickname: randomOpponent.nickname
        });
        
        // Auto close after showing found opponent for 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, findTime);

    return () => clearTimeout(findTimer);
  }, [isOpen, searchState, candidates, onFoundOpponent, onClose]);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const currentCandidate = candidates[currentCandidateIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl p-0 [&>button]:hidden">
        <div className="relative flex flex-col items-center justify-center min-h-[400px] text-center p-8">

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
          >
            <X className="h-5 w-5" />
          </Button>
          {/* Search indicator */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Search className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-white text-lg font-medium">
              {searchState === 'searching' && 'Procurando oponente...'}
              {searchState === 'found' && 'Oponente encontrado!'}
              {searchState === 'timeout' && 'Nenhum oponente encontrado'}
            </span>
          </motion.div>

          {/* Main content area */}
          <AnimatePresence mode="wait">
            {searchState === 'searching' && currentCandidate && (
              <motion.div
                key={currentCandidate.id}
                className="flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Rotating ring animation */}
                <div className="relative mb-6">
                  <motion.div
                    className="w-32 h-32 border-4 border-primary/30 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 border-2 border-primary rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Avatar */}
                  <div className="absolute inset-4 flex items-center justify-center">
                    <AvatarDisplayUniversal
                      profileImageUrl={currentCandidate.avatar_url}
                      nickname={currentCandidate.nickname}
                      className="w-20 h-20 border-4 border-white shadow-lg"
                    />
                  </div>
                </div>

                {/* Candidate info */}
                <motion.div
                  className="text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-xl font-semibold mb-1">{currentCandidate.nickname}</p>
                  {currentCandidate.level && (
                    <p className="text-white/70">Nível {currentCandidate.level}</p>
                  )}
                  {currentCandidate.is_bot && (
                    <p className="text-primary text-sm mt-1">🤖 Bot</p>
                  )}
                </motion.div>
              </motion.div>
            )}

            {searchState === 'found' && foundOpponent && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div className="relative mb-6">
                  <motion.div
                    className="w-32 h-32 border-4 border-green-500 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                  />
                  
                  <div className="absolute inset-4 flex items-center justify-center">
                    <AvatarDisplayUniversal
                      profileImageUrl={foundOpponent.avatar_url}
                      nickname={foundOpponent.nickname}
                      className="w-20 h-20 border-4 border-green-500 shadow-lg"
                    />
                  </div>
                </div>

                <div className="text-white text-center">
                  <p className="text-2xl font-bold text-green-400 mb-2">🎉 Encontrado!</p>
                  <p className="text-xl font-semibold mb-1">{foundOpponent.nickname}</p>
                  {foundOpponent.level && (
                    <p className="text-white/70">Nível {foundOpponent.level}</p>
                  )}
                </div>
              </motion.div>
            )}

            {searchState === 'timeout' && (
              <motion.div
                className="flex flex-col items-center text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-32 h-32 border-4 border-red-500/50 rounded-full flex items-center justify-center mb-6">
                  <X className="h-12 w-12 text-red-500" />
                </div>
                
                <div className="text-center">
                  <p className="text-xl font-semibold text-red-400 mb-2">Oponente não encontrado</p>
                  <p className="text-white/70 mb-4">Tente mais tarde</p>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer */}
          {searchState === 'searching' && (
            <motion.div
              className="flex items-center gap-2 mt-8 text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Clock className="h-4 w-4" />
              <span className="text-sm">{formatTime(timeRemaining)}</span>
            </motion.div>
          )}

          {/* Scanning dots */}
          {searchState === 'searching' && (
            <motion.div
              className="flex gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}