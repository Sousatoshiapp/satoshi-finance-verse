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

// Mapeamento dos temas com suas especificações
const THEME_TEMPLATES = {
  trading: {
    name: "Trading & Análise Técnica",
    description: "Perguntas sobre análise técnica, gráficos, indicadores, estratégias de trading, suporte/resistência, padrões candlestick.",
    keywords: "análise técnica, gráficos, indicadores, trading, suporte, resistência, candlestick, RSI, MACD, médias móveis"
  },
  cryptocurrency: {
    name: "Criptomoedas & DeFi",
    description: "Perguntas sobre Bitcoin, Ethereum, blockchain, DeFi, NFTs, protocolos, yield farming, staking.",
    keywords: "Bitcoin, Ethereum, blockchain, DeFi, NFT, staking, yield farming, smart contracts, Web3"
  },
  portfolio: {
    name: "Gestão de Portfolio",
    description: "Perguntas sobre diversificação, asset allocation, risk management, rebalanceamento, tipos de ativos.",
    keywords: "diversificação, asset allocation, risco, portfolio, rebalanceamento, correlação, sharpe ratio"
  },
  basic_investments: {
    name: "Investimentos Básicos",
    description: "Perguntas sobre fundamentos de investimentos, renda fixa, renda variável, tesouro direto, CDB, ações.",
    keywords: "investimentos, renda fixa, renda variável, tesouro direto, CDB, ações, fundos, dividendos"
  },
  financial_education: {
    name: "Educação Financeira",
    description: "Perguntas sobre conceitos financeiros básicos, juros compostos, inflação, planejamento financeiro.",
    keywords: "educação financeira, juros compostos, inflação, planejamento, reserva emergência, aposentadoria"
  },
  budgeting: {
    name: "Orçamento & Planejamento",
    description: "Perguntas sobre controle de gastos, orçamento pessoal, metas financeiras, poupança.",
    keywords: "orçamento, planejamento, controle gastos, poupança, metas financeiras, fluxo de caixa"
  },
  economics: {
    name: "Economia & Macroeconomia",
    description: "Perguntas sobre indicadores econômicos, política monetária, inflação, PIB, taxa de juros.",
    keywords: "economia, macroeconomia, PIB, inflação, política monetária, taxa de juros, COPOM, indicadores"
  }
};

