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

// Modelos disponíveis com fallback
const MODELS = ['gpt-4o-mini', 'gpt-3.5-turbo'];

async function tryModelWithFallback(prompt: string, maxAttempts = 2) {
  let lastError: any;
  
  for (let i = 0; i < MODELS.length && i < maxAttempts; i++) {
    try {
      console.log(`🤖 Tentando modelo ${MODELS[i]}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODELS[i],
          messages: [
            { role: 'system', content: 'Você é um especialista em educação financeira. Responda APENAS com JSON válido.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Sucesso com modelo ${MODELS[i]}`);
      return data;
      
    } catch (error) {
      console.warn(`⚠️ Falha com modelo ${MODELS[i]}:`, error);
      lastError = error;
      
      if (i < MODELS.length - 1) {
        console.log(`🔄 Tentando próximo modelo...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Geração rápida iniciada');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const { theme = 'financial_education', difficulty = 'easy', count = 10 } = await req.json();
    
    // Limitar a 15 perguntas por execução para evitar timeout
    const limitedCount = Math.min(count, 15);
    
    const prompt = `Gere EXATAMENTE ${limitedCount} perguntas de múltipla escolha sobre educação financeira brasileira.

DIFICULDADE: ${difficulty}
TEMA: ${theme}

FORMATO JSON OBRIGATÓRIO:
{
  "questions": [
    {
      "question": "Pergunta clara?",
      "option_a": "Opção A",
      "option_b": "Opção B", 
      "option_c": "Opção C",
      "option_d": "Opção D",
      "correct_answer": "Opção A",
      "explanation": "Explicação breve",
      "difficulty": "${difficulty}",
      "category": "Educação Financeira"
    }
  ]
}

Gere EXATAMENTE ${limitedCount} perguntas no formato acima.`;

    // Usar fallback de modelos
    const data = await tryModelWithFallback(prompt);
    const content = data.choices[0].message.content;

    let questionsData;
    try {
      questionsData = JSON.parse(content.trim());
    } catch {
      // Tentar extrair JSON do conteúdo
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON inválido na resposta');
      }
    }

    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Formato de perguntas inválido');
    }

    // Processar perguntas
    const processedQuestions = questionsData.questions
      .filter(q => q.question && q.option_a && q.option_b && q.option_c && q.option_d && q.correct_answer)
      .map(q => ({
        question: q.question.trim(),
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correct_answer: q.correct_answer.trim(),
        explanation: q.explanation?.trim() || 'Explicação não fornecida',
        difficulty: difficulty,
        category: q.category || 'Educação Financeira',
        theme: theme,
        is_approved: true
      }));

    console.log(`📝 ${processedQuestions.length} perguntas processadas`);

    // Inserir no banco
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(processedQuestions)
      .select();

    if (insertError) {
      throw new Error(`Erro no banco: ${insertError.message}`);
    }

    console.log(`✅ ${insertedQuestions?.length || 0} perguntas inseridas`);

    return new Response(JSON.stringify({
      success: true,
      questions_generated: insertedQuestions?.length || 0,
      theme,
      difficulty,
      message: `${insertedQuestions?.length || 0} perguntas geradas com sucesso`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});