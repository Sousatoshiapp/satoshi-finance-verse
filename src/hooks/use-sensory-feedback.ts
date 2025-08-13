import { useCallback, useRef, useEffect } from 'react';
import { useAddictiveAnimations } from './use-addictive-animations';
import { useAdvancedQuizAudio } from './use-advanced-quiz-audio';

interface HapticPattern {
  pattern: number[];
  intensity: 'light' | 'medium' | 'heavy';
}

interface SensoryFeedbackSystem {
  triggerHover: (element: HTMLElement) => void;
  triggerClick: (element: HTMLElement, intensity?: number) => void;
  triggerSuccess: (position: { x: number, y: number }, level?: number) => void;
  triggerError: (element?: HTMLElement) => void;
  triggerAchievement: (level: number) => void;
  triggerCombo: (comboCount: number) => void;
  triggerNearMiss: () => void;
  triggerTension: (level: number) => void;
  triggerRelease: () => void;
  setAmbientIntensity: (intensity: number) => void;
}

const HAPTIC_PATTERNS = {
  hover: { pattern: [50], intensity: 'light' as const },
  click: { pattern: [100, 50, 100], intensity: 'medium' as const },
  success: { pattern: [200, 100, 200, 100, 300], intensity: 'heavy' as const },
  error: { pattern: [300, 100, 300], intensity: 'heavy' as const },
  achievement: { pattern: [400, 200, 400, 200, 600], intensity: 'heavy' as const },
  combo: { pattern: [100, 50, 100, 50, 100], intensity: 'medium' as const },
  nearMiss: { pattern: [150, 100, 150, 100, 150], intensity: 'medium' as const },
  tension: { pattern: [200, 100, 200, 100, 200, 100, 300], intensity: 'heavy' as const },
  release: { pattern: [500], intensity: 'heavy' as const }
};

