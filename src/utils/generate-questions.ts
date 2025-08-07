import { supabase } from "@/integrations/supabase/client";

export async function generateAllThemedQuestions() {
  console.log('🚀 Iniciando geração de todas as perguntas temáticas...');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-all-themed-questions');
    
    if (error) {
      console.error('❌ Erro na edge function:', error);
      throw error;
    }
    
    console.log('✅ Perguntas geradas com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro gerando perguntas:', error);
    throw error;
  }
}

export async function getThemeQuestionStats() {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('theme, difficulty')
      .not('theme', 'is', null);
    
    if (error) throw error;
    
    const stats = {};
    data?.forEach(q => {
      if (!stats[q.theme]) {
        stats[q.theme] = { easy: 0, medium: 0, hard: 0, total: 0 };
      }
      stats[q.theme][q.difficulty]++;
      stats[q.theme].total++;
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Erro buscando estatísticas:', error);
    return {};
  }
}