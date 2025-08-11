-- CORREÇÕES PARA SISTEMA DE PRESENÇA E CONVITES
-- Problema: Usuários online não são visíveis e não recebem convites

-- 1. ADICIONAR CAMPO PARA DISPONIBILIDADE DE DUELO
ALTER TABLE user_presence 
ADD COLUMN IF NOT EXISTS available_for_duel boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_heartbeat timestamp with time zone DEFAULT now();

-- 2. FUNÇÃO PARA INICIALIZAR PRESENÇA AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION initialize_user_presence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Garantir que o usuário tem um perfil na tabela profiles
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    -- Inicializar ou atualizar presença
    INSERT INTO user_presence (user_id, is_online, last_seen, available_for_duel, last_heartbeat)
    SELECT p.id, true, now(), true, now()
    FROM profiles p 
    WHERE p.user_id = NEW.id
    ON CONFLICT (user_id) 
    DO UPDATE SET
      is_online = true,
      last_seen = now(),
      available_for_duel = true,
      last_heartbeat = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. TRIGGER PARA INICIALIZAR PRESENÇA NO LOGIN
DROP TRIGGER IF EXISTS trigger_initialize_presence ON auth.users;
CREATE TRIGGER trigger_initialize_presence
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION initialize_user_presence();

-- 4. NOVA POLÍTICA RLS PARA PERMITIR VER USUÁRIOS DISPONÍVEIS PARA DUELO
DROP POLICY IF EXISTS "Users can see available opponents" ON user_presence;
CREATE POLICY "Users can see available opponents"
ON user_presence
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    -- Pode ver própria presença
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR
    -- Pode ver usuários disponíveis para duelo (online nos últimos 5 minutos)
    (is_online = true AND available_for_duel = true AND last_seen > now() - interval '5 minutes')
    OR
    -- Pode ver usuários em duelos ativos (política existente)
    (user_id IN (
      SELECT DISTINCT unnest(ARRAY[cd.player1_id, cd.player2_id])
      FROM casino_duels cd
      WHERE (cd.player1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
             OR cd.player2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
        AND cd.status IN ('waiting', 'active', 'in_progress')
    ))
    OR
    (user_id IN (
      SELECT DISTINCT unnest(ARRAY[bpd.player1_id, bpd.player2_id])
      FROM btc_prediction_duels bpd
      WHERE (bpd.player1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
             OR bpd.player2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
        AND bpd.status IN ('waiting_predictions', 'active', 'in_progress')
    ))
  )
);

-- 5. FUNÇÃO PARA MANTER HEARTBEAT AUTOMÁTICO
CREATE OR REPLACE FUNCTION update_user_heartbeat(target_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_profile_id uuid;
BEGIN
  -- Determinar o perfil do usuário atual
  SELECT id INTO current_profile_id 
  FROM profiles 
  WHERE user_id = COALESCE(target_user_id, auth.uid());
  
  IF current_profile_id IS NOT NULL THEN
    -- Atualizar heartbeat e status online
    INSERT INTO user_presence (user_id, is_online, last_seen, available_for_duel, last_heartbeat)
    VALUES (current_profile_id, true, now(), true, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
      is_online = true,
      last_seen = now(),
      last_heartbeat = now(),
      available_for_duel = COALESCE(user_presence.available_for_duel, true);
  END IF;
END;
$$;

-- 6. FUNÇÃO PARA GARANTIR ENTREGA DE CONVITES
CREATE OR REPLACE FUNCTION ensure_duel_invite_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Garantir que o usuário desafiado tem presença ativa
  PERFORM update_user_heartbeat((SELECT user_id FROM profiles WHERE id = NEW.challenged_id));
  
  -- Se não tem presença, inicializar
  IF NOT EXISTS (SELECT 1 FROM user_presence WHERE user_id = NEW.challenged_id) THEN
    INSERT INTO user_presence (user_id, is_online, last_seen, available_for_duel, last_heartbeat)
    VALUES (NEW.challenged_id, true, now(), true, now());
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. TRIGGER PARA GARANTIR ENTREGA DE CONVITES
DROP TRIGGER IF EXISTS trigger_ensure_invite_delivery ON duel_invites;
CREATE TRIGGER trigger_ensure_invite_delivery
  AFTER INSERT ON duel_invites
  FOR EACH ROW
  EXECUTE FUNCTION ensure_duel_invite_delivery();

-- 8. LIMPAR PRESENÇAS INATIVAS (MAIS DE 10 MINUTOS)
CREATE OR REPLACE FUNCTION cleanup_inactive_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE user_presence 
  SET is_online = false, available_for_duel = false
  WHERE last_heartbeat < now() - interval '10 minutes'
    AND is_online = true;
END;
$$;