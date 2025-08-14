import { useState, useCallback, useRef } from 'react';
import { useAdvancedQuizAudio } from './use-advanced-quiz-audio';
import confetti from 'canvas-confetti';

interface CriticalHit {
  isCritical: boolean;
  multiplier: number;
  comboCount: number;
  visualEffect: string;
}

export function useCriticalHitSystem() {
  const [currentCombo, setCurrentCombo] = useState(0);
  const [criticalStreak, setCriticalStreak] = useState(0);
  const lastCriticalTime = useRef<number>(0);
  const { playCorrectSound } = useAdvancedQuizAudio();

  const processCriticalHit = useCallback((baseValue: number): CriticalHit => {
    const now = Date.now();
    const timeSinceLastCritical = now - lastCriticalTime.current;
    
    // 5% base chance + 1% per combo (max 15%)
    const criticalChance = Math.min(0.05 + (currentCombo * 0.01), 0.15);
    const isCritical = Math.random() < criticalChance;
    
    let multiplier = 1;
    let visualEffect = 'normal';
    let newCombo = currentCombo;
    
    if (isCritical) {
      // Critical hit multipliers: 2x, 3x, 4x, 5x based on streak
      multiplier = Math.min(2 + Math.floor(criticalStreak / 3), 5);
      visualEffect = getCriticalVisualEffect(multiplier);
      
      setCriticalStreak(prev => prev + 1);
      setCurrentCombo(prev => prev + 1);
      newCombo = currentCombo + 1;
      lastCriticalTime.current = now;
      
      // Epic effects for high multipliers
      if (multiplier >= 4) {
        triggerEpicEffects(multiplier);
      }
      
      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        const pattern = [100, 50, 100, 50, 200]; // Critical hit pattern
        navigator.vibrate(pattern);
      }
      
    } else {
      // Reset critical streak if too much time passed
      if (timeSinceLastCritical > 10000) {
        setCriticalStreak(0);
      }
      setCurrentCombo(0);
      newCombo = 0;
    }

    return {
      isCritical,
      multiplier,
      comboCount: newCombo,
      visualEffect
    };
  }, [currentCombo, criticalStreak]);

  const getCriticalVisualEffect = (multiplier: number): string => {
    switch (multiplier) {
      case 2: return 'critical-normal';
      case 3: return 'critical-super';
      case 4: return 'critical-ultra';
      case 5: return 'critical-legendary';
      default: return 'normal';
    }
  };

  const triggerEpicEffects = (multiplier: number) => {
    // Screen shake effect
    document.body.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);

    // Epic confetti
    const colors = multiplier >= 5 
      ? ['#FFD700', '#FFA500', '#FF6B6B', '#9D4EDD', '#00F5FF']
      : ['#FFD700', '#FFA500', '#FF6B6B'];
      
    confetti({
      particleCount: 100 * multiplier,
      spread: 360,
      startVelocity: 30,
      origin: { x: 0.5, y: 0.3 },
      colors
    });

    // Multiple bursts for legendary
    if (multiplier >= 5) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
      }, 200);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });
      }, 400);
    }
  };

  const triggerFloatingNumbers = useCallback((value: number, element: HTMLElement, isCritical: boolean, multiplier: number) => {
    const rect = element.getBoundingClientRect();
    const event = new CustomEvent('showFloatingNumber', {
      detail: {
        value: value,
        type: isCritical ? 'critical' : 'xp',
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        multiplier: isCritical ? multiplier : 1,
        critical: isCritical
      }
    });
    window.dispatchEvent(event);
  }, []);

  const resetCombo = useCallback(() => {
    setCurrentCombo(0);
  }, []);

  return {
    processCriticalHit,
    triggerFloatingNumbers,
    resetCombo,
    currentCombo,
    criticalStreak
  };
}