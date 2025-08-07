-- Atualizar função calculate_daily_yield para usar configurações corrigidas
CREATE OR REPLACE FUNCTION public.calculate_daily_yield(profile_id uuid)
 RETURNS TABLE(yield_applied boolean, yield_amount integer, new_total integer, streak_bonus numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
  base_rate DECIMAL(4,3) := 0.001; -- CORRIGIDO: 0.1% base rate (era 0.5%)
  subscription_bonus DECIMAL(4,3) := 0;
  streak_multiplier DECIMAL(4,3) := 0;
  total_yield_rate DECIMAL(4,3);
  calculated_yield INTEGER;
  capped_yield INTEGER;
  new_protected_btz INTEGER;
  ABSOLUTE_DAILY_CAP INTEGER := 5; -- 5 BTZ máximo por dia
BEGIN
  -- Get user data
  SELECT * INTO user_record 
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 0.0;
    RETURN;
  END IF;
  
  -- Check if yield already applied today
  IF user_record.last_yield_date = CURRENT_DATE THEN
    RETURN QUERY SELECT false, 0, user_record.points, 0.0;
    RETURN;
  END IF;
  
  -- Calculate subscription bonus
  CASE user_record.subscription_tier
    WHEN 'pro' THEN subscription_bonus := 0.0005; -- CORRIGIDO: +0.05% (era +0.5%)
    WHEN 'elite' THEN subscription_bonus := 0.001; -- CORRIGIDO: +0.1% (era +1.0%)
    ELSE subscription_bonus := 0;
  END CASE;
  
  -- Calculate streak bonus (+0.01% for every 5 days, max +0.3%)
  streak_multiplier := LEAST(0.003, FLOOR(user_record.consecutive_login_days / 5) * 0.0001);
  
  -- Total yield rate
  total_yield_rate := base_rate + subscription_bonus + streak_multiplier;
  
  -- Calculate yield amount
  calculated_yield := FLOOR(user_record.points * total_yield_rate);
  
  -- APLICAR CAP ABSOLUTO - CRÍTICO
  capped_yield := LEAST(calculated_yield, ABSOLUTE_DAILY_CAP);
  
  -- Log cap application for monitoring
  IF calculated_yield > ABSOLUTE_DAILY_CAP THEN
    RAISE LOG 'YIELD CAP APPLIED: Profile % - Calculated: % BTZ, Capped to: % BTZ', 
      profile_id, calculated_yield, capped_yield;
  END IF;
  
  -- Minimum yield of 1 BTZ if user has any BTZ and calculated yield > 0
  IF user_record.points > 0 AND calculated_yield > 0 AND capped_yield = 0 THEN
    capped_yield := 1;
  END IF;
  
  -- Update user BTZ and protected BTZ
  new_protected_btz := FLOOR((user_record.points + capped_yield) * 0.20);
  
  UPDATE profiles 
  SET 
    points = points + capped_yield,
    protected_btz = GREATEST(protected_btz, new_protected_btz),
    last_yield_date = CURRENT_DATE,
    total_yield_earned = total_yield_earned + capped_yield
  WHERE id = profile_id;
  
  -- Record yield history
  INSERT INTO btz_yield_history (
    user_id, yield_amount, btz_before, btz_after, 
    yield_rate, streak_bonus, subscription_bonus
  ) VALUES (
    profile_id, capped_yield, user_record.points, 
    user_record.points + capped_yield, total_yield_rate, 
    streak_multiplier, subscription_bonus
  );
  
  RETURN QUERY SELECT true, capped_yield, user_record.points + capped_yield, streak_multiplier;
END;
$function$;

-- Adicionar função de monitoramento para yields anômalos
CREATE OR REPLACE FUNCTION public.monitor_yield_anomalies()
 RETURNS TABLE(profile_id uuid, yield_amount integer, issue_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Retornar yields que ultrapassaram o cap hoje
  RETURN QUERY
  SELECT 
    yh.user_id as profile_id,
    yh.yield_amount,
    'yield_above_cap' as issue_type
  FROM btz_yield_history yh
  WHERE yh.created_at::date = CURRENT_DATE
    AND yh.yield_amount > 5; -- Cap de 5 BTZ
    
  -- Retornar yields com rates anômalas
  RETURN QUERY
  SELECT 
    yh.user_id as profile_id,
    yh.yield_amount,
    'anomalous_rate' as issue_type
  FROM btz_yield_history yh
  WHERE yh.created_at::date = CURRENT_DATE
    AND yh.yield_rate > 0.01; -- Rate acima de 1% é suspeito
END;
$function$;