export function useSensoryFeedback(): SensoryFeedbackSystem {
  const animations = useAddictiveAnimations();
  const { playCorrectSound, playWrongSound, playStreakSound, playCashRegisterSound } = useAdvancedQuizAudio();
  const lastHoverTime = useRef<number>(0);
  const ambientIntensity = useRef<number>(0.5);

  const triggerHaptic = useCallback((pattern: HapticPattern, multiplier = 1) => {
    if ('vibrate' in navigator) {
      const adjustedPattern = pattern.pattern.map(duration => 
        Math.floor(duration * multiplier * ambientIntensity.current)
      );
      navigator.vibrate(adjustedPattern);
    }
  }, []);

  const triggerAudioFeedback = useCallback((type: string, intensity = 1) => {
    const volume = Math.min(1, intensity * ambientIntensity.current);
    
    switch (type) {
      case 'hover':
        // Subtle hover sound
        if (Date.now() - lastHoverTime.current > 100) {
          // Play subtle tick sound
          lastHoverTime.current = Date.now();
        }
        break;
      case 'click':
        playCorrectSound(volume);
        break;
      case 'success':
        playCorrectSound(volume);
        playCashRegisterSound();
        break;
      case 'error':
        playWrongSound();
        break;
      case 'achievement':
        playStreakSound(intensity);
        break;
      case 'combo':
        playStreakSound(Math.min(intensity, 3));
        break;
    }
  }, [playCorrectSound, playWrongSound, playStreakSound, playCashRegisterSound]);

  const triggerHover = useCallback((element: HTMLElement) => {
    // Visual feedback
    element.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    element.style.transform = 'translateY(-2px) scale(1.02)';
    element.style.filter = 'brightness(1.1)';
    element.style.boxShadow = '0 8px 25px -8px rgba(0, 0, 0, 0.3)';
    
    // Haptic feedback
    triggerHaptic(HAPTIC_PATTERNS.hover, 0.5);
    
    // Audio feedback
    triggerAudioFeedback('hover', 0.3);
    
    // Reset on mouse leave
    const resetStyles = () => {
      element.style.transform = '';
      element.style.filter = '';
      element.style.boxShadow = '';
    };
    
    element.addEventListener('mouseleave', resetStyles, { once: true });
    element.addEventListener('pointerleave', resetStyles, { once: true });
  }, [triggerHaptic, triggerAudioFeedback]);

  const triggerClick = useCallback((element: HTMLElement, intensity = 1) => {
    // Visual feedback
    animations.triggerMorphingEffect(element, 'pulse');
    
    // Haptic feedback
    triggerHaptic(HAPTIC_PATTERNS.click, intensity);
    
    // Audio feedback
    triggerAudioFeedback('click', intensity);
    
    // Ripple effect
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
      width: 100px;
      height: 100px;
      left: ${rect.left + rect.width / 2 - 50}px;
      top: ${rect.top + rect.height / 2 - 50}px;
    `;
    
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, [animations, triggerHaptic, triggerAudioFeedback]);

  const triggerSuccess = useCallback((position: { x: number, y: number }, level = 1) => {
    // Visual explosion
    animations.triggerColorBurst('rgba(0, 255, 0, 0.3)', 300);
    
    // Haptic feedback
    triggerHaptic(HAPTIC_PATTERNS.success, level);
    
    // Audio feedback
    triggerAudioFeedback('success', level);
    
    // Particle burst
    const event = new CustomEvent('showParticleSystem', {
      detail: {
        type: 'burst',
        intensity: level,
        duration: 1000,
        sourcePosition: position,
        trigger: true
      }
    });
    window.dispatchEvent(event);
    
    if (level >= 3) {
      animations.triggerScreenShake(level * 0.5);
    }
  }, [animations, triggerHaptic, triggerAudioFeedback]);

  const triggerError = useCallback((element?: HTMLElement) => {
    // Visual feedback
    if (element) {
      animations.triggerMorphingEffect(element, 'wave');
    }
    animations.triggerColorBurst('rgba(255, 0, 0, 0.3)', 200);
    
    // Haptic feedback
    triggerHaptic(HAPTIC_PATTERNS.error);
    
    // Audio feedback
    triggerAudioFeedback('error');
  }, [animations, triggerHaptic, triggerAudioFeedback]);

  const triggerAchievement = useCallback((level: number) => {
    // Epic visual effects
    animations.triggerScreenShake(level);
    animations.triggerColorBurst('rgba(255, 215, 0, 0.5)', 1000);
    
    // Intense haptic
    triggerHaptic(HAPTIC_PATTERNS.achievement, level);
    
    // Audio celebration
    triggerAudioFeedback('achievement', level);
    
    // Breathing effect
    animations.breathingMode(true);
    setTimeout(() => animations.breathingMode(false), 5000);
  }, [animations, triggerHaptic, triggerAudioFeedback]);

  const triggerCombo = useCallback((comboCount: number) => {
    const intensity = Math.min(comboCount / 5, 2);
    
    // Escalating visual effects
    animations.triggerColorBurst(`rgba(${255 - comboCount * 10}, ${100 + comboCount * 15}, 255, 0.4)`, 400);
    
    // Increasing haptic
    triggerHaptic(HAPTIC_PATTERNS.combo, intensity);
    
    // Audio buildup
    triggerAudioFeedback('combo', intensity);
    
    // Temperature increase
    animations.temperatureMode(intensity * 0.5);
  }, [animations, triggerHaptic, triggerAudioFeedback]);

  const triggerNearMiss = useCallback(() => {
    // Frustrating but motivating feedback
    animations.triggerColorBurst('rgba(255, 165, 0, 0.4)', 500);
    triggerHaptic(HAPTIC_PATTERNS.nearMiss);
    
    // Near miss sound (custom)
    triggerAudioFeedback('hover', 1.5);
  }, [animations, triggerHaptic, triggerAudioFeedback]);

  const triggerTension = useCallback((level: number) => {
    // Building tension effects
    const intensity = Math.min(level / 10, 1);
    
    triggerHaptic(HAPTIC_PATTERNS.tension, intensity);
    animations.temperatureMode(intensity);
    
    // Tension breathing
    animations.breathingMode(true);
  }, [animations, triggerHaptic]);

  const triggerRelease = useCallback(() => {
    // Relief and satisfaction
    triggerHaptic(HAPTIC_PATTERNS.release);
    animations.temperatureMode(0);
    animations.breathingMode(false);
  }, [animations, triggerHaptic]);

  const setAmbientIntensity = useCallback((intensity: number) => {
    ambientIntensity.current = Math.max(0, Math.min(1, intensity));
  }, []);

  // Add CSS for ripple animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => style.remove();
  }, []);

  return {
    triggerHover,
    triggerClick,
    triggerSuccess,
    triggerError,
    triggerAchievement,
    triggerCombo,
    triggerNearMiss,
    triggerTension,
    triggerRelease,
    setAmbientIntensity
  };
}