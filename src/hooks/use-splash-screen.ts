import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    SplashScreen?: {
      hide: () => Promise<void>;
      show: () => Promise<void>;
    };
  }
}

export function useSplashScreen() {
  useEffect(() => {
    const hideSplashScreen = async () => {
      try {
        if (Capacitor.isNativePlatform() && window.SplashScreen) {
          // Aguarda um pouco para o app carregar completamente
          await new Promise(resolve => setTimeout(resolve, 1500));
          await window.SplashScreen.hide();
        }
      } catch (error) {
        console.warn('Erro ao esconder splash screen:', error);
      }
    };

    // Esconde a splash screen quando o app estiver carregado
    if (document.readyState === 'complete') {
      hideSplashScreen();
    } else {
      window.addEventListener('load', hideSplashScreen);
      return () => window.removeEventListener('load', hideSplashScreen);
    }
  }, []);
}