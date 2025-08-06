import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { motion, AnimatePresence } from "framer-motion";
import { TargetIcon, IconSystem, UserIcon } from "@/components/icons/icon-system";
import { useI18n } from "@/hooks/use-i18n";
import { useNavigate } from "react-router-dom";


interface MatchmakingWheelProps {
  isSearching: boolean;
  onMatchFound: (opponent: any) => void;
  onCancel: () => void;
  topic: string;
}

interface ArenaUser {
  id: string;
  nickname: string;
  level: number;
  avatar_id?: string;
  is_bot: boolean;
  is_online: boolean;
  profile_image_url?: string;
}

export function MatchmakingWheel({ isSearching, onMatchFound, onCancel, topic }: MatchmakingWheelProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [arenaUsers, setArenaUsers] = useState<ArenaUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTime, setSearchTime] = useState(30);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<ArenaUser | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(80);
  const [isSlowingDown, setIsSlowingDown] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);

  // Fallback bots for when no arena users are available
  const fallbackBots: ArenaUser[] = [
    { id: 'bot-1', nickname: 'Amanda Nascimento', level: 19, is_bot: true, is_online: true },
    { id: 'bot-2', nickname: 'Bruno Dias', level: 22, is_bot: true, is_online: true },
    { id: 'bot-3', nickname: 'Victor Hugo', level: 15, is_bot: true, is_online: true },
    { id: 'bot-4', nickname: 'Rafael Souza', level: 12, is_bot: true, is_online: true },
    { id: 'bot-5', nickname: 'Mariana Santos', level: 21, is_bot: true, is_online: true },
    { id: 'bot-6', nickname: 'Beatriz Carvalho', level: 18, is_bot: true, is_online: true },
    { id: 'bot-7', nickname: 'Otavio Borges', level: 27, is_bot: true, is_online: true },
  ];

  useEffect(() => {
    loadArenaUsers();
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

    // Dynamic roulette animation for the wheel
    let interval: NodeJS.Timeout;
    const updateInterval = () => {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.max(arenaUsers.length, 1));
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
        
        // Adjust animation speed based on time remaining - wheel slows down gradually
        if (newTime > 25) {
          setAnimationSpeed(80);
        } else if (newTime > 15) {
          setAnimationSpeed(120);
        } else if (newTime > 10) {
          setAnimationSpeed(180);
        } else if (newTime > 5) {
          setAnimationSpeed(250);
        } else if (newTime > 0) {
          setAnimationSpeed(400);
        }
        
        if (newTime <= 0) {
          clearInterval(interval);
          // Check if we have any valid opponents in the arena
          if (arenaUsers.length > 0) {
            setIsMatched(true);
            const randomOpponent = arenaUsers[Math.floor(Math.random() * arenaUsers.length)];
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
  }, [isSearching, arenaUsers, animationSpeed, isSlowingDown, onMatchFound]);

  const loadArenaUsers = async () => {
    try {
      // Get arena users using our new RPC function
      const { data: users, error } = await supabase.rpc('get_arena_users');
      
      if (error) throw error;

      let arenaList: ArenaUser[] = [];
      
      if (users && users.length > 0) {
        arenaList = users.map(user => ({
          id: user.id,
          nickname: user.nickname || 'User',
          level: user.level || 1,
          avatar_id: user.avatar_id,
          is_bot: user.is_bot,
          is_online: user.is_online,
          profile_image_url: user.profile_image_url
        }));
      }

      // Always ensure we have at least 8 users for a good wheel experience
      if (arenaList.length < 8) {
        const remainingSlots = 8 - arenaList.length;
        const additionalBots = fallbackBots
          .filter(bot => !arenaList.find(user => user.nickname === bot.nickname))
          .slice(0, remainingSlots);
        arenaList = [...arenaList, ...additionalBots];
      }

      setArenaUsers(arenaList);
    } catch (error) {
      console.error('Error loading arena users:', error);
      // Use fallback bots if database fails
      setArenaUsers(fallbackBots);
    }
  };

  const handleTryAgain = () => {
    setNoMatchFound(false);
    setSearchTime(30);
    setIsMatched(false);
    setMatchedOpponent(null);
    setAnimationSpeed(80);
    setIsSlowingDown(false);
    loadArenaUsers();
    // Don't restart search automatically - let parent component handle this
  };

  const handleUserClick = (user: ArenaUser) => {
    navigate(`/profile/${user.id}`);
  };

  if (!isSearching) return null;

  const currentHighlighted = arenaUsers[currentIndex] || fallbackBots[0];

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
          className="bg-background border border-border rounded-2xl p-4 md:p-6 max-w-2xl w-full mx-auto text-center space-y-6"
        >
          {/* Header with Arena Count */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserIcon className="w-6 h-6 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {t('duels.matchmaking.arenaUsers')}: {arenaUsers.length}
            </h2>
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
                <AvatarDisplayUniversal
                  avatarName={matchedOpponent.avatar_id}
                  profileImageUrl={matchedOpponent.profile_image_url}
                  nickname={matchedOpponent.nickname}
                  size="lg"
                  className="w-full h-full"
                />
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
            /* Searching State with Wheel */
            <motion.div className="space-y-6">
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                {t('duels.matchmaking.searchingFor')} {topic}
              </h3>
              
              {/* Arena Users Wheel */}
              <div className="relative">
                {/* Central Timer */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-background border border-border rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shadow-lg">
                    <span className={`text-xl md:text-2xl font-bold ${
                      isSlowingDown ? 'text-yellow-400' : 'text-primary'
                    }`}>
                      {searchTime}
                    </span>
                  </div>
                </div>

                {/* User Cards in Circle */}
                <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
                  {arenaUsers.slice(0, 8).map((user, index) => {
                    const angle = (index * 360) / 8;
                    const radius = 140; // Distance from center
                    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                    const isHighlighted = index === currentIndex;
                    
                    return (
                      <motion.div
                        key={`${user.id}-${index}`}
                        className={`absolute w-16 h-16 md:w-20 md:h-20 cursor-pointer transition-all duration-300 ${
                          isHighlighted 
                            ? 'scale-125 z-20 ring-4 ring-primary ring-opacity-60' 
                            : 'scale-100 z-10 hover:scale-110'
                        }`}
                        style={{
                          left: `calc(50% + ${x}px - 2rem)`,
                          top: `calc(50% + ${y}px - 2rem)`,
                        }}
                        onClick={() => handleUserClick(user)}
                        animate={{
                          rotate: isHighlighted ? 360 : 0,
                        }}
                        transition={{ 
                          duration: isHighlighted ? 0.6 : 0.3,
                          ease: "easeInOut"
                        }}
                      >
                        <div className={`w-full h-full rounded-full border-2 overflow-hidden ${
                          isHighlighted 
                            ? 'border-primary shadow-lg shadow-primary/50' 
                            : user.is_online 
                              ? 'border-green-400' 
                              : 'border-muted'
                        }`}>
                          <AvatarDisplayUniversal
                            avatarName={user.avatar_id}
                            profileImageUrl={user.profile_image_url}
                            nickname={user.nickname}
                            size="md"
                            className="w-full h-full"
                          />
                        </div>
                        {/* Online Status Indicator */}
                        {user.is_online && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background"></div>
                        )}
                        {/* Level Badge */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-6 text-center">
                          {user.level}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Highlighted User Info */}
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-lg font-semibold text-foreground">
                  {currentHighlighted?.nickname || 'Loading...'}
                  {isSlowingDown && <span className="text-yellow-400 ml-2">🎯</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('common.level')} {currentHighlighted?.level || 1}
                  {currentHighlighted?.is_online && (
                    <span className="text-green-400 ml-2">● {t('common.online')}</span>
                  )}
                </p>
              </motion.div>

              <div className="text-sm text-muted-foreground">
                <span className={isSlowingDown ? 'text-yellow-400 font-semibold' : ''}>
                  {t('duels.matchmaking.timeRemaining')}: {searchTime}s / 30s
                </span>
                {isSlowingDown && (
                  <div className="text-yellow-400 text-xs animate-pulse mt-1">
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