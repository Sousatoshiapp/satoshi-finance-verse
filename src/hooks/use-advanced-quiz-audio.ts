import { useRef, useCallback } from "react";
import { 
  playCorrectSound as playCorrectSoundNew,
  playWrongSound as playWrongSoundNew,
  playStreakSound as playStreakSoundNew,
  playBTZSound as playBTZSoundNew
} from "@/audio/quiz-sounds";

export function useAdvancedQuizAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playCorrectSound = useCallback((intensity: number = 1) => {
    try {
      playCorrectSoundNew(intensity);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const playWrongSound = useCallback(() => {
    try {
      playWrongSoundNew();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const playStreakSound = useCallback((streakLevel: number) => {
    try {
      playStreakSoundNew(streakLevel);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  // Som de BTZ - novo sistema sintético mais agradável
  const playCashRegisterSound = useCallback(() => {
    try {
      playBTZSoundNew();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);


  return {
    playCorrectSound,
    playWrongSound,
    playStreakSound,
    playCashRegisterSound
  };
}
