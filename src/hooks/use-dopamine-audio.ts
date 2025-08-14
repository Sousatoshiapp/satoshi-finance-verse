import { useCallback, useRef } from 'react';

export function useDopamineAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastComboTime = useRef<number>(0);
  const currentTone = useRef<number>(440); // Base frequency

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playHeadshotSound = useCallback((intensity: number = 1) => {
    const ctx = getAudioContext();
    
    // Create multiple oscillators for layered effect
    const oscillators = [
      { freq: 800 * intensity, type: 'sine' as OscillatorType },
      { freq: 1200 * intensity, type: 'square' as OscillatorType },
      { freq: 600 * intensity, type: 'triangle' as OscillatorType }
    ];

    oscillators.forEach((osc, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(osc.freq, ctx.currentTime);
      oscillator.type = osc.type;
      
      // Different volume for each layer
      gainNode.gain.setValueAtTime(0.1 / (index + 1), ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    });

    // Add white noise burst for impact
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const whiteNoise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    
    whiteNoise.buffer = buffer;
    whiteNoise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    whiteNoise.start(ctx.currentTime);
    whiteNoise.stop(ctx.currentTime + 0.1);
  }, [getAudioContext]);

  const playComboSound = useCallback((comboCount: number) => {
    const ctx = getAudioContext();
    const now = Date.now();
    
    // Escalating tones based on combo
    const baseFreq = 440;
    const frequency = baseFreq * Math.pow(1.2, comboCount);
    currentTone.current = Math.min(frequency, 2000); // Cap at 2kHz
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(currentTone.current, ctx.currentTime);
    oscillator.type = 'sawtooth';
    
    // Low-pass filter for smoothness
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(currentTone.current * 2, ctx.currentTime);
    
    // Quick attack, longer decay for combo feel
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    
    lastComboTime.current = now;
  }, [getAudioContext]);

  const playCriticalHitSound = useCallback((multiplier: number) => {
    const ctx = getAudioContext();
    
    // Epic sound for critical hits
    const frequencies = [
      523.25, // C5
      659.25, // E5
      783.99, // G5
      1046.50 // C6
    ];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        oscillator.type = 'triangle';
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, ctx.currentTime);
        filter.Q.setValueAtTime(10, ctx.currentTime);
        
        const volume = 0.3 * multiplier / 5; // Scale with multiplier
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.8);
      }, index * 100);
    });

    // Bass drop for high multipliers
    if (multiplier >= 4) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      
      bassOsc.frequency.setValueAtTime(80, ctx.currentTime);
      bassOsc.type = 'sine';
      
      bassGain.gain.setValueAtTime(0, ctx.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 1.0);
    }
  }, [getAudioContext]);

  const playAmbientTension = useCallback((intensity: number) => {
    const ctx = getAudioContext();
    
    // Subtle ambient hum that builds tension
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(100 + intensity * 50, ctx.currentTime);
    oscillator.type = 'sine';
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200 + intensity * 100, ctx.currentTime);
    
    const volume = 0.05 * intensity;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    
    oscillator.start(ctx.currentTime);
    
    // Stop after 2 seconds
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
    }, 2000);
  }, [getAudioContext]);

  const playVictoryFanfare = useCallback(() => {
    const ctx = getAudioContext();
    
    // Victory melody
    const melody = [
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 783.99, duration: 0.2 }, // G5
      { freq: 1046.50, duration: 0.6 } // C6
    ];
    
    let startTime = ctx.currentTime;
    
    melody.forEach((note, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(note.freq, startTime);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
      
      startTime += note.duration;
    });
  }, [getAudioContext]);

  return {
    playHeadshotSound,
    playComboSound,
    playCriticalHitSound,
    playAmbientTension,
    playVictoryFanfare
  };
}