import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = "https://uabdmohhzsertxfishoh.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 GERAÇÃO COM AI INICIADA - função está sendo chamada!');
    
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
      return new Response(JSON.stringify({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY não configurada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return new Response(JSON.stringify({
        success: false,
        error: 'OPENAI_API_KEY não configurada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Service Key encontrada, criando cliente Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Testar conexão primeiro
    console.log('🔍 Testando conexão com banco de dados...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('quiz_questions')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError);
      return new Response(JSON.stringify({
        success: false,
        error: `Erro de conexão: ${connectionError.message}`,
        details: connectionError
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Conexão testada com sucesso');

    // Gerar perguntas com OpenAI
    console.log('🤖 Iniciando geração de perguntas com OpenAI...');
    
    const prompt = `Gere exatamente 5 perguntas de múltipla escolha sobre educação financeira básica no Brasil.

IMPORTANTE: Responda APENAS com um JSON válido no formato abaixo, sem texto adicional:

{
  "questions": [
    {
      "question": "texto da pergunta",
      "options": ["opção A", "opção B", "opção C", "opção D"],
      "correct_answer": "resposta correta (deve ser exatamente igual a uma das opções)",
      "explanation": "explicação clara e educativa",
      "difficulty": "easy",
      "category": "financial_education",
      "theme": "financial_education"
    }
  ]
}

Temas para as perguntas:
- Poupança e investimentos básicos
- Controle de gastos e orçamento familiar
- Juros simples e compostos
- Cartão de crédito e débito
- Planejamento financeiro pessoal

Cada pergunta deve:
- Ser clara e objetiva
- Ter 4 opções de resposta
- Estar no contexto brasileiro
- Ser educativa e útil para iniciantes`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Você é um especialista em educação financeira no Brasil. Responda APENAS com JSON válido, sem texto adicional.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ Erro na API OpenAI:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `Erro na API OpenAI: ${openAIResponse.status}`,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    console.log('✅ Resposta da OpenAI recebida');

    // Processar resposta da OpenAI
    let questionsData;
    try {
      const content = openAIData.choices[0].message.content.trim();
      console.log('📝 Conteúdo da resposta:', content);
      questionsData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao processar resposta da OpenAI',
        details: parseError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      console.error('❌ Formato inválido da resposta:', questionsData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Formato inválido da resposta da OpenAI',
        details: questionsData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar perguntas para inserção
    const questionsToInsert = questionsData.questions.map(q => ({
      question: q.question,
      options: JSON.stringify(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'easy',
      category: q.category || 'financial_education',
      theme: q.theme || 'financial_education'
    }));

    console.log(`💾 Inserindo ${questionsToInsert.length} perguntas no banco...`);
    
    const { data: insertedData, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select('id');

    if (insertError) {
      console.error('❌ Erro detalhado ao inserir:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: `Erro na inserção: ${insertError.message}`,
        error_details: insertError.details,
        error_hint: insertError.hint,
        error_code: insertError.code,
        questions_data: questionsToInsert
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Perguntas inseridas com sucesso:', insertedData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Perguntas geradas e inseridas com sucesso!',
      questions_generated: questionsToInsert.length,
      questions_data: questionsToInsert,
      inserted_ids: insertedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERRO GERAL NO TESTE:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      error_name: error.name,
      stack: error.stack,
      details: 'Erro completo logado no console'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});