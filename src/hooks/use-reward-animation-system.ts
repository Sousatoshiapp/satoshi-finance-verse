import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAdvancedQuizAudio } from './use-advanced-quiz-audio';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Reward {
  type: 'btz' | 'xp' | 'item';
  amount: number;
  description: string;
}

interface RewardAnimationSystem {
  showBTZGain: (amount: number, position: { x: number, y: number }, multiplier?: number) => void;
  showXPGain: (amount: number, levelUp?: boolean) => void;
  showStreakMilestone: (days: number, multiplier: number) => void;
  showAchievementUnlock: (achievement: Achievement) => void;
  showLevelUp: (newLevel: number, rewards: Reward[]) => void;
  showPerfectQuiz: (score: number, streak: number) => void;
  showCorrectAnswer: (position: { x: number, y: number }) => void;
  showIncorrectAnswer: (correctAnswer: string) => void;
  showTimeBonus: (timeRemaining: number, bonus: number) => void;
}

export function useRewardAnimationSystem(): RewardAnimationSystem {
  const { addNotification } = useNotifications();
  const { playCorrectSound, playStreakSound, playCashRegisterSound } = useAdvancedQuizAudio();

  const showBTZGain = useCallback((amount: number, position: { x: number, y: number }, multiplier = 1) => {
    playCashRegisterSound();
    
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    const event = new CustomEvent('showFloatingNumber', {
      detail: {
        value: amount,
        type: 'btz',
        position,
        multiplier
      }
    });
    window.dispatchEvent(event);

    if (amount >= 100) {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { x: position.x / window.innerWidth, y: position.y / window.innerHeight },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
        scalar: 0.25
      });
    }
  }, [playCashRegisterSound]);

  const showXPGain = useCallback((amount: number, levelUp = false) => {
    playCorrectSound();
    
    const event = new CustomEvent('showFloatingNumber', {
      detail: {
        value: amount,
        type: 'xp',
        position: { x: window.innerWidth / 2, y: window.innerHeight * 0.3 },
        levelUp
      }
    });
    window.dispatchEvent(event);

    if (levelUp) {
      confetti({
        particleCount: 400,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#9333EA', '#C084FC', '#E879F9'],
        scalar: 0.25
      });
    }
  }, [playCorrectSound]);

  const showStreakMilestone = useCallback((days: number, multiplier: number) => {
    playStreakSound(1);
    
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }

    const event = new CustomEvent('showMilestoneCelebration', {
      detail: {
        milestone: {
          type: 'streak',
          value: days,
          title: `${days} Days Streak!`,
          description: `${multiplier}x multiplier active`,
          rewards: []
        }
      }
    });
    window.dispatchEvent(event);

    const colors = days >= 30 ? ['#FFD700', '#FFA500'] : 
                   days >= 14 ? ['#32CD32', '#90EE90'] : 
                   ['#87CEEB', '#4169E1'];

    confetti({
      particleCount: 600,
      spread: 180,
      origin: { y: 0.5 },
      colors,
      scalar: 0.25
    });
  }, [playStreakSound]);

  const showAchievementUnlock = useCallback((achievement: Achievement) => {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    addNotification({
      title: 'Achievement Unlocked!',
      message: achievement.title,
      type: 'success'
    });

    const event = new CustomEvent('showMilestoneCelebration', {
      detail: {
        milestone: {
          type: 'achievement',
          value: 1,
          title: 'Achievement Unlocked!',
          description: achievement.title,
          rewards: []
        }
      }
    });
    window.dispatchEvent(event);

    confetti({
      particleCount: 800,
      spread: 200,
      origin: { y: 0.4 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493'],
      scalar: 0.25
    });
  }, [addNotification]);

  const showLevelUp = useCallback((newLevel: number, rewards: Reward[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 200, 400, 200, 600]);
    }

    addNotification({
      title: 'Level Up!',
      message: `Congratulations! You reached level ${newLevel}`,
      type: 'success'
    });

    const event = new CustomEvent('showMilestoneCelebration', {
      detail: {
        milestone: {
          type: 'level',
          value: newLevel,
          title: 'Level Up!',
          description: `Welcome to level ${newLevel}`,
          rewards
        }
      }
    });
    window.dispatchEvent(event);

    confetti({
      particleCount: 1200,
      spread: 360,
      origin: { y: 0.3 },
      colors: ['#9333EA', '#C084FC', '#E879F9', '#FFD700'],
      scalar: 0.25
    });
  }, [addNotification]);

  const showPerfectQuiz = useCallback((score: number, streak: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 50, 200, 50, 200, 50, 400]);
    }

    const event = new CustomEvent('showMilestoneCelebration', {
      detail: {
        milestone: {
          type: 'perfect_quiz',
          value: score,
          title: 'Perfect Quiz!',
          description: `100% accuracy with ${streak} streak`,
          rewards: []
        }
      }
    });
    window.dispatchEvent(event);

    confetti({
      particleCount: 1000,
      spread: 180,
      origin: { y: 0.5 },
      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      scalar: 0.25
    });
  }, []);

  const showCorrectAnswer = useCallback((position: { x: number, y: number }) => {
    playCorrectSound();
    
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    const event = new CustomEvent('showCorrectFeedback', {
      detail: { position }
    });
    window.dispatchEvent(event);
  }, [playCorrectSound]);

  const showIncorrectAnswer = useCallback((correctAnswer: string) => {
    // Vibration for wrong answer
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    const event = new CustomEvent('showIncorrectFeedback', {
      detail: { correctAnswer }
    });
    window.dispatchEvent(event);
  }, []);

  const showTimeBonus = useCallback((timeRemaining: number, bonus: number) => {
    const event = new CustomEvent('showFloatingNumber', {
      detail: {
        value: bonus,
        type: 'bonus',
        position: { x: window.innerWidth * 0.8, y: window.innerHeight * 0.2 },
        timeRemaining
      }
    });
    window.dispatchEvent(event);

    confetti({
      particleCount: 120,
      spread: 50,
      origin: { x: 0.8, y: 0.2 },
      colors: ['#00FF00', '#32CD32'],
      scalar: 0.25
    });
  }, []);

  return {
    showBTZGain,
    showXPGain,
    showStreakMilestone,
    showAchievementUnlock,
    showLevelUp,
    showPerfectQuiz,
    showCorrectAnswer,
    showIncorrectAnswer,
    showTimeBonus
  };
}
