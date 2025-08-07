import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

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
    console.log('🧪 TESTE INICIADO - função está sendo chamada!');
    
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
      throw new Error('Supabase Service Key não configurada');
    }

    console.log('✅ Service Key encontrada');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Inserir uma pergunta de teste simples (sem OpenAI)
    const testQuestion = {
      question: "Teste: O que é poupança?",
      options: ["Uma conta bancária", "Um investimento", "Uma dívida", "Um empréstimo"],
      correct_answer: "Uma conta bancária",
      explanation: "A poupança é uma conta bancária para guardar dinheiro.",
      difficulty: 'easy',
      category: 'financial_education',
      theme: 'financial_education'
    };

    console.log('💾 Tentando inserir pergunta de teste...');
    
    const { data: insertedData, error: insertError } = await supabase
      .from('quiz_questions')
      .insert([testQuestion])
      .select('id');

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      throw new Error(`Erro na inserção: ${insertError.message}`);
    }

    console.log('✅ Pergunta inserida com sucesso:', insertedData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Teste básico concluído com sucesso!',
      questions_generated: 1,
      test_data: testQuestion,
      inserted_ids: insertedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      details: 'Erro completo logado no console'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});