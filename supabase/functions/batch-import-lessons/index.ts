import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lesson {
  title: string;
  content: string;
  category: string;
  quiz_question: string;
  quiz_options: string[];
  correct_answer: number;
  lesson_date: string;
  is_main_lesson: boolean;
  xp_reward: number;
  btz_reward: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lessons } = await req.json();
    
    if (!Array.isArray(lessons)) {
      return new Response(
        JSON.stringify({ error: 'Lessons must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${lessons.length} lessons for import`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    const validCategories = [
      'curiosidades',
      'dicas', 
      'historias',
      'glossario'
    ];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      try {
        // Validar campos obrigatórios
        if (!lesson.title || !lesson.content || !lesson.quiz_question) {
          results.errors.push(`Lesson ${i + 1}: Missing required fields (title, content, quiz_question)`);
          results.failed++;
          continue;
        }

        if (!lesson.quiz_options || !Array.isArray(lesson.quiz_options) || lesson.quiz_options.length !== 4) {
          results.errors.push(`Lesson ${i + 1}: quiz_options must be an array with exactly 4 options`);
          results.failed++;
          continue;
        }

        if (!lesson.correct_answer || lesson.correct_answer < 0 || lesson.correct_answer > 3) {
          results.errors.push(`Lesson ${i + 1}: correct_answer must be between 0 and 3`);
          results.failed++;
          continue;
        }

        if (!lesson.lesson_date || !lesson.lesson_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          results.errors.push(`Lesson ${i + 1}: lesson_date must be in YYYY-MM-DD format`);
          results.failed++;
          continue;
        }

        if (!validCategories.includes(lesson.category)) {
          results.errors.push(`Lesson ${i + 1}: Invalid category. Must be one of: ${validCategories.join(', ')}`);
          results.failed++;
          continue;
        }

        // Verificar se já existe lição para esta data se for principal
        if (lesson.is_main_lesson) {
          const { data: existingMainLesson } = await supabase
            .from('daily_lessons')
            .select('id')
            .eq('lesson_date', lesson.lesson_date)
            .eq('is_main_lesson', true)
            .single();

          if (existingMainLesson) {
            results.errors.push(`Lesson ${i + 1}: Main lesson already exists for date ${lesson.lesson_date}`);
            results.failed++;
            continue;
          }
        }

        // Verificar duplicata por título e data
        const { data: existingLesson } = await supabase
          .from('daily_lessons')
          .select('id')
          .eq('title', lesson.title)
          .eq('lesson_date', lesson.lesson_date)
          .single();

        if (existingLesson) {
          results.errors.push(`Lesson ${i + 1}: Lesson with title "${lesson.title}" already exists for date ${lesson.lesson_date}`);
          results.failed++;
          continue;
        }

        // Inserir lição
        const { error: insertError } = await supabase
          .from('daily_lessons')
          .insert({
            title: lesson.title,
            content: lesson.content,
            category: lesson.category,
            quiz_question: lesson.quiz_question,
            quiz_options: lesson.quiz_options,
            correct_answer: lesson.correct_answer,
            lesson_date: lesson.lesson_date,
            is_main_lesson: lesson.is_main_lesson || false,
            xp_reward: lesson.xp_reward || 50,
            btz_reward: lesson.btz_reward || 100,
            is_active: true
          });

        if (insertError) {
          console.error(`Error inserting lesson ${i + 1}:`, insertError);
          results.errors.push(`Lesson ${i + 1}: Database error - ${insertError.message}`);
          results.failed++;
        } else {
          results.successful++;
          console.log(`Successfully imported lesson: ${lesson.title}`);
        }

      } catch (error) {
        console.error(`Error processing lesson ${i + 1}:`, error);
        results.errors.push(`Lesson ${i + 1}: Processing error - ${error.message}`);
        results.failed++;
      }
    }

    console.log(`Import completed: ${results.successful} successful, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in batch-import-lessons:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});