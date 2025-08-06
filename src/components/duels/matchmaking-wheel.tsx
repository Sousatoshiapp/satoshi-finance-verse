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

interface LocalBot {
  id: string;
  nickname: string;
  level: number;
  avatar_id?: string;
  is_bot: boolean;
  profile_image_url?: string;
}

export function MatchmakingWheel({ isSearching, onMatchFound, onCancel, topic }: MatchmakingWheelProps) {
  const { t } = useI18n();
  const [potentialOpponents, setPotentialOpponents] = useState<LocalBot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTime, setSearchTime] = useState(30);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<LocalBot | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [isSlowingDown, setIsSlowingDown] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);

  // Fallback bots for when no real opponents are available
  const fallbackBots: LocalBot[] = [
    { id: 'bot-1', nickname: 'Amanda Nascimento', level: 19, is_bot: true },
    { id: 'bot-2', nickname: 'Bruno Dias', level: 22, is_bot: true },
    { id: 'bot-3', nickname: 'Victor Hugo', level: 9, is_bot: true },
    { id: 'bot-4', nickname: 'Rafael Souza', level: 9, is_bot: true },
    { id: 'bot-5', nickname: 'Mariana Santos', level: 21, is_bot: true },
    { id: 'bot-6', nickname: 'Beatriz Carvalho', level: 8, is_bot: true },
    { id: 'bot-7', nickname: 'Otavio Borges', level: 27, is_bot: true },
  ];

  useEffect(() => {
    loadPotentialOpponents();
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setSearchTime(30);
      setIsMatched(false);
      setMatchedOpponent(null);
      setAnimationSpeed(50);
      setIsSlowingDown(false);
      setNoMatchFound(false);
      return;
    }

    // Dynamic roulette animation
    let interval: NodeJS.Timeout;
    const updateInterval = () => {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % potentialOpponents.length);
      }, animationSpeed);
    };
    updateInterval();

    // Timer for search - counting down from 30 to 0
    const timer = setInterval(() => {
      setSearchTime(prev => {
        const newTime = prev - 1;
        
        // Start slowing down in the last 5 seconds
        if (newTime <= 5 && !isSlowingDown) {
          setIsSlowingDown(true);
        }
        
        // Adjust animation speed based on time remaining
        if (newTime > 25) {
          setAnimationSpeed(50);
        } else if (newTime > 10) {
          setAnimationSpeed(100);
        } else if (newTime > 5) {
          setAnimationSpeed(150);
        } else if (newTime > 0) {
          setAnimationSpeed(300);
        }
        
        if (newTime <= 0) {
          clearInterval(interval);
          // Check if we have any valid opponents
          if (potentialOpponents.length > 0) {
            setIsMatched(true);
            const randomOpponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
            setMatchedOpponent(randomOpponent);
            setTimeout(() => {
              onMatchFound(randomOpponent);
            }, 2000);
          } else {
            // No opponents found - show "no players" message
            setNoMatchFound(true);
          }
          return 0;
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
      // Try to get real opponents from database first
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, level, avatar_id, is_bot')
        .eq('is_bot', true)
        .limit(10);

      let opponents: LocalBot[] = [];
      
      if (profiles && profiles.length > 0) {
        opponents = profiles.map(profile => ({
          id: profile.id,
          nickname: profile.nickname || 'Bot Player',
          level: profile.level || 1,
          avatar_id: profile.avatar_id,
          is_bot: profile.is_bot,
          profile_image_url: null
        }));
      }

      // If we have fewer than 3 opponents, add fallback bots
      if (opponents.length < 3) {
        const remainingSlots = 7 - opponents.length;
        const additionalBots = fallbackBots
          .filter(bot => !opponents.find(op => op.nickname === bot.nickname))
          .slice(0, remainingSlots);
        opponents = [...opponents, ...additionalBots];
      }

      setPotentialOpponents(opponents);
    } catch (error) {
      console.error('Error loading opponents:', error);
      // Use fallback bots if database fails
      setPotentialOpponents(fallbackBots);
    }
  };

  const handleTryAgain = () => {
    setNoMatchFound(false);
    setSearchTime(30);
    setIsMatched(false);
    setMatchedOpponent(null);
    setAnimationSpeed(50);
    setIsSlowingDown(false);
    loadPotentialOpponents();
    // Don't restart search automatically - let parent component handle this
  };

  if (!isSearching) return null;

  const currentOpponent = potentialOpponents[currentIndex] || fallbackBots[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background border border-border rounded-2xl p-6 md:p-8 max-w-md w-full mx-auto text-center space-y-6"
        >
          {/* Timer and Progress Circle */}
          <div className="relative">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - searchTime / 30)}`}
                  className={`transition-all duration-1000 ${
                    isSlowingDown ? 'text-yellow-400' : 'text-primary'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl md:text-3xl font-bold ${
                  isSlowingDown ? 'text-yellow-400' : 'text-primary'
                }`}>
                  {searchTime}
                </span>
              </div>
            </div>
          </div>

          {/* Match Found State */}
          {isMatched && matchedOpponent ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-2xl font-bold text-green-400">
                {t('duels.matchmaking.matchFound')}
              </div>
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full border-4 border-green-400 overflow-hidden bg-green-400/20">
                 <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-2xl font-bold">
                   {matchedOpponent.nickname?.charAt(0) || '?'}
                 </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-green-400">
                  {matchedOpponent.nickname}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('common.level')} {matchedOpponent.level}
                </p>
              </div>
            </motion.div>
          ) : noMatchFound ? (
            /* No Match Found State */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-xl font-bold text-orange-400">
                {t('duels.matchmaking.noPlayersFound')}
              </div>
              <div className="space-y-3">
                 <button
                   onClick={handleTryAgain}
                   className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                 >
                   {t('duels.matchmaking.tryAgain')}
                 </button>
                 <button
                   onClick={onCancel}
                   className="w-full border border-border bg-background hover:bg-accent text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                 >
                   {t('duels.matchmaking.cancel')}
                 </button>
              </div>
            </motion.div>
          ) : (
            /* Searching State */
            <motion.div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {t('duels.matchmaking.searchingFor')} {topic}
              </h2>
              
              {/* Current Opponent Display */}
              <motion.div
                key={currentIndex}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full border-2 border-primary overflow-hidden">
                   <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-lg font-bold">
                     {currentOpponent?.nickname?.charAt(0) || '?'}
                   </div>
                </div>
                <div className="space-y-1">
                  <p className="text-base md:text-lg font-semibold text-foreground">
                    {currentOpponent?.nickname || 'Loading...'}
                    {isSlowingDown && <span className="text-yellow-400 ml-2">🎯</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('common.level')} {currentOpponent?.level || 1}
                  </p>
                </div>
              </motion.div>

              <div className="text-sm text-muted-foreground space-y-1">
                <span className={isSlowingDown ? 'text-yellow-400 font-semibold' : ''}>
                  {t('duels.matchmaking.timeRemaining')}: {searchTime}s / 30s
                </span>
                {isSlowingDown && (
                  <div className="text-yellow-400 text-xs animate-pulse">
                    {t('duels.matchmaking.finalizingSearch')}
                  </div>
                )}
              </div>

               <button
                 onClick={onCancel}
                 className="w-full mt-4 border border-border bg-background hover:bg-accent text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
               >
                 {t('duels.matchmaking.cancel')}
               </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}