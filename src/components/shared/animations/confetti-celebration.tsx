import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger: boolean;
  type: 'achievement' | 'levelup' | 'perfect' | 'milestone';
  intensity: 'low' | 'medium' | 'high';
  colors?: string[];
  duration?: number;
  customOrigin?: { x: number; y: number };
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  trigger, 
  type, 
  intensity, 
  colors, 
  duration = 3000,
  customOrigin,
  onComplete 
}: ConfettiCelebrationProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!trigger) return;

    const getIntensityConfig = () => {
      switch (intensity) {
        case 'low':
          return { particleCount: 200, spread: 60, scalar: 0.25 };
        case 'medium':
          return { particleCount: 400, spread: 90, scalar: 0.25 };
        case 'high':
          return { particleCount: 800, spread: 120, scalar: 0.25 };
        default:
          return { particleCount: 400, spread: 90, scalar: 0.25 };
      }
    };

    const getTypeConfig = () => {
      switch (type) {
        case 'achievement':
          return {
            colors: colors || ['#FFD700', '#FFA500', '#FF6347', '#FF1493'],
            origin: { y: 0.4 },
            pattern: 'burst'
          };
        case 'levelup':
          return {
            colors: colors || ['#9333EA', '#C084FC', '#E879F9', '#FFD700'],
            origin: { y: 0.3 },
            pattern: 'fountain'
          };
        case 'perfect':
          return {
            colors: colors || ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
            origin: { y: 0.5 },
            pattern: 'rainbow'
          };
        case 'milestone':
          return {
            colors: colors || ['#32CD32', '#90EE90', '#87CEEB', '#4169E1'],
            origin: { y: 0.6 },
            pattern: 'celebration'
          };
        default:
          return {
            colors: colors || ['#FFD700', '#FFA500'],
            origin: { y: 0.5 },
            pattern: 'burst'
          };
      }
    };

    const intensityConfig = getIntensityConfig();
    const typeConfig = getTypeConfig();

    // Use custom origin if provided, otherwise use type default
    const origin = customOrigin || typeConfig.origin;

    const fireConfetti = () => {
      switch (typeConfig.pattern) {
        case 'burst':
          confetti({
            ...intensityConfig,
            colors: typeConfig.colors,
            origin: origin,
            scalar: intensityConfig.scalar
          });
          break;
          
        case 'fountain':
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              confetti({
                ...intensityConfig,
                colors: typeConfig.colors,
                origin: customOrigin ? origin : { x: 0.3 + (i * 0.2), y: origin.y },
                spread: intensityConfig.spread / 2,
                scalar: intensityConfig.scalar
              });
            }, i * 200);
          }
          break;
          
        case 'rainbow':
          typeConfig.colors.forEach((color, index) => {
            setTimeout(() => {
              confetti({
                particleCount: intensityConfig.particleCount / typeConfig.colors.length,
                colors: [color],
                origin: customOrigin ? origin : { 
                  x: 0.2 + (index * 0.1), 
                  y: origin.y 
                },
                spread: intensityConfig.spread,
                scalar: intensityConfig.scalar
              });
            }, index * 100);
          });
          break;
          
        case 'celebration':
          const celebrationInterval = setInterval(() => {
            confetti({
              particleCount: intensityConfig.particleCount / 4,
              colors: typeConfig.colors,
              origin: customOrigin ? origin : { 
                x: Math.random() * 0.6 + 0.2, 
                y: origin.y 
              },
              spread: intensityConfig.spread / 2,
              scalar: intensityConfig.scalar
            });
          }, 300);
          
          setTimeout(() => {
            clearInterval(celebrationInterval);
          }, duration);
          break;
      }
    };

    fireConfetti();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, type, intensity, colors, duration, customOrigin, onComplete]);

  return null; // This component doesn't render anything visible
}
