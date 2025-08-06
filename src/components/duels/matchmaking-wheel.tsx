import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { motion, AnimatePresence } from "framer-motion";
import { TargetIcon, IconSystem } from "@/components/icons/icon-system";
import { useI18n } from "@/hooks/use-i18n";

interface MatchmakingWheelProps {
  isSearching: boolean;
  onMatchFound: (opponent: any) => void;
  onCancel: () => void;
  topic: string;
}

export function MatchmakingWheel({ isSearching, onMatchFound, onCancel, topic }: MatchmakingWheelProps) {
  const { t } = useI18n();
  const [potentialOpponents, setPotentialOpponents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null);
  const [animationSpeed, setAnimationSpeed] = useState(50); // Dynamic speed
  const [isSlowingDown, setIsSlowingDown] = useState(false);

  useEffect(() => {
    loadPotentialOpponents();
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setSearchTime(0);
      setIsMatched(false);
      setMatchedOpponent(null);
      setAnimationSpeed(50);
      setIsSlowingDown(false);
      return;
    }

    // Dynamic roulette animation with acceleration/deceleration
    let interval: NodeJS.Timeout;
    const updateInterval = () => {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % potentialOpponents.length);
      }, animationSpeed);
    };
    updateInterval();

    // Timer for search - 30 seconds with dynamic animation
    const timer = setInterval(() => {
      setSearchTime(prev => {
        const newTime = prev + 1;
        
        // Start slowing down in the last 5 seconds
        if (newTime >= 25 && !isSlowingDown) {
          setIsSlowingDown(true);
        }
        
        // Adjust animation speed based on time
        if (newTime < 5) {
          // Fast in the beginning
          setAnimationSpeed(50);
        } else if (newTime < 20) {
          // Medium speed
          setAnimationSpeed(100);
        } else if (newTime < 25) {
          // Slightly slower
          setAnimationSpeed(150);
        } else {
          // Very slow at the end (dramatic effect)
          setAnimationSpeed(300);
        }
        
        if (newTime >= 30) { // Match found after 30 seconds
          setIsMatched(true);
          // Pick a random opponent for variety
          const randomOpponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
          setMatchedOpponent(randomOpponent);
          clearInterval(interval);
          setTimeout(() => {
            onMatchFound(randomOpponent);
          }, 2000); // Give time to see the match
          return newTime;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isSearching, potentialOpponents, animationSpeed, isSlowingDown, onMatchFound]);

  const loadPotentialOpponents = async () => {
    try {
      // Get a diverse set of opponents with variety in levels and avatars
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, avatar_id, is_bot,
          avatars (name, image_url, avatar_class)
        `)
        .eq('is_bot', true)
        .order('RANDOM()')
        .limit(50); // More opponents for better variety

      if (profiles && profiles.length > 0) {
        // Ensure we have a good mix by shuffling multiple times
        const shuffled = [...profiles]
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5);
        setPotentialOpponents(shuffled);
      } else {
        // Enhanced fallback with more diverse bots
        setPotentialOpponents([
          { id: '1', nickname: 'Rafael Souza', level: 15, avatars: { name: 'Trader Bot', image_url: null } },
          { id: '2', nickname: 'Carla Lima', level: 22, avatars: { name: 'Finance Pro', image_url: null } },
          { id: '3', nickname: 'Bruno Dias', level: 18, avatars: { name: 'Crypto Master', image_url: null } },
          { id: '4', nickname: 'Patricia Ramos', level: 8, avatars: { name: 'Beginner', image_url: null } },
          { id: '5', nickname: 'Sabrina Campos', level: 25, avatars: { name: 'Expert', image_url: null } },
          { id: '6', nickname: 'Vinicius Lopes', level: 12, avatars: { name: 'Intermediate', image_url: null } },
          { id: '7', nickname: 'Eduardo Barros', level: 30, avatars: { name: 'Master', image_url: null } },
          { id: '8', nickname: 'Fernanda Ribeiro', level: 7, avatars: { name: 'Novice', image_url: null } },
          { id: '9', nickname: 'Pedro Costa', level: 20, avatars: { name: 'Advanced', image_url: null } },
          { id: '10', nickname: 'Leticia Barbosa', level: 16, avatars: { name: 'Professional', image_url: null } },
          { id: '11', nickname: 'Gustavo Freitas', level: 28, avatars: { name: 'Veteran', image_url: null } },
          { id: '12', nickname: 'Larissa Duarte', level: 11, avatars: { name: 'Student', image_url: null } },
        ]);
      }
    } catch (error) {
      console.error('Error loading opponents:', error);
      // Enhanced fallback with more diverse bots
      setPotentialOpponents([
        { id: '1', nickname: 'Rafael Souza', level: 15, avatars: { name: 'Trader Bot', image_url: null } },
        { id: '2', nickname: 'Carla Lima', level: 22, avatars: { name: 'Finance Pro', image_url: null } },
        { id: '3', nickname: 'Bruno Dias', level: 18, avatars: { name: 'Crypto Master', image_url: null } },
        { id: '4', nickname: 'Patricia Ramos', level: 8, avatars: { name: 'Beginner', image_url: null } },
        { id: '5', nickname: 'Sabrina Campos', level: 25, avatars: { name: 'Expert', image_url: null } },
        { id: '6', nickname: 'Vinicius Lopes', level: 12, avatars: { name: 'Intermediate', image_url: null } },
        { id: '7', nickname: 'Eduardo Barros', level: 30, avatars: { name: 'Master', image_url: null } },
        { id: '8', nickname: 'Fernanda Ribeiro', level: 7, avatars: { name: 'Novice', image_url: null } },
        { id: '9', nickname: 'Pedro Costa', level: 20, avatars: { name: 'Advanced', image_url: null } },
        { id: '10', nickname: 'Leticia Barbosa', level: 16, avatars: { name: 'Professional', image_url: null } },
        { id: '11', nickname: 'Gustavo Freitas', level: 28, avatars: { name: 'Veteran', image_url: null } },
        { id: '12', nickname: 'Larissa Duarte', level: 11, avatars: { name: 'Student', image_url: null } },
      ]);
    }
  };

  const currentOpponent = potentialOpponents[currentIndex];
  const progress = (searchTime / 30) * 100; // Updated for 30 second search

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
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    rotateY: isSlowingDown ? [0, 10, -10, 0] : 0
                  }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ 
                    duration: animationSpeed / 1000,
                    rotateY: { duration: 0.5, ease: "easeInOut" }
                  }}
                  className="relative"
                >
                  <AvatarDisplayUniversal
                    avatarName={currentOpponent.avatars?.name}
                    avatarUrl={currentOpponent.avatars?.image_url}
                    nickname={currentOpponent.nickname}
                    size="xl"
                    className={`border-4 rounded-full bg-background transition-all duration-300 ${
                      isSlowingDown 
                        ? 'border-yellow-400/60 shadow-lg shadow-yellow-400/30' 
                        : 'border-primary/20'
                    }`}
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
                {currentOpponent?.nickname || t('common.loading') + "..."} 
                {isSlowingDown && <span className="text-yellow-400 ml-2">🎯</span>}
              </p>
              <div className="text-sm text-muted-foreground">
                <span className={isSlowingDown ? 'text-yellow-400 font-semibold' : ''}>
                  Tempo: {searchTime}s / 30s
                </span>
                {isSlowingDown && (
                  <div className="text-yellow-400 text-xs mt-1 animate-pulse">
                    Finalizando busca...
                  </div>
                )}
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
