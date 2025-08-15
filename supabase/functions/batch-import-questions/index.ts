import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { questions }: { questions: Question[] } = await req.json()
    
    if (!questions || !Array.isArray(questions)) {
      throw new Error('Array de questões é obrigatório')
    }

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      try {
        // Validar questão
        if (!question.question || !question.options || !question.correct_answer) {
          throw new Error('Campos obrigatórios: question, options, correct_answer');
        }

        if (question.options.length < 2) {
          throw new Error('Mínimo de 2 opções necessárias');
        }

        if (!question.options.includes(question.correct_answer)) {
          throw new Error('Resposta correta deve estar nas opções');
        }

        // Validar categoria permitida
        const allowedCategories = ['ABC das Finanças', 'Cripto', 'Finanças do Dia a Dia'];
        if (!allowedCategories.includes(question.category)) {
          throw new Error(`Categoria deve ser uma das permitidas: ${allowedCategories.join(', ')}`);
        }

        // Inserir questão
        const { error: insertError } = await supabaseClient
          .from('quiz_questions')
          .insert({
            question: question.question.trim(),
            options: question.options,
            correct_answer: question.correct_answer.trim(),
            explanation: question.explanation?.trim(),
            category: question.category?.trim() || 'ABC das Finanças',
            difficulty: question.difficulty?.toLowerCase() || 'medium',
            is_active: true
          });

        if (insertError) {
          throw insertError;
        }

        successCount++;
        
      } catch (error: any) {
        console.error(`Erro na questão ${i + 1}:`, error);
        errors.push(`Questão ${i + 1}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: successCount,
        errors: errors,
        total: questions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Erro no batch import:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})