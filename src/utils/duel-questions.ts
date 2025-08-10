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

const DISTRICT_MAPPING: Record<string, string> = {
  'XP Investimentos District': '0645a23d-6f02-465a-b9a5-8571853ebdec',
  'Banking Sector': '6add63a5-9c43-4859-8f9c-282223d6b077',
  'Cripto Valley': '5a562d56-efde-4341-8789-87fd3d4cf703',
  'Tech Finance Hub': 'e1f9ede2-3a54-4a4f-a533-4f85b9d9025c',
  'International Trade': 'c04f1a05-07f2-426b-8ea6-2fb783054111',
  'Real Estate Zone': '366870a4-fc67-48c2-be47-d3b35e5b523e',
  'Anima Educação District': '1c58cbaa-9ed2-45ba-b2f9-6b666e94e937'
};

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

export async function generateDuelQuestions(quizTopic: string): Promise<QuizQuestion[]> {
  try {
    console.log('🎯 Generating questions for topic:', quizTopic);
    
    // Map common topics to available districts
    const topicToDistrict: Record<string, string> = {
      'financas': '6add63a5-9c43-4859-8f9c-282223d6b077', // Banking Sector
      'cripto': '5a562d56-efde-4341-8789-87fd3d4cf703', // Cripto Valley
      'investimentos': '0645a23d-6f02-465a-b9a5-8571853ebdec', // XP Investimentos
      'educacao': '1c58cbaa-9ed2-45ba-b2f9-6b666e94e937', // Anima Educação
      'tech': 'e1f9ede2-3a54-4a4f-a533-4f85b9d9025c', // Tech Finance Hub
      'imoveis': '366870a4-fc67-48c2-be47-d3b35e5b523e', // Real Estate Zone
      'internacional': 'c04f1a05-07f2-426b-8ea6-2fb783054111' // International Trade
    };
    
    const districtId = topicToDistrict[quizTopic.toLowerCase()] || DISTRICT_MAPPING[quizTopic] || '6add63a5-9c43-4859-8f9c-282223d6b077';
    console.log('📍 Using district ID:', districtId);
    
    const { data: districtQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('district_id', districtId)
      .order('difficulty', { ascending: false })
      .limit(5);

    if (questionsError) {
      console.error('❌ Error loading questions:', questionsError);
      console.log('🔄 Falling back to default questions');
    }

    console.log('📊 Found questions:', districtQuestions?.length || 0);
    const questions = (districtQuestions || []).map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: JSON.parse(q.options as string).map((opt: string, optIndex: number) => ({
        id: String.fromCharCode(97 + optIndex),
        text: opt,
        isCorrect: opt === q.correct_answer
      })),
      explanation: q.explanation || 'Explicação não disponível'
    }));

    if (questions.length < 3) {
      const neededQuestions = 3 - questions.length;
      console.log('📝 Adding fallback questions:', neededQuestions);
      const fallbackToAdd = FALLBACK_QUESTIONS.slice(0, neededQuestions).map((q, index) => ({
        ...q,
        id: questions.length + index + 1
      }));
      questions.push(...fallbackToAdd);
    }

    console.log('✅ Final questions count:', questions.length);
    return questions;
  } catch (error) {
    console.error('❌ Error generating duel questions:', error);
    console.log('🔄 Using fallback questions');
    return FALLBACK_QUESTIONS;
  }
}