// Função para embaralhar array (Fisher-Yates)
function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função para garantir posição aleatória da resposta correta
function randomizeAnswerPosition(question: any) {
  const correctAnswer = question.correct_answer;
  const allOptions = [correctAnswer, ...question.wrong_answers];
  const shuffledOptions = shuffleArray(allOptions);
  
  return {
    ...question,
    options: shuffledOptions,
    correct_answer: correctAnswer // Mantém a resposta correta original
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 Iniciando geração de perguntas temáticas');
    
    const { theme, difficulty = 'mixed', count = 50 } = await req.json();
    
    if (!theme || !THEME_TEMPLATES[theme]) {
      return new Response(JSON.stringify({ 
        error: 'Tema inválido ou não especificado',
        availableThemes: Object.keys(THEME_TEMPLATES)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key não configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const themeConfig = THEME_TEMPLATES[theme];
    console.log(`📚 Gerando ${count} perguntas para tema: ${themeConfig.name}`);

    // Dividir as perguntas por dificuldade para garantir distribuição
    const questionsPerDifficulty = Math.ceil(count / 3);
    const difficulties = ['easy', 'medium', 'hard'];
    
    let allGeneratedQuestions: any[] = [];

    for (const diff of difficulties) {
      console.log(`🔄 Gerando ${questionsPerDifficulty} perguntas de dificuldade: ${diff}`);
      
      const difficultyInstructions = {
        easy: "nível básico/iniciante, conceitos fundamentais",
        medium: "nível intermediário, aplicação prática de conceitos",
        hard: "nível avançado, cenários complexos e análise profunda"
      };

      const prompt = `Você é um especialista em educação financeira. Gere EXATAMENTE ${questionsPerDifficulty} perguntas de múltipla escolha sobre "${themeConfig.name}" com dificuldade ${difficultyInstructions[diff]}.

TEMA: ${themeConfig.description}
PALAVRAS-CHAVE: ${themeConfig.keywords}

INSTRUÇÕES CRÍTICAS:
1. Cada pergunta deve ter EXATAMENTE 4 opções de resposta
2. Apenas UMA opção deve estar correta
3. Explicação deve ter no máximo 60 caracteres: "[Conceito] é [definição]"
4. Dificuldade: ${diff}
5. Use terminologia brasileira e contexto do mercado brasileiro
6. Perguntas práticas e relevantes para investidores brasileiros

FORMATO JSON OBRIGATÓRIO:
{
  "questions": [
    {
      "question": "Texto da pergunta objetiva e clara?",
      "option_a": "Primeira opção",
      "option_b": "Segunda opção", 
      "option_c": "Terceira opção",
      "option_d": "Quarta opção",
      "correct_answer": "Primeira opção",
      "explanation": "Conceito é definição simples",
      "difficulty": "${diff}",
      "category": "${themeConfig.name}"
    }
  ]
}

GERE EXATAMENTE ${questionsPerDifficulty} PERGUNTAS NO FORMATO ACIMA.`;

      console.log(`🤖 Enviando prompt para OpenAI (${diff})`);

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
              content: 'Você é um especialista em educação financeira brasileira. Gere perguntas de múltipla escolha precisas e educativas em formato JSON válido.'
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
        console.error(`❌ Erro OpenAI (${diff}):`, response.status, response.statusText);
        continue;
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        console.log(`📝 Processando resposta OpenAI (${diff})`);
        
        // Tentar extrair JSON da resposta
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`❌ Não foi possível extrair JSON da resposta (${diff})`);
          continue;
        }

        const questionsData = JSON.parse(jsonMatch[0]);
        
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
          console.error(`❌ Formato JSON inválido (${diff}):`, questionsData);
          continue;
        }

        console.log(`✅ ${questionsData.questions.length} perguntas processadas (${diff})`);

        // Processar cada pergunta
        for (const q of questionsData.questions) {
          try {
            // Criar array de opções e embaralhar
            const options = [q.option_a, q.option_b, q.option_c, q.option_d];
            const shuffledOptions = shuffleArray(options);
            
            // Garantir que a resposta correta está nas opções
            if (!options.includes(q.correct_answer)) {
              console.warn(`⚠️ Resposta correta não encontrada nas opções: ${q.correct_answer}`);
              continue;
            }

            const processedQuestion = {
              question: q.question,
              options: shuffledOptions,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
              difficulty: diff,
              category: q.category || themeConfig.name,
              theme: theme
            };

            allGeneratedQuestions.push(processedQuestion);
          } catch (questionError) {
            console.error(`❌ Erro processando pergunta individual:`, questionError);
          }
        }

      } catch (parseError) {
        console.error(`❌ Erro fazendo parse da resposta (${diff}):`, parseError);
        console.log(`Conteúdo recebido: ${content.substring(0, 500)}...`);
      }
    }

    console.log(`📊 Total de perguntas geradas: ${allGeneratedQuestions.length}`);

    if (allGeneratedQuestions.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Nenhuma pergunta foi gerada com sucesso',
        details: 'Verifique os logs para mais detalhes'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Inserir perguntas no Supabase
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
        generatedCount: allGeneratedQuestions.length
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ ${insertedQuestions?.length || 0} perguntas inseridas com sucesso`);

    return new Response(JSON.stringify({
      success: true,
      message: `${insertedQuestions?.length || 0} perguntas geradas e inseridas para o tema ${themeConfig.name}`,
      theme: themeConfig.name,
      questionsGenerated: insertedQuestions?.length || 0,
      breakdown: {
        easy: insertedQuestions?.filter(q => q.difficulty === 'easy').length || 0,
        medium: insertedQuestions?.filter(q => q.difficulty === 'medium').length || 0,
        hard: insertedQuestions?.filter(q => q.difficulty === 'hard').length || 0
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