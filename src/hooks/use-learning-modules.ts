import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LearningModule {
  id: string;
  name: string;
  description: string;
  learning_objectives: string[];
  prerequisite_modules: string[];
  estimated_duration_minutes: number;
  difficulty_level: number;
  module_order: number;
  is_active: boolean;
  sponsor_company?: string;
  banner_image_url?: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface UserModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  started_at: string;
  completed_at?: string;
  current_lesson: number;
  total_lessons: number;
  mastery_score: number;
  time_spent_minutes: number;
  is_completed: boolean;
  last_accessed: string;
}

interface ConceptMastery {
  id: string;
  concept_id: string;
  concept_name: string;
  mastery_level: number;
  total_exposures: number;
  correct_responses: number;
  last_reviewed: string;
}

export function useLearningModules() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserModuleProgress[]>([]);
  const [conceptMastery, setConceptMastery] = useState<ConceptMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
    loadUserProgress();
    loadConceptMastery();
  }, []);

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('is_active', true)
        .order('module_order');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const loadConceptMastery = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_concept_mastery')
        .select(`
          *,
          educational_concepts!inner(name)
        `)
        .eq('user_id', profile.id);

      if (error) throw error;
      setConceptMastery(data?.map(item => ({
        ...item,
        concept_name: item.educational_concepts.name
      })) || []);
    } catch (error) {
      console.error('Error loading concept mastery:', error);
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (moduleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      await supabase.rpc('update_module_progress', {
        p_user_id: profile.id,
        p_module_id: moduleId
      });

      await loadUserProgress();
    } catch (error) {
      console.error('Error starting module:', error);
    }
  };

  const getModuleProgress = (moduleId: string): UserModuleProgress | undefined => {
    return userProgress.find(p => p.module_id === moduleId);
  };

  const getAvailableModules = (): LearningModule[] => {
    return modules.filter(module => {
      // Check if prerequisites are met
      if (module.prerequisite_modules.length === 0) return true;
      
      return module.prerequisite_modules.every(prereqId => {
        const prereqProgress = getModuleProgress(prereqId);
        return prereqProgress?.is_completed;
      });
    });
  };

  const getOverallMastery = (): number => {
    if (conceptMastery.length === 0) return 0;
    return conceptMastery.reduce((sum, concept) => sum + concept.mastery_level, 0) / conceptMastery.length;
  };

  const getModulesByDifficulty = (difficulty: number): LearningModule[] => {
    return modules.filter(module => module.difficulty_level === difficulty);
  };

  const getSponsoredModules = (): LearningModule[] => {
    return modules.filter(module => module.sponsor_company);
  };

  const getRecommendedModule = (): LearningModule | null => {
    const available = getAvailableModules();
    const notStarted = available.filter(module => !getModuleProgress(module.id));
    
    if (notStarted.length > 0) {
      // Return the first module in order that hasn't been started
      return notStarted.sort((a, b) => a.module_order - b.module_order)[0];
    }

    // Return incomplete modules
    const incomplete = available.filter(module => {
      const progress = getModuleProgress(module.id);
      return progress && !progress.is_completed;
    });

    return incomplete.length > 0 ? incomplete[0] : null;
  };

  return {
    modules,
    userProgress,
    conceptMastery,
    loading,
    startModule,
    getModuleProgress,
    getAvailableModules,
    getOverallMastery,
    getModulesByDifficulty,
    getSponsoredModules,
    getRecommendedModule,
    loadModules,
    loadUserProgress,
    loadConceptMastery
  };
}