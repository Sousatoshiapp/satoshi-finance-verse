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

async function generateBatchQuestions(theme: string, difficulty: string, count: number = 5) {
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

FORMATO JSON OBRIGATÓRIO (responda APENAS com JSON válido):
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
    console.log(`🔄 Gerando ${count} perguntas ${difficulty} para ${theme}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em educação financeira brasileira. Gere perguntas precisas e educativas em formato JSON válido. Responda APENAS com JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log(`📝 Conteúdo recebido para ${theme}-${difficulty}: ${content.substring(0, 100)}...`);

    // Parse JSON robusto
    let questionsData;
    try {
      questionsData = JSON.parse(content.trim());
    } catch {
      // Tentar extrair JSON de bloco de código
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch?.[1]) {
        questionsData = JSON.parse(jsonMatch[1].trim());
      } else {
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (objMatch?.[0]) {
          questionsData = JSON.parse(objMatch[0]);
        } else {
          throw new Error('Não foi possível extrair JSON válido');
        }
      }
    }
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      console.error(`❌ Formato JSON inválido:`, questionsData);
      return [];
    }

    const processedQuestions = [];
    
    for (const q of questionsData.questions) {
      if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        console.warn(`⚠️ Pergunta incompleta ignorada:`, q);
        continue;
      }

      const options = [q.option_a, q.option_b, q.option_c, q.option_d];
      
      if (!options.includes(q.correct_answer)) {
        console.warn(`⚠️ Resposta correta não encontrada nas opções`);
        continue;
      }

      processedQuestions.push({
        question: q.question.trim(),
        options: options,
        correct_answer: q.correct_answer.trim(),
        explanation: q.explanation?.trim() || 'Explicação não fornecida',
        difficulty: difficulty,
        category: q.category?.trim() || themeConfig.name,
        theme: theme
      });
    }

    console.log(`✅ ${processedQuestions.length}/${count} perguntas processadas para ${theme}-${difficulty}`);
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
    console.log('🚀 Iniciando geração de lote de perguntas');

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key não configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { themes, difficulties, questionsPerBatch = 5 } = body;

    if (!themes || !difficulties) {
      return new Response(JSON.stringify({ error: 'Temas e dificuldades são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📦 Gerando lote: ${themes.length} temas, ${difficulties.length} dificuldades, ${questionsPerBatch} perguntas cada`);

    let allGeneratedQuestions: any[] = [];
    let batchResults = {};

    for (const theme of themes) {
      batchResults[theme] = { easy: 0, medium: 0, hard: 0, total: 0 };

      for (const difficulty of difficulties) {
        console.log(`🔄 Processando ${theme}-${difficulty}`);
        
        const questions = await generateBatchQuestions(theme, difficulty, questionsPerBatch);
        allGeneratedQuestions.push(...questions);
        
        batchResults[theme][difficulty] = questions.length;
        batchResults[theme].total += questions.length;
        
        console.log(`✅ ${questions.length} perguntas geradas para ${theme}-${difficulty}`);
      }
    }

    console.log(`📊 Total de perguntas geradas: ${allGeneratedQuestions.length}`);

    if (allGeneratedQuestions.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Nenhuma pergunta foi gerada',
        batchResults
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inserir no banco
    console.log(`💾 Inserindo ${allGeneratedQuestions.length} perguntas no banco`);
    
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(allGeneratedQuestions)
      .select();

    if (insertError) {
      console.error('❌ Erro inserindo no banco:', insertError);
      return new Response(JSON.stringify({ 
        error: 'Erro inserindo perguntas no banco',
        details: insertError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ ${insertedQuestions?.length || 0} perguntas inseridas`);

    return new Response(JSON.stringify({
      success: true,
      message: `Lote de ${insertedQuestions?.length || 0} perguntas gerado com sucesso`,
      totalGenerated: insertedQuestions?.length || 0,
      batchResults,
      themes_processed: themes.length,
      difficulties_processed: difficulties.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro geral na função:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});