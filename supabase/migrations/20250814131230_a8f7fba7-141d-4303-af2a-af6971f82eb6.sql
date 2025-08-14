-- Adicionar colunas para sistema de apostas real
ALTER TABLE public.battle_royale_sessions 
ADD COLUMN entry_fee_amount integer NOT NULL DEFAULT 10,
ADD COLUMN prize_pool_calculated integer NOT NULL DEFAULT 0,
ADD COLUMN refund_processed boolean NOT NULL DEFAULT false,
ADD COLUMN auto_cancel_at timestamp with time zone DEFAULT (now() + interval '1 minute'),
ADD COLUMN minimum_players integer NOT NULL DEFAULT 3;

-- Criar tabela para transações do Battle Royale
CREATE TABLE IF NOT EXISTS public.battle_royale_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.battle_royale_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('entry_fee', 'prize_win', 'refund')),
  amount integer NOT NULL,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.battle_royale_transactions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias transações
CREATE POLICY "Users can view their own battle royale transactions"
ON public.battle_royale_transactions
FOR SELECT
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Política para sistema inserir transações
CREATE POLICY "System can insert battle royale transactions"
ON public.battle_royale_transactions
FOR INSERT
WITH CHECK (true);

-- Função para processar entrada e debitar BTZ
CREATE OR REPLACE FUNCTION public.process_battle_royale_entry(
  p_session_id uuid,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  user_record RECORD;
  entry_fee integer;
  new_prize_pool integer;
BEGIN
  -- Buscar sessão
  SELECT * INTO session_record
  FROM public.battle_royale_sessions
  WHERE id = p_session_id AND status = 'waiting';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sessão não encontrada ou já iniciada');
  END IF;
  
  -- Buscar usuário
  SELECT * INTO user_record
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  entry_fee := session_record.entry_fee_amount;
  
  -- Verificar se usuário tem BTZ suficiente
  IF user_record.points < entry_fee THEN
    RETURN jsonb_build_object('success', false, 'error', 'BTZ insuficiente');
  END IF;
  
  -- Verificar se usuário já está na sessão
  IF EXISTS (
    SELECT 1 FROM public.battle_royale_participants 
    WHERE session_id = p_session_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário já está na sessão');
  END IF;
  
  -- Debitar BTZ do usuário
  UPDATE public.profiles
  SET points = points - entry_fee
  WHERE id = p_user_id;
  
  -- Calcular novo prize pool
  new_prize_pool := session_record.prize_pool_calculated + entry_fee;
  
  -- Atualizar prize pool da sessão
  UPDATE public.battle_royale_sessions
  SET prize_pool_calculated = new_prize_pool,
      current_players = current_players + 1
  WHERE id = p_session_id;
  
  -- Registrar transação
  INSERT INTO public.battle_royale_transactions (
    session_id, user_id, transaction_type, amount
  ) VALUES (
    p_session_id, p_user_id, 'entry_fee', entry_fee
  );
  
  -- Registrar na tabela wallet_transactions
  INSERT INTO public.wallet_transactions (
    user_id, transaction_type, amount, source_type, metadata
  ) VALUES (
    p_user_id, 'debit', entry_fee, 'battle_royale_entry', 
    jsonb_build_object('session_id', p_session_id, 'session_code', session_record.session_code)
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'entry_fee', entry_fee,
    'new_prize_pool', new_prize_pool,
    'remaining_btz', user_record.points - entry_fee
  );
END;
$$;

-- Função para processar reembolsos
CREATE OR REPLACE FUNCTION public.process_battle_royale_refunds(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant RECORD;
  total_refunded integer := 0;
  refund_count integer := 0;
BEGIN
  -- Buscar sessão
  SELECT * INTO session_record
  FROM public.battle_royale_sessions
  WHERE id = p_session_id AND refund_processed = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sessão não encontrada ou já processada');
  END IF;
  
  -- Reembolsar todos os participantes
  FOR participant IN 
    SELECT DISTINCT bp.user_id, brt.amount
    FROM public.battle_royale_participants bp
    JOIN public.battle_royale_transactions brt ON brt.user_id = bp.user_id AND brt.session_id = bp.session_id
    WHERE bp.session_id = p_session_id AND brt.transaction_type = 'entry_fee'
  LOOP
    -- Creditar BTZ de volta
    UPDATE public.profiles
    SET points = points + participant.amount
    WHERE id = participant.user_id;
    
    -- Registrar transação de reembolso
    INSERT INTO public.battle_royale_transactions (
      session_id, user_id, transaction_type, amount
    ) VALUES (
      p_session_id, participant.user_id, 'refund', participant.amount
    );
    
    -- Registrar na tabela wallet_transactions
    INSERT INTO public.wallet_transactions (
      user_id, transaction_type, amount, source_type, metadata
    ) VALUES (
      participant.user_id, 'credit', participant.amount, 'battle_royale_refund',
      jsonb_build_object('session_id', p_session_id, 'session_code', session_record.session_code)
    );
    
    total_refunded := total_refunded + participant.amount;
    refund_count := refund_count + 1;
  END LOOP;
  
  -- Marcar sessão como reembolsada
  UPDATE public.battle_royale_sessions
  SET refund_processed = true,
      prize_pool_calculated = 0,
      status = 'cancelled'
  WHERE id = p_session_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_refunded', total_refunded,
    'refund_count', refund_count
  );
END;
$$;

-- Função para distribuir prêmios
CREATE OR REPLACE FUNCTION public.distribute_battle_royale_prizes(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant RECORD;
  prize_pool integer;
  first_prize integer;
  second_prize integer;
  third_prize integer;
  prizes_distributed integer := 0;
BEGIN
  -- Buscar sessão
  SELECT * INTO session_record
  FROM public.battle_royale_sessions
  WHERE id = p_session_id AND status = 'finished';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sessão não encontrada ou não finalizada');
  END IF;
  
  prize_pool := session_record.prize_pool_calculated;
  
  -- Calcular prêmios (70% / 20% / 10%)
  first_prize := FLOOR(prize_pool * 0.70);
  second_prize := FLOOR(prize_pool * 0.20);
  third_prize := prize_pool - first_prize - second_prize; -- Resto vai para 3º lugar
  
  -- Distribuir prêmios para top 3
  FOR participant IN
    SELECT bp.user_id, bp.position
    FROM public.battle_royale_participants bp
    WHERE bp.session_id = p_session_id 
    AND bp.position IN (1, 2, 3)
    ORDER BY bp.position
  LOOP
    DECLARE
      prize_amount integer;
    BEGIN
      prize_amount := CASE participant.position
        WHEN 1 THEN first_prize
        WHEN 2 THEN second_prize
        WHEN 3 THEN third_prize
        ELSE 0
      END;
      
      IF prize_amount > 0 THEN
        -- Creditar prêmio
        UPDATE public.profiles
        SET points = points + prize_amount
        WHERE id = participant.user_id;
        
        -- Registrar transação
        INSERT INTO public.battle_royale_transactions (
          session_id, user_id, transaction_type, amount
        ) VALUES (
          p_session_id, participant.user_id, 'prize_win', prize_amount
        );
        
        -- Registrar na tabela wallet_transactions
        INSERT INTO public.wallet_transactions (
          user_id, transaction_type, amount, source_type, metadata
        ) VALUES (
          participant.user_id, 'credit', prize_amount, 'battle_royale_prize',
          jsonb_build_object(
            'session_id', p_session_id, 
            'session_code', session_record.session_code,
            'position', participant.position
          )
        );
        
        prizes_distributed := prizes_distributed + prize_amount;
      END IF;
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_distributed', prizes_distributed,
    'first_prize', first_prize,
    'second_prize', second_prize,
    'third_prize', third_prize
  );
END;
$$;

-- Função para cancelar sessões expiradas automaticamente
CREATE OR REPLACE FUNCTION public.cancel_expired_battle_royale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_session RECORD;
BEGIN
  FOR expired_session IN
    SELECT id
    FROM public.battle_royale_sessions
    WHERE status = 'waiting'
    AND auto_cancel_at < now()
    AND refund_processed = false
  LOOP
    PERFORM public.process_battle_royale_refunds(expired_session.id);
  END LOOP;
END;
$$;