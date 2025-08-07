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

// Rate limiting e retry utilities
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`🔄 Tentativa ${attempt} falhou:`, error);
      
      if (attempt === maxAttempts) break;
      
      // Exponential backoff com jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

// JSON parsing robusto
function parseJsonRobust(content: string): any {
  if (!content || typeof content !== 'string') {
    throw new Error('Conteúdo inválido para parsing');
  }

  const cleanContent = content.trim();
  
  // Múltiplas estratégias de parsing
  const parseStrategies = [
    // Parsing direto
    () => JSON.parse(cleanContent),
    
    // Extrair do bloco ```json
    () => {
      const jsonMatch = cleanContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch?.[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
      throw new Error('Bloco JSON não encontrado');
    },
    
    // Extrair qualquer bloco de código
    () => {
      const codeMatch = cleanContent.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch?.[1]) {
        return JSON.parse(codeMatch[1].trim());
      }
      throw new Error('Bloco de código não encontrado');
    },
    
    // Extrair objeto JSON
    () => {
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch?.[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Objeto JSON não encontrado');
    },
    
    // Estratégia de limpeza linha por linha
    () => {
      const lines = cleanContent.split('\n');
      const jsonLines = lines.filter(line => 
        line.trim().startsWith('{') || 
        line.trim().startsWith('"') || 
        line.trim().startsWith('}') ||
        line.includes(':') ||
        line.includes('[') ||
        line.includes(']')
      );
      return JSON.parse(jsonLines.join('\n'));
    }
  ];
  
  for (let i = 0; i < parseStrategies.length; i++) {
    try {
      const result = parseStrategies[i]();
      console.log(`✅ JSON parsing bem-sucedido na estratégia ${i + 1}`);
      return result;
    } catch (error) {
      console.warn(`⚠️ Estratégia de parsing ${i + 1} falhou:`, error);
    }
  }
  
  throw new Error(`Falha no parsing após ${parseStrategies.length} tentativas. Conteúdo: ${cleanContent.substring(0, 200)}...`);
}

function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function generateThemeQuestions(theme: string, difficulty: string, count: number = 25) {
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

  // Modelos com fallback para maior confiabilidade
  const MODELS = ['gpt-4o-mini', 'gpt-3.5-turbo'];
  
  const makeOpenAICallWithFallback = async () => {
    let lastError: any;
    
    for (let i = 0; i < MODELS.length; i++) {
      try {
        console.log(`🤖 Tentando modelo ${MODELS[i]} para ${theme}-${difficulty}`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: MODELS[i],
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
            max_tokens: Math.min(2000, count * 150) // Ajustar tokens baseado no count
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API erro ${response.status} com ${MODELS[i]}: ${errorText}`);
        }

        console.log(`✅ Sucesso com modelo ${MODELS[i]}`);
        return response.json();
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Falha com modelo ${MODELS[i]}:`, error);
        
        if (i < MODELS.length - 1) {
          console.log(`🔄 Tentando próximo modelo em 2s...`);
          await sleep(2000);
        }
      }
    }
    
    throw lastError;
  };

  try {
    console.log(`🔄 Gerando ${count} perguntas ${difficulty} para ${theme} (com retry)`);
    
    const data = await withRetry(makeOpenAICallWithFallback, 2, 3000);
    const content = data.choices[0].message.content;

    console.log(`📝 Conteúdo recebido para ${theme}-${difficulty}: ${content.substring(0, 100)}...`);

    // Usar parsing robusto
    const questionsData = parseJsonRobust(content);
    
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      console.error(`❌ Formato JSON inválido (${theme}-${difficulty}):`, questionsData);
      return [];
    }

    const processedQuestions = [];
    
    for (const q of questionsData.questions) {
      try {
        // Validação mais rigorosa dos campos obrigatórios
        if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
          console.warn(`⚠️ Pergunta incompleta ignorada:`, q);
          continue;
        }

        const options = [q.option_a, q.option_b, q.option_c, q.option_d];
        const shuffledOptions = shuffleArray(options);
        
        if (!options.includes(q.correct_answer)) {
          console.warn(`⚠️ Resposta correta não encontrada nas opções: ${q.correct_answer}. Opções: ${options.join(', ')}`);
          continue;
        }

        processedQuestions.push({
          question: q.question.trim(),
          options: shuffledOptions,
          correct_answer: q.correct_answer.trim(),
          explanation: q.explanation?.trim() || 'Explicação não fornecida',
          difficulty: difficulty,
          category: q.category?.trim() || themeConfig.name,
          theme: theme
        });
      } catch (questionError) {
        console.error(`❌ Erro processando pergunta individual:`, questionError, q);
      }
    }

    console.log(`✅ ${processedQuestions.length}/${count} perguntas processadas com sucesso para ${theme}-${difficulty}`);
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
    const targetQuestionsPerDifficulty = 30; // Reduzido para 30 para evitar timeout
    const batchSize = 10; // Lotes menores de 10 perguntas
    
    let allGeneratedQuestions: any[] = [];
    let themeResults = {};

    for (const theme of themes) {
      console.log(`📚 Processando tema: ${THEME_TEMPLATES[theme].name}`);
      themeResults[theme] = { easy: 0, medium: 0, hard: 0, total: 0 };

      for (const difficulty of difficulties) {
        console.log(`🔄 Iniciando geração de ${targetQuestionsPerDifficulty} perguntas ${difficulty} para ${theme}`);
        
        let difficultyQuestions: any[] = [];
        const batchCount = Math.ceil(targetQuestionsPerDifficulty / batchSize);
        
        // Gerar em lotes menores para evitar timeout e rate limiting
        for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
          const questionsInThisBatch = Math.min(batchSize, targetQuestionsPerDifficulty - difficultyQuestions.length);
          
          if (questionsInThisBatch <= 0) break;
          
          console.log(`📦 Lote ${batchIndex + 1}/${batchCount}: ${questionsInThisBatch} perguntas ${difficulty} para ${theme}`);
          
          try {
            const batchQuestions = await generateThemeQuestions(theme, difficulty, questionsInThisBatch);
            difficultyQuestions.push(...batchQuestions);
            
            console.log(`✅ Lote ${batchIndex + 1} completado: ${batchQuestions.length} perguntas geradas`);
            
            // Delay progressivo entre lotes
            if (batchIndex < batchCount - 1) {
              const delay = 2000 + (batchIndex * 1000); // 2s, 3s, 4s...
              console.log(`⏳ Aguardando ${delay}ms antes do próximo lote...`);
              await sleep(delay);
            }
          } catch (batchError) {
            console.error(`❌ Erro no lote ${batchIndex + 1} para ${theme}-${difficulty}:`, batchError);
            // Continuar com o próximo lote mesmo se um falhar
          }
        }
        
        allGeneratedQuestions.push(...difficultyQuestions);
        themeResults[theme][difficulty] = difficultyQuestions.length;
        themeResults[theme].total += difficultyQuestions.length;
        
        console.log(`📈 Total para ${theme}-${difficulty}: ${difficultyQuestions.length} perguntas`);
        
        // Delay entre diferentes dificuldades
        if (difficulty !== 'hard') {
          console.log(`⏳ Aguardando 3 segundos antes da próxima dificuldade...`);
          await sleep(3000);
        }
      }
      
      console.log(`✅ Tema ${THEME_TEMPLATES[theme].name} concluído: ${themeResults[theme].total} perguntas`);
      
      // Delay maior entre temas
      const currentThemeIndex = themes.indexOf(theme);
      if (currentThemeIndex < themes.length - 1) {
        console.log(`⏳ Aguardando 5 segundos antes do próximo tema...`);
        await sleep(5000);
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
        target_per_difficulty: targetQuestionsPerDifficulty,
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