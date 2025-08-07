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
    console.log('🧪 Iniciando teste simples de geração de perguntas...');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API Key não configurada');
    }

    if (!supabaseServiceKey) {
      throw new Error('Supabase Service Key não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prompt simplificado para teste
    const testPrompt = `
Gere EXATAMENTE 10 perguntas de múltipla escolha sobre educação financeira básica para iniciantes.

FORMATO OBRIGATÓRIO - Retorne APENAS um JSON válido:
{
  "questions": [
    {
      "question": "texto da pergunta",
      "options": ["opção A", "opção B", "opção C", "opção D"],
      "correct_answer": "opção correta",
      "explanation": "explicação simples"
    }
  ]
}

Temas das perguntas:
- Poupança básica
- Juros compostos simples
- Planejamento financeiro pessoal
- Controle de gastos
- Conceitos de inflação

IMPORTANTE:
- Use linguagem simples e clara
- Perguntas para iniciantes absolutos
- Respostas curtas e objetivas
- Apenas JSON válido na resposta
`;

    console.log('📞 Fazendo chamada à OpenAI API...');
    
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
            content: 'Você é um especialista em educação financeira que cria perguntas didáticas para iniciantes. Responda APENAS com JSON válido.'
          },
          {
            role: 'user',
            content: testPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API erro ${response.status}: ${errorText}`);
    }

    const openAIData = await response.json();
    console.log('✅ Resposta da OpenAI recebida');
    
    const content = openAIData.choices[0].message.content;
    console.log('📝 Conteúdo bruto:', content.substring(0, 200) + '...');

    // Parse robusto do JSON
    let parsedData;
    try {
      // Tentar parser direto
      parsedData = JSON.parse(content);
    } catch {
      try {
        // Tentar extrair JSON entre ```json e ```
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Tentar encontrar apenas o objeto JSON
          const jsonStart = content.indexOf('{');
          const jsonEnd = content.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            parsedData = JSON.parse(content.substring(jsonStart, jsonEnd));
          } else {
            throw new Error('JSON não encontrado na resposta');
          }
        }
      } catch (e) {
        throw new Error(`Erro ao fazer parse do JSON: ${e.message}`);
      }
    }

    console.log('✅ JSON parseado com sucesso');
    
    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error('Formato inválido: propriedade "questions" não encontrada ou não é array');
    }

    console.log(`📊 ${parsedData.questions.length} perguntas encontradas`);

    // Validar e preparar perguntas para inserção
    const questionsToInsert = [];
    
    for (const [index, q] of parsedData.questions.entries()) {
      if (!q.question || !q.options || !q.correct_answer || !q.explanation) {
        console.warn(`⚠️ Pergunta ${index + 1} com campos faltando, pulando...`);
        continue;
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        console.warn(`⚠️ Pergunta ${index + 1} não tem 4 opções, pulando...`);
        continue;
      }

      questionsToInsert.push({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: 'easy',
        category: 'financial_education',
        theme: 'financial_education'
      });
    }

    console.log(`💾 Inserindo ${questionsToInsert.length} perguntas válidas no banco...`);

    if (questionsToInsert.length === 0) {
      throw new Error('Nenhuma pergunta válida foi processada');
    }

    // Inserir no banco
    const { data: insertedData, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select('id');

    if (insertError) {
      throw new Error(`Erro ao inserir no banco: ${insertError.message}`);
    }

    console.log(`✅ ${insertedData?.length || 0} perguntas inseridas com sucesso!`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Teste concluído com sucesso!',
      questions_generated: insertedData?.length || 0,
      questions_data: questionsToInsert.slice(0, 2) // Primeiras 2 como exemplo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Verifique os logs para mais detalhes'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});