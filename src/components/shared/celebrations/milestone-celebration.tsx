import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfettiCelebration } from "../animations/confetti-celebration";

interface Reward {
  type: 'btz' | 'xp' | 'item';
  amount: number;
  description: string;
}

interface MilestoneCelebrationProps {
  milestone: {
    type: 'streak' | 'level' | 'achievement' | 'perfect_quiz';
    value: number;
    title: string;
    description: string;
    rewards: Reward[];
  };
  onComplete: () => void;
}

export function MilestoneCelebration({ milestone, onComplete }: MilestoneCelebrationProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);

    if ('vibrate' in navigator) {
      const patterns = {
        streak: [200, 100, 200, 100, 300],
        level: [400, 200, 400, 200, 600],
        achievement: [300, 100, 300, 100, 500],
        perfect_quiz: [200, 50, 200, 50, 200, 50, 400]
      };
      navigator.vibrate(patterns[milestone.type]);
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [milestone.type, onComplete]);

  const getTypeConfig = () => {
    switch (milestone.type) {
      case 'streak':
        return {
          icon: '🔥',
          gradient: 'from-orange-400 via-red-500 to-pink-500',
          confettiType: 'milestone' as const,
          confettiColors: ['#FF6B35', '#F7931E', '#FFD23F']
        };
      case 'level':
        return {
          icon: '⭐',
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          confettiType: 'levelup' as const,
          confettiColors: ['#FFD700', '#FFA500', '#FF6347']
        };
      case 'achievement':
        return {
          icon: '🏆',
          gradient: 'from-purple-400 via-pink-500 to-red-500',
          confettiType: 'achievement' as const,
          confettiColors: ['#9333EA', '#E879F9', '#F59E0B']
        };
      case 'perfect_quiz':
        return {
          icon: '💯',
          gradient: 'from-green-400 via-blue-500 to-purple-600',
          confettiType: 'perfect' as const,
          confettiColors: ['#10B981', '#3B82F6', '#8B5CF6']
        };
      default:
        return {
          icon: '✨',
          gradient: 'from-blue-400 to-purple-600',
          confettiType: 'milestone' as const,
          confettiColors: ['#3B82F6', '#8B5CF6']
        };
    }
  };

  const config = getTypeConfig();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  return (
    <>
      {/* Confetti Effect */}
      <ConfettiCelebration
        trigger={showConfetti}
        type={config.confettiType}
        intensity="high"
        colors={config.confettiColors}
        duration={4000}
      />

      {/* Modal Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Celebration Card */}
            <motion.div
              className="relative max-w-md w-full mx-4"
              initial={{ scale: 0.3, opacity: 0, y: 100 }}
              animate={{ 
                scale: [0.3, 1.1, 1], 
                opacity: 1, 
                y: 0,
                transition: {
                  scale: { times: [0, 0.7, 1], duration: 0.8 },
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }
              }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
            >
              <div className={`
                bg-gradient-to-br ${config.gradient}
                rounded-2xl shadow-2xl overflow-hidden
                border-4 border-white/30
              `}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      background: [
                        'radial-gradient(circle at 20% 50%, white 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 20%, white 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 80%, white 0%, transparent 50%)',
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative p-8 text-center text-white">
                  {/* Icon */}
                  <motion.div
                    className="text-8xl mb-4"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {config.icon}
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="text-3xl font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {milestone.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    className="text-lg opacity-90 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {milestone.description}
                  </motion.p>

                  {/* Rewards */}
                  {milestone.rewards.length > 0 && (
                    <motion.div
                      className="space-y-2 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="text-sm font-semibold opacity-80 mb-3">
                        {t('common.rewards')}:
                      </h3>
                      {milestone.rewards.map((reward, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + (index * 0.1) }}
                        >
                          <span className="font-bold">
                            +{reward.amount} {reward.type.toUpperCase()}
                          </span>
                          <span className="opacity-75">
                            {reward.description}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Continue Button */}
                  <motion.button
                    onClick={handleClose}
                    className="
                      px-8 py-3 bg-white/20 hover:bg-white/30
                      rounded-full font-bold text-lg
                      border-2 border-white/30 hover:border-white/50
                      transition-all duration-200
                      backdrop-blur-sm
                    "
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('common.continue')}
                  </motion.button>
                </div>

                {/* Sparkle Effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${20 + (i * 12)}%`,
                      top: `${10 + (i % 2) * 80}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MilestoneCelebrationContainer() {
  const [activeCelebrations, setActiveCelebrations] = useState<Array<{
    id: string;
    milestone: MilestoneCelebrationProps['milestone'];
  }>>([]);

  useEffect(() => {
    const handleShowMilestoneCelebration = (event: CustomEvent) => {
      const { milestone } = event.detail;
      const id = Math.random().toString(36).substr(2, 9);
      
      setActiveCelebrations(prev => [...prev, { id, milestone }]);
    };

    window.addEventListener('showMilestoneCelebration', handleShowMilestoneCelebration as EventListener);
    
    return () => {
      window.removeEventListener('showMilestoneCelebration', handleShowMilestoneCelebration as EventListener);
    };
  }, []);

  const handleComplete = (id: string) => {
    setActiveCelebrations(prev => prev.filter(item => item.id !== id));
  };

  return (
    <>
      {activeCelebrations.map(({ id, milestone }) => (
        <MilestoneCelebration
          key={id}
          milestone={milestone}
          onComplete={() => handleComplete(id)}
        />
      ))}
    </>
  );
}
