import { useRef, useCallback } from "react";

export function useAdvancedQuizAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  console.log('🔊 useAdvancedQuizAudio hook inicializado');

  const initAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playCorrectSound = useCallback((intensity: number = 1) => {
    console.log('🎵 playCorrectSound called with intensity:', intensity);
    const audioContext = initAudioContext();
    if (!audioContext) return;

    // Som de acerto com intensidade crescente
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Frequência aumenta com intensidade
    const baseFreq = 523; // C5
    const frequency = baseFreq + (intensity * 50);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + 0.2);
    
    const volume = Math.min(0.1 + (intensity * 0.05), 0.3);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [initAudioContext]);

  const playWrongSound = useCallback(() => {
    console.log('❌ playWrongSound called');
    const audioContext = initAudioContext();
    if (!audioContext) return;

    // Som de erro (mais grave)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.type = 'sawtooth';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [initAudioContext]);

  const playStreakSound = useCallback((streakLevel: number) => {
    console.log('🔥 playStreakSound called with streak level:', streakLevel);
    const audioContext = initAudioContext();
    if (!audioContext) return;

    // Som especial para streak - múltiplas notas
    const frequencies = [523, 659, 783]; // C5, E5, G5 (acorde C major)
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
      
      const volume = 0.1 + (streakLevel * 0.02);
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6 + index * 0.1);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + 0.6 + index * 0.1);
    });
  }, [initAudioContext]);

  // Som de BTZ usando arquivo MP3
  const playCashRegisterSound = useCallback(() => {
    console.log('💰 playCashRegisterSound called');
    try {
      const audio = new Audio('/audio/btz-earn.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.warn('Erro ao reproduzir som de BTZ:', error);
      });
    } catch (error) {
      console.warn('Erro ao carregar som de BTZ:', error);
    }
  }, []);


  return {
    playCorrectSound,
    playWrongSound,
    playStreakSound,
    playCashRegisterSound
  };
}