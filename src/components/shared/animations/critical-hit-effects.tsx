import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CriticalHitEffect {
  id: string;
  type: 'critical-normal' | 'critical-super' | 'critical-ultra' | 'critical-legendary';
  position: { x: number; y: number };
  multiplier: number;
}

export function CriticalHitEffectsContainer() {
  const [effects, setEffects] = useState<CriticalHitEffect[]>([]);

  useEffect(() => {
    const handleCriticalHit = (event: CustomEvent) => {
      const { type, position, multiplier } = event.detail;
      
      if (!type.startsWith('critical-')) return;

      const newEffect: CriticalHitEffect = {
        id: Date.now().toString(),
        type,
        position,
        multiplier
      };

      setEffects(prev => [...prev, newEffect]);

      // Remove effect after animation
      setTimeout(() => {
        setEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 2000);
    };

    window.addEventListener('showCriticalHit', handleCriticalHit as EventListener);
    
    return () => {
      window.removeEventListener('showCriticalHit', handleCriticalHit as EventListener);
    };
  }, []);

  const getEffectConfig = (type: CriticalHitEffect['type']) => {
    switch (type) {
      case 'critical-normal':
        return {
          text: 'CRITICAL!',
          color: 'text-yellow-400',
          size: 'text-4xl',
          glow: 'drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]',
          animation: 'animate-pulse'
        };
      case 'critical-super':
        return {
          text: 'SUPER CRITICAL!',
          color: 'text-orange-400',
          size: 'text-5xl',
          glow: 'drop-shadow-[0_0_20px_rgba(255,165,0,1)]',
          animation: 'animate-bounce'
        };
      case 'critical-ultra':
        return {
          text: 'ULTRA CRITICAL!',
          color: 'text-red-400',
          size: 'text-6xl',
          glow: 'drop-shadow-[0_0_25px_rgba(255,0,0,1)]',
          animation: 'animate-ping'
        };
      case 'critical-legendary':
        return {
          text: 'LEGENDARY CRITICAL!',
          color: 'text-purple-400',
          size: 'text-7xl',
          glow: 'drop-shadow-[0_0_30px_rgba(147,51,234,1)]',
          animation: 'animate-spin'
        };
      default:
        return {
          text: 'CRITICAL!',
          color: 'text-yellow-400',
          size: 'text-4xl',
          glow: 'drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]',
          animation: 'animate-pulse'
        };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {effects.map((effect) => {
          const config = getEffectConfig(effect.type);
          
          return (
            <motion.div
              key={effect.id}
              initial={{ 
                x: effect.position.x - 150,
                y: effect.position.y - 50,
                opacity: 0,
                scale: 0.5,
                rotate: -10
              }}
              animate={{ 
                x: effect.position.x - 150,
                y: effect.position.y - 150,
                opacity: 1,
                scale: [0.5, 1.2, 1],
                rotate: [0, 5, 0]
              }}
              exit={{ 
                opacity: 0,
                scale: 0.8,
                y: effect.position.y - 200
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut",
                scale: {
                  duration: 0.6,
                  times: [0, 0.4, 1],
                  ease: "backOut"
                }
              }}
              className="absolute font-bold"
            >
              <div 
                className={`
                  ${config.color} 
                  ${config.size} 
                  ${config.glow}
                  font-extrabold 
                  text-center 
                  whitespace-nowrap
                  animate-pulse
                `}
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  WebkitTextStroke: '2px black'
                }}
              >
                {config.text}
              </div>
              
              {/* Multiplier badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-center mt-2"
              >
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xl font-bold">
                  {effect.multiplier}x
                </span>
              </motion.div>

              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: 150,
                      y: 50,
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{
                      x: 150 + (Math.cos(i * 45 * Math.PI / 180) * 100),
                      y: 50 + (Math.sin(i * 45 * Math.PI / 180) * 100),
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.2,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}