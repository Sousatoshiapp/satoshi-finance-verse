-- Primeiro drop da função existente e depois recriação corrigida
DROP FUNCTION IF EXISTS public.calculate_daily_yield(uuid);

-- Recriar a função calculate_daily_yield com os cálculos corretos
CREATE OR REPLACE FUNCTION public.calculate_daily_yield(profile_id uuid)
RETURNS TABLE(
    yield_amount numeric,
    new_total numeric,
    yield_rate numeric,
    streak_bonus numeric,
    subscription_bonus numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_record RECORD;
    base_rate DECIMAL(4,3) := 0.001; -- 0.1% ao dia
    streak_bonus_rate DECIMAL(5,4) := 0.0000; -- Iniciado em 0
    subscription_bonus_rate DECIMAL(4,3) := 0.000;
    total_rate DECIMAL(5,4);
    calculated_yield DECIMAL(10,3);
    capped_yield DECIMAL(4,3);
    new_points_total DECIMAL(10,3);
BEGIN
    -- Buscar dados do usuário
    SELECT * INTO user_record 
    FROM profiles 
    WHERE id = profile_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calcular streak bonus com valor correto (0.0001 por tier, não 0.001)
    IF user_record.consecutive_login_days > 0 THEN
        streak_bonus_rate := LEAST(0.003, (user_record.consecutive_login_days / 5) * 0.0001);
    END IF;
    
    -- Calcular subscription bonus
    subscription_bonus_rate := CASE user_record.subscription_tier
        WHEN 'pro' THEN 0.0005   -- +0.05%
        WHEN 'elite' THEN 0.001  -- +0.1%
        ELSE 0.000
    END;
    
    -- Calcular taxa total (limitada para evitar overflow)
    total_rate := LEAST(0.009, base_rate + streak_bonus_rate + subscription_bonus_rate);
    
    -- Calcular yield bruto
    calculated_yield := user_record.points * total_rate;
    
    -- Aplicar cap absoluto de 5 BTZ
    capped_yield := LEAST(calculated_yield, 5.000);
    
    -- Calcular novo total
    new_points_total := user_record.points + capped_yield;
    
    -- Atualizar pontos do usuário
    UPDATE profiles 
    SET points = new_points_total
    WHERE id = profile_id;
    
    -- Registrar o yield na história
    INSERT INTO btz_yield_history (
        user_id, 
        yield_amount, 
        yield_rate, 
        streak_bonus, 
        subscription_bonus,
        points_before, 
        points_after
    ) VALUES (
        profile_id,
        capped_yield,
        total_rate,
        streak_bonus_rate,
        subscription_bonus_rate,
        user_record.points,
        new_points_total
    );
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        capped_yield,
        new_points_total,
        total_rate,
        streak_bonus_rate,
        subscription_bonus_rate;
END;
$$;