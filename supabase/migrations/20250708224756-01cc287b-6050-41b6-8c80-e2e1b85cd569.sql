-- Fix STABLE functions that are incorrectly using SET search_path
-- This will eliminate the remaining "SET is not allowed in a non-volatile function" warnings

-- Fix calculate_user_level function - remove SET search_path since it's not needed for STABLE functions
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_xp integer)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  calculated_level INTEGER DEFAULT 1;
BEGIN
  SELECT COALESCE(MAX(level), 1) INTO calculated_level
  FROM public.level_tiers 
  WHERE xp_required <= user_xp;
  
  RETURN calculated_level;
END;
$function$;

-- Fix get_next_level_xp function - remove SET search_path since it's not needed for STABLE functions
CREATE OR REPLACE FUNCTION public.get_next_level_xp(current_level integer)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  next_xp INTEGER;
BEGIN
  SELECT xp_required INTO next_xp
  FROM public.level_tiers 
  WHERE level = current_level + 1;
  
  RETURN COALESCE(next_xp, (SELECT MAX(xp_required) FROM public.level_tiers));
END;
$function$;

-- Fix any other potential STABLE functions with SET search_path issues
-- Update handle_new_user to use proper SECURITY DEFINER without conflicting SET commands
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', 'Usuário'));
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix detect_suspicious_activity function
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Log failed login attempts
  IF NEW.event_message LIKE '%authentication failed%' THEN
    PERFORM public.log_security_event(
      'failed_login',
      NEW.user_id,
      jsonb_build_object('timestamp', now(), 'ip', NEW.event_message)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, user_id uuid, event_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.activity_feed (
    activity_type,
    user_id,
    activity_data,
    created_at
  ) VALUES (
    'security_' || event_type,
    user_id,
    event_data,
    now()
  );
END;
$function$;

-- Fix update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix update_post_stats function
CREATE OR REPLACE FUNCTION public.update_post_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.social_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.social_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.social_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;