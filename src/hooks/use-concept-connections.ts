import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './use-profile';
import { useUnifiedRewards } from './use-unified-rewards';

export interface ConceptConnectionQuestion {
  id: string;
  theme: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  left_concepts: string[];
  right_concepts: string[];
  correct_connections: Record<string, string>;
  explanation?: string;
}

export interface ConceptSession {
  id?: string;
  question_id: string;
  connections_made: Record<string, string>;
  correct_connections: number;
  total_connections: number;
  time_seconds: number;
  btz_earned: number;
  xp_earned: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export function useConceptConnections() {
  const [questions, setQuestions] = useState<ConceptConnectionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<ConceptConnectionQuestion | null>(null);
  const { profile } = useProfile();
  const unifiedRewards = useUnifiedRewards();

  // Calcular recompensa BTZ baseada no nível
  const calculateConceptReward = (userLevel: number): number => {
    if (userLevel <= 5) return 0.15;        // Básico
    if (userLevel <= 15) return 0.2;        // Intermediário  
    if (userLevel <= 20) return 0.25;       // Avançado
    return 0.3;                             // Expert
  };

  // Buscar questões baseadas no tema e nível do usuário
  const getQuestionsByTheme = async (theme: string) => {
    try {
      setLoading(true);
      
      // Determinar dificuldade baseada no nível (com fallback)
      let difficulty: string;
      if (profile && profile.level) {
        if (profile.level <= 5) difficulty = 'basic';
        else if (profile.level <= 15) difficulty = 'intermediate';
        else difficulty = 'advanced';
      } else {
        // Fallback para dificuldade básica se profile não disponível
        difficulty = 'basic';
        console.log('Profile não disponível, usando dificuldade básica');
      }

      const { data, error } = await supabase
        .from('concept_connection_questions')
        .select('*')
        .eq('theme', theme)
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuestions: ConceptConnectionQuestion[] = data.map(q => ({
        id: q.id,
        theme: q.theme,
        difficulty: q.difficulty as 'basic' | 'intermediate' | 'advanced',
        left_concepts: q.left_concepts as string[],
        right_concepts: q.right_concepts as string[],
        correct_connections: q.correct_connections as Record<string, string>,
        explanation: q.explanation
      }));

      setQuestions(formattedQuestions);
      
      // Selecionar uma questão aleatória
      if (formattedQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * formattedQuestions.length);
        setCurrentQuestion(formattedQuestions[randomIndex]);
      }
    } catch (error) {
      console.error('Erro ao buscar questões de conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submeter sessão de conexão
  const submitConceptSession = async (session: ConceptSession) => {
    try {
      if (!profile || !unifiedRewards.isLoaded) return;

      // Calcular recompensas
      const userLevel = profile.level;
      const baseBTZ = calculateConceptReward(userLevel);
      
      // Multiplicador por acurácia (0.5x a 1.0x baseado na % de acerto)
      const accuracyMultiplier = session.correct_connections / session.total_connections;
      const finalBTZ = baseBTZ * Math.max(0.5, accuracyMultiplier);
      
      // XP baseado na complexidade: 2-5 pontos
      const baseXP = session.difficulty === 'basic' ? 2 : 
                    session.difficulty === 'intermediate' ? 3 : 5;
      
      // Salvar sessão no banco
      const { error } = await supabase
        .from('concept_connection_sessions')
        .insert({
          user_id: profile.id,
          question_id: session.question_id,
          connections_made: session.connections_made,
          correct_connections: session.correct_connections,
          total_connections: session.total_connections,
          time_seconds: session.time_seconds,
          btz_earned: finalBTZ,
          xp_earned: baseXP
        });

      if (error) throw error;

      // Conceder recompensas via unified rewards
      await unifiedRewards.earnBTZ(finalBTZ, 'concept_connections');
      await unifiedRewards.awardXP(baseXP, 'concept_connections');

      return {
        btz_earned: finalBTZ,
        xp_earned: baseXP,
        accuracy: accuracyMultiplier
      };
    } catch (error) {
      console.error('Erro ao submeter sessão de conexão:', error);
      return null;
    }
  };

  // Buscar histórico de sessões do usuário
  const getUserSessions = async (limit = 10) => {
    try {
      if (!profile) return [];

      const { data, error } = await supabase
        .from('concept_connection_sessions')
        .select(`
          *,
          concept_connection_questions (
            theme,
            difficulty,
            explanation
          )
        `)
        .eq('user_id', profile.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  return {
    questions,
    currentQuestion,
    loading,
    getQuestionsByTheme,
    submitConceptSession,
    getUserSessions,
    calculateConceptReward
  };
}