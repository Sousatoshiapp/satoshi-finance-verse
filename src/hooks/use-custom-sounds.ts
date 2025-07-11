import { useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Lista de rotas onde o countdown deve tocar (apenas rotas de quiz)
  const isQuizRoute = useCallback(() => {
    const quizRoutes = [
      '/quiz',
      '/solo-quiz', 
      '/enhanced-quiz',
      '/duel-quiz',
      '/tournament-quiz',
      '/district-duel',
    ];
    
    console.log('🔊 [SOM] Verificando rota:', location.pathname);
    const isQuiz = quizRoutes.some(route => location.pathname.startsWith(route));
    console.log('🔊 [SOM] É rota de quiz?', isQuiz);
    
    return isQuiz;
  }, [location.pathname]);
  const playSound = useCallback((soundType: keyof typeof CUSTOM_SOUNDS, volume: number = 0.3) => {
    console.log(`🔊 [SOM] Reproduzindo som: ${soundType} (volume: ${volume})`);
    try {
      const audio = new Audio(CUSTOM_SOUNDS[soundType]);
      audio.volume = volume;
      audio.play().then(() => {
        console.log(`🔊 [SOM] Som ${soundType} reproduzido com sucesso`);
      }).catch((error) => {
        console.error(`🔊 [SOM] Erro ao tocar som ${soundType}:`, error);
      });
    } catch (error) {
      console.error(`🔊 [SOM] Erro ao criar áudio ${soundType}:`, error);
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

  const playCountdownSound = useCallback(() => {
    console.log('🔊 [SOM] playCountdownSound chamado. Rota atual:', location.pathname);
    
    // Só toca o countdown se estiver em uma rota de quiz
    if (!isQuizRoute()) {
      console.log('🔊 [SOM] Não está em uma rota de quiz, som de countdown bloqueado');
      return;
    }
    
    console.log('🔊 [SOM] Tentando tocar som de countdown');
    
    // Se já existe uma instância tocando, não criar nova
    if (countdownAudioRef.current && !countdownAudioRef.current.paused) {
      console.log('🔊 [SOM] Som de countdown já está tocando, ignorando nova chamada');
      return;
    }
    
    try {
      // Parar e limpar instância anterior se existir
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current.currentTime = 0;
      }
      
      countdownAudioRef.current = new Audio('/audio/10sec-digital-countdown-sfx-319873.mp3');
      console.log('🔊 [SOM] Arquivo de áudio criado:', countdownAudioRef.current.src);
      countdownAudioRef.current.volume = 0.15;
      
      // Deixar o som tocar naturalmente até o fim
      countdownAudioRef.current.addEventListener('ended', () => {
        console.log('🔊 [SOM] Som de countdown terminou naturalmente');
        countdownAudioRef.current = null;
      });
      
      countdownAudioRef.current.play().then(() => {
        console.log('🔊 [SOM] Som de countdown tocado com sucesso');
      }).catch((error) => {
        console.error('🔊 [SOM] Erro ao tocar som de countdown:', error);
        countdownAudioRef.current = null;
      });
      
    } catch (error) {
      console.error('🔊 [SOM] Erro ao criar áudio de countdown:', error);
      countdownAudioRef.current = null;
    }
  }, [isQuizRoute, location.pathname]);

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