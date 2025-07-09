
-- Atualizar estrutura da tabela duels para suportar duelos simultâneos
ALTER TABLE public.duels 
ADD COLUMN IF NOT EXISTS player1_current_question INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS player2_current_question INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS player1_finished_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS player2_finished_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS player1_timeout_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_timeout_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player1_status TEXT DEFAULT 'playing',
ADD COLUMN IF NOT EXISTS player2_status TEXT DEFAULT 'playing';

-- Remover campo current_turn pois não precisamos mais de turnos
ALTER TABLE public.duels DROP COLUMN IF EXISTS current_turn;
ALTER TABLE public.duels DROP COLUMN IF EXISTS turn_started_at;

-- Função para processar resposta de duelo simultâneo
CREATE OR REPLACE FUNCTION public.process_duel_answer(
  p_duel_id uuid,
  p_player_id uuid,
  p_question_number integer,
  p_answer_id text,
  p_is_timeout boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_record RECORD;
  question_data JSONB;
  is_correct BOOLEAN;
  is_player1 BOOLEAN;
  current_answers JSONB;
  new_answer JSONB;
  updated_answers JSONB;
  current_score INTEGER;
  new_score INTEGER;
  timeout_count INTEGER;
  next_question INTEGER;
  is_finished BOOLEAN DEFAULT FALSE;
  opponent_finished BOOLEAN DEFAULT FALSE;
  winner_id UUID;
  result JSONB;
BEGIN
  -- Buscar dados do duelo
  SELECT * INTO duel_record FROM public.duels WHERE id = p_duel_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Duelo não encontrado');
  END IF;
  
  -- Determinar se é player1 ou player2
  is_player1 := duel_record.player1_id = p_player_id;
  
  -- Verificar se pergunta existe
  IF p_question_number > jsonb_array_length(duel_record.questions) THEN
    RETURN jsonb_build_object('error', 'Pergunta inválida');
  END IF;
  
  -- Buscar dados da pergunta
  question_data := duel_record.questions->((p_question_number - 1)::integer);
  
  -- Verificar se resposta está correta (não aplicável para timeout)
  IF NOT p_is_timeout AND p_answer_id IS NOT NULL THEN
    SELECT (opt->>'isCorrect')::boolean INTO is_correct
    FROM jsonb_array_elements(question_data->'options') opt
    WHERE opt->>'id' = p_answer_id;
  ELSE
    is_correct := FALSE;
  END IF;
  
  -- Preparar nova resposta
  new_answer := jsonb_build_object(
    'questionNumber', p_question_number,
    'answerId', COALESCE(p_answer_id, 'timeout'),
    'isCorrect', is_correct,
    'isTimeout', p_is_timeout,
    'answeredAt', now()
  );
  
  -- Atualizar dados do player correto
  IF is_player1 THEN
    current_answers := COALESCE(duel_record.player1_answers, '[]'::jsonb);
    current_score := COALESCE(duel_record.player1_score, 0);
    timeout_count := COALESCE(duel_record.player1_timeout_count, 0);
    next_question := COALESCE(duel_record.player1_current_question, 1) + 1;
  ELSE
    current_answers := COALESCE(duel_record.player2_answers, '[]'::jsonb);
    current_score := COALESCE(duel_record.player2_score, 0);
    timeout_count := COALESCE(duel_record.player2_timeout_count, 0);
    next_question := COALESCE(duel_record.player2_current_question, 1) + 1;
  END IF;
  
  -- Adicionar nova resposta
  updated_answers := current_answers || new_answer;
  
  -- Calcular novo score
  new_score := current_score + CASE WHEN is_correct THEN 1 ELSE 0 END;
  
  -- Incrementar timeout count se aplicável
  IF p_is_timeout THEN
    timeout_count := timeout_count + 1;
  END IF;
  
  -- Verificar se terminou todas as perguntas
  is_finished := next_question > jsonb_array_length(duel_record.questions);
  
  -- Atualizar duelo
  IF is_player1 THEN
    UPDATE public.duels SET
      player1_answers = updated_answers,
      player1_score = new_score,
      player1_current_question = next_question,
      player1_timeout_count = timeout_count,
      player1_status = CASE WHEN is_finished THEN 'finished' ELSE 'playing' END,
      player1_finished_at = CASE WHEN is_finished THEN now() ELSE player1_finished_at END
    WHERE id = p_duel_id;
    
    -- Verificar se oponente já terminou
    opponent_finished := duel_record.player2_status = 'finished';
  ELSE
    UPDATE public.duels SET
      player2_answers = updated_answers,
      player2_score = new_score,
      player2_current_question = next_question,
      player2_timeout_count = timeout_count,
      player2_status = CASE WHEN is_finished THEN 'finished' ELSE 'playing' END,
      player2_finished_at = CASE WHEN is_finished THEN now() ELSE player2_finished_at END
    WHERE id = p_duel_id;
    
    -- Verificar se oponente já terminou
    opponent_finished := duel_record.player1_status = 'finished';
  END IF;
  
  -- Determinar vencedor se duelo acabou
  IF is_finished OR opponent_finished THEN
    -- Buscar dados atualizados
    SELECT * INTO duel_record FROM public.duels WHERE id = p_duel_id;
    
    -- Se ambos terminaram ou um terminou, determinar vencedor
    IF (duel_record.player1_status = 'finished' AND duel_record.player2_status = 'finished') OR
       (is_finished AND opponent_finished) THEN
      
      -- Lógica de vitória: mais acertos primeiro, se empate quem terminou primeiro
      IF duel_record.player1_score > duel_record.player2_score THEN
        winner_id := duel_record.player1_id;
      ELSIF duel_record.player2_score > duel_record.player1_score THEN
        winner_id := duel_record.player2_id;
      ELSE
        -- Empate: quem terminou primeiro vence
        IF duel_record.player1_finished_at IS NOT NULL AND duel_record.player2_finished_at IS NOT NULL THEN
          IF duel_record.player1_finished_at <= duel_record.player2_finished_at THEN
            winner_id := duel_record.player1_id;
          ELSE
            winner_id := duel_record.player2_id;
          END IF;
        ELSIF duel_record.player1_finished_at IS NOT NULL THEN
          winner_id := duel_record.player1_id;
        ELSE
          winner_id := duel_record.player2_id;
        END IF;
      END IF;
      
      -- Finalizar duelo
      UPDATE public.duels SET
        status = 'finished',
        winner_id = winner_id,
        finished_at = now()
      WHERE id = p_duel_id;
    END IF;
  END IF;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'success', true,
    'isCorrect', is_correct,
    'newScore', new_score,
    'nextQuestion', next_question,
    'isFinished', is_finished,
    'winnerId', winner_id
  );
  
  RETURN result;
END;
$$;

-- Função para obter status atual do duelo
CREATE OR REPLACE FUNCTION public.get_duel_status(p_duel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_record RECORD;
  result JSONB;
BEGIN
  SELECT * INTO duel_record FROM public.duels WHERE id = p_duel_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Duelo não encontrado');
  END IF;
  
  result := jsonb_build_object(
    'player1_current_question', duel_record.player1_current_question,
    'player2_current_question', duel_record.player2_current_question,
    'player1_status', duel_record.player1_status,
    'player2_status', duel_record.player2_status,
    'player1_score', duel_record.player1_score,
    'player2_score', duel_record.player2_score,
    'status', duel_record.status,
    'winner_id', duel_record.winner_id,
    'total_questions', jsonb_array_length(duel_record.questions)
  );
  
  RETURN result;
END;
$$;
