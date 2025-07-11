import { useCallback } from "react";

interface CustomSounds {
  // Básicos
  correct: string;
  wrong: string;
  
  // Gamificação
  streak: string;
  beetz: string;
  levelUp: string;
  
  // Contextuais por distrito
  crypto: string;
  finance: string;
  education: string;
  
  // Eventos especiais
  combo: string;
  perfectScore: string;
  achievement: string;
}

const CUSTOM_SOUNDS: CustomSounds = {
  // Sons básicos - mais sutis
  correct: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCZvxe/XgSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  wrong: "data:audio/wav;base64,UklGRhIEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4DAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCZ",
  
  // Sons de gamificação - mais energéticos
  streak: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  beetz: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  levelUp: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  
  // Sons por distrito
  crypto: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  finance: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  education: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  
  // Sons especiais
  combo: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  perfectScore: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC",
  achievement: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC"
};

function useCustomSounds() {
  const playSound = useCallback((soundType: keyof typeof CUSTOM_SOUNDS, volume: number = 0.3) => {
    try {
      const audio = new Audio(CUSTOM_SOUNDS[soundType]);
      audio.volume = volume;
      audio.play().catch((error) => {
        console.error(`Erro ao tocar som ${soundType}:`, error);
      });
    } catch (error) {
      console.error(`Erro ao criar áudio ${soundType}:`, error);
    }
  }, []);

  const playCorrectSound = useCallback(() => {
    playSound('correct');
  }, [playSound]);

  const playWrongSound = useCallback(() => {
    playSound('wrong');
  }, [playSound]);

  const playStreakSound = useCallback(() => {
    playSound('streak');
  }, [playSound]);

  const playBeetzSound = useCallback(() => {
    playSound('beetz');
  }, [playSound]);

  const playLevelUpSound = useCallback(() => {
    playSound('levelUp');
  }, [playSound]);

  const playComboSound = useCallback(() => {
    playSound('combo');
  }, [playSound]);

  const playPerfectScoreSound = useCallback(() => {
    playSound('perfectScore');
  }, [playSound]);

  const playAchievementSound = useCallback(() => {
    playSound('achievement');
  }, [playSound]);

  const playDistrictSound = useCallback((district: string) => {
    const soundKey = CUSTOM_SOUNDS[district as keyof typeof CUSTOM_SOUNDS] 
      ? district as keyof typeof CUSTOM_SOUNDS 
      : 'correct';
    playSound(soundKey);
  }, [playSound]);

  // Instância única do áudio de countdown para evitar duplicações
  let countdownAudioInstance: HTMLAudioElement | null = null;
  
  const playCountdownSound = useCallback(() => {
    console.log('🔊 Tentando tocar som de countdown');
    
    // Se já existe uma instância tocando, não criar nova
    if (countdownAudioInstance && !countdownAudioInstance.paused) {
      console.log('🔊 Som de countdown já está tocando, ignorando nova chamada');
      return;
    }
    
    try {
      // Parar e limpar instância anterior se existir
      if (countdownAudioInstance) {
        countdownAudioInstance.pause();
        countdownAudioInstance.currentTime = 0;
      }
      
      countdownAudioInstance = new Audio('/audio/10sec-digital-countdown-sfx-319873.mp3');
      console.log('🔊 Arquivo de áudio criado:', countdownAudioInstance.src);
      countdownAudioInstance.volume = 0.15;
      
      // Parar o áudio após exatos 10 segundos
      setTimeout(() => {
        if (countdownAudioInstance) {
          countdownAudioInstance.pause();
          countdownAudioInstance.currentTime = 0;
          console.log('🔊 Som de countdown parado após 10 segundos');
          countdownAudioInstance = null;
        }
      }, 10000);
      
      countdownAudioInstance.play().then(() => {
        console.log('🔊 Som de countdown tocado com sucesso');
      }).catch((error) => {
        console.error('🔊 Erro ao tocar som de countdown:', error);
        countdownAudioInstance = null;
      });
      
    } catch (error) {
      console.error('🔊 Erro ao criar áudio de countdown:', error);
      countdownAudioInstance = null;
    }
  }, []);

  return {
    playCorrectSound,
    playWrongSound,
    playStreakSound,
    playBeetzSound,
    playLevelUpSound,
    playComboSound,
    playPerfectScoreSound,
    playAchievementSound,
    playDistrictSound,
    playCountdownSound,
    playSound
  };
}

export { useCustomSounds };