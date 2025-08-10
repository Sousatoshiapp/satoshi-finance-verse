-- Fix create_duel_with_invite function to remove non-existent updated_at column
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(p_invite_id uuid, p_challenger_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  invite_record RECORD;
  duel_id uuid;
  questions_array jsonb;
  result jsonb;
BEGIN
  -- Buscar o convite
  SELECT * INTO invite_record
  FROM duel_invites 
  WHERE id = p_invite_id 
  AND challenged_id = p_challenger_id
  AND status = 'pending';
  
  IF invite_record IS NULL THEN
    RETURN jsonb_build_object('error', 'Convite não encontrado ou inválido');
  END IF;
  
  -- Gerar questões para o duelo (corrigido: q.is_approved ao invés de q.is_active)
  SELECT jsonb_agg(
    jsonb_build_object(
      'question', q.question,
      'options', q.options,
      'correct_answer', q.correct_answer,
      'explanation', q.explanation
    )
  ) INTO questions_array
  FROM quiz_questions q
  WHERE q.district_id = (
    CASE invite_record.quiz_topic
      WHEN 'financas' THEN (SELECT id FROM districts WHERE name = 'Centro Financeiro' LIMIT 1)
      WHEN 'tecnologia' THEN (SELECT id FROM districts WHERE name = 'Vale do Silício' LIMIT 1)  
      WHEN 'negocios' THEN (SELECT id FROM districts WHERE name = 'Distrito Empresarial' LIMIT 1)
      WHEN 'investimentos' THEN (SELECT id FROM districts WHERE name = 'Wall Street' LIMIT 1)
      ELSE (SELECT id FROM districts LIMIT 1)
    END
  )
  AND q.is_approved = true -- CORRIGIDO: era q.is_active = true
  ORDER BY RANDOM()
  LIMIT 10;
  
  -- Se não encontrou questões, usar questões genéricas
  IF questions_array IS NULL OR jsonb_array_length(questions_array) = 0 THEN
    questions_array := '[
      {
        "question": "Qual é o principal objetivo da diversificação em investimentos?",
        "options": ["Maximizar retornos", "Reduzir riscos", "Aumentar liquidez", "Evitar impostos"],
        "correct_answer": "Reduzir riscos",
        "explanation": "A diversificação visa reduzir o risco total da carteira."
      },
      {
        "question": "O que significa ROI?",
        "options": ["Return on Investment", "Risk of Investment", "Rate of Interest", "Revenue Over Income"],
        "correct_answer": "Return on Investment",
        "explanation": "ROI significa Return on Investment - Retorno sobre Investimento."
      },
      {
        "question": "Qual é a principal característica de um ativo líquido?",
        "options": ["Alto retorno", "Facilidade de conversão em dinheiro", "Baixo risco", "Proteção contra inflação"],
        "correct_answer": "Facilidade de conversão em dinheiro",
        "explanation": "Liquidez refere-se à facilidade de converter um ativo em dinheiro."
      }
    ]'::jsonb;
  END IF;
  
  -- Criar o duelo na tabela correta (casino_duels)
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
    COALESCE(invite_record.bet_amount, 100),
    questions_array,
    'waiting'
  ) RETURNING id INTO duel_id;
  
  -- Atualizar o convite (CORRIGIDO: removido updated_at que não existe)
  UPDATE duel_invites 
  SET status = 'accepted'
  WHERE id = p_invite_id;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'success', true,
    'duel_id', duel_id,
    'topic', invite_record.quiz_topic,
    'bet_amount', COALESCE(invite_record.bet_amount, 100)
  );
  
  RETURN result;
END;
$function$;