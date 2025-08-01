import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

class EdgeErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }

        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
        console.warn(`[EdgeErrorHandler] Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static parseJsonRobust<T>(content: string): { success: boolean; data?: T; error?: string } {
    if (!content || typeof content !== 'string') {
      return {
        success: false,
        error: 'Content is empty or not a string'
      };
    }

    const cleanContent = content.trim();
    
    const parseAttempts = [
      () => JSON.parse(cleanContent),
      () => {
        const jsonMatch = cleanContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch?.[1]) {
          return JSON.parse(jsonMatch[1].trim());
        }
        throw new Error('No JSON block found');
      },
      () => {
        const jsonMatch = cleanContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch?.[1]) {
          return JSON.parse(jsonMatch[1].trim());
        }
        throw new Error('No code block found');
      },
      () => {
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch?.[0]) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON object found');
      },
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

    for (let i = 0; i < parseAttempts.length; i++) {
      try {
        const result = parseAttempts[i]();
        console.log(`[EdgeErrorHandler] JSON parsed successfully on attempt ${i + 1}`);
        return {
          success: true,
          data: result
        };
      } catch (error) {
        console.warn(`[EdgeErrorHandler] JSON parse attempt ${i + 1} failed:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: `Failed to parse JSON after ${parseAttempts.length} attempts. Content: ${cleanContent.substring(0, 200)}...`
    };
  }

  static createLogger(context: string) {
    return {
      error: (message: string, data?: any) => {
        console.error(`[${context}] ❌ ${message}`, {
          timestamp: new Date().toISOString(),
          context,
          data,
          stack: new Error().stack
        });
      },
      warn: (message: string, data?: any) => {
        console.warn(`[${context}] ⚠️ ${message}`, {
          timestamp: new Date().toISOString(),
          context,
          data
        });
      },
      info: (message: string, data?: any) => {
        console.log(`[${context}] ℹ️ ${message}`, {
          timestamp: new Date().toISOString(),
          context,
          data
        });
      }
    };
  }
}

