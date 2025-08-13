import { supabase } from "../integrations/supabase/client";

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

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

// Função para buscar questões com fallback de dificuldade
async function getQuestionsWithDifficultyFallback(
  category: string, 
  targetDifficulty: string, 
  limit: number = 5
): Promise<any[]> {
  console.log('🔍 Trying to find questions:', { category, targetDifficulty, limit });
  
  // Tentar buscar questões na dificuldade desejada primeiro
  for (const difficulty of DIFFICULTY_FALLBACK) {
    if (DIFFICULTY_FALLBACK.indexOf(difficulty) < DIFFICULTY_FALLBACK.indexOf(targetDifficulty)) {
      continue; // Pular dificuldades mais altas que a desejada
    }
    
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('category', category)
      .eq('difficulty', difficulty)
      .limit(limit);

    if (!error && questions && questions.length > 0) {
      console.log(`✅ Found ${questions.length} questions with difficulty: ${difficulty}`);
      return questions;
    }
    
    console.log(`⚠️ No questions found for difficulty: ${difficulty}`);
  }
  
  // Se não encontrou nenhuma questão, tentar sem filtro de dificuldade
  console.log('🔄 Trying without difficulty filter...');
  const { data: anyQuestions, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('category', category)
    .limit(limit);
  
  if (!error && anyQuestions && anyQuestions.length > 0) {
    console.log(`✅ Found ${anyQuestions.length} questions without difficulty filter`);
    return anyQuestions;
  }
  
  console.log('❌ No questions found at all for category:', category);
  return [];
}

// Função para formatar questões do banco para o formato esperado
function formatQuestions(data: any[]): QuizQuestion[] {
  return data.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: (typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt: string, optIndex: number) => ({
      id: String.fromCharCode(97 + optIndex),
      text: opt,
      isCorrect: opt === q.correct_answer
    })),
    explanation: q.explanation || 'Explicação não disponível'
  }));
}

export async function generateDuelQuestions(
  quizTopic: string, 
  playerLevel1?: number, 
  playerLevel2?: number
): Promise<QuizQuestion[]> {
  try {
    console.log('🎯 Generating duel questions for topic:', quizTopic);
    
    // Mapear tópico para categoria
    const category = TOPIC_TO_CATEGORY[quizTopic.toLowerCase()] || 'Finanças do Dia a Dia';
    console.log('📂 Using category:', category);
    
    // Determinar dificuldade baseada no nível dos jogadores
    const targetDifficulty = determineDuelDifficulty(playerLevel1, playerLevel2);
    console.log('🎚️ Target difficulty:', targetDifficulty);
    
    // Buscar questões com fallback de dificuldade
    const questionsData = await getQuestionsWithDifficultyFallback(category, targetDifficulty, 5);
    
    if (questionsData.length > 0) {
      const questions = formatQuestions(questionsData);
      console.log('✅ Successfully loaded real questions:', questions.length);
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
