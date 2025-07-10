import { useEffect, useRef } from "react";

interface ProgressiveIntensityProps {
  streak: number;
  isActive: boolean;
  onIntensityChange?: (level: number) => void;
}

export function ProgressiveIntensity({ 
  streak, 
  isActive, 
  onIntensityChange 
}: ProgressiveIntensityProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar Web Audio Context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const intensityLevel = Math.min(Math.floor(streak / 2), 5); // 0-5 levels
    onIntensityChange?.(intensityLevel);

    // Escalada de vibração
    if ('vibrate' in navigator) {
      const vibrationPatterns = [
        [], // Level 0 - sem vibração
        [50], // Level 1 - vibração leve
        [100], // Level 2 - vibração média
        [150], // Level 3 - vibração forte
        [100, 50, 100], // Level 4 - padrão
        [150, 50, 150, 50, 150] // Level 5 - máximo
      ];
      
      if (vibrationPatterns[intensityLevel]) {
        navigator.vibrate(vibrationPatterns[intensityLevel]);
      }
    }

    // Escalada de áudio
    playProgressiveAudio(intensityLevel);

  }, [streak, isActive, onIntensityChange]);

  const playProgressiveAudio = (level: number) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    
    // Frequências que aumentam com a intensidade
    const frequencies = [440, 523, 659, 783, 880, 1047]; // C4 to C6
    const frequency = frequencies[level] || 440;
    
    // Duração que aumenta com intensidade
    const duration = 0.1 + (level * 0.05);
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = level > 3 ? 'sawtooth' : 'sine'; // Som mais agressivo em níveis altos
    
    gainNode.gain.setValueAtTime(0.1 + (level * 0.05), audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // Retorna classes CSS baseadas na intensidade
  const getIntensityClasses = () => {
    const intensityLevel = Math.min(Math.floor(streak / 2), 5);
    
    const backgroundColors = [
      'bg-background', // Level 0
      'bg-gradient-to-br from-background to-blue-950/20', // Level 1
      'bg-gradient-to-br from-background to-purple-950/30', // Level 2
      'bg-gradient-to-br from-background to-red-950/40', // Level 3
      'bg-gradient-to-br from-background to-orange-950/50', // Level 4
      'bg-gradient-to-br from-background to-yellow-950/60' // Level 5
    ];

    return backgroundColors[intensityLevel] || backgroundColors[0];
  };

  return (
    <div 
      className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${getIntensityClasses()}`}
      style={{
        mixBlendMode: 'multiply',
        opacity: isActive ? 0.6 : 0
      }}
    />
  );
}