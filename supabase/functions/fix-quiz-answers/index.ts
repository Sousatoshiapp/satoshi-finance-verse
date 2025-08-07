import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 Iniciando correção de respostas do quiz...')

    // Buscar questões com formato incorreto
    const { data: problematicQuestions, error: fetchError } = await supabaseClient
      .from('quiz_questions')
      .select('id, question, options, correct_answer')
      .or('correct_answer.like.Opção %,correct_answer.like.Option %')

    if (fetchError) {
      console.error('❌ Erro ao buscar questões:', fetchError)
      throw fetchError
    }

    console.log(`📊 Encontradas ${problematicQuestions?.length || 0} questões problemáticas`)

    if (!problematicQuestions?.length) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          fixed: 0, 
          message: 'Nenhuma questão problemática encontrada' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let fixedCount = 0
    const errors: string[] = []

    for (const question of problematicQuestions) {
      try {
        let options: string[]
        
        // Parse options se for string
        if (typeof question.options === 'string') {
          options = JSON.parse(question.options)
        } else {
          options = question.options
        }

        // Extrair o índice da opção (A, B, C, D)
        const optionMatch = question.correct_answer.match(/Opção ([A-D])|Option ([A-D])/i)
        if (!optionMatch) {
          errors.push(`Questão ${question.id}: Formato de resposta não reconhecido`)
          continue
        }

        const optionLetter = optionMatch[1] || optionMatch[2]
        const optionIndex = optionLetter.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3

        if (optionIndex < 0 || optionIndex >= options.length) {
          errors.push(`Questão ${question.id}: Índice de opção inválido (${optionLetter})`)
          continue
        }

        const correctAnswerText = options[optionIndex]

        // Atualizar a questão
        const { error: updateError } = await supabaseClient
          .from('quiz_questions')
          .update({ correct_answer: correctAnswerText })
          .eq('id', question.id)

        if (updateError) {
          errors.push(`Questão ${question.id}: ${updateError.message}`)
          continue
        }

        fixedCount++
        console.log(`✅ Corrigida: ${question.id} - "${question.correct_answer}" → "${correctAnswerText}"`)
        
      } catch (error) {
        errors.push(`Questão ${question.id}: ${error.message}`)
        console.error(`❌ Erro ao processar questão ${question.id}:`, error)
      }
    }

    console.log(`🎉 Processo concluído: ${fixedCount} questões corrigidas, ${errors.length} erros`)

    return new Response(
      JSON.stringify({
        success: true,
        fixed: fixedCount,
        total: problematicQuestions.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `${fixedCount} questões corrigidas com sucesso`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Erro interno do servidor'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})