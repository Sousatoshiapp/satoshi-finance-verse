import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração de perguntas...');
    const { category, difficulty, count = 3, topics } = await req.json(); // Reduzido para 3 perguntas por lote

    console.log('📝 Parâmetros recebidos:', { category, difficulty, count, topics });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key não encontrada');
      throw new Error('OpenAI API key não configurada');
    }

    console.log(`🎯 Gerando ${count} perguntas para categoria: ${category}, dificuldade: ${difficulty}`);

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

    console.log('🤖 Enviando requisição para OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Mudado para modelo mais rápido
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
        max_tokens: 2000 // Reduzido para ser mais rápido
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na OpenAI API:', { status: response.status, error: errorText });
      throw new Error(`OpenAI API erro: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('✅ Resposta recebida da OpenAI');
    console.log('📄 Conteúdo gerado:', generatedContent.substring(0, 200) + '...');

    // Parse do JSON gerado
    let questionsData;
    try {
      console.log('🔍 Tentando fazer parse do JSON...');
      questionsData = JSON.parse(generatedContent);
    } catch (e) {
      console.log('⚠️ Parse direto falhou, tentando extrair JSON do markdown...');
      try {
        // Tentar extrair JSON se estiver com markdown
        const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                         generatedContent.match(/```\n([\s\S]*?)\n```/) ||
                         [null, generatedContent];
        if (jsonMatch[1]) {
          questionsData = JSON.parse(jsonMatch[1]);
        } else {
          questionsData = JSON.parse(generatedContent);
        }
      } catch (parseError) {
        console.error('❌ Erro no parse do JSON:', parseError);
        console.error('📝 Conteúdo original:', generatedContent);
        throw new Error(`Erro no parse do JSON: ${parseError.message}`);
      }
    }

    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      console.error('❌ Formato inválido:', questionsData);
      throw new Error('Formato de resposta inválido da OpenAI - questions não encontrado ou não é array');
    }

    console.log(`✅ Parse bem-sucedido: ${questionsData.questions.length} perguntas geradas`);

    // Inserir perguntas no banco
    console.log('💾 Preparando inserção no banco de dados...');
    
    const questionsToInsert = questionsData.questions.map(q => ({
      question: q.question,
      options: JSON.stringify(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty
    }));

    console.log(`📊 Inserindo ${questionsToInsert.length} perguntas no banco...`);

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir perguntas no banco:', insertError);
      throw new Error(`Erro ao salvar perguntas: ${insertError.message}`);
    }

    console.log(`✅ ${questionsToInsert.length} perguntas inseridas com sucesso no banco!`);

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
    console.error('❌ ERRO FATAL na geração de perguntas:', error);
    console.error('📍 Stack trace:', error.stack);
    
    // Determinar tipo de erro para melhor debug
    let errorType = 'unknown';
    if (error.message.includes('OpenAI')) errorType = 'openai';
    else if (error.message.includes('JSON')) errorType = 'parse';
    else if (error.message.includes('banco')) errorType = 'database';
    
    console.error('🏷️ Tipo de erro:', errorType);
    
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