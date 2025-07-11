import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";
import { motion, AnimatePresence } from "framer-motion";
import { TargetIcon, IconSystem } from "@/components/icons/icon-system";

interface MatchmakingWheelProps {
  isSearching: boolean;
  onMatchFound: (opponent: any) => void;
  onCancel: () => void;
  topic: string;
}

export function MatchmakingWheel({ isSearching, onMatchFound, onCancel, topic }: MatchmakingWheelProps) {
  const [potentialOpponents, setPotentialOpponents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null);

  useEffect(() => {
    loadPotentialOpponents();
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setSearchTime(0);
      setIsMatched(false);
      setMatchedOpponent(null);
      return;
    }

    // Animate through opponents quickly - faster for better roulette effect
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % potentialOpponents.length);
    }, 80); // Faster animation for better roulette feel

    // Timer for search - shorter time for better UX
    const timer = setInterval(() => {
      setSearchTime(prev => {
        if (prev >= 5) { // Reduced to 5 seconds for faster matchmaking
          setIsMatched(true);
          // Pick a random opponent instead of current index for more variety
          const randomOpponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
          setMatchedOpponent(randomOpponent);
          clearInterval(interval);
          setTimeout(() => {
            onMatchFound(randomOpponent);
          }, 1500); // Slightly faster transition
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isSearching, potentialOpponents, currentIndex, onMatchFound]);

  const loadPotentialOpponents = async () => {
    try {
      // Get a diverse set of opponents, excluding recently used ones
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, avatar_id, is_bot,
          avatars (name, image_url, avatar_class)
        `)
        .eq('is_bot', true)
        .order('level', { ascending: false })
        .limit(50); // Get more opponents for better variety

      if (profiles) {
        // Shuffle the array to get random opponents each time
        const shuffled = [...profiles].sort(() => Math.random() - 0.5);
        setPotentialOpponents(shuffled);
      }
    } catch (error) {
      console.error('Error loading opponents:', error);
      // Fallback: create some default opponents if DB fails
      setPotentialOpponents([
        { id: '1', nickname: 'Bot Trader', level: 15, avatars: { name: 'Trader Bot', image_url: '/lovable-uploads/crypto-analyst.jpg' } },
        { id: '2', nickname: 'Finance Pro', level: 22, avatars: { name: 'Finance Pro', image_url: '/lovable-uploads/finance-hacker.jpg' } },
        { id: '3', nickname: 'Crypto Master', level: 18, avatars: { name: 'Crypto Master', image_url: '/lovable-uploads/defi-samurai.jpg' } },
      ]);
    }
  };

  const currentOpponent = potentialOpponents[currentIndex];
  const progress = (searchTime / 10) * 100;

  if (!isSearching) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
              className="opacity-20"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: `drop-shadow(0 0 20px hsl(var(--primary) / 0.5))`
              }}
            />
          </svg>
          
          {/* Avatar in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentOpponent && !isMatched && (
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="relative"
                >
                  <AvatarDisplayUniversal
                    avatarName={currentOpponent.avatars?.name}
                    avatarUrl={currentOpponent.avatars?.image_url}
                    nickname={currentOpponent.nickname}
                    size="xl"
                    className="border-4 border-primary/20 rounded-full bg-background"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                    {currentOpponent.level}
                  </div>
                </motion.div>
              )}
              
              {isMatched && matchedOpponent && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 360 }}
                  transition={{ duration: 1, type: "spring" }}
                  className="relative"
                >
                  <AvatarDisplayUniversal
                    avatarName={matchedOpponent.avatars?.name}
                    avatarUrl={matchedOpponent.avatars?.image_url}
                    nickname={matchedOpponent.nickname}
                    size="xl"
                    className="border-4 border-green-500 rounded-full bg-background shadow-lg shadow-green-500/50"
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-lg animate-pulse">
                    ✓ MATCH!
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {matchedOpponent.level}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-4">
          {!isMatched ? (
            <>
              <h2 className="text-2xl font-bold text-white">
                <span className="flex items-center gap-2">
                  <TargetIcon size="sm" animated variant="glow" /> Procurando Oponente...
                </span>
              </h2>
              <p className="text-muted-foreground">
                {currentOpponent?.nickname || "Carregando..."}
              </p>
              <div className="text-sm text-muted-foreground">
                Tempo: {searchTime}s
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-green-500">
                <span className="flex items-center gap-2">
                  <IconSystem emoji="🎉" size="lg" animated variant="glow" />
                  Oponente Encontrado!
                </span>
              </h2>
              <p className="text-white text-lg font-semibold">
                {matchedOpponent?.nickname}
              </p>
              <div className="text-sm text-green-400">
                Preparando duelo...
              </div>
            </>
          )}
        </div>

        {/* Cancel Button */}
        {!isMatched && (
          <button
            onClick={onCancel}
            className="mt-8 px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}