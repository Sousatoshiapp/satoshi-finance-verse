import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Templates de temas com configurações específicas de dificuldade
const THEME_TEMPLATES = {
  financial_education: {
    name: "Educação Financeira",
    description: "Conceitos básicos fundamentais de educação financeira",
    easy_keywords: "reserva emergência, poupança, orçamento básico, juros simples, inflação básica",
    medium_keywords: "juros compostos, CDB, investimentos básicos, planejamento financeiro",
    hard_keywords: "análise de risco, diversificação, planejamento aposentadoria"
  },
  budgeting: {
    name: "Orçamento & Planejamento",
    description: "Controle financeiro pessoal e planejamento",
    easy_keywords: "controle gastos, planilha orçamento, categorias gastos",
    medium_keywords: "metas financeiras, fluxo de caixa, controle dívidas",
    hard_keywords: "otimização orçamento, planejamento longo prazo, estratégias economia"
  },
  basic_investments: {
    name: "Investimentos Básicos", 
    description: "Fundamentos de investimentos para iniciantes",
    easy_keywords: "poupança, tesouro direto, CDB, renda fixa básica",
    medium_keywords: "fundos investimento, ações básicas, dividendos, diversificação",
    hard_keywords: "análise fundamentalista, carteira investimentos, rebalanceamento"
  },
  economics: {
    name: "Economia & Macroeconomia",
    description: "Indicadores e conceitos econômicos",
    easy_keywords: "PIB, inflação básica, taxa juros básica, mercado financeiro",
    medium_keywords: "política monetária, COPOM, indicadores econômicos, câmbio",
    hard_keywords: "política fiscal, ciclos econômicos, análise macroeconômica"
  },
  portfolio: {
    name: "Gestão de Portfolio",
    description: "Gestão e diversificação de carteiras",
    easy_keywords: "diversificação básica, risco retorno, perfil investidor",
    medium_keywords: "asset allocation, correlação ativos, rebalanceamento",
    hard_keywords: "otimização portfolio, sharpe ratio, gestão risco avançada"
  },
  trading: {
    name: "Trading & Análise Técnica",
    description: "Análise técnica e estratégias de trading",
    easy_keywords: "gráficos básicos, suporte resistência, tendências",
    medium_keywords: "indicadores técnicos, RSI, MACD, médias móveis",
    hard_keywords: "padrões avançados, estratégias trading, análise técnica complexa"
  },
  cryptocurrency: {
    name: "Criptomoedas & DeFi",
    description: "Blockchain, criptomoedas e finanças descentralizadas",
    easy_keywords: "Bitcoin básico, blockchain conceito, carteira crypto",
    medium_keywords: "Ethereum, DeFi básico, staking, yield farming",
    hard_keywords: "smart contracts avançados, protocolos DeFi, análise on-chain"
  }
};

