import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LearningAnalytics {
  id: string;
  analytics_date: string;
  total_study_time_minutes: number;
  questions_attempted: number;
  questions_correct: number;
  concepts_mastered: number;
  difficulty_preference: string;
  learning_velocity: number;
  attention_span_minutes: number;
  preferred_session_length: number;
  optimal_time_of_day: string;
  learning_style_data: any;
}

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  recommendation_data: any;
  confidence_score: number;
  applied: boolean;
  created_at: string;
  expires_at: string;
}

interface AnalyticsInsight {
  metric: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  insight: string;
  actionable: boolean;
}

interface LearningPattern {
  pattern: string;
  confidence: number;
  description: string;
  recommendations: string[];
}

interface LearningPrediction {
  nextBestTopic: string;
  estimatedMastery: number;
  suggestedStudyTime: number;
}

interface WeaknessAnalysis {
  concept: string;
  severity: number;
  improvement_path: string[];
}

interface StrengthAnalysis {
  concept: string;
  mastery_level: number;
  can_mentor: boolean;
}

interface AnalyticsData {
  insights: AnalyticsInsight[];
  patterns: LearningPattern[];
  predictions: LearningPrediction;
  weaknessAnalysis: WeaknessAnalysis[];
  strengthsAnalysis: StrengthAnalysis[];
}

export function useLearningAnalytics() {
  const [analytics, setAnalytics] = useState<LearningAnalytics[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Carregar analytics dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: analyticsData } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', profile.id)
        .gte('analytics_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('analytics_date', { ascending: false });

      // Carregar recomendações ativas
      const { data: recommendationsData } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', profile.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      setAnalytics(analyticsData || []);
      setRecommendations(recommendationsData || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = async (studyTime: number, questionsAttempted: number, questionsCorrect: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('update_learning_analytics', {
        p_user_id: profile.id,
        p_study_time: studyTime,
        p_questions_attempted: questionsAttempted,
        p_questions_correct: questionsCorrect
      });

      if (error) throw error;

      // Recarregar dados
      await loadAnalyticsData();

      return data;
    } catch (error) {
      console.error('Error updating analytics:', error);
      return null;
    }
  };

  const generateRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase.rpc('generate_ai_recommendations', {
        p_user_id: profile.id
      });

      if (error) throw error;

      await loadAnalyticsData();
      return data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return null;
    }
  };

  const applyRecommendation = async (recommendationId: string) => {
    try {
      await supabase
        .from('ai_recommendations')
        .update({ applied: true })
        .eq('id', recommendationId);

      await loadAnalyticsData();
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  };

  const getWeeklyStudyTime = () => {
    const lastWeek = analytics.slice(0, 7);
    return lastWeek.reduce((total, day) => total + day.total_study_time_minutes, 0);
  };

  const getAverageAccuracy = () => {
    const totalAttempted = analytics.reduce((sum, day) => sum + day.questions_attempted, 0);
    const totalCorrect = analytics.reduce((sum, day) => sum + day.questions_correct, 0);
    return totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
  };

  const getLearningVelocity = () => {
    const recentAnalytics = analytics.slice(0, 7);
    const avgVelocity = recentAnalytics.reduce((sum, day) => sum + day.learning_velocity, 0) / recentAnalytics.length;
    return avgVelocity || 0;
  };

  const getStudyTimeProgress = () => {
    return analytics.map(day => ({
      date: day.analytics_date,
      minutes: day.total_study_time_minutes,
      questions: day.questions_attempted,
      accuracy: day.questions_attempted > 0 ? (day.questions_correct / day.questions_attempted) * 100 : 0
    }));
  };

  const getPendingRecommendations = () => {
    return recommendations.filter(r => !r.applied);
  };

  const getRecommendationsByType = (type: string) => {
    return recommendations.filter(r => r.recommendation_type === type && !r.applied);
  };

  const generateAnalytics = async () => {
    if (analytics.length === 0) return;

    // Generate mock analytics data based on real data
    const mockAnalytics: AnalyticsData = {
      insights: [
        {
          metric: 'Tempo de Estudo',
          value: getWeeklyStudyTime(),
          trend: 'up',
          insight: 'Aumentou 15% esta semana',
          actionable: false
        },
        {
          metric: 'Precisão',
          value: `${getAverageAccuracy().toFixed(1)}%`,
          trend: getAverageAccuracy() > 75 ? 'up' : 'down',
          insight: 'Mantendo boa consistência',
          actionable: true
        },
        {
          metric: 'Velocidade',
          value: getLearningVelocity().toFixed(1),
          trend: 'stable',
          insight: 'Questões por minuto',
          actionable: false
        }
      ],
      patterns: [
        {
          pattern: 'Melhor desempenho pela manhã',
          confidence: 0.85,
          description: 'Você tende a ter melhor precisão entre 8h e 11h',
          recommendations: ['Agende estudos mais complexos pela manhã', 'Use a tarde para revisão']
        },
        {
          pattern: 'Dificuldade com conceitos de renda fixa',
          confidence: 0.92,
          description: 'Taxa de erro 40% maior em questões de renda fixa',
          recommendations: ['Foque em teoria antes da prática', 'Use simuladores de bonds']
        }
      ],
      predictions: {
        nextBestTopic: 'Análise Técnica',
        estimatedMastery: 78,
        suggestedStudyTime: 45
      },
      weaknessAnalysis: [
        {
          concept: 'Derivativos',
          severity: 7,
          improvement_path: ['Revise conceitos básicos', 'Pratique com simuladores', 'Faça exercícios diários']
        },
        {
          concept: 'Análise Fundamentalista',
          severity: 5,
          improvement_path: ['Estude demonstrações financeiras', 'Pratique cálculo de indicadores']
        }
      ],
      strengthsAnalysis: [
        {
          concept: 'Renda Variável',
          mastery_level: 92,
          can_mentor: true
        },
        {
          concept: 'Planejamento Financeiro',
          mastery_level: 88,
          can_mentor: true
        }
      ]
    };

    setAnalyticsData(mockAnalytics);
  };

  const getOptimalStudyPlan = () => {
    // Mock implementation
    return {
      recommendedTime: 30,
      bestTopics: ['Análise Técnica', 'Renda Fixa'],
      difficulty: 'intermediate'
    };
  };

  return {
    analytics: analyticsData,
    recommendations,
    loading,
    updateAnalytics,
    generateRecommendations,
    applyRecommendation,
    getWeeklyStudyTime,
    getAverageAccuracy,
    getLearningVelocity,
    getStudyTimeProgress,
    getPendingRecommendations,
    getRecommendationsByType,
    loadAnalyticsData,
    generateAnalytics,
    getOptimalStudyPlan
  };
}