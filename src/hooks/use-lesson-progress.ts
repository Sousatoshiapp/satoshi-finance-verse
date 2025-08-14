import { useDailyLessons } from './use-daily-lessons';

export function useLessonProgress() {
  const { userStreak, userProgress, isLessonCompleted } = useDailyLessons();

  // Calcular lições completadas baseado nos dados reais
  const completedLessonsCount = userStreak?.total_lessons_completed || 0;
  
  // Meta adaptável baseada na progressão do usuário
  const getProgressGoal = () => {
    if (completedLessonsCount <= 10) return 20;
    if (completedLessonsCount <= 30) return 50;
    return 100;
  };

  const progressGoal = getProgressGoal();
  const progressPercentage = Math.min((completedLessonsCount / progressGoal) * 100, 100);

  return {
    completedLessonsCount,
    progressGoal,
    progressPercentage,
    userStreak,
    userProgress,
    isLessonCompleted
  };
}