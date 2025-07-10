import { useRef, useCallback } from "react";

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

  // Som de caixa registradora para BTZ
  const playCashRegisterSound = useCallback(() => {
    const audioContext = initAudioContext();
    if (!audioContext) return;

    // Simulate cash register sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Cash register "cha-ching" sound
    oscillator1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    oscillator1.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.1); // G5
    
    oscillator2.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5  
    oscillator2.frequency.exponentialRampToValueAtTime(1047, audioContext.currentTime + 0.3); // C6
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator1.type = 'triangle';
    oscillator2.type = 'sine';
    
    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.2);
    
    oscillator2.start(audioContext.currentTime + 0.1);
    oscillator2.stop(audioContext.currentTime + 0.5);
  }, [initAudioContext]);

  // Som de contagem regressiva para os últimos 5 segundos
  const playCountdownSound = useCallback((secondsLeft: number) => {
    const audioContext = initAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Frequência mais aguda conforme o tempo diminui
    const baseFreq = secondsLeft === 1 ? 800 : 400 + (100 * (6 - secondsLeft));
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    
    const volume = secondsLeft === 1 ? 0.4 : 0.2;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.type = secondsLeft === 1 ? 'square' : 'triangle';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, [initAudioContext]);

  return {
    playCorrectSound,
    playWrongSound,
    playStreakSound,
    playCashRegisterSound,
    playCountdownSound
  };
}