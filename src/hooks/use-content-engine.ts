import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';

interface DynamicContent {
  id: string;
  type: 'simulation' | 'interactive_lesson' | 'adaptive_quiz' | 'scenario';
  title: string;
  description: string;
  content: any;
  difficulty: number;
  topics: string[];
  personalizedFor?: string;
  metadata: {
    estimatedTime: number;
    requiredLevel: number;
    concepts: string[];
    adaptiveParameters: any;
  };
}

interface ContentRecommendation {
  content: DynamicContent;
  reason: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
}

export const useContentEngine = () => {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const { profile } = useProfile();

  const generatePersonalizedContent = useCallback(async (
    topic: string, 
    type: DynamicContent['type'],
    userPreferences?: any
  ) => {
    if (!profile) return null;
    
    setGeneratingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-dynamic-content', {
        body: {
          topic,
          type,
          userLevel: profile.level,
          userId: profile.id,
          preferences: userPreferences
        }
      });

      if (error) throw error;
      return data.content as DynamicContent;
    } catch (error) {
      console.error('Content generation error:', error);
      return null;
    } finally {
      setGeneratingContent(false);
    }
  }, [profile]);

  const getRecommendations = useCallback(async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-recommendations', {
        body: {
          userId: profile.id,
          currentLevel: profile.level,
          recentActivity: true
        }
      });

      if (error) throw error;
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const createAdaptiveQuiz = useCallback(async (
    topics: string[],
    targetDifficulty?: number
  ) => {
    return generatePersonalizedContent(
      `Adaptive quiz covering: ${topics.join(', ')}`,
      'adaptive_quiz',
      { topics, targetDifficulty }
    );
  }, [generatePersonalizedContent]);

  const createSimulation = useCallback(async (
    scenario: string,
    complexity: 'basic' | 'intermediate' | 'advanced' = 'intermediate'
  ) => {
    return generatePersonalizedContent(
      `${scenario} simulation`,
      'simulation',
      { scenario, complexity }
    );
  }, [generatePersonalizedContent]);

  const createInteractiveLesson = useCallback(async (
    concept: string,
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  ) => {
    return generatePersonalizedContent(
      `Interactive lesson: ${concept}`,
      'interactive_lesson',
      { concept, learningStyle }
    );
  }, [generatePersonalizedContent]);

  // Load recommendations on mount
  useEffect(() => {
    getRecommendations();
  }, [getRecommendations]);

  return {
    recommendations,
    loading,
    generatingContent,
    generatePersonalizedContent,
    getRecommendations,
    createAdaptiveQuiz,
    createSimulation,
    createInteractiveLesson
  };
};