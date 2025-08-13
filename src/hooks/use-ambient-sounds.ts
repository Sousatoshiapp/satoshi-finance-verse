import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface AmbientSoundSystem {
  setDistrict: (district: 'crypto' | 'finance' | 'education' | null) => void;
  setIntensity: (intensity: number) => void;
  playTransitionSound: (from: string, to: string) => void;
  setMood: (mood: 'calm' | 'energetic' | 'focused' | 'celebration') => void;
  toggleAmbient: (enabled: boolean) => void;
  isPlaying: boolean;
}

const DISTRICT_SOUNDS = {
  crypto: {
    base: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LKeSEFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMbBjaN1fPNfisGKoPR8...',
    intensity: 0.3,
    reverb: 0.4,
    filter: 'highpass'
  },
  finance: {
    base: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LKeSEFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMbBjaN1fPNfisGKoPR8...',
    intensity: 0.2,
    reverb: 0.2,
    filter: 'lowpass'
  },
  education: {
    base: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LKeSEFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMbBjaN1fPNfisGKoPR8...',
    intensity: 0.25,
    reverb: 0.3,
    filter: 'bandpass'
  }
};

const MOOD_MODIFIERS = {
  calm: { volume: 0.7, tempo: 0.8, reverb: 1.5 },
  energetic: { volume: 1.0, tempo: 1.2, reverb: 0.5 },
  focused: { volume: 0.8, tempo: 0.9, reverb: 1.0 },
  celebration: { volume: 1.2, tempo: 1.3, reverb: 0.3 }
};

