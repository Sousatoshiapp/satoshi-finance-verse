import { useCallback } from 'react';

interface HapticPattern {
  pattern: number[];
  intensity?: number;
}

export function useAdvancedHaptics() {
  const isHapticsSupported = typeof window !== 'undefined' && 'vibrate' in navigator;

  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    if (!isHapticsSupported) return;
    
    const { pattern: vibrationPattern, intensity = 1 } = pattern;
    
    // Scale pattern by intensity
    const scaledPattern = vibrationPattern.map(duration => 
      Math.round(duration * intensity)
    );
    
    navigator.vibrate(scaledPattern);
  }, [isHapticsSupported]);

  // Precision haptics for different scenarios
  const correctAnswerHaptic = useCallback(() => {
    triggerHaptic({
      pattern: [50, 30, 50], // Double tap
      intensity: 0.8
    });
  }, [triggerHaptic]);

  const criticalHitHaptic = useCallback((multiplier: number) => {
    const basePattern = [100, 50, 100, 50, 200];
    const intensity = Math.min(0.5 + (multiplier * 0.2), 1.0);
    
    triggerHaptic({
      pattern: basePattern,
      intensity
    });
  }, [triggerHaptic]);

  const comboHaptic = useCallback((comboCount: number) => {
    // Escalating buzz pattern
    const baseVibration = 30;
    const pattern: number[] = [];
    
    for (let i = 0; i < Math.min(comboCount, 5); i++) {
      pattern.push(baseVibration + (i * 10));
      if (i < comboCount - 1) pattern.push(20); // Gap between vibrations
    }
    
    triggerHaptic({
      pattern,
      intensity: 0.7
    });
  }, [triggerHaptic]);

  const wrongAnswerHaptic = useCallback(() => {
    triggerHaptic({
      pattern: [200, 100, 200], // Disappointing but motivating
      intensity: 0.6
    });
  }, [triggerHaptic]);

  const tensionBuildupHaptic = useCallback((intensity: number) => {
    // Crescendo effect
    const duration = Math.round(100 + (intensity * 100));
    
    triggerHaptic({
      pattern: [duration],
      intensity: intensity
    });
  }, [triggerHaptic]);

  const achievementHaptic = useCallback(() => {
    // Celebration sequence
    triggerHaptic({
      pattern: [100, 50, 100, 50, 100, 50, 300],
      intensity: 1.0
    });
  }, [triggerHaptic]);

  const levelUpHaptic = useCallback(() => {
    // Epic celebration
    triggerHaptic({
      pattern: [200, 100, 200, 100, 200, 100, 500],
      intensity: 1.0
    });
  }, [triggerHaptic]);

  const nearMissHaptic = useCallback(() => {
    // Teasing frustration
    triggerHaptic({
      pattern: [150, 200, 150],
      intensity: 0.4
    });
  }, [triggerHaptic]);

  const streakBreakHaptic = useCallback(() => {
    // Dramatic loss
    triggerHaptic({
      pattern: [300, 200, 300],
      intensity: 0.8
    });
  }, [triggerHaptic]);

  const urgencyHaptic = useCallback(() => {
    // Time pressure
    triggerHaptic({
      pattern: [50, 50, 50, 50, 50],
      intensity: 0.9
    });
  }, [triggerHaptic]);

  const heartbeatHaptic = useCallback((bpm: number = 60) => {
    const interval = 60000 / bpm; // Convert BPM to milliseconds
    const pattern = [80, interval - 80];
    
    triggerHaptic({
      pattern,
      intensity: 0.3
    });
  }, [triggerHaptic]);

  return {
    isHapticsSupported,
    triggerHaptic,
    correctAnswerHaptic,
    criticalHitHaptic,
    comboHaptic,
    wrongAnswerHaptic,
    tensionBuildupHaptic,
    achievementHaptic,
    levelUpHaptic,
    nearMissHaptic,
    streakBreakHaptic,
    urgencyHaptic,
    heartbeatHaptic
  };
}