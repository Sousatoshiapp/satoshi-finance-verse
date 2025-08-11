-- Corrigir RPC create_duel_with_invite - trocar 'topic' por 'theme'
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_invite_id uuid,
  p_challenger_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_record RECORD;
  challenger_profile RECORD;
  challenged_profile RECORD;
  new_duel_id uuid;
  result_data jsonb;
BEGIN
  -- Buscar dados do convite
  SELECT * INTO invite_record 
  FROM duel_invites 
  WHERE id = p_invite_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Convite não encontrado ou já processado'
    );
  END IF;
  
  -- Buscar perfis dos jogadores
  SELECT * INTO challenger_profile FROM profiles WHERE id = invite_record.challenger_id;
  SELECT * INTO challenged_profile FROM profiles WHERE id = invite_record.challenged_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Perfis dos jogadores não encontrados'
    );
  END IF;
  
  -- Verificar se challenger tem pontos suficientes
  IF challenger_profile.points < invite_record.bet_amount THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Challenger não tem pontos suficientes'
    );
  END IF;
  
  -- Verificar se challenged tem pontos suficientes
  IF challenged_profile.points < invite_record.bet_amount THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Challenged não tem pontos suficientes'
    );
  END IF;
  
  -- Gerar perguntas do duelo (CORRIGIDO: theme ao invés de topic)
  DECLARE
    duel_questions jsonb;
  BEGIN
    -- Buscar 10 perguntas aleatórias do tema
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'question', question,
        'options', options,
        'correct_answer', correct_answer,
        'explanation', explanation
      )
    ) INTO duel_questions
    FROM (
      SELECT id, question, options, correct_answer, explanation
      FROM quiz_questions
      WHERE theme = invite_record.quiz_topic
      AND is_active = true
      ORDER BY RANDOM()
      LIMIT 10
    ) q;
    
    -- Se não houver perguntas suficientes, usar perguntas gerais
    IF jsonb_array_length(COALESCE(duel_questions, '[]'::jsonb)) < 10 THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'question', question,
          'options', options,
          'correct_answer', correct_answer,
          'explanation', explanation
        )
      ) INTO duel_questions
      FROM (
        SELECT id, question, options, correct_answer, explanation
        FROM quiz_questions
        WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 10
      ) q;
    END IF;
  END;
  
  -- Criar o duelo na tabela casino_duels
  INSERT INTO casino_duels (
    player1_id,
    player2_id,
    topic,
    bet_amount,
    questions,
    status
  ) VALUES (
    invite_record.challenger_id,
    invite_record.challenged_id,
    invite_record.quiz_topic,
    invite_record.bet_amount,
    COALESCE(duel_questions, '[]'::jsonb),
    'waiting'
  )
  RETURNING id INTO new_duel_id;
  
  -- Debitar pontos dos jogadores
  UPDATE profiles 
  SET points = points - invite_record.bet_amount
  WHERE id IN (invite_record.challenger_id, invite_record.challenged_id);
  
  -- Atualizar status do convite
  UPDATE duel_invites 
  SET status = 'accepted'
  WHERE id = p_invite_id;
  
  -- Preparar resultado
  result_data := jsonb_build_object(
    'success', true,
    'duel_id', new_duel_id,
    'topic', invite_record.quiz_topic,
    'bet_amount', invite_record.bet_amount,
    'questions_count', jsonb_array_length(COALESCE(duel_questions, '[]'::jsonb))
  );
  
  RETURN result_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;