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

function createAdaptiveDelay(attempt: number, baseDelay = 3000): number {
  const jitter = Math.random() * 0.2 * baseDelay;
  const exponentialDelay = baseDelay * Math.pow(1.5, attempt - 1);
  return Math.min(exponentialDelay + jitter, 15000);
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plano de expansão para 500+ perguntas
const expansionPlan = [
  // Categorias populares - expandir para 20-25 perguntas cada
  { category: 'Investimentos Básicos', targetCount: 25, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Cryptocurrency', targetCount: 25, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Trading', targetCount: 20, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Educação Financeira', targetCount: 20, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Orçamento Pessoal', targetCount: 15, priorities: ['easy', 'medium'] },
  { category: 'Planejamento Financeiro', targetCount: 15, priorities: ['easy', 'medium'] },
  
  // Novas categorias brasileiras - 10-15 perguntas cada
  { category: 'Economia Brasileira', targetCount: 15, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Impostos e Tributação', targetCount: 15, priorities: ['medium', 'hard'] },
  { category: 'Finanças Pessoais', targetCount: 15, priorities: ['easy', 'medium'] },
  { category: 'Bancos Digitais', targetCount: 12, priorities: ['easy', 'medium'] },
  { category: 'Tesouro Direto', targetCount: 12, priorities: ['easy', 'medium'] },
  { category: 'Fundos de Investimento', targetCount: 12, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Renda Fixa', targetCount: 12, priorities: ['easy', 'medium'] },
  { category: 'Ações e Bolsa', targetCount: 15, priorities: ['easy', 'medium', 'hard'] },
  { category: 'Previdência Privada', targetCount: 10, priorities: ['easy', 'medium'] },
  { category: 'Seguros', targetCount: 10, priorities: ['easy', 'medium'] },
  { category: 'Cartão de Crédito', targetCount: 10, priorities: ['easy', 'medium'] },
  { category: 'Financiamentos', targetCount: 10, priorities: ['easy', 'medium'] },
  { category: 'Economia Digital', targetCount: 10, priorities: ['easy', 'medium'] },
  { category: 'Finanças para Jovens', targetCount: 10, priorities: ['easy'] },
  { category: 'Empreendedorismo Financeiro', targetCount: 10, priorities: ['medium'] },
  { category: 'Investimentos Sustentáveis', targetCount: 8, priorities: ['medium'] },
  
  // Categorias avançadas - expandir moderadamente
  { category: 'Análise Fundamentalista', targetCount: 8, priorities: ['medium', 'hard'] },
  { category: 'Gestão de Risco', targetCount: 8, priorities: ['medium', 'hard'] },
  { category: 'Derivativos', targetCount: 6, priorities: ['hard'] },
  { category: 'Portfolio Management', targetCount: 8, priorities: ['medium', 'hard'] },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Recebida requisição:', req.method);
    const requestBody = await req.json();
    console.log('📦 Body da requisição:', requestBody);
    
    const { mode = 'plan', categories, batchSize = 50 } = requestBody;
    console.log('🎯 Modo:', mode);

    if (mode === 'plan') {
      // Retornar o plano de expansão
      return new Response(JSON.stringify({
        success: true,
        expansionPlan,
        totalTargetQuestions: expansionPlan.reduce((sum, cat) => sum + cat.targetCount, 0),
        currentQuestions: 179
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'generate') {
      console.log('🚀 Iniciando geração de perguntas...');
      console.log('📊 Categorias recebidas:', categories);
      
      // Gerar perguntas em lote
      const results: Array<{
        category: string;
        difficulty: string;
        generated: number;
        success: boolean;
        error?: string;
      }> = [];
      const categoriesToProcess = categories || expansionPlan.slice(0, 5); // Processar 5 categorias por vez
      
      console.log('🎯 Categorias a processar:', categoriesToProcess);

      for (const categoryPlan of categoriesToProcess) {
        console.log(`🔄 Processando categoria: ${categoryPlan.category}`);

        // Verificar quantas perguntas já existem
        const { data: existingQuestions, error: countError } = await supabase
          .from('quiz_questions')
          .select('difficulty')
          .eq('category', categoryPlan.category);

        if (countError) {
          console.error(`Erro ao contar perguntas existentes para ${categoryPlan.category}:`, countError);
          continue;
        }

        const currentCount = existingQuestions?.length || 0;
        const needed = Math.max(0, (categoryPlan.target || categoryPlan.targetCount) - currentCount);

        if (needed <= 0) {
          console.log(`Categoria ${categoryPlan.category} já tem perguntas suficientes (${currentCount}/${categoryPlan.target || categoryPlan.targetCount})`);
          continue;
        }

        // Distribuir perguntas por dificuldade
        const difficultyDistribution = {};
        const priorityDifficulties = categoryPlan.priorities;
        
        const perDifficulty = Math.ceil(needed / priorityDifficulties.length);
        priorityDifficulties.forEach(diff => {
          difficultyDistribution[diff] = perDifficulty;
        });

        // Ajustar para não exceder o necessário
        let totalPlanned = Object.values(difficultyDistribution).reduce((sum: number, count: unknown) => sum + (count as number), 0);
        if (totalPlanned > needed) {
          const excess = totalPlanned - needed;
          difficultyDistribution[priorityDifficulties[priorityDifficulties.length - 1]] -= excess;
        }

        // Gerar perguntas para cada dificuldade
        for (const [difficulty, count] of Object.entries(difficultyDistribution)) {
          const questionCount = count as number;
          if (questionCount <= 0) continue;

          try {
            const logger = EdgeErrorHandler.createLogger(`batch-${categoryPlan.category}-${difficulty}`);
            logger.info(`Gerando ${questionCount} perguntas ${difficulty} para ${categoryPlan.category}`);
            
            const generateResult = await EdgeErrorHandler.withRetry(async () => {
              const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
                body: {
                  category: categoryPlan.category,
                  difficulty,
                  count: Math.min(questionCount, 3)
                }
              });

              if (error) {
                logger.error('Erro na edge function', { error });
                throw new Error(error.message || 'Erro na Edge Function');
              }

              return data;
            }, {
              maxAttempts: 3,
              baseDelay: 2000,
              maxDelay: 10000
            });

            logger.info(`Sucesso para ${categoryPlan.category}`, { generated: generateResult?.generated || 0 });

            results.push({
              category: categoryPlan.category,
              difficulty,
              generated: generateResult?.generated || 0,
              success: generateResult?.success || false
            });

            const adaptiveDelay = createAdaptiveDelay(results.length);
            logger.info(`Aguardando ${adaptiveDelay}ms antes da próxima geração...`);
            await new Promise(resolve => setTimeout(resolve, adaptiveDelay));

          } catch (error) {
            const logger = EdgeErrorHandler.createLogger(`batch-error-${categoryPlan.category}`);
            logger.error(`Erro ao processar ${categoryPlan.category} (${difficulty})`, { error: error.message });
            results.push({
              category: categoryPlan.category,
              difficulty,
              generated: 0,
              success: false,
              error: error.message
            });
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        results,
        totalGenerated: results.reduce((sum, r) => sum + (r.generated || 0), 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'status') {
      console.log('📊 Verificando status...');
      // Verificar status atual vs. plano
      const statusResults: Array<{
        category: string;
        current: number;
        target: number;
        progress: number;
        needed: number;
      }> = [];

      for (const categoryPlan of expansionPlan) {
        console.log(`🔍 Verificando categoria: ${categoryPlan.category}`);
        
        const { data: existingQuestions, error } = await supabase
          .from('quiz_questions')
          .select('difficulty')
          .eq('category', categoryPlan.category);

        if (error) {
          console.error(`❌ Erro ao verificar ${categoryPlan.category}:`, error);
          continue;
        }

        const currentCount = existingQuestions?.length || 0;
        const progress = Math.min(100, (currentCount / categoryPlan.targetCount) * 100);

        const categoryData = {
          category: categoryPlan.category,
          current: currentCount,
          target: categoryPlan.targetCount,
          progress: Math.round(progress),
          needed: Math.max(0, categoryPlan.targetCount - currentCount)
        };
        
        console.log(`📊 ${categoryPlan.category}:`, categoryData);
        statusResults.push(categoryData);
      }

      const totalCurrent = statusResults.reduce((sum, s) => sum + s.current, 0);
      const totalTarget = statusResults.reduce((sum, s) => sum + s.target, 0);

      const response = {
        success: true,
        summary: {
          totalCurrent,
          totalTarget,
          globalProgress: Math.round((totalCurrent / totalTarget) * 100),
          remaining: totalTarget - totalCurrent
        },
        categories: statusResults
      };
      
      console.log('✅ Status calculado:', response);

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Modo inválido. Use: plan, generate, ou status');

  } catch (error) {
    console.error('Erro no batch generation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
