import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface ProgressBurstProps {
  fromValue: number;
  toValue: number;
  maxValue: number;
  type: 'xp' | 'level' | 'streak';
  animated: boolean;
  className?: string;
}

export function ProgressBurst({ 
  fromValue, 
  toValue, 
  maxValue, 
  type, 
  animated,
  className = ""
}: ProgressBurstProps) {
  const controls = useAnimation();
  const [currentValue, setCurrentValue] = useState(fromValue);
  const [showBurst, setShowBurst] = useState(false);

  const getTypeConfig = () => {
    switch (type) {
      case 'xp':
        return {
          color: '#9333EA',
          glowColor: '#C084FC',
          gradient: 'from-purple-500 to-pink-500'
        };
      case 'level':
        return {
          color: '#FFD700',
          glowColor: '#FFA500',
          gradient: 'from-yellow-400 to-orange-500'
        };
      case 'streak':
        return {
          color: '#32CD32',
          glowColor: '#90EE90',
          gradient: 'from-green-400 to-blue-500'
        };
      default:
        return {
          color: '#9333EA',
          glowColor: '#C084FC',
          gradient: 'from-purple-500 to-pink-500'
        };
    }
  };

  const config = getTypeConfig();
  const progressPercentage = Math.min((currentValue / maxValue) * 100, 100);
  const isLevelUp = toValue >= maxValue && type === 'xp';

  useEffect(() => {
    if (!animated) {
      setCurrentValue(toValue);
      return;
    }

    const animateProgress = async () => {
      if (toValue - fromValue >= maxValue * 0.1) {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 1000);
      }

      await controls.start({
        scaleX: [1, 1.05, 1],
        transition: { duration: 0.3 }
      });

      const duration = 1500;
      const steps = 60;
      const increment = (toValue - fromValue) / steps;
      
      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          const newValue = fromValue + (increment * i);
          setCurrentValue(Math.min(newValue, toValue));
        }, (duration / steps) * i);
      }

      if (isLevelUp) {
        setTimeout(() => {
          controls.start({
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            transition: { duration: 0.8 }
          });
        }, duration);
      }
    };

    animateProgress();
  }, [fromValue, toValue, maxValue, animated, controls, isLevelUp]);

  return (
    <div className={`relative ${className}`}>
      {/* Progress Bar Container */}
      <motion.div 
        className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        animate={controls}
      >
        {/* Background Glow Effect */}
        {showBurst && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${config.glowColor}40 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.8, 1.2, 1],
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}

        {/* Progress Fill */}
        <motion.div
          className={`h-full bg-gradient-to-r ${config.gradient} rounded-full relative overflow-hidden`}
          style={{ width: `${progressPercentage}%` }}
          initial={{ width: `${(fromValue / maxValue) * 100}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ width: '30%' }}
            animate={{
              x: ['-100%', '400%']
            }}
            transition={{
              duration: 2,
              repeat: showBurst ? 3 : 0,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Burst Particles */}
        {showBurst && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: config.color,
                  left: `${progressPercentage}%`,
                  top: '50%',
                }}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: [1, 0],
                  scale: [0, 1],
                  x: Math.cos((i * 45) * Math.PI / 180) * 30,
                  y: Math.sin((i * 45) * Math.PI / 180) * 30,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Progress Text */}
      <motion.div 
        className="flex justify-between items-center mt-2 text-sm"
        animate={isLevelUp ? {
          scale: [1, 1.1, 1],
          color: [config.color, config.glowColor, config.color]
        } : {}}
        transition={{ duration: 0.8 }}
      >
        <span className="text-gray-600 dark:text-gray-400">
          {Math.floor(currentValue)} / {maxValue}
        </span>
        <span 
          className="font-bold"
          style={{ color: config.color }}
        >
          {Math.floor(progressPercentage)}%
        </span>
      </motion.div>

      {/* Level Up Indicator */}
      {isLevelUp && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className={`
            px-3 py-1 rounded-full text-white text-xs font-bold
            bg-gradient-to-r ${config.gradient}
            border border-white/30
            shadow-lg
          `}>
            LEVEL UP!
          </div>
        </motion.div>
      )}
    </div>
  );
}
