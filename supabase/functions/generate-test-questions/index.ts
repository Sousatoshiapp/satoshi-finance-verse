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
      return new Response(JSON.stringify({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY não configurada'
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

    // Preparar dados da pergunta de teste com validação
    const testQuestion = {
      question: "Teste: O que é poupança?",
      options: JSON.stringify(["Uma conta bancária", "Um investimento", "Uma dívida", "Um empréstimo"]),
      correct_answer: "Uma conta bancária",
      explanation: "A poupança é uma conta bancária para guardar dinheiro.",
      difficulty: 'easy',
      category: 'financial_education',
      theme: 'financial_education'
    };

    console.log('💾 Dados preparados:', testQuestion);
    console.log('💾 Tentando inserir pergunta de teste...');
    
    const { data: insertedData, error: insertError } = await supabase
      .from('quiz_questions')
      .insert([testQuestion])
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
        test_data: testQuestion
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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