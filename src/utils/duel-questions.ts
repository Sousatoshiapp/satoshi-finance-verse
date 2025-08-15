import { supabase } from "../integrations/supabase/client";
import { QuizQuestion } from '@/types/quiz';

// Mapeamento de tópicos de duelo para categorias da base de dados
const TOPIC_TO_CATEGORY: Record<string, string> = {
  'financas': 'Finanças do Dia a Dia',
  'cripto': 'Cripto',
  'investimentos': 'ABC das Finanças',
  'educacao': 'ABC das Finanças',
  'tech': 'ABC das Finanças',
  'imoveis': 'Finanças do Dia a Dia',
  'internacional': 'ABC das Finanças'
};

// Lista de dificuldades em ordem de preferência (fallback)
const DIFFICULTY_FALLBACK = ['hard', 'medium', 'easy'];

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é a regra básica do orçamento pessoal?",
    options: [
      { id: "a", text: "Gastar mais do que se ganha", isCorrect: false },
      { id: "b", text: "Receitas devem ser maiores que despesas", isCorrect: true },
      { id: "c", text: "Poupar é desnecessário", isCorrect: false },
      { id: "d", text: "Investir é muito arriscado", isCorrect: false }
    ],
    correct_answer: "Receitas devem ser maiores que despesas",
    explanation: "A regra fundamental do orçamento é manter as receitas maiores que as despesas."
  },
  {
    id: 2,
    question: "O que é uma reserva de emergência?",
    options: [
      { id: "a", text: "Dinheiro para compras supérfluas", isCorrect: false },
      { id: "b", text: "Investimento de alto risco", isCorrect: false },
      { id: "c", text: "Recurso para situações inesperadas", isCorrect: true },
      { id: "d", text: "Dinheiro para férias", isCorrect: false }
    ],
    correct_answer: "Recurso para situações inesperadas",
    explanation: "A reserva de emergência é um fundo para cobrir despesas inesperadas."
  },
  {
    id: 3,
    question: "Qual é o principal objetivo de diversificar investimentos?",
    options: [
      { id: "a", text: "Aumentar os riscos", isCorrect: false },
      { id: "b", text: "Reduzir os riscos", isCorrect: true },
      { id: "c", text: "Garantir perdas", isCorrect: false },
      { id: "d", text: "Complicar a carteira", isCorrect: false }
    ],
    correct_answer: "Reduzir os riscos",
    explanation: "A diversificação ajuda a reduzir os riscos distribuindo investimentos em diferentes ativos."
  }
];

// Função para determinar dificuldade baseada no nível dos jogadores
function determineDuelDifficulty(playerLevel1: number = 1, playerLevel2: number = 1): string {
  const avgLevel = (playerLevel1 + playerLevel2) / 2;
  if (avgLevel >= 10) return 'hard';
  if (avgLevel >= 5) return 'medium';
  return 'easy';
}

// Função para obter questões já vistas pelo usuário
async function getUserSeenQuestions(userId: string, contextType: string = 'duel', daysBack: number = 7): Promise<string[]> {
  const { data: seenQuestions, error } = await supabase
    .from('user_question_history')
    .select('question_id')
    .eq('user_id', userId)
    .eq('context_type', contextType)
    .gte('seen_at', new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)).toISOString());
    
  if (error) {
    console.error('❌ Error fetching seen questions:', error);
    return [];
  }
  
  return seenQuestions.map(q => q.question_id);
}

