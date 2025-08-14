import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      battle_royale_sessions: any;
      battle_royale_participants: any;
      quiz_questions: any;
      profiles: any;
    };
    Functions: {
      process_battle_royale_elimination: any;
      calculate_battle_royale_rewards: any;
      generate_session_code: any;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, ...payload } = await req.json();
    console.log('Battle Royale Manager Action:', action, payload);

    switch (action) {
      case 'create_session':
        return await createSession(supabase, payload);
      case 'join_session':
        return await joinSession(supabase, payload);
      case 'start_session':
        return await startSession(supabase, payload);
      case 'process_round':
        return await processRound(supabase, payload);
      case 'submit_answer':
        return await submitAnswer(supabase, payload);
      case 'finish_session':
        return await finishSession(supabase, payload);
      case 'auto_start_check':
        return await autoStartReadySessions(supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Battle Royale Manager Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createSession(supabase: any, payload: any) {
  const { mode, topic, difficulty, entry_fee_amount = 10, max_players } = payload;
  
  // Generate session code
  const { data: sessionCode } = await supabase.rpc('generate_session_code');
  
  // Create new session
  const { data: session, error } = await supabase
    .from('battle_royale_sessions')
    .insert({
      session_code: sessionCode,
      mode,
      topic,
      difficulty,
      entry_fee: entry_fee_amount, // Keep old column for compatibility
      entry_fee_amount, // New column
      max_players,
      prize_pool: 0,
      prize_pool_calculated: 0,
      status: 'waiting',
      auto_cancel_at: new Date(Date.now() + 60000), // 1 minute from now
      minimum_players: mode === 'chaos' ? 6 : 10
    })
    .select()
    .single();

  if (error) throw error;

  console.log('Session created:', session);
  
  return new Response(
    JSON.stringify({ session }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function joinSession(supabase: any, payload: any) {
  const { session_id, user_id, team_name } = payload;
  
  console.log('Joining session:', { session_id, user_id, team_name });

  try {
    // Process entry fee using the database function
    const { data: entryResult, error: entryError } = await supabase
      .rpc('process_battle_royale_entry', {
        p_session_id: session_id,
        p_user_id: user_id
      });

    if (entryError || !entryResult.success) {
      console.error('Entry fee error:', entryError || entryResult.error);
      throw new Error(entryResult?.error || 'Failed to process entry fee');
    }

    // Add participant
    const { data: participant, error: participantError } = await supabase
      .from('battle_royale_participants')
      .insert({
        session_id,
        user_id,
        team_id: null
      })
      .select()
      .single();

    if (participantError) {
      console.error('Error adding participant:', participantError);
      throw new Error('Failed to join session');
    }

    console.log('Entry processed successfully:', entryResult);
    
    return new Response(
      JSON.stringify({ 
        participant,
        entry_fee: entryResult.entry_fee,
        new_prize_pool: entryResult.new_prize_pool,
        remaining_btz: entryResult.remaining_btz
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Join session error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  const { data: session, error: sessionError } = await supabase
    .from('battle_royale_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('status', 'waiting')
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found or not accepting players');
  }

  if (session.current_players >= session.max_players) {
    throw new Error('Session is full');
  }

  // Check if user already joined
  const { data: existing } = await supabase
    .from('battle_royale_participants')
    .select('id')
    .eq('session_id', session_id)
    .eq('user_id', user_id)
    .single();

  if (existing) {
    throw new Error('User already joined this session');
  }

  // Create team if squad mode
  let team_id = null;
  if (session.mode === 'squad' && team_name) {
    const { data: team, error: teamError } = await supabase
      .from('battle_royale_teams')
      .insert({
        session_id,
        team_name,
        captain_id: user_id
      })
      .select()
      .single();

    if (teamError) throw teamError;
    team_id = team.id;
  }

  // Add participant
  const { data: participant, error: participantError } = await supabase
    .from('battle_royale_participants')
    .insert({
      session_id,
      user_id,
      team_id
    })
    .select()
    .single();

  if (participantError) throw participantError;

  // Update session player count
  const { error: updateError } = await supabase
    .from('battle_royale_sessions')
    .update({ 
      current_players: session.current_players + 1,
      prize_pool: session.prize_pool + session.entry_fee
    })
    .eq('id', session_id);

  if (updateError) throw updateError;

  console.log('User joined session:', participant);

  return new Response(
    JSON.stringify({ participant, team_id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function startSession(supabase: any, payload: any) {
  const { session_id } = payload;
  
  // Get session
  const { data: session, error: sessionError } = await supabase
    .from('battle_royale_sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  if (sessionError) throw sessionError;

  if (session.current_players < 2) {
    throw new Error('Need at least 2 players to start');
  }

  // Get random questions for the battle
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('category', session.topic)
    .eq('difficulty', session.difficulty)
    .limit(session.total_rounds);

  if (questionsError || !questions.length) {
    throw new Error('Not enough questions for this topic/difficulty');
  }

  // Update session status and add questions
  const { error: updateError } = await supabase
    .from('battle_royale_sessions')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
      questions: questions
    })
    .eq('id', session_id);

  if (updateError) throw updateError;

  console.log('Session started:', session_id);

  return new Response(
    JSON.stringify({ 
      session_id, 
      status: 'active',
      first_question: questions[0],
      total_players: session.current_players
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function submitAnswer(supabase: any, payload: any) {
  const { session_id, participant_id, round_number, question_id, selected_answer, response_time_ms } = payload;
  
  // Get the question to check correct answer
  const { data: session, error: sessionError } = await supabase
    .from('battle_royale_sessions')
    .select('questions')
    .eq('id', session_id)
    .single();

  if (sessionError) throw sessionError;

  const question = session.questions[round_number - 1];
  const is_correct = selected_answer === question.correct_answer;
  
  // Calculate points based on correctness and speed
  let points_earned = 0;
  if (is_correct) {
    const time_bonus = Math.max(0, 30000 - response_time_ms) / 1000; // Bonus for speed
    points_earned = 100 + Math.floor(time_bonus);
  }

  // Submit answer
  const { error: answerError } = await supabase
    .from('battle_royale_answers')
    .insert({
      session_id,
      participant_id,
      round_number,
      question_id,
      selected_answer,
      is_correct,
      response_time_ms,
      points_earned
    });

  if (answerError) throw answerError;

  // Update participant score
  if (is_correct) {
    const { error: scoreError } = await supabase
      .from('battle_royale_participants')
      .update({
        total_score: supabase.rpc('increment', { x: points_earned }),
        correct_answers: supabase.rpc('increment', { x: 1 })
      })
      .eq('id', participant_id);

    if (scoreError) throw scoreError;
  }

  console.log('Answer submitted:', { participant_id, is_correct, points_earned });

  return new Response(
    JSON.stringify({ 
      is_correct, 
      points_earned,
      correct_answer: question.correct_answer
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processRound(supabase: any, payload: any) {
  const { session_id, round_number } = payload;
  
  // Process elimination for this round
  const { data: eliminationResult, error: eliminationError } = await supabase
    .rpc('process_battle_royale_elimination', {
      p_session_id: session_id,
      p_round_number: round_number
    });

  if (eliminationError) throw eliminationError;

  // Get remaining participants
  const { data: participants, error: participantsError } = await supabase
    .from('battle_royale_participants')
    .select(`
      *,
      profiles:user_id (
        nickname,
        current_avatar_id
      )
    `)
    .eq('session_id', session_id)
    .eq('is_alive', true)
    .order('total_score', { ascending: false });

  if (participantsError) throw participantsError;

  console.log('Round processed:', { round_number, eliminated: eliminationResult.eliminated_count, remaining: participants.length });

  return new Response(
    JSON.stringify({
      elimination_result: eliminationResult,
      remaining_participants: participants,
      is_final_round: participants.length <= 3
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function finishSession(supabase: any, payload: any) {
  const { session_id } = payload;
  
  console.log('Finishing session:', session_id);

  try {
    // Update session status
    const { error: sessionError } = await supabase
      .from('battle_royale_sessions')
      .update({ 
        status: 'finished',
        finished_at: new Date().toISOString()
      })
      .eq('id', session_id);

    if (sessionError) throw sessionError;

    // Set final rankings based on elimination order and scores
    const { data: participants } = await supabase
      .from('battle_royale_participants')
      .select('*')
      .eq('session_id', session_id)
      .order('is_alive', { ascending: false })
      .order('total_score', { ascending: false })
      .order('eliminated_by_round', { ascending: false });

    // Update positions
    for (let i = 0; i < participants.length; i++) {
      await supabase
        .from('battle_royale_participants')
        .update({ position: i + 1 })
        .eq('id', participants[i].id);
    }

    // Distribute prizes using the database function
    const { data: prizeResult, error: prizeError } = await supabase
      .rpc('distribute_battle_royale_prizes', {
        p_session_id: session_id
      });

    if (prizeError) {
      console.error('Prize distribution error:', prizeError);
    } else {
      console.log('Prizes distributed:', prizeResult);
    }

    return new Response(
      JSON.stringify({ success: true, prizes: prizeResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Finish session error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
    .from('battle_royale_sessions')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString()
    })
    .eq('id', session_id);

  if (sessionError) throw sessionError;

  // Calculate and distribute rewards
  const { error: rewardsError } = await supabase
    .rpc('calculate_battle_royale_rewards', {
      p_session_id: session_id
    });

  if (rewardsError) throw rewardsError;

  console.log('Session finished:', { session_id, participants: participants.length });

  return new Response(
    JSON.stringify({
      final_rankings: participants,
      winner: participants[0],
      session_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Auto-start sessions that meet criteria
async function autoStartReadySessions(supabase: any) {
  try {
    console.log('Checking for sessions ready to auto-start...');
    
    // First, cancel expired sessions and process refunds
    await supabase.rpc('cancel_expired_battle_royale_sessions');
    
    // Find waiting sessions that should start
    const { data: readySessions, error: fetchError } = await supabase
      .from('battle_royale_sessions')
      .select(`
        id,
        session_code,
        mode,
        topic,
        current_players,
        max_players,
        minimum_players,
        auto_cancel_at,
        created_at
      `)
      .eq('status', 'waiting')
      .gte('current_players', 2) // Minimum 2 players for testing
      .gt('auto_cancel_at', new Date().toISOString()) // Not expired yet
      .lt('created_at', new Date(Date.now() - 45000).toISOString()); // 45 seconds old

    if (fetchError) {
      console.error('Error fetching ready sessions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startedSessions = [];

    for (const session of readySessions || []) {
      try {
        console.log(`Auto-starting session ${session.session_code} with ${session.current_players} players`);
        
        // Start the session
        const startResult = await startSession(supabase, {
          session_id: session.id
        });

        if (startResult.ok) {
          startedSessions.push({
            sessionId: session.id,
            sessionCode: session.session_code,
            players: session.current_players
          });
          console.log(`Successfully auto-started session ${session.session_code}`);
        }
      } catch (error) {
        console.error(`Failed to auto-start session ${session.session_code}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        startedSessions,
        message: `Auto-started ${startedSessions.length} sessions`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Auto-start error:', error);
    return new Response(
      JSON.stringify({ error: 'Auto-start failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}