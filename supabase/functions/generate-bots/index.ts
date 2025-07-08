import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { batchSize = 100 } = await req.json();
    
    console.log(`Generating ${batchSize} bot profiles...`);
    
    // Generate bots using the database function
    const { data: newBots, error } = await supabase
      .rpc('generate_bot_profile', { bot_count: batchSize });

    if (error) {
      console.error('Error generating bots:', error);
      throw error;
    }

    console.log(`Successfully generated ${newBots?.length || 0} bots`);

    // Create some initial quiz sessions for realism
    for (const bot of newBots || []) {
      // Random chance to create recent quiz sessions
      if (Math.random() > 0.5) {
        const sessionCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < sessionCount; i++) {
          const questionsTotal = Math.floor(Math.random() * 8) + 3; // 3-10 questions
          const questionsCorrect = Math.floor(questionsTotal * (0.6 + Math.random() * 0.35)); // 60-95% accuracy
          
          await supabase
            .from('quiz_sessions')
            .insert({
              user_id: bot.bot_id,
              questions_total: questionsTotal,
              questions_correct: questionsCorrect,
              questions_incorrect: questionsTotal - questionsCorrect,
              time_spent: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
              completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              performance_score: (questionsCorrect / questionsTotal) * 100,
              session_type: 'practice'
            });
        }
      }

      // Log bot creation
      await supabase
        .from('bot_activity_log')
        .insert({
          bot_id: bot.bot_id,
          activity_type: 'bot_created',
          activity_data: {
            nickname: bot.nickname,
            level: bot.level,
            xp: bot.xp,
            points: bot.points
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        botsGenerated: newBots?.length || 0,
        bots: newBots
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-bots function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});