// Função para registrar questões vistas
async function recordSeenQuestions(userId: string, questionIds: string[], contextType: string = 'duel'): Promise<void> {
  try {
    const records = questionIds.map(questionId => ({
      user_id: userId,
      question_id: questionId,
      context_type: contextType
    }));
    
    const { error } = await supabase
      .from('user_question_history')
      .insert(records);
      
    if (error) {
      console.error('❌ Error recording seen questions:', error);
    } else {
      console.log(`✅ Recorded ${questionIds.length} questions as seen for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error in recordSeenQuestions:', error);
  }
}

// Função para buscar questões com randomização completa e anti-repetição
async function getRandomizedQuestionsWithHistory(
  category: string, 
  targetDifficulty: string, 
  userId?: string,
  limit: number = 5,
  contextType: string = 'duel'
): Promise<any[]> {
  console.log('🎯 Getting randomized questions:', { category, targetDifficulty, limit, userId });
  
  // Obter questões já vistas pelo usuário (se userId fornecido)
  let seenQuestionIds: string[] = [];
  if (userId) {
    seenQuestionIds = await getUserSeenQuestions(userId, contextType);
    console.log(`📋 User has seen ${seenQuestionIds.length} questions recently`);
  }
  
  // Tentar buscar questões na dificuldade desejada primeiro, com randomização
  for (const difficulty of DIFFICULTY_FALLBACK) {
    if (DIFFICULTY_FALLBACK.indexOf(difficulty) < DIFFICULTY_FALLBACK.indexOf(targetDifficulty)) {
      continue; // Pular dificuldades mais altas que a desejada
    }
    
    console.log(`🔍 Searching for questions with difficulty: ${difficulty}`);
    
    // Primeira tentativa: questões não vistas
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('category', category)
      .eq('difficulty', difficulty);
      
    // Excluir questões já vistas se houver usuário
    if (userId && seenQuestionIds.length > 0) {
      query = query.not('id', 'in', `(${seenQuestionIds.join(',')})`);
    }
    
    // Buscar um pool maior e randomizar
    const poolSize = Math.max(limit * 3, 15); // Pool 3x maior que o necessário
    let { data: questions, error } = await query
      .limit(poolSize)
      .order('id', { ascending: false }); // Ordenação temporária para depois randomizar
      
    if (!error && questions && questions.length > 0) {
      // Randomizar as questões no JavaScript
      const shuffledQuestions = shuffleArray([...questions]);
      const selectedQuestions = shuffledQuestions.slice(0, limit);
      
      console.log(`✅ Found ${selectedQuestions.length} fresh questions with difficulty: ${difficulty}`);
      
      // Registrar questões como vistas
      if (userId) {
        const questionIds = selectedQuestions.map(q => q.id);
        await recordSeenQuestions(userId, questionIds, contextType);
      }
      
      return selectedQuestions;
    }
    
    // Se não encontrou questões novas suficientes, buscar todas (incluindo já vistas)
    console.log(`🔄 Not enough fresh questions, including previously seen...`);
    const { data: allQuestions, error: allError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('category', category)
      .eq('difficulty', difficulty)
      .limit(poolSize);
      
    if (!allError && allQuestions && allQuestions.length > 0) {
      const shuffledQuestions = shuffleArray([...allQuestions]);
      const selectedQuestions = shuffledQuestions.slice(0, limit);
      
      console.log(`✅ Found ${selectedQuestions.length} questions (including seen) with difficulty: ${difficulty}`);
      
      // Registrar questões como vistas
      if (userId) {
        const questionIds = selectedQuestions.map(q => q.id);
        await recordSeenQuestions(userId, questionIds, contextType);
      }
      
      return selectedQuestions;
    }
    
    console.log(`⚠️ No questions found for difficulty: ${difficulty}`);
  }
  
  // Se não encontrou nenhuma questão, tentar sem filtro de dificuldade
  console.log('🔄 Trying without difficulty filter...');
  let query = supabase
    .from('quiz_questions')
    .select('*')
    .eq('category', category);
    
  if (userId && seenQuestionIds.length > 0) {
    query = query.not('id', 'in', `(${seenQuestionIds.join(',')})`);
  }
  
  const { data: anyQuestions, error } = await query.limit(15);
  
  if (!error && anyQuestions && anyQuestions.length > 0) {
    const shuffledQuestions = shuffleArray([...anyQuestions]);
    const selectedQuestions = shuffledQuestions.slice(0, limit);
    
    console.log(`✅ Found ${selectedQuestions.length} questions without difficulty filter`);
    
    // Registrar questões como vistas
    if (userId) {
      const questionIds = selectedQuestions.map(q => q.id);
      await recordSeenQuestions(userId, questionIds, contextType);
    }
    
    return selectedQuestions;
  }
  
  console.log('❌ No questions found at all for category:', category);
  return [];
}

// Função Fisher-Yates para embaralhar array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função legacy mantida para compatibilidade
async function getQuestionsWithDifficultyFallback(
  category: string, 
  targetDifficulty: string, 
  limit: number = 5
): Promise<any[]> {
  return getRandomizedQuestionsWithHistory(category, targetDifficulty, undefined, limit);
}

// Função para formatar questões do banco para o formato esperado
function formatQuestions(data: any[]): QuizQuestion[] {
  return data.map((q, index) => {
    const optionsArray = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    
    console.log('🔧 Formatting question:', {
      id: q.id,
      question: q.question?.substring(0, 50) + '...',
      correct_answer: q.correct_answer,
      options_count: optionsArray?.length
    });
    
    return {
      id: index + 1,
      question: q.question,
      options: optionsArray.map((opt: string, optIndex: number) => ({
        id: String.fromCharCode(97 + optIndex), // 'a', 'b', 'c', 'd'
        text: opt,
        isCorrect: opt === q.correct_answer
      })),
      correct_answer: q.correct_answer, // Store the correct answer text
      explanation: q.explanation || 'Explicação não disponível'
    };
  });
}

// Nova função principal com sistema completo de randomização
export async function generateDuelQuestions(
  quizTopic: string, 
  playerLevel1?: number, 
  playerLevel2?: number,
  userId?: string
): Promise<QuizQuestion[]> {
  try {
    console.log('🎯 Generating duel questions for topic:', quizTopic, 'userId:', userId);
    
    // Mapear tópico para categoria
    const category = TOPIC_TO_CATEGORY[quizTopic.toLowerCase()] || 'Finanças do Dia a Dia';
    console.log('📂 Using category:', category);
    
    // Determinar dificuldade baseada no nível dos jogadores
    const targetDifficulty = determineDuelDifficulty(playerLevel1, playerLevel2);
    console.log('🎚️ Target difficulty:', targetDifficulty);
    
    // Buscar questões com sistema completo de randomização
    const questionsData = await getRandomizedQuestionsWithHistory(
      category, 
      targetDifficulty, 
      userId,
      5, // limit
      'duel' // context
    );
    
    if (questionsData.length > 0) {
      const questions = formatQuestions(questionsData);
      console.log('✅ Successfully loaded randomized questions:', questions.length);
      console.log('🎲 Question IDs:', questions.map(q => `${q.id} - ${q.question.substring(0, 30)}...`));
      return questions;
    }
    
    // Se não encontrou questões reais, usar fallback
    console.log('🔄 No real questions found, using fallback questions');
    return FALLBACK_QUESTIONS;
    
  } catch (error) {
    console.error('❌ Error generating duel questions:', error);
    console.log('🔄 Using fallback questions due to error');
    return FALLBACK_QUESTIONS;
  }
}

// Função legacy mantida para compatibilidade com código existente
export async function generateDuelQuestionsLegacy(
  quizTopic: string, 
  playerLevel1?: number, 
  playerLevel2?: number
): Promise<QuizQuestion[]> {
  return generateDuelQuestions(quizTopic, playerLevel1, playerLevel2);
}
