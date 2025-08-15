import { Badge } from '@/components/shared/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAdaptivePerformance } from '@/hooks/use-adaptive-performance';

interface AdaptiveQuizIndicatorProps {
  metrics: ReturnType<typeof useAdaptivePerformance>['metrics'];
  showAdjustments?: boolean;
}

export function AdaptiveQuizIndicator({ 
  metrics, 
  showAdjustments = true 
}: AdaptiveQuizIndicatorProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getPerformanceIndicator = () => {
    if (metrics.accuracy >= 0.8) return { icon: <TrendingUp className="h-3 w-3" />, color: 'text-green-600' };
    if (metrics.accuracy <= 0.4) return { icon: <TrendingDown className="h-3 w-3" />, color: 'text-red-600' };
    return { icon: <Minus className="h-3 w-3" />, color: 'text-yellow-600' };
  };

  const performanceIndicator = getPerformanceIndicator();

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Dificuldade Atual */}
      <Badge variant="outline" className={getDifficultyColor(metrics.currentDifficulty)}>
        {getDifficultyIcon(metrics.currentDifficulty)} {metrics.currentDifficulty.toUpperCase()}
      </Badge>

      {/* Performance */}
      <div className={`flex items-center gap-1 ${performanceIndicator.color}`}>
        {performanceIndicator.icon}
        <span>{Math.round(metrics.accuracy * 100)}%</span>
      </div>

      {/* Indicador de Ajuste */}
      {showAdjustments && metrics.shouldAdjustDifficulty && (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-700 border-blue-500/30 animate-pulse">
          🎚️ Ajustando...
        </Badge>
      )}

      {/* Streak */}
      {metrics.consecutiveCorrect > 0 && (
        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
          🔥 {metrics.consecutiveCorrect}
        </Badge>
      )}
    </div>
  );
}