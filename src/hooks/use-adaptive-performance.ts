import { useState, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  recentPerformance: boolean[]; // últimas 5-10 respostas
  consecutiveCorrect: number;
  consecutiveWrong: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  shouldAdjustDifficulty: boolean;
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
}

export interface PerformanceWindow {
  windowSize: number; // tamanho da janela de análise
  adjustmentThreshold: number; // limite para ajuste de dificuldade
}

export function useAdaptivePerformance(
  initialDifficulty: 'easy' | 'medium' | 'hard' = 'medium',
  windowConfig: PerformanceWindow = { windowSize: 5, adjustmentThreshold: 0.2 }
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    correctAnswers: 0,
    totalAnswers: 0,
    accuracy: 0,
    averageResponseTime: 0,
    recentPerformance: [],
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    currentDifficulty: initialDifficulty,
    shouldAdjustDifficulty: false,
    suggestedDifficulty: initialDifficulty
  });

  const responseTimes = useRef<number[]>([]);

  // Adicionar nova resposta e analisar performance
  const recordAnswer = useCallback((isCorrect: boolean, responseTime: number) => {
    setMetrics(prev => {
      const newRecentPerformance = [...prev.recentPerformance, isCorrect];
      
      // Manter apenas as últimas respostas (janela)
      if (newRecentPerformance.length > windowConfig.windowSize) {
        newRecentPerformance.shift();
      }

      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const newTotalAnswers = prev.totalAnswers + 1;
      const newAccuracy = newTotalAnswers > 0 ? newCorrectAnswers / newTotalAnswers : 0;

      // Atualizar tempos de resposta
      responseTimes.current.push(responseTime);
      if (responseTimes.current.length > windowConfig.windowSize) {
        responseTimes.current.shift();
      }

      const newAverageResponseTime = responseTimes.current.length > 0 
        ? responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length 
        : 0;

      // Calcular streaks
      const newConsecutiveCorrect = isCorrect ? prev.consecutiveCorrect + 1 : 0;
      const newConsecutiveWrong = !isCorrect ? prev.consecutiveWrong + 1 : 0;

      // ALGORITMO DE AJUSTE ADAPTATIVO
      let shouldAdjust = false;
      let suggestedDifficulty = prev.currentDifficulty;

      // Analisar performance da janela recente
      if (newRecentPerformance.length >= Math.min(windowConfig.windowSize, 3)) {
        const recentAccuracy = newRecentPerformance.filter(Boolean).length / newRecentPerformance.length;
        
        console.log('🎯 Análise Adaptativa:', {
          recentAccuracy,
          windowSize: newRecentPerformance.length,
          currentDifficulty: prev.currentDifficulty,
          consecutiveCorrect: newConsecutiveCorrect,
          consecutiveWrong: newConsecutiveWrong
        });

        // REGRAS DE AJUSTE
        
        // 1. Performance alta consistente → Aumentar dificuldade
        if (recentAccuracy >= 0.80 && newConsecutiveCorrect >= 3) {
          if (prev.currentDifficulty === 'easy') {
            suggestedDifficulty = 'medium';
            shouldAdjust = true;
          } else if (prev.currentDifficulty === 'medium') {
            suggestedDifficulty = 'hard';
            shouldAdjust = true;
          }
        }
        
        // 2. Performance baixa consistente → Diminuir dificuldade
        else if (recentAccuracy <= 0.40 && newConsecutiveWrong >= 2) {
          if (prev.currentDifficulty === 'hard') {
            suggestedDifficulty = 'medium';
            shouldAdjust = true;
          } else if (prev.currentDifficulty === 'medium') {
            suggestedDifficulty = 'easy';
            shouldAdjust = true;
          }
        }
        
        // 3. Ajuste por tempo de resposta (muito rápido = muito fácil)
        else if (recentAccuracy >= 0.70 && newAverageResponseTime < 5000) {
          if (prev.currentDifficulty === 'easy') {
            suggestedDifficulty = 'medium';
            shouldAdjust = true;
          }
        }
        
        // 4. Ajuste por tempo de resposta (muito lento = muito difícil)
        else if (recentAccuracy <= 0.60 && newAverageResponseTime > 20000) {
          if (prev.currentDifficulty === 'hard') {
            suggestedDifficulty = 'medium';
            shouldAdjust = true;
          }
        }
      }

      console.log('📊 Performance Update:', {
        isCorrect,
        newAccuracy,
        recentPerformance: newRecentPerformance,
        shouldAdjust,
        suggestedDifficulty,
        currentDifficulty: prev.currentDifficulty
      });

      return {
        correctAnswers: newCorrectAnswers,
        totalAnswers: newTotalAnswers,
        accuracy: newAccuracy,
        averageResponseTime: newAverageResponseTime,
        recentPerformance: newRecentPerformance,
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveWrong: newConsecutiveWrong,
        currentDifficulty: prev.currentDifficulty,
        shouldAdjustDifficulty: shouldAdjust,
        suggestedDifficulty
      };
    });
  }, [windowConfig]);

  // Aplicar ajuste de dificuldade
  const applyDifficultyAdjustment = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      currentDifficulty: prev.suggestedDifficulty,
      shouldAdjustDifficulty: false,
      // Reset alguns contadores para nova dificuldade
      consecutiveCorrect: 0,
      consecutiveWrong: 0
    }));
    
    console.log('🎚️ Dificuldade ajustada para:', metrics.suggestedDifficulty);
  }, [metrics.suggestedDifficulty]);

  // Reset métricas
  const resetMetrics = useCallback(() => {
    setMetrics({
      correctAnswers: 0,
      totalAnswers: 0,
      accuracy: 0,
      averageResponseTime: 0,
      recentPerformance: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      currentDifficulty: initialDifficulty,
      shouldAdjustDifficulty: false,
      suggestedDifficulty: initialDifficulty
    });
    responseTimes.current = [];
  }, [initialDifficulty]);

  return {
    metrics,
    recordAnswer,
    applyDifficultyAdjustment,
    resetMetrics
  };
}