function isQuestionData(data: any): data is { questions: Array<any> } {
  return data && 
         typeof data === 'object' && 
         Array.isArray(data.questions) && 
         data.questions.length > 0 &&
         data.questions.every((q: any) => 
           q.question && 
           q.options && 
           q.correct_answer && 
           q.explanation &&
           q.category &&
           q.difficulty
         );
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Templates para diferentes categorias
const categoryTemplates = {
  'Investimentos Básicos': {
    topics: ['CDB', 'LCI/LCA', 'Tesouro Direto', 'Poupança', 'Fundos de Investimento', 'Ações', 'Renda Fixa', 'Renda Variável'],
    context: 'investimentos básicos para iniciantes no Brasil'
  },
  'Cryptocurrency': {
    topics: ['Bitcoin', 'Ethereum', 'Blockchain', 'Mining', 'Wallets', 'DeFi', 'NFT', 'Staking', 'Trading Crypto'],
    context: 'criptomoedas e tecnologia blockchain'
  },
  'Trading': {
    topics: ['Day Trade', 'Swing Trade', 'Análise Técnica', 'Análise Gráfica', 'Stop Loss', 'Take Profit', 'Candlestick', 'Indicadores'],
    context: 'trading e análise técnica'
  },
  'Educação Financeira': {
    topics: ['Orçamento', 'Planejamento', 'Poupança', 'Reserva de Emergência', 'Controle de Gastos', 'Investimento', 'Aposentadoria'],
    context: 'educação financeira pessoal'
  },
  'Economia Brasileira': {
    topics: ['SELIC', 'CDI', 'IPCA', 'PIB', 'Banco Central', 'Política Monetária', 'Inflação', 'Taxa de Câmbio'],
    context: 'economia brasileira e indicadores econômicos'
  },
  'Impostos e Tributação': {
    topics: ['Imposto de Renda', 'DARF', 'IRPF', 'IOF', 'Come-Cotas', 'Ganho de Capital', 'Isenções'],
    context: 'tributação de investimentos no Brasil'
  },
  'Finanças Pessoais': {
    topics: ['Orçamento Familiar', 'Controle de Gastos', 'Cartão de Crédito', 'Financiamentos', 'Empréstimos', 'Seguros'],
    context: 'gestão de finanças pessoais'
  },
  'Bancos Digitais': {
    topics: ['Nubank', 'Inter', 'C6 Bank', 'PIX', 'TED', 'DOC', 'Conta Digital', 'Fintech'],
    context: 'bancos digitais e tecnologia financeira'
  }
};

const difficultyLevels = {
  'easy': 'básico para iniciantes, conceitos fundamentais',
  'medium': 'intermediário com alguns detalhes técnicos',
  'hard': 'avançado com conceitos complexos e cálculos'
};

serve(async (req) => {
  const logger = EdgeErrorHandler.createLogger('generate-quiz-questions');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logger.info('Iniciando geração de perguntas...');
    const { category, difficulty, count = 3, topics } = await req.json();

    logger.info('Parâmetros recebidos', { category, difficulty, count, topics });

    if (!openAIApiKey) {
      logger.error('OpenAI API key não encontrada');
      throw new Error('OpenAI API key não configurada');
    }

    logger.info(`Gerando ${count} perguntas para categoria: ${category}, dificuldade: ${difficulty}`);

    const template = categoryTemplates[category] || {
      topics: topics || ['conceitos gerais'],
      context: category.toLowerCase()
    };

    const prompt = `Gere ${count} perguntas de múltipla escolha sobre ${template.context} em português brasileiro.

REQUISITOS OBRIGATÓRIOS:
- Nível de dificuldade: ${difficultyLevels[difficulty]}
- Categoria: ${category}
- Temas para abordar: ${template.topics.join(', ')}
- Cada pergunta deve ter exatamente 4 opções (A, B, C, D)
- Apenas UMA resposta correta por pergunta
- Explicação didática para a resposta correta
- Português brasileiro correto com acentuação
- Perguntas práticas e relevantes para o mercado brasileiro
- Evitar perguntas muito similares entre si

FORMATO DE RESPOSTA (JSON válido):
{
  "questions": [
    {
      "question": "Qual é a principal característica do CDB?",
      "options": {
        "A": "É um investimento de renda variável",
        "B": "É garantido pelo FGC até R$ 250.000",
        "C": "Não tem prazo de vencimento",
        "D": "Sempre rende mais que a poupança"
      },
      "correct_answer": "B",
      "explanation": "O CDB é garantido pelo Fundo Garantidor de Créditos (FGC) até R$ 250.000 por CPF e por instituição financeira.",
      "category": "${category}",
      "difficulty": "${difficulty}"
    }
  ]
}

Gere ${count} perguntas seguindo exatamente este formato:`;

    logger.info('Enviando requisição para OpenAI...');
    
    const openAIResponse = await EdgeErrorHandler.withRetry(async () => {
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
              content: 'Você é um especialista em finanças e educação financeira brasileira. Gere perguntas educativas, precisas e bem formatadas em JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Erro na OpenAI API', { status: response.status, error: errorText });
        throw new Error(`OpenAI API erro: ${response.status} - ${errorText}`);
      }

      return response;
    }, {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 10000
    });

    const data = await openAIResponse.json();
    const generatedContent = data.choices[0].message.content;

    logger.info('Resposta recebida da OpenAI');
    logger.info('Conteúdo gerado (preview)', { preview: generatedContent.substring(0, 200) + '...' });

    const parseResult = EdgeErrorHandler.parseJsonRobust(generatedContent);
    
    if (!parseResult.success) {
      logger.error('Falha no parse do JSON', { error: parseResult.error, content: generatedContent });
      throw new Error(`Erro no parse do JSON: ${parseResult.error}`);
    }

    const questionsData = parseResult.data;

    if (!isQuestionData(questionsData)) {
      logger.error('Formato inválido de dados', { data: questionsData });
      throw new Error('Formato de resposta inválido da OpenAI - questions não encontrado ou inválido');
    }

    logger.info(`Parse bem-sucedido: ${questionsData.questions.length} perguntas geradas`);

    logger.info('Preparando inserção no banco de dados...');
    
    const questionsToInsert = questionsData.questions.map(q => ({
      question: q.question,
      options: JSON.stringify(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty
    }));

    logger.info(`Inserindo ${questionsToInsert.length} perguntas no banco...`);

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      logger.error('Erro ao inserir perguntas no banco', { error: insertError });
      throw new Error(`Erro ao salvar perguntas: ${insertError.message}`);
    }

    logger.info(`${questionsToInsert.length} perguntas inseridas com sucesso no banco!`);

    return new Response(JSON.stringify({
      success: true,
      generated: questionsToInsert.length,
      questions: insertedQuestions,
      category,
      difficulty
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logger.error('ERRO FATAL na geração de perguntas', { 
      error: error.message, 
      stack: error.stack 
    });
    
    let errorType = 'unknown';
    if (error.message.includes('OpenAI')) errorType = 'openai';
    else if (error.message.includes('JSON')) errorType = 'parse';
    else if (error.message.includes('banco')) errorType = 'database';
    
    logger.error('Tipo de erro identificado', { errorType });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      errorType,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
