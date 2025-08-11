-- Add more quiz questions to resolve the duel question loading issue
-- We need at least 10 questions per category for duels to work properly

INSERT INTO public.quiz_questions (question, category, difficulty, options, correct_answer, explanation, is_approved, theme) VALUES
-- Finanças do Dia a Dia questions
('Qual é a principal vantagem de ter uma reserva de emergência?', 'Finanças do Dia a Dia', 'easy', '{"a": "Ganhar dinheiro rapidamente", "b": "Ter segurança financeira para imprevistos", "c": "Aumentar o score no Serasa", "d": "Comprar mais produtos"}', 'b', 'A reserva de emergência é fundamental para proteger contra imprevistos financeiros.', true, 'financial_planning'),
('Quantos meses de gastos é recomendado ter na reserva de emergência?', 'Finanças do Dia a Dia', 'medium', '{"a": "1 a 2 meses", "b": "3 a 6 meses", "c": "12 meses", "d": "24 meses"}', 'b', 'O ideal é ter entre 3 a 6 meses de gastos para cobrir emergências.', true, 'financial_planning'),
('O que significa taxa Selic?', 'Finanças do Dia a Dia', 'medium', '{"a": "Taxa de desconto dos bancos", "b": "Taxa básica de juros da economia", "c": "Taxa de inflação", "d": "Taxa de câmbio"}', 'b', 'A Selic é a taxa básica de juros que influencia toda a economia.', true, 'economic_concepts'),
('Qual é a diferença entre débito e crédito?', 'Finanças do Dia a Dia', 'easy', '{"a": "Não há diferença", "b": "Débito desconta na hora, crédito vira dívida", "c": "Crédito é mais barato", "d": "Débito só funciona online"}', 'b', 'O cartão de débito desconta o valor imediatamente da conta, já o crédito gera uma dívida.', true, 'payment_methods'),
('O que é score de crédito?', 'Finanças do Dia a Dia', 'easy', '{"a": "Pontuação do seu time favorito", "b": "Avaliação da sua capacidade de pagar dívidas", "c": "Valor do seu salário", "d": "Quantidade de cartões"}', 'b', 'O score é uma pontuação que indica o risco de você não pagar uma dívida.', true, 'credit_analysis'),

-- Cripto questions
('O que é uma blockchain?', 'Cripto', 'medium', '{"a": "Um tipo de criptomoeda", "b": "Uma rede de computadores", "c": "Um livro contábil distribuído", "d": "Um aplicativo de investimento"}', 'c', 'Blockchain é uma tecnologia de livro contábil distribuído e imutável.', true, 'blockchain'),
('Qual foi a primeira criptomoeda criada?', 'Cripto', 'easy', '{"a": "Ethereum", "b": "Bitcoin", "c": "Litecoin", "d": "Ripple"}', 'b', 'Bitcoin foi a primeira criptomoeda, criada por Satoshi Nakamoto em 2009.', true, 'cryptocurrency_history'),
('O que significa "HODL" no mundo cripto?', 'Cripto', 'easy', '{"a": "Vender rapidamente", "b": "Segurar por muito tempo", "c": "Trocar por outra moeda", "d": "Emprestar criptomoedas"}', 'b', 'HODL significa manter as criptomoedas por longo prazo, sem vender.', true, 'crypto_strategy'),
('O que é mining de criptomoedas?', 'Cripto', 'medium', '{"a": "Comprar criptomoedas", "b": "Validar transações e criar novos blocos", "c": "Trocar moedas", "d": "Guardar em carteira"}', 'b', 'Mining é o processo de validar transações e criar novos blocos na blockchain.', true, 'blockchain'),
('O que é uma carteira de criptomoedas?', 'Cripto', 'easy', '{"a": "Uma carteira física", "b": "Um software para guardar chaves privadas", "c": "Um banco digital", "d": "Um site de notícias"}', 'b', 'A carteira cripto é um software que armazena suas chaves privadas de forma segura.', true, 'crypto_wallets'),