function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function generateThemeQuestions(theme: string, difficulty: string, count: number = 50) {
  const themeConfig = THEME_TEMPLATES[theme];
  if (!themeConfig) return [];

  const difficultyKeywords = {
    easy: themeConfig.easy_keywords,
    medium: themeConfig.medium_keywords,
    hard: themeConfig.hard_keywords
  };

  const difficultyInstructions = {
    easy: "nível BÁSICO/INICIANTE - conceitos fundamentais e introdutórios",
    medium: "nível INTERMEDIÁRIO - aplicação prática de conceitos",
    hard: "nível AVANÇADO - cenários complexos e análise profunda"
  };

  const prompt = `Você é um especialista em educação financeira brasileira. Gere EXATAMENTE ${count} perguntas de múltipla escolha sobre "${themeConfig.name}" com dificuldade ${difficultyInstructions[difficulty]}.

TEMA: ${themeConfig.description}
PALAVRAS-CHAVE ESPECÍFICAS: ${difficultyKeywords[difficulty]}

INSTRUÇÕES CRÍTICAS:
1. Cada pergunta deve ter EXATAMENTE 4 opções de resposta
2. Apenas UMA opção deve estar correta
3. Explicação deve ser MUITO CONCISA (máximo 50 caracteres)
4. Dificuldade: ${difficulty}
5. Use terminologia brasileira e contexto do mercado brasileiro
6. Perguntas práticas e relevantes para investidores brasileiros
7. ${difficulty === 'easy' ? 'CONCEITOS MUITO BÁSICOS E FUNDAMENTAIS' : difficulty === 'medium' ? 'APLICAÇÃO PRÁTICA DE CONCEITOS' : 'CENÁRIOS COMPLEXOS E ANÁLISE AVANÇADA'}

FORMATO JSON OBRIGATÓRIO:
{
  "questions": [
    {
      "question": "Pergunta clara e objetiva?",
      "option_a": "Primeira opção",
      "option_b": "Segunda opção", 
      "option_c": "Terceira opção",
      "option_d": "Quarta opção",
      "correct_answer": "Primeira opção",
      "explanation": "Explicação concisa",
      "difficulty": "${difficulty}",
      "category": "${themeConfig.name}"
    }
  ]
}

GERE EXATAMENTE ${count} PERGUNTAS NO FORMATO ACIMA.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em educação financeira brasileira. Gere perguntas precisas e educativas em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      console.error(`❌ Erro OpenAI (${theme}-${difficulty}):`, response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`❌ Não foi possível extrair JSON (${theme}-${difficulty})`);
      return [];
    }

    const questionsData = JSON.parse(jsonMatch[0]);
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      console.error(`❌ Formato JSON inválido (${theme}-${difficulty})`);
      return [];
    }

    const processedQuestions = [];
    
    for (const q of questionsData.questions) {
      try {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d];
        const shuffledOptions = shuffleArray(options);
        
        if (!options.includes(q.correct_answer)) {
          console.warn(`⚠️ Resposta correta não encontrada nas opções: ${q.correct_answer}`);
          continue;
        }

        processedQuestions.push({
          question: q.question,
          options: shuffledOptions,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: difficulty,
          category: q.category || themeConfig.name,
          theme: theme
        });
      } catch (questionError) {
        console.error(`❌ Erro processando pergunta individual:`, questionError);
      }
    }

    console.log(`✅ ${processedQuestions.length} perguntas geradas para ${theme}-${difficulty}`);
    return processedQuestions;

  } catch (error) {
    console.error(`❌ Erro gerando perguntas para ${theme}-${difficulty}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração completa de perguntas temáticas');

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key não configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const themes = Object.keys(THEME_TEMPLATES);
    const difficulties = ['easy', 'medium', 'hard'];
    const questionsPerDifficultyPerTheme = 70; // 70 x 3 = 210 per theme
    
    let allGeneratedQuestions: any[] = [];
    let themeResults = {};

    for (const theme of themes) {
      console.log(`📚 Processando tema: ${THEME_TEMPLATES[theme].name}`);
      themeResults[theme] = { easy: 0, medium: 0, hard: 0 };

      for (const difficulty of difficulties) {
        console.log(`🔄 Gerando ${questionsPerDifficultyPerTheme} perguntas ${difficulty} para ${theme}`);
        
        const questions = await generateThemeQuestions(theme, difficulty, questionsPerDifficultyPerTheme);
        allGeneratedQuestions.push(...questions);
        themeResults[theme][difficulty] = questions.length;
        
        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 Total de perguntas geradas: ${allGeneratedQuestions.length}`);

    if (allGeneratedQuestions.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Nenhuma pergunta foi gerada com sucesso',
        themeResults
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inserir todas as perguntas no banco
    console.log(`💾 Inserindo ${allGeneratedQuestions.length} perguntas no banco de dados`);
    
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(allGeneratedQuestions)
      .select();

    if (insertError) {
      console.error('❌ Erro inserindo no banco:', insertError);
      return new Response(JSON.stringify({ 
        error: 'Erro inserindo perguntas no banco de dados',
        details: insertError.message,
        generatedCount: allGeneratedQuestions.length,
        themeResults
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ ${insertedQuestions?.length || 0} perguntas inseridas com sucesso`);

    return new Response(JSON.stringify({
      success: true,
      message: `${insertedQuestions?.length || 0} perguntas geradas para todos os temas`,
      totalGenerated: insertedQuestions?.length || 0,
      themeBreakdown: themeResults,
      summary: {
        themes_processed: themes.length,
        difficulties_per_theme: 3,
        target_per_difficulty: questionsPerDifficultyPerTheme,
        total_inserted: insertedQuestions?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro geral na função:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});