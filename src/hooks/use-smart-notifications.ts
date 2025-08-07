import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
}

interface Reward {
  type: 'btz' | 'xp' | 'item';
  amount: number;
  description: string;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  duration: number;
}

interface SmartNotificationSystem {
  showAchievementNotification: (achievement: Achievement) => void;
  showStreakNotification: (days: number, nextMilestone: number) => void;
  showLevelUpNotification: (level: number, unlockedFeatures: string[]) => void;
  showMissionProgress: (mission: Mission, progress: number) => void;
  showDailyGoalComplete: (rewards: Reward[]) => void;
  showWeeklyRankingUpdate: (position: number, change: number) => void;
  showMultiplierActive: (multiplier: number, timeRemaining: number) => void;
  showPowerUpActivated: (powerUp: PowerUp) => void;
  showStreakProtection: (used: boolean) => void;
}

export function useSmartNotifications(): SmartNotificationSystem {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  const showAchievementNotification = useCallback((achievement: Achievement) => {
    addNotification({
      title: t('feedback.notifications.achievementUnlocked'),
      message: achievement.title,
      type: 'success'
    });

    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: `achievement-${achievement.id}`,
        type: 'achievement',
        title: t('feedback.notifications.achievementUnlocked'),
        description: achievement.title,
        icon: achievement.icon,
        position: 'top-center',
        animation: 'bounce',
        duration: 5000
      }
    });
    window.dispatchEvent(event);
  }, [addNotification, t]);

  const showStreakNotification = useCallback((days: number, nextMilestone: number) => {
    const isSpecialMilestone = days % 7 === 0;
    
    if (isSpecialMilestone) {
      const event = new CustomEvent('showSmartNotification', {
        detail: {
          id: `streak-${days}`,
          type: 'celebration',
          title: t('feedback.celebrations.streak', { days }),
          description: t('feedback.notifications.nextMilestone', { milestone: nextMilestone }),
          icon: '🔥',
          position: 'top-center',
          animation: 'scale',
          duration: 4000
        }
      });
      window.dispatchEvent(event);
    }
  }, [t]);

  const showLevelUpNotification = useCallback((level: number, unlockedFeatures: string[]) => {
    addNotification({
      title: t('feedback.animations.levelUp'),
      message: t('feedback.celebrations.levelMilestone', { level }),
      type: 'success'
    });

    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: `levelup-${level}`,
        type: 'celebration',
        title: t('feedback.animations.levelUp'),
        description: t('feedback.celebrations.levelMilestone', { level }),
        icon: '⭐',
        position: 'top-center',
        animation: 'bounce',
        duration: 6000,
        action: unlockedFeatures.length > 0 ? {
          label: t('common.viewFeatures'),
          onClick: () => {
            console.log('Show unlocked features:', unlockedFeatures);
          }
        } : undefined
      }
    });
    window.dispatchEvent(event);
  }, [addNotification, t]);

  const showMissionProgress = useCallback((mission: Mission, progress: number) => {
    const progressPercentage = Math.floor((progress / mission.target) * 100);
    
    if (progressPercentage >= 100) {
      const event = new CustomEvent('showSmartNotification', {
        detail: {
          id: `mission-complete-${mission.id}`,
          type: 'progress',
          title: t('feedback.notifications.missionComplete'),
          description: mission.title,
          icon: '✅',
          position: 'top-right',
          animation: 'slide',
          duration: 4000
        }
      });
      window.dispatchEvent(event);
    } else if (progressPercentage % 25 === 0 && progressPercentage > 0) {
      const event = new CustomEvent('showSmartNotification', {
        detail: {
          id: `mission-progress-${mission.id}-${progressPercentage}`,
          type: 'progress',
          title: `${progressPercentage}% Complete`,
          description: mission.title,
          icon: '📈',
          position: 'top-right',
          animation: 'fade',
          duration: 3000
        }
      });
      window.dispatchEvent(event);
    }
  }, [t]);

  const showDailyGoalComplete = useCallback((rewards: Reward[]) => {
    const totalBTZ = rewards.filter(r => r.type === 'btz').reduce((sum, r) => sum + r.amount, 0);
    const totalXP = rewards.filter(r => r.type === 'xp').reduce((sum, r) => sum + r.amount, 0);

    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: 'daily-goal-complete',
        type: 'celebration',
        title: t('feedback.notifications.dailyGoalReached'),
        description: `+${totalBTZ} BTZ, +${totalXP} XP`,
        icon: '🎯',
        position: 'top-center',
        animation: 'bounce',
        duration: 5000
      }
    });
    window.dispatchEvent(event);
  }, [t]);

  const showWeeklyRankingUpdate = useCallback((position: number, change: number) => {
    const isImprovement = change > 0;
    
    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: 'ranking-update',
        type: isImprovement ? 'celebration' : 'progress',
        title: t('feedback.notifications.weeklyRankingUp', { position }),
        description: isImprovement 
          ? `+${change} positions!` 
          : change < 0 
            ? `${change} positions` 
            : 'No change',
        icon: isImprovement ? '📈' : '📊',
        position: 'top-right',
        animation: isImprovement ? 'bounce' : 'slide',
        duration: 4000
      }
    });
    window.dispatchEvent(event);
  }, [t]);

  const showMultiplierActive = useCallback((multiplier: number, timeRemaining: number) => {
    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: 'multiplier-active',
        type: 'warning',
        title: t('feedback.animations.multiplierActive'),
        description: t('feedback.notifications.multiplierExpiring', { 
          time: `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` 
        }),
        icon: '⚡',
        position: 'bottom-center',
        animation: 'fade',
        duration: 3000
      }
    });
    window.dispatchEvent(event);
  }, [t]);

  const showPowerUpActivated = useCallback((powerUp: PowerUp) => {
    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: `powerup-${powerUp.id}`,
        type: 'progress',
        title: t('feedback.notifications.powerUpActivated'),
        description: powerUp.name,
        icon: '💪',
        position: 'top-right',
        animation: 'scale',
        duration: 3000
      }
    });
    window.dispatchEvent(event);
  }, [t]);

  const showStreakProtection = useCallback((used: boolean) => {
    const event = new CustomEvent('showSmartNotification', {
      detail: {
        id: 'streak-protection',
        type: used ? 'warning' : 'progress',
        title: t('feedback.notifications.streakProtected'),
        description: used 
          ? 'Streak protection used!' 
          : 'Your streak is safe',
        icon: '🛡️',
        position: 'top-center',
        animation: 'bounce',
        duration: 4000
      }
    });
    window.dispatchEvent(event);
  }, [t]);

  return {
    showAchievementNotification,
    showStreakNotification,
    showLevelUpNotification,
    showMissionProgress,
    showDailyGoalComplete,
    showWeeklyRankingUpdate,
    showMultiplierActive,
    showPowerUpActivated,
    showStreakProtection
  };
}