-- ABC das Finanças questions
('O que é inflação?', 'ABC das Finanças', 'medium', '{"a": "Aumento geral dos preços", "b": "Diminuição do salário", "c": "Aumento do desemprego", "d": "Queda da bolsa"}', 'a', 'Inflação é o aumento generalizado e contínuo dos preços na economia.', true, 'economic_concepts'),
('O que significa liquidez de um investimento?', 'ABC das Finanças', 'medium', '{"a": "Quanto rende", "b": "Facilidade para resgatar", "c": "Nível de risco", "d": "Valor mínimo"}', 'b', 'Liquidez é a facilidade e rapidez para converter um investimento em dinheiro.', true, 'investment_concepts'),
('O que é CDI?', 'ABC das Finanças', 'medium', '{"a": "Certificado de Depósito Interbancário", "b": "Conta de Depósito Individual", "c": "Cartão de Débito Internacional", "d": "Centro de Distribuição de Investimentos"}', 'a', 'CDI é uma taxa de referência baseada nos empréstimos entre bancos.', true, 'investment_concepts'),
('O que é diversificação de investimentos?', 'ABC das Finanças', 'easy', '{"a": "Investir apenas em um produto", "b": "Espalhar investimentos em diferentes ativos", "c": "Investir apenas em renda fixa", "d": "Comprar muitas ações da mesma empresa"}', 'b', 'Diversificar é espalhar os investimentos para reduzir riscos.', true, 'investment_strategy'),
('O que é renda fixa?', 'ABC das Finanças', 'easy', '{"a": "Investimento com rendimento previsível", "b": "Salário fixo", "c": "Investimento de alto risco", "d": "Dinheiro na poupança"}', 'a', 'Renda fixa são investimentos com rentabilidade conhecida ou previsível.', true, 'investment_concepts');

-- Update existing RPC function to handle insufficient questions by repeating them
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(p_invite_id uuid, p_challenger_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  invite_record RECORD;
  new_duel_id uuid;
  duel_questions jsonb;
  available_questions jsonb;
  questions_count integer;
  final_questions jsonb := '[]'::jsonb;
  i integer;
  result jsonb;
  mapped_category text;
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
    ELSE 'Finanças do Dia a Dia' -- Default fallback
  END;
  
  RAISE LOG 'create_duel_with_invite: Mapped category=%', mapped_category;
  
  -- Get available questions for the category
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', q.id,
      'question', q.question,
      'options', q.options,
      'correct_answer', q.correct_answer,
      'explanation', q.explanation,
      'difficulty', q.difficulty
    )
  ) INTO available_questions
  FROM public.quiz_questions q
  WHERE q.category = mapped_category
  AND q.is_approved = true;
  
  -- If no questions found for specific category, get from any category
  IF available_questions IS NULL OR jsonb_array_length(available_questions) = 0 THEN
    RAISE LOG 'create_duel_with_invite: No questions found for category, using fallback';
    
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'question', q.question,
        'options', q.options,
        'correct_answer', q.correct_answer,
        'explanation', q.explanation,
        'difficulty', q.difficulty
      )
    ) INTO available_questions
    FROM public.quiz_questions q
    WHERE q.is_approved = true;
  END IF;
  
  questions_count := jsonb_array_length(COALESCE(available_questions, '[]'::jsonb));
  RAISE LOG 'create_duel_with_invite: Found % questions', questions_count;
  
  -- If we have questions, create 10 questions by repeating if necessary
  IF questions_count > 0 THEN
    FOR i IN 0..9 LOOP
      final_questions := final_questions || (available_questions->((i % questions_count)));
    END LOOP;
  ELSE
    -- Create fallback questions if no questions in database
    final_questions := '[
      {
        "id": "fallback-1",
        "question": "Qual é a importância de ter uma reserva de emergência?",
        "options": {"a": "Não é importante", "b": "Proteção contra imprevistos", "c": "Apenas para investir", "d": "Para comprar supérfluos"},
        "correct_answer": "b",
        "explanation": "A reserva de emergência protege contra imprevistos financeiros.",
        "difficulty": "easy"
      }
    ]'::jsonb;
    
    -- Repeat this question 10 times
    FOR i IN 1..9 LOOP
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
    'original_questions_count', questions_count
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
$function$;