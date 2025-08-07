-- Atualizar função handle_new_user para dar exatamente 5 BTZ de boas vindas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nickname, points)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', 'Usuário'), 5);
  RETURN NEW;
END;
$function$;

-- Atualizar award_daily_loot_box para não dar loot box no primeiro dia
CREATE OR REPLACE FUNCTION public.award_daily_loot_box(profile_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  loot_box_id UUID;
  new_user_loot_box_id UUID;
  user_created_date DATE;
BEGIN
  -- Verificar se o usuário foi criado hoje (não dar loot box no primeiro dia)
  SELECT DATE(created_at) INTO user_created_date
  FROM public.profiles
  WHERE id = profile_id;
  
  IF user_created_date = CURRENT_DATE THEN
    RETURN NULL;
  END IF;
  
  -- Check if user already received daily loot box today
  IF EXISTS (
    SELECT 1 FROM public.user_loot_boxes 
    WHERE user_id = profile_id 
    AND source = 'daily_reward'
    AND DATE(created_at) = CURRENT_DATE
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Get a random daily loot box
  SELECT id INTO loot_box_id
  FROM public.loot_boxes
  WHERE name = 'Caixa Diária'
  LIMIT 1;
  
  -- Award the loot box
  INSERT INTO public.user_loot_boxes (user_id, loot_box_id, source)
  VALUES (profile_id, loot_box_id, 'daily_reward')
  RETURNING id INTO new_user_loot_box_id;
  
  RETURN new_user_loot_box_id;
END;
$function$;