export function useAmbientSounds(): AmbientSoundSystem {
  const [currentDistrict, setCurrentDistrict] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<keyof typeof MOOD_MODIFIERS>('calm');
  const [intensity, setIntensityState] = useState(0.5);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  
  const location = useLocation();

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    // Create nodes if they don't exist
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
    }
    
    if (!reverbNodeRef.current) {
      reverbNodeRef.current = audioContextRef.current.createConvolver();
      // Create impulse response for reverb
      const impulseBuffer = audioContextRef.current.createBuffer(
        2, 
        audioContextRef.current.sampleRate * 2, 
        audioContextRef.current.sampleRate
      );
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 2);
        }
      }
      reverbNodeRef.current.buffer = impulseBuffer;
    }
    
    if (!filterNodeRef.current) {
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'lowpass';
      filterNodeRef.current.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    }
  }, []);

  // Generate procedural ambient sound
  const generateAmbientSound = useCallback(async (district: string) => {
    if (!audioContextRef.current || !isEnabled) return;
    
    const context = audioContextRef.current;
    const sampleRate = context.sampleRate;
    const duration = 30; // 30 seconds loop
    const buffer = context.createBuffer(2, sampleRate * duration, sampleRate);
    
    const districtConfig = DISTRICT_SOUNDS[district as keyof typeof DISTRICT_SOUNDS];
    const moodConfig = MOOD_MODIFIERS[currentMood];
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        let sample = 0;
        
        // Base frequency components for different districts
        switch (district) {
          case 'crypto':
            // Digital, glitchy sounds
            sample += Math.sin(2 * Math.PI * 55 * i / sampleRate) * 0.1; // Low bass
            sample += Math.sin(2 * Math.PI * 220 * i / sampleRate) * 0.05; // Mid
            sample += (Math.random() - 0.5) * 0.02; // Digital noise
            break;
            
          case 'finance':
            // Professional, steady sounds
            sample += Math.sin(2 * Math.PI * 80 * i / sampleRate) * 0.08; // Bass
            sample += Math.sin(2 * Math.PI * 160 * i / sampleRate) * 0.04; // Harmonic
            sample += Math.sin(2 * Math.PI * 0.5 * i / sampleRate) * 0.02; // Slow modulation
            break;
            
          case 'education':
            // Calm, natural sounds
            sample += Math.sin(2 * Math.PI * 110 * i / sampleRate) * 0.06; // Warm bass
            sample += Math.sin(2 * Math.PI * 330 * i / sampleRate) * 0.03; // Mid
            sample += Math.sin(2 * Math.PI * 1.2 * i / sampleRate) * 0.01; // Nature modulation
            break;
        }
        
        // Apply mood modifiers
        sample *= moodConfig.volume * intensity * districtConfig.intensity;
        
        // Add some evolution over time
        const timeProgress = i / channelData.length;
        const evolution = Math.sin(timeProgress * Math.PI * 4) * 0.3 + 0.7;
        sample *= evolution;
        
        channelData[i] = sample;
      }
    }
    
    return buffer;
  }, [currentMood, intensity, isEnabled]);

  // Play ambient sound
  const playAmbientSound = useCallback(async (district: string) => {
    if (!isEnabled) return;
    
    try {
      await initAudioContext();
      
      // Stop current sound
      if (currentSourceRef.current) {
        currentSourceRef.current.disconnect();
        currentSourceRef.current.stop();
      }
      
      const buffer = await generateAmbientSound(district);
      if (!buffer || !audioContextRef.current) return;
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      // Connect audio chain
      const districtConfig = DISTRICT_SOUNDS[district as keyof typeof DISTRICT_SOUNDS];
      const moodConfig = MOOD_MODIFIERS[currentMood];
      
      // Configure filter based on district
      if (filterNodeRef.current) {
        switch (districtConfig.filter) {
          case 'highpass':
            filterNodeRef.current.type = 'highpass';
            filterNodeRef.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
            break;
          case 'lowpass':
            filterNodeRef.current.type = 'lowpass';
            filterNodeRef.current.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
            break;
          case 'bandpass':
            filterNodeRef.current.type = 'bandpass';
            filterNodeRef.current.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
            break;
        }
      }
      
      // Set gain
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(
          moodConfig.volume * intensity * 0.3, 
          audioContextRef.current.currentTime
        );
      }
      
      // Connect nodes
      source
        .connect(filterNodeRef.current!)
        .connect(reverbNodeRef.current!)
        .connect(gainNodeRef.current!)
        .connect(audioContextRef.current.destination);
      
      source.start();
      currentSourceRef.current = source;
      setIsPlaying(true);
      
    } catch (error) {
      console.warn('Failed to play ambient sound:', error);
    }
  }, [initAudioContext, generateAmbientSound, currentMood, intensity, isEnabled]);

  // Stop ambient sound
  const stopAmbientSound = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.disconnect();
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Auto-detect district from route
  useEffect(() => {
    const path = location.pathname;
    let district: string | null = null;
    
    if (path.includes('crypto') || path.includes('defi') || path.includes('nft')) {
      district = 'crypto';
    } else if (path.includes('finance') || path.includes('trading') || path.includes('investment')) {
      district = 'finance';
    } else if (path.includes('education') || path.includes('learn') || path.includes('study')) {
      district = 'education';
    }
    
    if (district !== currentDistrict) {
      setCurrentDistrict(district);
      if (district && isEnabled) {
        playAmbientSound(district);
      } else {
        stopAmbientSound();
      }
    }
  }, [location.pathname, currentDistrict, playAmbientSound, stopAmbientSound, isEnabled]);

  const setDistrict = useCallback((district: 'crypto' | 'finance' | 'education' | null) => {
    setCurrentDistrict(district);
    if (district && isEnabled) {
      playAmbientSound(district);
    } else {
      stopAmbientSound();
    }
  }, [playAmbientSound, stopAmbientSound, isEnabled]);

  const setIntensity = useCallback((newIntensity: number) => {
    const clampedIntensity = Math.max(0, Math.min(1, newIntensity));
    setIntensityState(clampedIntensity);
    
    if (gainNodeRef.current && audioContextRef.current) {
      const moodConfig = MOOD_MODIFIERS[currentMood];
      gainNodeRef.current.gain.setValueAtTime(
        moodConfig.volume * clampedIntensity * 0.3,
        audioContextRef.current.currentTime
      );
    }
  }, [currentMood]);

  const playTransitionSound = useCallback(async (from: string, to: string) => {
    if (!isEnabled || !audioContextRef.current) return;
    
    try {
      await initAudioContext();
      
      // Create a short transition sound
      const context = audioContextRef.current;
      const duration = 1;
      const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          const progress = i / channelData.length;
          const frequency = 200 + (progress * 400); // Rising frequency
          const sample = Math.sin(2 * Math.PI * frequency * i / context.sampleRate) * 
                        (1 - progress) * 0.1; // Fade out
          channelData[i] = sample;
        }
      }
      
      const source = context.createBufferSource();
      source.buffer = buffer;
      
      const transitionGain = context.createGain();
      transitionGain.gain.setValueAtTime(0.2, context.currentTime);
      
      source.connect(transitionGain).connect(context.destination);
      source.start();
      
    } catch (error) {
      console.warn('Failed to play transition sound:', error);
    }
  }, [initAudioContext, isEnabled]);

  const setMood = useCallback((mood: 'calm' | 'energetic' | 'focused' | 'celebration') => {
    setCurrentMood(mood);
    
    // Restart current ambient with new mood
    if (currentDistrict && isEnabled) {
      playAmbientSound(currentDistrict);
    }
  }, [currentDistrict, playAmbientSound, isEnabled]);

  const toggleAmbient = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    
    if (enabled && currentDistrict) {
      playAmbientSound(currentDistrict);
    } else {
      stopAmbientSound();
    }
  }, [currentDistrict, playAmbientSound, stopAmbientSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAmbientSound]);

  return {
    setDistrict,
    setIntensity,
    playTransitionSound,
    setMood,
    toggleAmbient,
    isPlaying
  };
}