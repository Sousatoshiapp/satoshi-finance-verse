import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QuestionSequence {
  sessionId: string;
  questionIds: string[];
  category?: string;
  difficulty?: string;
  createdAt: Date;
}

export interface RandomizationConfig {
  avoidRecentRepetition: boolean;
  cooldownHours: number;
  maxSequenceCache: number;
}

export function useQuestionRandomizer(
  config: RandomizationConfig = {
    avoidRecentRepetition: true,
    cooldownHours: 24,
    maxSequenceCache: 50
  }
) {
  const [usedSequences, setUsedSequences] = useState<QuestionSequence[]>([]);
  const sessionCache = useRef<Map<string, string[]>>(new Map());

  // Gerar hash único para uma sequência de questões
  const generateSequenceHash = useCallback((questionIds: string[]): string => {
    return questionIds.sort().join('-');
  }, []);

  // Verificar se uma sequência já foi usada recentemente
  const isSequenceRecent = useCallback((questionIds: string[], category?: string, difficulty?: string): boolean => {
    if (!config.avoidRecentRepetition) return false;

    const hash = generateSequenceHash(questionIds);
    const cutoffTime = new Date(Date.now() - config.cooldownHours * 60 * 60 * 1000);

    return usedSequences.some(seq => {
      const seqHash = generateSequenceHash(seq.questionIds);
      const matchesHash = seqHash === hash;
      const isRecent = seq.createdAt > cutoffTime;
      const matchesCategory = !category || seq.category === category;
      const matchesDifficulty = !difficulty || seq.difficulty === difficulty;

      return matchesHash && isRecent && matchesCategory && matchesDifficulty;
    });
  }, [usedSequences, config, generateSequenceHash]);

  // Embaralhar array usando Fisher-Yates
  const shuffleArray = useCallback(<T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Buscar questões com randomização total
  const getRandomizedQuestions = useCallback(async (
    category?: string,
    difficulty?: string,
    limit: number = 10,
    excludeIds: string[] = []
  ) => {
    console.log('🔀 [RANDOMIZER DEBUG] Iniciando randomização de questões:', { 
      category, 
      difficulty, 
      limit,
      excludeIds: excludeIds.length 
    });

    try {
      // 1. Buscar todas as questões disponíveis da categoria/dificuldade
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_approved', true);

      console.log('🔍 [RANDOMIZER DEBUG] Aplicando filtros:', {
        hasCategory: !!category,
        hasDifficulty: !!difficulty,
        hasExcludes: excludeIds.length > 0
      });

      if (category) {
        console.log('🏷️ [RANDOMIZER DEBUG] Filtrando por categoria:', category);
        query = query.eq('category', category);
      }
      if (difficulty) {
        console.log('⚡ [RANDOMIZER DEBUG] Filtrando por dificuldade:', difficulty);
        query = query.eq('difficulty', difficulty);
      }
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data: allQuestions, error } = await query;

      console.log('📊 [RANDOMIZER DEBUG] Resultado da query:', {
        error: !!error,
        questionsFound: allQuestions?.length || 0,
        errorMessage: error?.message
      });

      if (error) {
        console.error('❌ [RANDOMIZER DEBUG] Erro na query:', error);
        throw error;
      }
      
      if (!allQuestions || allQuestions.length === 0) {
        console.warn('⚠️ [RANDOMIZER DEBUG] Nenhuma questão encontrada para os critérios:', {
          category,
          difficulty,
          limit
        });
        return [];
      }

      // Log das primeiras questões para verificação
      console.log('📋 [RANDOMIZER DEBUG] Sample das questões encontradas:', {
        total: allQuestions.length,
        categories: [...new Set(allQuestions.map(q => q.category))],
        difficulties: [...new Set(allQuestions.map(q => q.difficulty))],
        sampleQuestions: allQuestions.slice(0, 3).map(q => ({
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          question: q.question.substring(0, 60) + '...'
        }))
      });

      console.log('📚 Questões disponíveis:', allQuestions.length);

      // 2. Tentar gerar sequência única (até 10 tentativas)
      let attempts = 0;
      let selectedQuestions: any[] = [];
      
      while (attempts < 10) {
        // Embaralhar todas as questões disponíveis
        const shuffledQuestions = shuffleArray(allQuestions);
        
        // Selecionar as primeiras questões conforme o limite
        const candidateQuestions = shuffledQuestions.slice(0, Math.min(limit, shuffledQuestions.length));
        const candidateIds = candidateQuestions.map(q => q.id);

        // Verificar se esta sequência já foi usada recentemente
        if (!isSequenceRecent(candidateIds, category, difficulty)) {
          selectedQuestions = candidateQuestions;
          console.log('✅ Sequência única gerada na tentativa:', attempts + 1);
          break;
        }

        attempts++;
        console.log(`🔄 Tentativa ${attempts}: sequência já usada, tentando novamente...`);
      }

      // Se não conseguiu gerar sequência única, usar a última gerada
      if (selectedQuestions.length === 0 && allQuestions.length > 0) {
        console.log('⚠️ Usando sequência não-única após 10 tentativas');
        const shuffledQuestions = shuffleArray(allQuestions);
        selectedQuestions = shuffledQuestions.slice(0, Math.min(limit, shuffledQuestions.length));
      }

      // 3. Embaralhar as opções de cada questão também
      const randomizedQuestions = selectedQuestions.map(question => {
        const options = typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : Array.isArray(question.options) ? question.options : [];
        
        const correctAnswer = question.correct_answer;
        const shuffledOptions = shuffleArray(options);

        return {
          ...question,
          options: shuffledOptions,
          correct_answer: correctAnswer // Manter a resposta correta
        };
      });

      // 4. Registrar sequência usada
      const newSequence: QuestionSequence = {
        sessionId: Date.now().toString(),
        questionIds: randomizedQuestions.map(q => q.id),
        category,
        difficulty,
        createdAt: new Date()
      };

      setUsedSequences(prev => {
        const updated = [...prev, newSequence];
        // Manter apenas as sequências mais recentes
        if (updated.length > config.maxSequenceCache) {
          return updated.slice(-config.maxSequenceCache);
        }
        return updated;
      });

      console.log('🎯 Questões randomizadas:', {
        geradas: randomizedQuestions.length,
        sequenceId: newSequence.sessionId,
        tentativas: attempts + 1
      });

      return randomizedQuestions;

    } catch (error) {
      console.error('❌ Erro na randomização de questões:', error);
      return [];
    }
  }, [shuffleArray, isSequenceRecent, config]);

  // Embaralhar questões existentes (sem buscar do banco)
  const shuffleExistingQuestions = useCallback((questions: any[]) => {
    return shuffleArray(questions).map(question => {
      const options = Array.isArray(question.options) ? question.options : [];
      const shuffledOptions = shuffleArray(options);

      return {
        ...question,
        options: shuffledOptions
      };
    });
  }, [shuffleArray]);

  // Limpar cache de sequências antigas
  const clearOldSequences = useCallback(() => {
    const cutoffTime = new Date(Date.now() - config.cooldownHours * 60 * 60 * 1000);
    setUsedSequences(prev => prev.filter(seq => seq.createdAt > cutoffTime));
  }, [config.cooldownHours]);

  // Reset completo do randomizer
  const resetRandomizer = useCallback(() => {
    setUsedSequences([]);
    sessionCache.current.clear();
  }, []);

  return {
    getRandomizedQuestions,
    shuffleExistingQuestions,
    clearOldSequences,
    resetRandomizer,
    usedSequences: usedSequences.length
  };
}