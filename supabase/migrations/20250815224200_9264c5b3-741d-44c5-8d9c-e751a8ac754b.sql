-- Atualizar a função create_duel_with_invite para usar o novo sistema de randomização
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_invite_id uuid,
  p_challenger_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record RECORD;
  new_duel_id uuid;
  duel_questions jsonb;
  mapped_category text;
  result jsonb;
  seen_question_ids text[] := '{}';
  available_questions RECORD[];
  selected_questions jsonb := '[]'::jsonb;
  question_record RECORD;
  i integer;
  pool_size integer := 15; -- Pool maior para randomização
  final_questions jsonb := '[]'::jsonb;
BEGIN
  RAISE LOG 'create_duel_with_invite: Starting with invite_id=% challenger_id=%', p_invite_id, p_challenger_id;
  
  -- Get invite details
  SELECT * INTO invite_record
  FROM public.duel_invites 
  WHERE id = p_invite_id 
  AND challenged_id = p_challenger_id 
  AND status = 'pending';
  
  IF invite_record IS NULL THEN
    RAISE LOG 'create_duel_with_invite: No valid invite found';
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  RAISE LOG 'create_duel_with_invite: Found invite for topic=%', invite_record.quiz_topic;
  
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
    ELSE 'Finanças do Dia a Dia' -- Default fallback
  END;
  
  RAISE LOG 'create_duel_with_invite: Mapped category=%', mapped_category;
  
  -- Obter questões já vistas pelos jogadores nos últimos 7 dias
  SELECT ARRAY_AGG(DISTINCT question_id) INTO seen_question_ids
  FROM public.user_question_history
  WHERE (user_id = invite_record.challenger_id OR user_id = invite_record.challenged_id)
  AND context_type = 'duel'
  AND seen_at > NOW() - INTERVAL '7 days';
  
  seen_question_ids := COALESCE(seen_question_ids, '{}');
  RAISE LOG 'create_duel_with_invite: Found % seen questions for both players', array_length(seen_question_ids, 1);
  
  -- Buscar questões não vistas primeiro, com randomização
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
  
  -- Se não temos questões suficientes não vistas, pegar todas e randomizar
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
  
  -- Se ainda não temos questões, usar fallback de qualquer categoria
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
  
  -- Selecionar 5 questões do pool randomizado
  IF duel_questions IS NOT NULL AND jsonb_array_length(duel_questions) > 0 THEN
    FOR i IN 0..LEAST(4, jsonb_array_length(duel_questions) - 1) LOOP
      final_questions := final_questions || (duel_questions->i);
    END LOOP;
  ELSE
    -- Questões fallback hardcoded se nada funcionar
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
    
    -- Completar até 5 questões repetindo se necessário
    WHILE jsonb_array_length(final_questions) < 5 LOOP
      final_questions := final_questions || (final_questions->0);
    END LOOP;
  END IF;
  
  RAISE LOG 'create_duel_with_invite: Created % final questions', jsonb_array_length(final_questions);
  
  -- Create the duel
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
  
  RAISE LOG 'create_duel_with_invite: Created duel with id=%', new_duel_id;
  
  -- Registrar questões como vistas para ambos os jogadores
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
  
  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'duel_id', new_duel_id,
    'questions_count', jsonb_array_length(final_questions),
    'mapped_category', mapped_category,
    'seen_questions_excluded', array_length(seen_question_ids, 1),
    'randomized', true
  );
  
  RAISE LOG 'create_duel_with_invite: Returning success result=%', result;
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'create_duel_with_invite: Error - %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'error_detail', 'Database error occurred while creating duel'
    );
END;
$$;