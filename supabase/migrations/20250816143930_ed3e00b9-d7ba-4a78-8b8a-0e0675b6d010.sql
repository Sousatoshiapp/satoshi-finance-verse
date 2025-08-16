-- Primeiro, vamos corrigir o sistema de apostas de duelos

-- 1. Modificar a função create_duel_with_invite para debitar apostas no início
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(p_invite_id uuid, p_challenger_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  new_duel_id uuid;
  duel_questions jsonb;
  mapped_category text;
  result jsonb;
  seen_question_ids text[] := '{}';
  pool_size integer := 15;
  final_questions jsonb := '[]'::jsonb;
  i integer;
  challenger_points integer;
  challenged_points integer;
BEGIN
  RAISE LOG 'create_duel_with_invite: Starting with invite_id=% challenger_id=%', p_invite_id, p_challenger_id;
  
  -- Get invite details including bet_amount
  SELECT * INTO invite_record
  FROM public.duel_invites 
  WHERE id = p_invite_id 
  AND challenged_id = p_challenger_id 
  AND status = 'pending';
  
  IF invite_record IS NULL THEN
    RAISE LOG 'create_duel_with_invite: No valid invite found';
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  -- Check if both players have sufficient balance for the bet
  SELECT points INTO challenger_points 
  FROM public.profiles 
  WHERE id = invite_record.challenger_id;
  
  SELECT points INTO challenged_points 
  FROM public.profiles 
  WHERE id = invite_record.challenged_id;
  
  IF COALESCE(invite_record.bet_amount, 0) > 0 THEN
    IF challenger_points < invite_record.bet_amount THEN
      RAISE LOG 'create_duel_with_invite: Challenger insufficient balance: % < %', challenger_points, invite_record.bet_amount;
      RETURN jsonb_build_object('success', false, 'error', 'Challenger has insufficient balance');
    END IF;
    
    IF challenged_points < invite_record.bet_amount THEN
      RAISE LOG 'create_duel_with_invite: Challenged insufficient balance: % < %', challenged_points, invite_record.bet_amount;
      RETURN jsonb_build_object('success', false, 'error', 'Challenged player has insufficient balance');
    END IF;
    
    -- Debit bet amount from both players immediately
    UPDATE public.profiles 
    SET points = points - invite_record.bet_amount
    WHERE id = invite_record.challenger_id;
    
    UPDATE public.profiles 
    SET points = points - invite_record.bet_amount
    WHERE id = invite_record.challenged_id;
    
    RAISE LOG 'create_duel_with_invite: Debited % BTZ from both players', invite_record.bet_amount;
  END IF;
  
  RAISE LOG 'create_duel_with_invite: Found invite for topic=% with bet_amount=%', invite_record.quiz_topic, COALESCE(invite_record.bet_amount, 0);
  
  -- Map quiz_topic to correct category names
  mapped_category := CASE invite_record.quiz_topic
    WHEN 'financas' THEN 'Finanças do Dia a Dia'
    WHEN 'cripto' THEN 'Cripto'
    WHEN 'abc_financas' THEN 'ABC das Finanças'
    WHEN 'investimentos' THEN 'ABC das Finanças'
    WHEN 'educacao' THEN 'ABC das Finanças'
    WHEN 'tech' THEN 'ABC das Finanças'
    WHEN 'imoveis' THEN 'Finanças do Dia a Dia'
    WHEN 'internacional' THEN 'ABC das Finanças'
    ELSE 'Finanças do Dia a Dia'
  END;
  
  RAISE LOG 'create_duel_with_invite: Mapped category=%', mapped_category;
  
  -- Get questions already seen by players in the last 7 days
  SELECT ARRAY_AGG(DISTINCT question_id) INTO seen_question_ids
  FROM public.user_question_history
  WHERE (user_id = invite_record.challenger_id OR user_id = invite_record.challenged_id)
  AND context_type = 'duel'
  AND seen_at > NOW() - INTERVAL '7 days';
  
  seen_question_ids := COALESCE(seen_question_ids, '{}');
  RAISE LOG 'create_duel_with_invite: Found % seen questions for both players', array_length(seen_question_ids, 1);
  
  -- Get fresh questions first, with randomization
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', q.id,
      'question', q.question,
      'options', q.options,
      'correct_answer', q.correct_answer,
      'explanation', q.explanation,
      'difficulty', q.difficulty
    ) ORDER BY RANDOM()
  ) INTO duel_questions
  FROM public.quiz_questions q
  WHERE q.category = mapped_category
  AND q.is_approved = true
  AND q.id::text != ALL(seen_question_ids)
  LIMIT pool_size;
  
  -- If not enough fresh questions, get all and randomize
  IF duel_questions IS NULL OR jsonb_array_length(duel_questions) < 5 THEN
    RAISE LOG 'create_duel_with_invite: Not enough fresh questions, including seen ones';
    
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'question', q.question,
        'options', q.options,
        'correct_answer', q.correct_answer,
        'explanation', q.explanation,
        'difficulty', q.difficulty
      ) ORDER BY RANDOM()
    ) INTO duel_questions
    FROM public.quiz_questions q
    WHERE q.category = mapped_category
    AND q.is_approved = true
    LIMIT pool_size;
  END IF;
  
  -- If still no questions, use fallback
  IF duel_questions IS NULL OR jsonb_array_length(duel_questions) = 0 THEN
    RAISE LOG 'create_duel_with_invite: No questions for category, using fallback from any category';
    
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'question', q.question,
        'options', q.options,
        'correct_answer', q.correct_answer,
        'explanation', q.explanation,
        'difficulty', q.difficulty
      ) ORDER BY RANDOM()
    ) INTO duel_questions
    FROM public.quiz_questions q
    WHERE q.is_approved = true
    LIMIT pool_size;
  END IF;
  
  -- Select 5 questions from randomized pool
  IF duel_questions IS NOT NULL AND jsonb_array_length(duel_questions) > 0 THEN
    FOR i IN 0..LEAST(4, jsonb_array_length(duel_questions) - 1) LOOP
      final_questions := final_questions || (duel_questions->i);
    END LOOP;
  ELSE
    -- Hardcoded fallback questions if nothing works
    final_questions := '[
      {
        "id": "fallback-1",
        "question": "Qual é a importância de ter uma reserva de emergência?",
        "options": ["Não é importante", "Proteção contra imprevistos", "Apenas para investir", "Para comprar supérfluos"],
        "correct_answer": "Proteção contra imprevistos",
        "explanation": "A reserva de emergência protege contra imprevistos financeiros.",
        "difficulty": "easy"
      },
      {
        "id": "fallback-2", 
        "question": "O que significa diversificar investimentos?",
        "options": ["Investir apenas em um ativo", "Espalhar investimentos em diferentes ativos", "Vender todos os investimentos", "Investir apenas em poupança"],
        "correct_answer": "Espalhar investimentos em diferentes ativos",
        "explanation": "Diversificar reduz o risco distribuindo investimentos.",
        "difficulty": "medium"
      }
    ]'::jsonb;
    
    -- Complete to 5 questions repeating if necessary
    WHILE jsonb_array_length(final_questions) < 5 LOOP
      final_questions := final_questions || (final_questions->0);
    END LOOP;
  END IF;
  
  RAISE LOG 'create_duel_with_invite: Created % final questions', jsonb_array_length(final_questions);
  
  -- Create the duel with the correct bet amount
  INSERT INTO public.casino_duels (
    player1_id,
    player2_id,
    topic,
    questions,
    status,
    bet_amount
  ) VALUES (
    invite_record.challenger_id,
    invite_record.challenged_id,
    invite_record.quiz_topic,
    final_questions,
    'waiting',
    COALESCE(invite_record.bet_amount, 0)
  ) RETURNING id INTO new_duel_id;
  
  RAISE LOG 'create_duel_with_invite: Created duel with id=% and bet_amount=%', new_duel_id, COALESCE(invite_record.bet_amount, 0);
  
  -- Record questions as seen for both players
  BEGIN
    FOR i IN 0..jsonb_array_length(final_questions) - 1 LOOP
      INSERT INTO public.user_question_history (user_id, question_id, context_type, seen_at)
      VALUES 
        (invite_record.challenger_id, (final_questions->i->>'id')::uuid, 'duel', NOW()),
        (invite_record.challenged_id, (final_questions->i->>'id')::uuid, 'duel', NOW())
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE LOG 'create_duel_with_invite: Recorded question history for both players';
  EXCEPTION
    WHEN others THEN
      RAISE LOG 'create_duel_with_invite: Warning - could not record question history: %', SQLERRM;
  END;
  
  -- Update invite status to accepted
  UPDATE public.duel_invites 
  SET status = 'accepted'
  WHERE id = p_invite_id;
  
  -- Insert transaction log for both players
  IF COALESCE(invite_record.bet_amount, 0) > 0 THEN
    INSERT INTO public.activity_feed (user_id, activity_type, activity_data)
    SELECT 
      invite_record.challenger_id,
      'duel_bet_debited',
      jsonb_build_object(
        'duel_id', new_duel_id,
        'amount', -invite_record.bet_amount,
        'opponent_id', invite_record.challenged_id,
        'timestamp', NOW()
      )
    UNION ALL
    SELECT 
      invite_record.challenged_id,
      'duel_bet_debited',
      jsonb_build_object(
        'duel_id', new_duel_id,
        'amount', -invite_record.bet_amount,
        'opponent_id', invite_record.challenger_id,
        'timestamp', NOW()
      );
  END IF;
  
  -- Return success response with all details
  result := jsonb_build_object(
    'success', true,
    'duel_id', new_duel_id,
    'questions_count', jsonb_array_length(final_questions),
    'mapped_category', mapped_category,
    'seen_questions_excluded', array_length(seen_question_ids, 1),
    'bet_amount', COALESCE(invite_record.bet_amount, 0),
    'bet_debited', COALESCE(invite_record.bet_amount, 0) > 0,
    'randomized', true
  );
  
  RAISE LOG 'create_duel_with_invite: Returning success result=%', result;
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If error after debiting bets, refund them
    IF COALESCE(invite_record.bet_amount, 0) > 0 THEN
      BEGIN
        UPDATE public.profiles 
        SET points = points + invite_record.bet_amount
        WHERE id IN (invite_record.challenger_id, invite_record.challenged_id);
        
        RAISE LOG 'create_duel_with_invite: Refunded bet amounts due to error';
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'create_duel_with_invite: Failed to refund bet amounts: %', SQLERRM;
      END;
    END IF;
    
    RAISE LOG 'create_duel_with_invite: Error - %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'error_detail', 'Database error occurred while creating duel'
    );
END;
$function$;