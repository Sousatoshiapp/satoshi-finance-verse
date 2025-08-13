import { useCallback, useRef, useEffect } from 'react';
import { useRewardAnimationSystem } from './use-reward-animation-system';

interface AddictiveAnimationsSystem {
  triggerScreenShake: (intensity?: number) => void;
  triggerColorBurst: (color: string, duration?: number) => void;
  triggerTensionBuilder: (element: HTMLElement, duration?: number) => void;
  triggerMorphingEffect: (element: HTMLElement, type: 'expand' | 'pulse' | 'wave') => void;
  triggerGravityEffect: (element: HTMLElement, direction: 'fall' | 'float' | 'bounce') => void;
  triggerMagneticEffect: (sourceElement: HTMLElement, targetElement: HTMLElement) => void;
  breathingMode: (enable: boolean) => void;
  temperatureMode: (heat: number) => void;
}

export function useAddictiveAnimations(): AddictiveAnimationsSystem {
  const shakeRef = useRef<number | null>(null);
  const { showBTZGain } = useRewardAnimationSystem();

  const triggerScreenShake = useCallback((intensity = 1) => {
    if (shakeRef.current) return; // Prevent multiple shakes
    
    const body = document.body;
    const shakeAmount = Math.min(intensity * 5, 20);
    
    // Add vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200 * intensity, 100, 200 * intensity]);
    }
    
    body.style.transform = `translate(${shakeAmount}px, ${shakeAmount}px)`;
    body.style.transition = 'transform 0.1s ease-out';
    
    let shakeCount = 0;
    const maxShakes = 6;
    
    shakeRef.current = window.setInterval(() => {
      shakeCount++;
      const x = (Math.random() - 0.5) * shakeAmount * (1 - shakeCount / maxShakes);
      const y = (Math.random() - 0.5) * shakeAmount * (1 - shakeCount / maxShakes);
      
      body.style.transform = `translate(${x}px, ${y}px)`;
      
      if (shakeCount >= maxShakes) {
        body.style.transform = 'translate(0, 0)';
        clearInterval(shakeRef.current!);
        shakeRef.current = null;
      }
    }, 50);
  }, []);

  const triggerColorBurst = useCallback((color: string, duration = 500) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${color};
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: overlay;
      transition: opacity 0.1s ease-out;
    `;
    
    document.body.appendChild(overlay);
    
    // Flash effect
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.8';
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
      }, duration / 5);
    });
  }, []);

  const triggerTensionBuilder = useCallback((element: HTMLElement, duration = 2000) => {
    const originalTransform = element.style.transform;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (progress < 1) {
        const intensity = Math.sin(progress * Math.PI * 4) * (1 - progress) * 0.1;
        const scale = 1 + intensity;
        element.style.transform = `${originalTransform} scale(${scale})`;
        element.style.filter = `brightness(${1 + intensity * 2})`;
        requestAnimationFrame(animate);
      } else {
        element.style.transform = originalTransform;
        element.style.filter = '';
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  const triggerMorphingEffect = useCallback((element: HTMLElement, type: 'expand' | 'pulse' | 'wave') => {
    const originalStyles = {
      transform: element.style.transform,
      borderRadius: element.style.borderRadius,
      boxShadow: element.style.boxShadow
    };
    
    switch (type) {
      case 'expand':
        element.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        element.style.transform = 'scale(1.2)';
        element.style.borderRadius = '50%';
        break;
        
      case 'pulse':
        element.style.animation = 'addictive-pulse 0.8s ease-out';
        break;
        
      case 'wave':
        element.style.animation = 'addictive-wave 1s ease-out';
        break;
    }
    
    setTimeout(() => {
      Object.assign(element.style, originalStyles);
      element.style.animation = '';
      element.style.transition = '';
    }, 800);
  }, []);

  const triggerGravityEffect = useCallback((element: HTMLElement, direction: 'fall' | 'float' | 'bounce') => {
    const rect = element.getBoundingClientRect();
    const originalPosition = { 
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      transform: element.style.transform
    };
    
    element.style.position = 'fixed';
    element.style.top = `${rect.top}px`;
    element.style.left = `${rect.left}px`;
    element.style.zIndex = '1000';
    
    switch (direction) {
      case 'fall':
        element.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.transform = `translateY(${window.innerHeight}px) rotate(720deg)`;
        break;
        
      case 'float':
        element.style.transition = 'transform 2s ease-out';
        element.style.transform = `translateY(-${window.innerHeight}px) rotate(-360deg) scale(0.1)`;
        break;
        
      case 'bounce':
        element.style.animation = 'addictive-bounce 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        break;
    }
    
    setTimeout(() => {
      Object.assign(element.style, originalPosition);
      element.style.animation = '';
    }, 2000);
  }, []);

  const triggerMagneticEffect = useCallback((sourceElement: HTMLElement, targetElement: HTMLElement) => {
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    const deltaX = targetRect.left - sourceRect.left;
    const deltaY = targetRect.top - sourceRect.top;
    
    sourceElement.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sourceElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;
    
    setTimeout(() => {
      sourceElement.style.transform = '';
      sourceElement.style.transition = '';
    }, 800);
  }, []);

  const breathingMode = useCallback((enable: boolean) => {
    const body = document.body;
    if (enable) {
      body.style.animation = 'addictive-breathing 4s ease-in-out infinite';
    } else {
      body.style.animation = '';
    }
  }, []);

  const temperatureMode = useCallback((heat: number) => {
    const clampedHeat = Math.max(0, Math.min(1, heat));
    const hue = 240 - (clampedHeat * 120); // Blue to red
    const saturation = 20 + (clampedHeat * 30);
    const lightness = 10 + (clampedHeat * 10);
    
    document.documentElement.style.setProperty(
      '--temperature-overlay',
      `hsla(${hue}, ${saturation}%, ${lightness}%, ${clampedHeat * 0.1})`
    );
  }, []);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes addictive-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); filter: brightness(1.3); }
      }
      
      @keyframes addictive-wave {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(5deg); }
        50% { transform: scale(1.05) rotate(-5deg); }
        75% { transform: scale(1.1) rotate(3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes addictive-bounce {
        0%, 100% { transform: translateY(0) scale(1); }
        25% { transform: translateY(-20px) scale(1.1); }
        50% { transform: translateY(-10px) scale(0.95); }
        75% { transform: translateY(-15px) scale(1.05); }
      }
      
      @keyframes addictive-breathing {
        0%, 100% { filter: brightness(1) saturate(1); }
        50% { filter: brightness(1.02) saturate(1.1); }
      }
    `;
    document.head.appendChild(style);
    
    return () => style.remove();
  }, []);

  return {
    triggerScreenShake,
    triggerColorBurst,
    triggerTensionBuilder,
    triggerMorphingEffect,
    triggerGravityEffect,
    triggerMagneticEffect,
    breathingMode,
    temperatureMode
  };
}