import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface FloatingNumbersProps {
  value: number;
  type: 'btz' | 'xp' | 'streak' | 'bonus';
  position: { x: number, y: number };
  duration?: number;
  multiplier?: number;
  levelUp?: boolean;
  timeRemaining?: number;
  onComplete?: () => void;
}

export function FloatingNumbers({ 
  value, 
  type, 
  position, 
  duration = 2000, 
  multiplier,
  levelUp,
  timeRemaining,
  onComplete 
}: FloatingNumbersProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const getTypeConfig = () => {
    switch (type) {
      case 'btz':
        return {
          color: '#FFD700',
          icon: '₿',
          label: t('feedback.animations.btzGained'),
          gradient: 'from-yellow-400 to-orange-500'
        };
      case 'xp':
        return {
          color: '#9333EA',
          icon: '⭐',
          label: levelUp ? t('feedback.animations.levelUp') : t('feedback.animations.xpGained'),
          gradient: 'from-purple-400 to-pink-500'
        };
      case 'streak':
        return {
          color: '#32CD32',
          icon: '🔥',
          label: t('feedback.animations.streakMilestone'),
          gradient: 'from-green-400 to-blue-500'
        };
      case 'bonus':
        return {
          color: '#00FF00',
          icon: '⚡',
          label: t('feedback.animations.timeBonus'),
          gradient: 'from-green-400 to-emerald-500'
        };
      default:
        return {
          color: '#FFD700',
          icon: '✨',
          label: '',
          gradient: 'from-yellow-400 to-orange-500'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.5, 
            x: position.x - 50, 
            y: position.y - 25 
          }}
          animate={{ 
            opacity: 1, 
            scale: [0.5, 1.2, 1], 
            x: position.x - 50, 
            y: position.y - 100 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: position.y - 150 
          }}
          transition={{ 
            duration: duration / 1000,
            ease: "easeOut",
            scale: { times: [0, 0.3, 1], duration: 0.5 }
          }}
          className="fixed pointer-events-none z-50"
          style={{ 
            left: 0, 
            top: 0,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
        >
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-gradient-to-r ${config.gradient}
            text-white font-bold text-lg
            border-2 border-white/30
            backdrop-blur-sm
          `}>
            <span className="text-2xl">{config.icon}</span>
            <div className="flex flex-col items-center">
              <span className="text-xl">
                +{value}
                {multiplier && multiplier > 1 && (
                  <span className="text-sm ml-1">×{multiplier}</span>
                )}
              </span>
              {config.label && (
                <span className="text-xs opacity-90">{config.label}</span>
              )}
              {timeRemaining && (
                <span className="text-xs opacity-75">
                  {timeRemaining}s bonus
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FloatingNumbersContainer() {
  const [activeNumbers, setActiveNumbers] = useState<Array<{
    id: string;
    props: FloatingNumbersProps;
  }>>([]);

  useEffect(() => {
    const handleShowFloatingNumber = (event: CustomEvent) => {
      const { value, type, position, multiplier, levelUp, timeRemaining } = event.detail;
      const id = Math.random().toString(36).substr(2, 9);
      
      setActiveNumbers(prev => [...prev, {
        id,
        props: {
          value,
          type,
          position,
          multiplier,
          levelUp,
          timeRemaining,
          onComplete: () => {
            setActiveNumbers(current => current.filter(item => item.id !== id));
          }
        }
      }]);
    };

    window.addEventListener('showFloatingNumber', handleShowFloatingNumber as EventListener);
    
    return () => {
      window.removeEventListener('showFloatingNumber', handleShowFloatingNumber as EventListener);
    };
  }, []);

  return (
    <>
      {activeNumbers.map(({ id, props }) => (
        <FloatingNumbers key={id} {...props} />
      ))}
    </>
  );
}
