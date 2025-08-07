import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const THEME_TEMPLATES = {
  'trading': {
    name: 'Trading & Análise Técnica',
    description: 'Perguntas sobre gráficos, indicadores técnicos, estratégias de trading',
    keywords: {
      easy: ['candlesticks', 'suporte', 'resistência', 'volumes', 'gráficos'],
      medium: ['RSI', 'MACD', 'médias móveis', 'breakout', 'stop loss'],
      hard: ['Elliott Wave', 'Fibonacci', 'opções', 'swing trade', 'scalping']
    }
  },
  'cryptocurrency': {
    name: 'Criptomoedas & DeFi',
    description: 'Bitcoin, Ethereum, DeFi, blockchain e mercado cripto',
    keywords: {
      easy: ['Bitcoin', 'blockchain', 'carteira digital', 'hash', 'mineração'],
      medium: ['Ethereum', 'smart contracts', 'DeFi', 'yield farming', 'staking'],
      hard: ['layer 2', 'MEV', 'liquidez', 'impermanent loss', 'governance tokens']
    }
  },
  'financial_education': {
    name: 'Educação Financeira',
    description: 'Conceitos fundamentais de finanças pessoais e planejamento',
    keywords: {
      easy: ['orçamento', 'poupança', 'juros', 'empréstimo', 'cartão de crédito'],
      medium: ['investimento', 'aposentadoria', 'seguro', 'financiamento', 'taxa Selic'],
      hard: ['planejamento sucessório', 'previdência', 'tributação', 'pessoa física']
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 Generate Themed Questions function called');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { theme, difficulty = 'medium', count = 10 } = await req.json();
    
    if (!theme || !THEME_TEMPLATES[theme]) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    const template = THEME_TEMPLATES[theme];
    const keywords = template.keywords[difficulty] || template.keywords['easy'];

    const prompt = `Gere ${count} perguntas de múltipla escolha sobre ${template.name}.
Tema: ${template.description}
Dificuldade: ${difficulty}
Palavras-chave: ${keywords.join(', ')}

Formato JSON:
{
  "questions": [
    {
      "question": "Pergunta?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "Resposta correta",
      "explanation": "Explicação",
      "difficulty": "${difficulty}",
      "category": "financial_education",
      "theme": "${theme}"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API Error: ${response.status}`);

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    
    const { error: insertError } = await supabase
      .from('quiz_questions')
      .insert(parsed.questions.map(q => ({
        ...q,
        is_approved: true,
        created_at: new Date().toISOString()
      })));

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      success: true,
      theme,
      difficulty,
      questions_generated: parsed.questions.length,
      message: `Successfully generated ${parsed.questions.length} questions`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});