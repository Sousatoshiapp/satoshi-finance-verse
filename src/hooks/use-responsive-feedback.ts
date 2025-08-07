import { useEffect, useState, useCallback } from 'react';

interface DeviceCapabilities {
  supportsHaptics: boolean;
  supportsAdvancedAnimations: boolean;
  batteryLevel: number;
  reducedMotion: boolean;
  isMobile: boolean;
  isLowEndDevice: boolean;
}

interface FeedbackConfig {
  enableAnimations: boolean;
  enableParticles: boolean;
  enableHaptics: boolean;
  animationDuration: number;
  particleCount: number;
  hapticIntensity: 'light' | 'medium' | 'heavy';
}

interface ResponsiveFeedbackSystem {
  deviceCapabilities: DeviceCapabilities;
  adaptFeedback: (feedbackType: string, intensity: number) => FeedbackConfig;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
  getOptimalSettings: () => FeedbackConfig;
}

export function useResponsiveFeedback(): ResponsiveFeedbackSystem {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    supportsHaptics: false,
    supportsAdvancedAnimations: true,
    batteryLevel: 1,
    reducedMotion: false,
    isMobile: false,
    isLowEndDevice: false
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      const capabilities: DeviceCapabilities = {
        supportsHaptics: 'vibrate' in navigator,
        supportsAdvancedAnimations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        batteryLevel: 1,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isLowEndDevice: false
      };

      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          capabilities.batteryLevel = battery.level;
        } catch (error) {
          console.log('Battery API not available');
        }
      }

      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      capabilities.isLowEndDevice = hardwareConcurrency <= 2 || deviceMemory <= 2;

      capabilities.supportsAdvancedAnimations = 
        !capabilities.reducedMotion && 
        !capabilities.isLowEndDevice && 
        capabilities.batteryLevel > 0.2;

      setDeviceCapabilities(capabilities);
    };

    detectCapabilities();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setDeviceCapabilities(prev => ({
        ...prev,
        reducedMotion: mediaQuery.matches,
        supportsAdvancedAnimations: !mediaQuery.matches && !prev.isLowEndDevice && prev.batteryLevel > 0.2
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const adaptFeedback = useCallback((feedbackType: string, intensity: number): FeedbackConfig => {
    const baseConfig: FeedbackConfig = {
      enableAnimations: true,
      enableParticles: true,
      enableHaptics: true,
      animationDuration: 1000,
      particleCount: 100,
      hapticIntensity: 'medium'
    };

    if (deviceCapabilities.reducedMotion) {
      return {
        ...baseConfig,
        enableAnimations: false,
        enableParticles: false,
        animationDuration: 0
      };
    }

    if (deviceCapabilities.isLowEndDevice) {
      return {
        ...baseConfig,
        enableParticles: false,
        animationDuration: Math.max(500, baseConfig.animationDuration * 0.5),
        particleCount: Math.max(20, baseConfig.particleCount * 0.2)
      };
    }

    if (deviceCapabilities.batteryLevel < 0.2) {
      return {
        ...baseConfig,
        enableParticles: intensity > 0.7, // Only for high intensity
        animationDuration: Math.max(600, baseConfig.animationDuration * 0.6),
        particleCount: Math.max(30, baseConfig.particleCount * 0.3)
      };
    }

    if (!deviceCapabilities.supportsHaptics) {
      baseConfig.enableHaptics = false;
    }

    switch (feedbackType) {
      case 'btz_gain':
        return {
          ...baseConfig,
          animationDuration: 1500,
          particleCount: Math.floor(50 + (intensity * 100)),
          hapticIntensity: intensity > 0.7 ? 'heavy' : 'medium'
        };
      
      case 'streak_milestone':
        return {
          ...baseConfig,
          animationDuration: 2000,
          particleCount: Math.floor(100 + (intensity * 150)),
          hapticIntensity: 'heavy'
        };
      
      case 'level_up':
        return {
          ...baseConfig,
          animationDuration: 2500,
          particleCount: Math.floor(150 + (intensity * 200)),
          hapticIntensity: 'heavy'
        };
      
      case 'achievement':
        return {
          ...baseConfig,
          animationDuration: 3000,
          particleCount: Math.floor(200 + (intensity * 100)),
          hapticIntensity: 'heavy'
        };
      
      case 'correct_answer':
        return {
          ...baseConfig,
          animationDuration: 800,
          particleCount: Math.floor(20 + (intensity * 30)),
          hapticIntensity: 'light'
        };
      
      default:
        return baseConfig;
    }
  }, [deviceCapabilities]);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (!deviceCapabilities.supportsHaptics || deviceCapabilities.reducedMotion) {
      return;
    }

    const patterns = {
      light: [100],
      medium: [200, 100, 200],
      heavy: [300, 100, 300, 100, 500]
    };

    if ('vibrate' in navigator) {
      navigator.vibrate(patterns[type]);
    }
  }, [deviceCapabilities]);

  const getOptimalSettings = useCallback((): FeedbackConfig => {
    if (deviceCapabilities.reducedMotion) {
      return {
        enableAnimations: false,
        enableParticles: false,
        enableHaptics: false,
        animationDuration: 0,
        particleCount: 0,
        hapticIntensity: 'light'
      };
    }

    if (deviceCapabilities.isLowEndDevice || deviceCapabilities.batteryLevel < 0.3) {
      return {
        enableAnimations: true,
        enableParticles: false,
        enableHaptics: deviceCapabilities.supportsHaptics,
        animationDuration: 600,
        particleCount: 20,
        hapticIntensity: 'light'
      };
    }

    return {
      enableAnimations: true,
      enableParticles: true,
      enableHaptics: deviceCapabilities.supportsHaptics,
      animationDuration: 1000,
      particleCount: 100,
      hapticIntensity: 'medium'
    };
  }, [deviceCapabilities]);

  return {
    deviceCapabilities,
    adaptFeedback,
    triggerHaptic,
    getOptimalSettings
  };
}
